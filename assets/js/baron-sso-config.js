const currentUrl = new URL(window.location.href);
const appPathSegments = currentUrl.pathname.split("/").filter(Boolean);
const rootMarkerSegments = ["ko", "en", "callback", "assets", "protected", "public", "recruit"];
const rootPrefix = appPathSegments.length && !rootMarkerSegments.includes(appPathSegments[0])
  ? `/${appPathSegments[0]}`
  : "";
const appOrigin = currentUrl.origin;
const productionClientHosts = new Set(["baroncs.co.kr", "www.baroncs.co.kr"]);
const fixedProductionRedirectHosts = new Set(["baroncs.co.kr", "www.baroncs.co.kr"]);
const usesProductionClient = productionClientHosts.has(currentUrl.hostname);
const usesFixedProductionRedirect = fixedProductionRedirectHosts.has(currentUrl.hostname);
const defaultRedirectUri = usesFixedProductionRedirect
  ? "https://baroncs.co.kr/callback.html"
  : `${appOrigin}${rootPrefix}/callback.html`;
const defaultPostLogoutRedirectUri = usesFixedProductionRedirect
  ? "https://baroncs.co.kr/"
  : `${appOrigin}${rootPrefix}/`;

const productionConfig = {
  clientId: "b5821f81-da7a-4778-ba97-7742e4ff4c39",
  authorizeUrl: "https://app.brsw.kr/oidc/oauth2/auth",
  tokenUrl: "https://app.brsw.kr/oidc/oauth2/token",
  logoutUrl: "https://app.brsw.kr/oidc/oauth2/sessions/logout",
  userInfoUrl: "https://app.brsw.kr/oidc/userinfo",
  scope: "openid",
};

const stagingConfig = {
  clientId: "de1c77a5-d861-4e45-bf06-11cf45b95489",
  authorizeUrl: "https://sso.hmac.kr/oidc/oauth2/auth",
  tokenUrl: "https://sso.hmac.kr/oidc/oauth2/token",
  logoutUrl: "https://sso.hmac.kr/oidc/oauth2/sessions/logout",
  userInfoUrl: "https://sso.hmac.kr/oidc/userinfo",
  scope: "openid tenants profile email",
};

const activeConfig = usesProductionClient ? productionConfig : stagingConfig;

export default {
  enabled: true,
  clientId: activeConfig.clientId,
  authorizeUrl: activeConfig.authorizeUrl,
  tokenUrl: activeConfig.tokenUrl,
  logoutUrl: activeConfig.logoutUrl,
  userInfoUrl: activeConfig.userInfoUrl,
  scope: activeConfig.scope,
  redirectUri: defaultRedirectUri,
  postLogoutRedirectUri: defaultPostLogoutRedirectUri,
  allowedEmailDomains: [],
  allowedEmails: [],
  requiredGroups: [],
  groupClaim: "groups",
  publicPaths: [],
  extraAuthorizeParams: {},
  extraTokenParams: {},
};
