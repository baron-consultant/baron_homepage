import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHmac} from 'node:crypto';
import worker from '../src/index.js';

const configText = await readFile(new URL('../wrangler.toml', import.meta.url), 'utf8');
const secret = 'local-route-test-only';
const bucket = {
  async get() {
    return {
      body: '<main>Page content</main>',
      async text() { return this.body; },
      httpEtag: '"test"',
      writeHttpMetadata(headers) { headers.set('content-type', 'text/html'); },
    };
  },
};

function configuredPolicy(section) {
  const block = configText.split(/(?=^\[)/m).find((value) => value.startsWith(`[${section}]`));
  assert.ok(block, `Missing ${section} configuration`);
  return Object.fromEntries([...block.matchAll(/^(PUBLIC_EXACT_PATHS|PUBLIC_PREFIXES|PROTECTED_PREFIXES)\s*=\s*"([^"]*)"/gm)]
    .map((match) => [match[1], match[2]]));
}

// Synthetic cookies stay inside this unit test; no login service or real credentials are used.
function sessionCookie() {
  const payload = Buffer.from(JSON.stringify({
    authorizationVersion: 2,
    expiresAt: Date.now() + 60000,
    profile: {},
  })).toString('base64url');
  const signature = createHmac('sha256', secret).update(payload).digest('base64url');
  return `baron_worker_session=${payload}.${signature}`;
}

for (const [name, policy] of [
  ['defaults', {}],
  ['production', configuredPolicy('vars')],
  ['test', configuredPolicy('env.test.vars')],
]) {
  const env = {...policy, SESSION_SECRET: secret, SITE_BUCKET: bucket};
  test(`${name}: anonymous users can view Big Room and package software; restricted pages require login`, async () => {
    for (const language of ['ko', 'en']) {
      for (const page of ['sv_bigroom', 'sv_sw', 'dt_explain', 'dt_sw', 'dt_use', 'sv_solution', 'dx']) {
        const path = `/${language}/${page}.html`;
        const response = await worker.fetch(new Request(`https://example.test${path}`), env);
        const isPublic = ['sv_bigroom', 'sv_sw'].includes(page);
        assert.equal(response.status, isPublic ? 200 : 302, path);
        if (!isPublic) {
          const destination = new URL(response.headers.get('location'), 'https://example.test');
          assert.equal(destination.pathname, '/auth/login');
          assert.equal(destination.searchParams.get('returnTo'), path);
        }
      }
    }
  });
  test(`${name}: existing authenticated sessions retain access to Digital Transformation`, async () => {
    for (const language of ['ko', 'en']) {
      for (const page of ['dt_explain', 'dt_sw', 'dt_use']) {
        const response = await worker.fetch(new Request(`https://example.test/${language}/${page}.html`, {
          headers: {cookie: sessionCookie()},
        }), env);
        assert.equal(response.status, 200, `${language}/${page}`);
      }
    }
  });
}
