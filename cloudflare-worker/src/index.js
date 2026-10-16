const DEFAULT_DOCUMENT = 'index.html';
const DEFAULT_CONTENT_TYPE = 'application/octet-stream';
const DEFAULT_SESSION_COOKIE_NAME = 'baron_worker_session';
const DEFAULT_PENDING_COOKIE_NAME = 'baron_worker_pending';
const DEFAULT_SESSION_TTL_SECONDS = 60 * 60 * 8;
const SESSION_AUTHORIZATION_VERSION = 2;
const STATIC_ASSET_PATTERN = /\.(?:css|js|mjs|json|svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf|mp4|webm|pdf|txt|xml|map|wasm)$/i;
const LEGACY_BLOCKED_PATHS = new Set([
  '/assets/js/baron-sso-config.js',
]);
const DEFAULT_PUBLIC_EXACT_PATHS = [
  '/',
  '/index.html',
  '/ko/index.html',
  '/en/index.html',
  '/ko/sv_bigroom.html',
  '/en/sv_bigroom.html',
  '/_include/header.html',
  '/_include/footer.html',
  '/_include/nav-public.html',
  '/_include/eng/header.html',
  '/_include/eng/footer.html',
  '/_include/eng/nav-public.html',
  '/assets/css/reset.css',
  '/assets/css/font.css',
  '/assets/css/layout.css',
  '/assets/css/common.css',
  '/assets/css/pr.css',
  '/assets/css/sevice.css',
  '/assets/css/eng/common.css',
  '/assets/css/eng/baron.css',
  '/assets/css/eng/pr.css',
  '/assets/css/eng/sevice.css',
  '/assets/js/common.js',
  '/assets/js/eng/common.js',
  '/assets/js/baron-sso-auth.js',
  '/assets/js/sv.js',
  '/assets/js/eng/sv.js',
  '/assets/js/pr.js',
  '/assets/js/eng/pr.js',
  '/assets/js/br.js',
  '/assets/js/public-landing.js',
  '/assets/js/eng/public-landing.js',
  '/assets/img/index.mp4',
  '/assets/img/favicon.ico',
  '/assets/img/og-main-thumb_baron.JPG',
  '/assets/img/logo_c.svg',
  '/assets/img/logo_w.svg',
  '/assets/img/logo.svg',
  '/assets/img/ico_language.svg',
  '/assets/img/ico_language_w.svg',
  '/assets/img/ico_more.svg',
  '/assets/img/ico_more_hover.svg',
  '/assets/img/ico_angle.svg',
  '/assets/img/ico_home.svg',
  '/assets/img/ico_close.svg',
  '/assets/img/flipbook_corner.png',
  '/assets/img/eng/logo_c.svg',
  '/assets/img/eng/logo_w.svg',
];
const DEFAULT_PUBLIC_PREFIXES = [
  '/ko/tova/',
  '/en/tova/',
  '/ko/gaia/',
  '/en/gaia/',
  '/ko/egbim/',
  '/en/egbim/',
  '/ko/kngil/',
  '/en/kngil/',
  '/ko/pr_',
  '/en/pr_',
  '/recruit/',
  '/portfolio/',
  '/assets/',
];
const DEFAULT_PROTECTED_PREFIXES = [
  '/ko/',
  '/en/',
  '/_include/',
  '/assets/',
  '/recruit/',
  '/portfolio/',
];
const DEFAULT_INTERNAL_ONLY_PREFIXES = [
  '/protected/',
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const config = buildConfig(url, env);

    if (!env.SITE_BUCKET) {
      return new Response('R2 bucket binding SITE_BUCKET is missing.', { status: 500 });
    }

    if (url.pathname.startsWith('/auth/')) {
      return handleAuthRequest(request, env, config, url);
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: { Allow: 'GET, HEAD' },
      });
    }

    if (isInternalOnlyPath(url.pathname, config) || isBlockedPath(url.pathname)) {
      return new Response('Not Found', {
        status: 404,
        headers: {
          'content-type': 'text/plain; charset=utf-8',
          'cache-control': 'no-store',
        },
      });
    }

    const session = await readSession(request, config);
    const anonymousPublicPath = isPublicPath(url.pathname, config);
    const protectedPath = isProtectedPath(url.pathname, config);

    if (!session && !anonymousPublicPath && (isPageRequest(url.pathname) || protectedPath)) {
      return redirect(buildWorkerLoginUrl(url), {
        'set-cookie': serializeCookie(config.sessionCookieName, '', { path: '/', maxAge: 0 }),
      });
    }

    if (!session && !anonymousPublicPath && !isPageRequest(url.pathname)) {
      return new Response('Not Found', {
        status: 404,
        headers: {
          'content-type': 'text/plain; charset=utf-8',
          'cache-control': 'no-store',
        },
      });
    }

    const keyCandidates = buildKeyCandidates(url.pathname);

    for (const key of keyCandidates) {
      const object = await env.SITE_BUCKET.get(key);
      if (!object) {
        continue;
      }

      return createObjectResponse(object, key, request.method === 'HEAD', session, url, config);
    }

    return new Response('Not Found', {
      status: 404,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'no-store',
      },
    });
  },
};

async function handleAuthRequest(request, env, config, url) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: { Allow: 'GET, HEAD' },
    });
  }

  if (!isAuthConfigured(config)) {
    return new Response('Worker auth is not configured.', {
      status: 500,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }

  if (url.pathname === '/auth/login') {
    return handleLogin(config, url);
  }

  if (url.pathname === '/auth/callback') {
    return handleCallback(request, config, url);
  }

  if (url.pathname === '/auth/logout') {
    return handleLogout(request, config, url);
  }

  return new Response('Not Found', {
    status: 404,
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}

function buildConfig(url, env) {
  const publicPrefixes = parseCsv(env.PUBLIC_PREFIXES);
  const publicExactPaths = parseCsv(env.PUBLIC_EXACT_PATHS);
  const protectedPrefixes = parseCsv(env.PROTECTED_PREFIXES);
  const internalOnlyPrefixes = parseCsv(env.INTERNAL_ONLY_PREFIXES);
  return {
    clientId: String(env.AUTH_CLIENT_ID || ''),
    clientSecret: String(env.AUTH_CLIENT_SECRET || ''),
    authorizeUrl: String(env.AUTH_AUTHORIZE_URL || ''),
    tokenUrl: String(env.AUTH_TOKEN_URL || ''),
    userInfoUrl: String(env.AUTH_USERINFO_URL || ''),
    logoutUrl: String(env.AUTH_LOGOUT_URL || ''),
    redirectUri: String(env.AUTH_REDIRECT_URI || `${url.origin}/auth/callback`),
    postLogoutRedirectUri: String(env.AUTH_POST_LOGOUT_REDIRECT_URI || `${url.origin}/`),
    scope: String(env.AUTH_SCOPE || 'openid'),
    sessionSecret: String(env.SESSION_SECRET || ''),
    allowedEmailDomains: parseCsv(env.ALLOWED_EMAIL_DOMAINS).map((domain) => domain.toLowerCase()),
    allowedEmails: parseCsv(env.ALLOWED_EMAILS).map((email) => email.toLowerCase()),
    requiredGroups: parseCsv(env.REQUIRED_GROUPS),
    groupClaim: String(env.GROUP_CLAIM || 'groups'),
    allowedTenantIds: parseCsv(env.ALLOWED_TENANT_IDS).map(normalizeTenantId),
    tenantClaims: parseCsv(env.TENANT_CLAIMS || env.TENANT_CLAIM || 'joined_tenants,tenant_id,tenants'),
    debugTenantAuth: String(env.DEBUG_TENANT_AUTH || '').toLowerCase() === 'true',
    sessionCookieName: String(env.SESSION_COOKIE_NAME || DEFAULT_SESSION_COOKIE_NAME),
    pendingCookieName: String(env.OAUTH_COOKIE_NAME || DEFAULT_PENDING_COOKIE_NAME),
    sessionTtlSeconds: Math.max(Number(env.SESSION_TTL_SECONDS || DEFAULT_SESSION_TTL_SECONDS), 60),
    publicExactPaths: mergeConfigEntries(DEFAULT_PUBLIC_EXACT_PATHS, publicExactPaths),
    publicPrefixes: mergeConfigEntries(DEFAULT_PUBLIC_PREFIXES, publicPrefixes),
    protectedPrefixes: mergeConfigEntries(DEFAULT_PROTECTED_PREFIXES, protectedPrefixes),
    internalOnlyPrefixes: mergeConfigEntries(DEFAULT_INTERNAL_ONLY_PREFIXES, internalOnlyPrefixes),
  };
}

function mergeConfigEntries(defaultEntries, overrideEntries) {
  return Array.from(new Set([...(defaultEntries || []), ...(overrideEntries || [])]));
}

function isAuthConfigured(config) {
  return Boolean(
    config.clientId &&
      config.authorizeUrl &&
      config.tokenUrl &&
      config.userInfoUrl &&
      config.sessionSecret
  );
}

async function handleLogin(config, url) {
  const returnTo = sanitizeReturnTo(url.searchParams.get('returnTo'), url.origin);
  const verifier = createRandomString(96);
  const state = createRandomString(48);
  const challenge = await createCodeChallenge(verifier);
  const pendingCookie = await createSignedCookie(
    {
      state,
      verifier,
      returnTo,
      redirectUri: config.redirectUri,
      createdAt: Date.now(),
    },
    config.sessionSecret
  );

  const authorizeUrl = new URL(config.authorizeUrl);
  authorizeUrl.searchParams.set('response_type', 'code');
  authorizeUrl.searchParams.set('client_id', config.clientId);
  authorizeUrl.searchParams.set('redirect_uri', config.redirectUri);
  authorizeUrl.searchParams.set('scope', config.scope);
  authorizeUrl.searchParams.set('state', state);
  authorizeUrl.searchParams.set('code_challenge', challenge);
  authorizeUrl.searchParams.set('code_challenge_method', 'S256');

  return redirect(authorizeUrl.toString(), {
    'set-cookie': serializeCookie(config.pendingCookieName, pendingCookie, {
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      path: '/',
      maxAge: 600,
    }),
  });
}

async function handleCallback(request, config, url) {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  if (!code || !state) {
    return new Response('Missing OAuth callback parameters.', {
      status: 400,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }

  const pending = await readSignedCookie(request, config.pendingCookieName, config.sessionSecret);
  if (!pending || pending.state !== state || !pending.verifier) {
    return redirect(config.postLogoutRedirectUri, {
      'set-cookie': serializeCookie(config.pendingCookieName, '', { path: '/', maxAge: 0 }),
    });
  }

  const tokenResult = await exchangeCode(config, code, pending.verifier, pending.redirectUri || config.redirectUri);
  const profile = await fetchUserInfo(config, tokenResult.access_token);
  if (config.debugTenantAuth) {
    console.log('[local tenant auth diagnostic]', JSON.stringify({
      tenantClaims: config.tenantClaims.map((claim) => {
        const value = profile?.[claim];
        return {
          claim,
          present: value !== undefined && value !== null,
          shape: describeTenantClaim(value),
          containsAllowedTenantId: containsAllowedTenantId(value, config.allowedTenantIds),
        };
      }),
      userInfoClaimNames: Object.keys(profile || {}).sort(),
      tenantLikeClaimNames: Object.keys(profile || {}).filter((key) => /tenant/i.test(key)).sort(),
      idTokenClaimNames: getJwtClaimNames(tokenResult.id_token),
      accessTokenClaimNames: getJwtClaimNames(tokenResult.access_token),
    }, null, 2));
  }

  if (!isAuthorized(config, profile)) {
    return redirect(config.postLogoutRedirectUri, {
      'set-cookie': [
        serializeCookie(config.pendingCookieName, '', { path: '/', maxAge: 0 }),
        serializeCookie(config.sessionCookieName, '', { path: '/', maxAge: 0 }),
      ],
    });
  }

  const expiresIn = Number(tokenResult.expires_in || 3600);
  const sessionProfile = sanitizeProfile(profile) || {};
  const sessionValue = await createSignedCookie(
    {
      profile: sessionProfile,
      expiresAt: Date.now() + Math.max(expiresIn - 30, 30) * 1000,
      authorizationVersion: SESSION_AUTHORIZATION_VERSION,
    },
    config.sessionSecret
  );

  return redirect(pending.returnTo || config.postLogoutRedirectUri, {
    'set-cookie': [
        serializeCookie(config.pendingCookieName, '', { path: '/', maxAge: 0 }),
        serializeCookie(config.sessionCookieName, sessionValue, {
        httpOnly: true,
        secure: true,
        sameSite: 'Lax',
        path: '/',
          maxAge: config.sessionTtlSeconds,
      }),
    ],
  });
}

async function handleLogout(request, config, url) {
  const session = await readSignedCookie(request, config.sessionCookieName, config.sessionSecret);
  const returnTo = sanitizeReturnTo(url.searchParams.get('returnTo'), url.origin, config.postLogoutRedirectUri);
  const clearHeaders = {
    'set-cookie': [
      serializeCookie(config.pendingCookieName, '', { path: '/', maxAge: 0 }),
      serializeCookie(config.sessionCookieName, '', { path: '/', maxAge: 0 }),
    ],
  };

  if (!config.logoutUrl || !session?.idToken) {
    return redirect(returnTo, clearHeaders);
  }

  const logoutUrl = new URL(config.logoutUrl);
  logoutUrl.searchParams.set('client_id', config.clientId);
  logoutUrl.searchParams.set('id_token_hint', session.idToken);
  logoutUrl.searchParams.set('post_logout_redirect_uri', returnTo);
  return redirect(logoutUrl.toString(), clearHeaders);
}

function isPageRequest(pathname) {
  if (!pathname || pathname === '/') {
    return true;
  }

  if (STATIC_ASSET_PATTERN.test(pathname)) {
    return false;
  }

  return pathname.endsWith('.html') || !pathname.split('/').pop().includes('.');
}

function isPublicPath(pathname, config) {
  const currentPath = normalizeRoutePath(pathname);
  return (
    config.publicExactPaths.some((entry) => currentPath === normalizeRoutePath(entry)) ||
    config.publicPrefixes.some((entry) => matchesPublicEntry(currentPath, normalizeRoutePath(entry)))
  );
}

function isProtectedPath(pathname, config) {
  const currentPath = normalizeRoutePath(pathname);
  return config.protectedPrefixes.some((entry) => matchesPublicEntry(currentPath, normalizeRoutePath(entry)));
}

function isInternalOnlyPath(pathname, config) {
  const currentPath = normalizeRoutePath(pathname);
  return config.internalOnlyPrefixes.some((entry) => matchesPublicEntry(currentPath, normalizeRoutePath(entry)));
}

function isBlockedPath(pathname) {
  return LEGACY_BLOCKED_PATHS.has(normalizeRoutePath(pathname));
}

function matchesPublicEntry(currentPath, entry) {
  if (!entry || entry === '/') {
    return currentPath === '/';
  }

  if (/\.html?$/i.test(entry)) {
    return currentPath === entry;
  }

  return currentPath === entry || currentPath.startsWith(entry);
}

function buildWorkerLoginUrl(url) {
  const returnTo = buildSafeReturnTo(url);
  return `/auth/login?returnTo=${encodeURIComponent(returnTo)}`;
}

function buildSafeReturnTo(url) {
  const returnUrl = new URL(url.toString());
  returnUrl.searchParams.delete('login');
  return `${returnUrl.pathname}${returnUrl.search}`;
}

async function readSession(request, config) {
  const session = await readSignedCookie(request, config.sessionCookieName, config.sessionSecret);
  if (
    !session ||
    session.authorizationVersion !== SESSION_AUTHORIZATION_VERSION ||
    !session.expiresAt ||
    Date.now() >= Number(session.expiresAt)
  ) {
    return null;
  }

  return session;
}

async function exchangeCode(config, code, verifier, redirectUri) {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: config.clientId,
    code,
    code_verifier: verifier,
    redirect_uri: redirectUri,
  });

  if (config.clientSecret) {
    body.set('client_secret', config.clientSecret);
  }

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`Token request failed: ${response.status} ${responseText}`);
  }

  return response.json();
}

async function fetchUserInfo(config, accessToken) {
  const response = await fetch(config.userInfoUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`User info request failed: ${response.status} ${responseText}`);
  }

  return response.json();
}

function isAuthorized(config, profile) {
  if (!profile) {
    return false;
  }

  const email = String(
    profile.email || profile.preferred_username || profile.upn || profile.unique_name || ''
  ).trim().toLowerCase();

  if (config.allowedEmails.length && !config.allowedEmails.includes(email)) {
    return false;
  }

  if (config.allowedEmailDomains.length) {
    const hasDomain = config.allowedEmailDomains.some((domain) => email.endsWith(`@${domain}`));
    if (!hasDomain) {
      return false;
    }
  }

  if (!config.requiredGroups.length) {
    return isAllowedTenant(config, profile);
  }

  const groupValue = profile?.[config.groupClaim];
  const groups = Array.isArray(groupValue) ? groupValue : typeof groupValue === 'string' ? [groupValue] : [];
  return config.requiredGroups.some((group) => groups.includes(group)) && isAllowedTenant(config, profile);
}

function isAllowedTenant(config, profile) {
  if (!config.allowedTenantIds.length) {
    return false;
  }

  return config.tenantClaims.some((claim) =>
    containsAllowedTenantId(profile?.[claim], config.allowedTenantIds)
  );
}

function normalizeTenantId(value) {
  return String(value || '').trim().toLowerCase();
}

function describeTenantClaim(value, depth = 0) {
  if (Array.isArray(value)) {
    return {
      type: 'array',
      length: value.length,
      items: depth < 2 ? value.slice(0, 5).map((item) => describeTenantClaim(item, depth + 1)) : undefined,
    };
  }

  if (value && typeof value === 'object') {
    const keys = Object.keys(value).slice(0, 20);
    return {
      type: 'object',
      keys,
      values: depth < 2
        ? keys.slice(0, 5).map((key) => describeTenantClaim(value[key], depth + 1))
        : undefined,
    };
  }

  return { type: value === null ? 'null' : typeof value };
}

function containsAllowedTenantId(value, allowedTenantIds) {
  if (typeof value === 'string') {
    return allowedTenantIds.includes(normalizeTenantId(value));
  }

  if (Array.isArray(value)) {
    return value.some((entry) => containsAllowedTenantId(entry, allowedTenantIds));
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).some(([key, entry]) =>
      allowedTenantIds.includes(normalizeTenantId(key)) || containsAllowedTenantId(entry, allowedTenantIds)
    );
  }

  return false;
}

function getJwtClaimNames(token) {
  try {
    const encodedPayload = String(token || '').split('.')[1];
    if (!encodedPayload) return [];
    const base64 = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')));
    return Object.keys(payload).sort();
  } catch {
    return [];
  }
}

function buildKeyCandidates(pathname) {
  const normalizedPath = normalizePath(pathname);

  if (!normalizedPath) {
    return [DEFAULT_DOCUMENT];
  }

  const candidates = [normalizedPath];

  if (normalizedPath.endsWith('/')) {
    candidates.unshift(`${normalizedPath}${DEFAULT_DOCUMENT}`);
  } else if (!hasFileExtension(normalizedPath)) {
    candidates.push(`${normalizedPath}/${DEFAULT_DOCUMENT}`);
  }

  return Array.from(new Set(candidates));
}

function normalizePath(pathname) {
  let normalized = pathname || '/';

  try {
    normalized = decodeURIComponent(normalized);
  } catch {
    return '';
  }

  if (normalized === '/' || normalized === '') {
    return '';
  }

  normalized = normalized.replace(/^\/+/, '');
  normalized = normalized.replace(/\/+/g, '/');

  const segments = normalized.split('/').filter(Boolean);
  if (segments.some((segment) => segment === '.' || segment === '..')) {
    return '';
  }

  const rebuilt = segments.join('/');
  if (pathname.endsWith('/')) {
    return rebuilt ? `${rebuilt}/` : '';
  }

  return rebuilt;
}

function normalizeRoutePath(pathname) {
  if (!pathname) {
    return '/';
  }

  let normalized = pathname;
  if (!normalized.startsWith('/')) {
    normalized = `/${normalized}`;
  }
  normalized = normalized.replace(/\/+/g, '/');
  return normalized;
}

function hasFileExtension(pathname) {
  const lastSegment = pathname.split('/').pop() || '';
  return lastSegment.includes('.');
}

async function createObjectResponse(object, key, headOnly, session, url, config) {
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);

  if (!headers.has('content-type')) {
    headers.set('content-type', inferContentType(key));
  }

  if (!headers.has('cache-control')) {
    headers.set('cache-control', inferCacheControl(key));
  }

  if (headOnly) {
    return new Response(null, { status: 200, headers });
  }

  const contentType = headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return new Response(object.body, { status: 200, headers });
  }

  let html = await object.text();
  html = injectWorkerBootstrap(html, session, url, config);
  headers.set('cache-control', 'no-store');
  return new Response(html, { status: 200, headers });
}

function injectWorkerBootstrap(html, session, url, config) {
  const bootstrap = {
    mode: 'worker',
    authenticated: Boolean(session),
    profile: sanitizeProfile(session?.profile || null),
    loginUrl: buildWorkerLoginUrl(url),
    logoutUrl: buildWorkerLogoutUrl(url, config),
  };

  const script = `<script>window.BARON_WORKER_AUTH=${JSON.stringify(bootstrap).replace(/</g, '\\u003c')};</script>`;
  if (html.includes('</head>')) {
    return html.replace('</head>', `${script}</head>`);
  }

  if (html.includes('</body>')) {
    return html.replace('</body>', `${script}</body>`);
  }

  return `${script}${html}`;
}

function buildWorkerLogoutUrl(url, config) {
  const returnTo = sanitizeReturnTo(config?.postLogoutRedirectUri, url.origin, '/');
  return `/auth/logout?returnTo=${encodeURIComponent(returnTo)}`;
}

function sanitizeProfile(profile) {
  if (!profile) {
    return null;
  }

  const sanitized = {
    email: profile.email || profile.preferred_username || profile.upn || profile.unique_name || '',
    name: profile.name || profile.nickname || profile.given_name || '',
  };

  const groups = profile.groups || profile.group || null;
  if (Array.isArray(groups)) {
    sanitized.groups = groups;
  }

  return sanitized;
}

function inferCacheControl(key) {
  const extension = (key.split('.').pop() || '').toLowerCase();

  switch (extension) {
    case 'html':
      return 'no-cache, no-store, must-revalidate';
    case 'css':
    case 'js':
    case 'mjs':
    case 'json':
    case 'svg':
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'webp':
    case 'ico':
    case 'woff':
    case 'woff2':
    case 'ttf':
    case 'otf':
    case 'mp4':
    case 'webm':
    case 'pdf':
    case 'wasm':
      return 'public, max-age=31536000, immutable';
    default:
      return 'public, max-age=3600';
  }
}

function inferContentType(key) {
  const extension = (key.split('.').pop() || '').toLowerCase();

  switch (extension) {
    case 'html':
      return 'text/html; charset=utf-8';
    case 'css':
      return 'text/css; charset=utf-8';
    case 'js':
    case 'mjs':
      return 'application/javascript; charset=utf-8';
    case 'json':
      return 'application/json; charset=utf-8';
    case 'txt':
      return 'text/plain; charset=utf-8';
    case 'xml':
      return 'application/xml; charset=utf-8';
    case 'svg':
      return 'image/svg+xml';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    case 'ico':
      return 'image/x-icon';
    case 'woff':
      return 'font/woff';
    case 'woff2':
      return 'font/woff2';
    case 'ttf':
      return 'font/ttf';
    case 'otf':
      return 'font/otf';
    case 'mp4':
      return 'video/mp4';
    case 'webm':
      return 'video/webm';
    case 'pdf':
      return 'application/pdf';
    case 'wasm':
      return 'application/wasm';
    default:
      return DEFAULT_CONTENT_TYPE;
  }
}

function parseCsv(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function sanitizeReturnTo(value, origin, fallback = '/') {
  if (!value) {
    return fallback;
  }

  try {
    const url = new URL(value, origin);
    if (url.origin !== origin) {
      return fallback;
    }

    if (url.pathname.startsWith('/auth/')) {
      return fallback;
    }

    return `${url.pathname}${url.search}` || fallback;
  } catch {
    return fallback;
  }
}

async function createSignedCookie(payload, secret) {
  const payloadString = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = await signValue(payloadString, secret);
  return `${payloadString}.${signature}`;
}

async function readSignedCookie(request, name, secret) {
  const cookies = parseCookies(request.headers.get('cookie') || '');
  const raw = cookies[name];
  if (!raw) {
    return null;
  }

  const lastDotIndex = raw.lastIndexOf('.');
  if (lastDotIndex <= 0) {
    return null;
  }

  const payloadString = raw.slice(0, lastDotIndex);
  const signature = raw.slice(lastDotIndex + 1);
  const expectedSignature = await signValue(payloadString, secret);
  if (!timingSafeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    return JSON.parse(new TextDecoder().decode(base64UrlDecode(payloadString)));
  } catch {
    return null;
  }
}

async function signValue(value, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return base64UrlEncode(new Uint8Array(signature));
}

function parseCookies(cookieHeader) {
  return cookieHeader.split(';').reduce((cookies, part) => {
    const separatorIndex = part.indexOf('=');
    if (separatorIndex === -1) {
      return cookies;
    }

    const key = part.slice(0, separatorIndex).trim();
    const value = part.slice(separatorIndex + 1).trim();
    cookies[key] = value;
    return cookies;
  }, {});
}

function serializeCookie(name, value, options = {}) {
  const parts = [`${name}=${value}`];
  parts.push(`Path=${options.path || '/'}`);

  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${options.maxAge}`);
  }

  if (options.httpOnly) {
    parts.push('HttpOnly');
  }

  if (options.secure !== false) {
    parts.push('Secure');
  }

  parts.push(`SameSite=${options.sameSite || 'Lax'}`);
  return parts.join('; ');
}

function redirect(location, extraHeaders = {}) {
  const headers = new Headers({ Location: location });
  Object.entries(extraHeaders).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => headers.append(key, item));
      return;
    }

    headers.set(key, value);
  });

  return new Response(null, { status: 302, headers });
}

function createRandomString(length = 64) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes).slice(0, length);
}

async function createCodeChallenge(verifier) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return base64UrlEncode(new Uint8Array(digest));
}

function base64UrlEncode(bytes) {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlDecode(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function timingSafeEqual(left, right) {
  if (left.length !== right.length) {
    return false;
  }

  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return result === 0;
}
