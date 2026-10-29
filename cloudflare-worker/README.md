# BARON Cloudflare Worker

이 폴더는 Cloudflare Worker가 R2 버킷 `baron-hompage`의 정적 파일을 브라우저에 서빙하기 위한 최소 구성이다.

## 포함 파일

- `wrangler.toml`: Worker 이름과 R2 바인딩 설정
- `src/index.js`: `/` 요청을 `index.html`로 매핑하고, 요청 경로에 해당하는 R2 객체를 서빙하는 엔트리

## 자동 배포

- GitHub Actions 워크플로: `.github/workflows/deploy-worker.yml`
- `main` 브랜치에서 `cloudflare-worker/**`가 변경되면 Worker를 자동 배포한다.
- 필요 GitHub Secrets: `CF_API_TOKEN`, `CF_R2_ACCOUNT_ID`
# BARON Cloudflare Worker Scaffold

이 폴더는 `cloudflare-worker-r2-auth-task.md`의 1차 구현 골격이다.

현재 포함된 범위:

- 공개/보호 경로 분기
- `/auth/login`, `/auth/callback`, `/auth/logout` 엔드포인트 골격
- PKCE verifier/challenge 생성
- 서명된 HttpOnly 세션 쿠키 발급/검증
- R2 비공개 버킷 객체 서빙

## 파일

- `wrangler.toml`: Worker 이름, R2 바인딩, 기본 변수
- `src/index.js`: Worker 엔트리 파일

## 자동 배포

- GitHub Actions 워크플로: `.github/workflows/deploy-worker.yml`
- `main` 브랜치에 `cloudflare-worker/**` 변경이 push 되면 Worker를 자동 배포한다.
- 수동 실행도 가능하다.
- 필요 GitHub Secrets: `CF_API_TOKEN`, `CF_R2_ACCOUNT_ID`

## 필요한 환경변수

`wrangler secret put` 또는 Cloudflare 대시보드에서 아래 값을 채운다.

- `SESSION_SECRET`
- `AUTH_CLIENT_ID`
- `AUTH_AUTHORIZE_URL`
- `AUTH_TOKEN_URL`
- `AUTH_USERINFO_URL`
- `AUTH_LOGOUT_URL`

선택 변수:

- `AUTH_REDIRECT_URI`
- `AUTH_POST_LOGOUT_REDIRECT_URI`
- `AUTH_SCOPE`
- `ALLOWED_TENANT_IDS` (allowed tenant IDs; configured in `wrangler.toml`)
- `TENANT_CLAIMS` (defaults to `joined_tenants,tenant_id,tenants`)
- `ALLOWED_EMAIL_DOMAINS`
- `ALLOWED_EMAILS`
- `REQUIRED_GROUPS`
- `GROUP_CLAIM`
- `PUBLIC_ROOT_KEY`
- `PUBLIC_PREFIXES`
- `PROTECTED_PREFIXES`

## 공개 랜딩 기준

별도 `public/index.html`을 두는 방향은 폐기했다.

현재 기준:

- `/` -> Worker가 `ko/index.html` 공개 랜딩으로 매핑
- `/ko/index.html` -> 공개 랜딩
- `/en/index.html` -> 공개 랜딩
- 인증된 사용자가 `/`, `/ko/index.html`, `/en/index.html`에 접근하면 Worker가 각각 `protected/ko/index.html`, `protected/ko/index.html`, `protected/en/index.html`를 반환
- `/protected/*` 는 Worker 내부 키 매핑용 경로이며 브라우저 직접 접근은 404로 차단

즉, 공개 랜딩의 소스 오브 트루스는 기존 `ko/index.html`, `en/index.html` 이다.

## 예상 R2 키 구조

현재 Worker는 아래 구조를 전제로 한다.

- 공개 랜딩: `ko/index.html`, `en/index.html`
- 공개 전용 include: `_include/header.html`, `_include/footer.html`, `_include/nav-public.html`, `_include/eng/header.html`, `_include/eng/footer.html`, `_include/eng/nav-public.html`
- 공개 전용 자산: `assets/css/reset.css`, `assets/css/font.css`, 공개 정보 페이지용 CSS/JS exact file, `assets/js/public-landing.js`, `assets/js/eng/public-landing.js`, `assets/css/lib/*`, `assets/js/lib/*`, `assets/file/*`, `assets/img/pr/*`, `assets/img/sv/*`, 공용 아이콘/로고 exact file, `assets/img/index.mp4`, `assets/img/favicon.ico`, `assets/img/og-main-thumb_baron.JPG`, `assets/font/*`
- 보호 랜딩: `protected/ko/index.html`, `protected/en/index.html`
- 보호 자산: `ko/*`, `en/*`, `_include/*`, `assets/*`, `recruit/*`, `portfolio/*`

예시 매핑:

- 비로그인 `GET /` -> R2 key `ko/index.html`
- 비로그인 `GET /ko/index.html` -> R2 key `ko/index.html`
- 비로그인 `GET /en/index.html` -> R2 key `en/index.html`
- 로그인 `GET /` -> R2 key `protected/ko/index.html`
- 로그인 `GET /ko/index.html` -> R2 key `protected/ko/index.html`
- 로그인 `GET /en/index.html` -> R2 key `protected/en/index.html`
- 직접 `GET /protected/ko/index.html` -> Worker 404

중요:

- 현재 공개 랜딩은 `assets/js/public-landing.js`, `assets/js/eng/public-landing.js`를 사용해 전체 nav include를 타지 않도록 분리한다.
- 공개 랜딩 HTML에서는 더 이상 `layout.css`, `common.css`, jQuery, GSAP 계열 라이브러리를 직접 로드하지 않는다.
- 공개 서비스/홍보/패키지 페이지는 비로그인 상태에서 전체 nav 대신 `nav-public.html` 계열만 읽는다.
- 공개 서비스/홍보/패키지 페이지는 `/assets/` 전체 대신 공개 섹션이 실제로 쓰는 CSS/JS/이미지/다운로드 하위 경로만 허용한다.
- 따라서 `ko/index.html`, `en/index.html` 자체는 유지하되, 공개 상태에서는 `_include/*`와 `common.js`를 직접 요청하지 않도록 구성한다.

남은 과제:

- `_include/`는 공개 exact file 기준으로 줄였고, `assets/`도 `css/lib`, `js/lib`, `img/pr`, `img/sv`, `file` 등으로 나눠 줄였다.
- 다음 단계에서는 공개 3개 섹션 전용 CSS/JS를 더 분리해 현재 exact file로 남아 있는 공용 `layout/common` 계열까지 더 잘라낼 수 있다.

## 다음 구현 포인트

1. `ko/index.html`, `en/index.html`에서 공개 랜딩에 필요한 자산만 별도 공개 경로로 분리
2. 현재 사이트 자산 중 공개 허용 목록 확정
3. Worker 세션 쿠키와 IDP claim 정책 확정
4. GitHub Actions 또는 배포 스크립트에서 Worker/R2 배포 경로 분리

## 배포 메모

- 현재 `.github/workflows/deploy-r2.yml` 은 `protected/` 폴더를 일반 정적 키처럼 R2에 업로드한다.
- 그러나 브라우저가 이 키를 직접 여는 것은 Worker가 차단하므로, `protected/`는 배포 대상이지만 공개 URL은 아닌 내부 키 공간으로 취급한다.

## 실제 검증 전제조건

다음 조건이 충족되지 않으면 실제 Cloudflare 환경에서 end-to-end 검증을 할 수 없다.

- Worker가 실제 route 또는 custom domain에 배포되어 있어야 한다.
- `SITE_BUCKET` 바인딩이 실제 비공개 R2 버킷에 연결되어 있어야 한다.
- 필수 secret이 모두 입력되어 있어야 한다.
	- `SESSION_SECRET`
	- `AUTH_CLIENT_ID`
	- `AUTH_AUTHORIZE_URL`
	- `AUTH_TOKEN_URL`
	- `AUTH_USERINFO_URL`
	- `AUTH_LOGOUT_URL`
- IDP에 Worker 도메인의 callback URL이 등록되어 있어야 한다.
	- 예: `https://baroncs.co.kr/auth/callback`
- 로그아웃 후 복귀 URI도 IDP와 Worker 설정이 서로 맞아야 한다.
	- 예: `https://baroncs.co.kr/`

즉, 코드만 배포 저장소에 있는 상태로는 부족하고, Cloudflare Worker 설정과 IDP 설정이 따로 필요하다.
