# VSCode에서 Git 최초 설정 가이드

처음 이 프로젝트를 VSCode로 작업하기 위한 최초 1회 설정 절차. 업로드(커밋/푸시) 방법은 [github-manual-upload-guide.md](github-manual-upload-guide.md)의 "방법 4. VSCode에서 업로드"를 참고.

## 0. 사전 준비

- 저장소: https://github.com/baron-consultant/homepage_test (`UI-Update` 브랜치에서 작업, `main`은 배포 반영 브랜치)
- **push(쓰기) 권한은 `hanmacdesign-hub` 계정에만 있다.** 개인 계정으로는 clone/pull만 가능.

## 1. Git 설치 확인

1. VSCode 하단 메뉴 `Terminal → New Terminal` 실행 (또는 `` Ctrl+` ``)
2. 아래 명령으로 설치 여부 확인
   ```bash
   git --version
   ```
3. 설치되어 있지 않다면 https://git-scm.com/downloads 에서 설치 후 VSCode 재시작

## 2. VSCode Git 확장 확인

- VSCode에는 Git 기능이 기본 내장되어 있어 별도 설치가 필요 없다.
- 좌측 Activity Bar에 `Source Control` 아이콘(가지 모양)이 보이면 정상 동작 중.
- 안 보인다면 `Extensions` 탭에서 `GitHub Pull Requests and Issues` 확장(선택 사항, GitHub 로그인 UI 편의용)을 설치해도 좋다.

## 3. GitHub 계정 로그인 (`hanmacdesign-hub`)

1. VSCode 좌측 하단 계정 아이콘 클릭 → `Sign in with GitHub` 선택
   - 이미 다른 계정(`csy009860-boop` 등)으로 로그인되어 있다면 먼저 `Sign out` 후 다시 로그인
2. 브라우저가 열리면 `hanmacdesign-hub` 계정으로 GitHub 로그인 및 권한 승인(Authorize)
3. VSCode로 돌아와 계정 아이콘에 `hanmacdesign-hub`가 표시되는지 확인
4. 안 뜨는 경우 `Ctrl+Shift+P` → `GitHub: Sign in` 명령으로 재시도

## 4. Git 사용자 정보 설정 (커밋 작성자 정보)

터미널에서 최초 1회 설정 (이미 설정돼 있다면 생략 가능):

```bash
git config --global user.name "hanmacdesign-hub"
git config --global user.email "<hanmacdesign-hub 계정의 이메일>"
```

> 여러 프로젝트에서 다른 계정을 쓴다면 `--global` 대신 이 저장소 폴더 안에서만 `git config user.name ...` (global 옵션 제거)으로 지역(local) 설정만 적용한다.

## 5. 저장소 클론 (최초 1회)

### 방법 A. VSCode UI로 클론

1. `Ctrl+Shift+P` → `Git: Clone` 실행
2. 저장소 URL 입력: `https://github.com/baron-consultant/homepage_test.git`
3. 클론할 로컬 폴더 위치 선택
4. 클론 완료 후 `Open` 선택 → 새 VSCode 창에서 프로젝트가 열림

### 방법 B. 터미널로 클론

```bash
git clone https://github.com/baron-consultant/homepage_test.git
cd homepage_test
code .
```

## 6. 작업 브랜치(`UI-Update`)로 전환

1. VSCode 하단 상태 표시줄의 브랜치명 클릭 (기본은 `main`으로 표시됨)
2. 브랜치 목록에서 `origin/UI-Update` 선택 → 로컬에 자동으로 추적 브랜치 생성되며 체크아웃됨
3. 하단 상태 표시줄이 `UI-Update`로 바뀌었는지 확인

터미널로 해도 동일:

```bash
git checkout UI-Update
```

## 7. 최초 설정 확인 체크리스트

- [ ] `git --version`으로 Git 설치 확인
- [ ] VSCode 계정 아이콘에 `hanmacdesign-hub` 로그인 표시 확인
- [ ] `git config --global user.name/user.email` 설정 완료 (또는 저장소 로컬 설정)
- [ ] 저장소가 로컬에 클론되어 VSCode에서 열려 있음
- [ ] 하단 상태 표시줄 브랜치가 `UI-Update`인지 확인
- [ ] Source Control 패널에서 `Changes` 목록이 비어 있는지(클론 직후 정상 상태) 확인

설정이 끝나면 이후 작업은 [github-manual-upload-guide.md](github-manual-upload-guide.md)의 "방법 4. VSCode에서 업로드" 절차를 따르면 된다.
