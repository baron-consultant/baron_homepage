// 패키지 S/W '자세히 보기' 상세 팝업 (dialog + iframe)
// - a[data-service-detail] 링크는 기본적으로 제품 페이지로 이동하는 일반 링크다.
//   이 스크립트가 있고 조건(601px 이상, 같은 출처, 일반 클릭, dialog 지원)이 맞을 때만 팝업으로 연다.
// - 제품 페이지 원본은 수정하지 않는다. 같은 출처 iframe 문서에만 헤더·푸터·플로팅·KNGIL 공지 숨김 스타일을 주입한다.
// - 제품 페이지의 common.js(SSO)와 GA 스크립트는 iframe 안에서 그대로 실행된다.
(() => {
  if (typeof HTMLDialogElement !== "function") return;

  const MOBILE_QUERY = window.matchMedia("(max-width: 600px)");
  const LOAD_TIMEOUT_MS = 15000;
  const EMBED_STYLE_ID = "service-detail-embed-style";
  // 헤더를 숨기므로 제품 페이지의 헤더 높이 여백(.container padding-top: 92px)도 팝업 안에서만 없앤다.
  const EMBED_CSS =
    "#header, #footer, .map_list, .btn_top, .floating_guide_only, .floating-kngil, .floating-menu, .floating-top-btn, #pop_notice { display: none !important; }" +
    " .container { padding-top: 0 !important; }";
  const NAMES = { egbim: "EG-BIM", tova: "TOVA", gaia: "GAIA", kngil: "KNGIL" };
  const TEXT =
    document.documentElement.lang === "en"
      ? {
          label: (name) => `${name} details`,
          frameTitle: (name) => `About ${name}`,
          close: "Close details",
          loading: "Loading service details…",
          failed: "Unable to load the content.",
          openPage: "Open the page",
        }
      : {
          label: (name) => `${name} 자세히 보기`,
          frameTitle: (name) => `${name} 소개`,
          close: "상세 팝업 닫기",
          loading: "서비스 내용을 불러오는 중입니다.",
          failed: "내용을 불러오지 못했습니다.",
          openPage: "페이지로 이동",
        };

  let dialog;
  let frame;
  let status;
  let trigger;
  let pageUrl;
  let loadTimer;

  function createDialog() {
    dialog = document.createElement("dialog");
    dialog.className = "service-detail";
    dialog.setAttribute("data-lenis-prevent", "");
    dialog.innerHTML =
      '<button type="button" class="service-detail__close"><span aria-hidden="true">×</span></button>' +
      '<div class="service-detail__body" data-lenis-prevent>' +
      '<div class="service-detail__status" role="status" hidden></div>' +
      '<iframe class="service-detail__frame" src="about:blank"></iframe>' +
      "</div>";
    document.body.append(dialog);

    frame = dialog.querySelector(".service-detail__frame");
    status = dialog.querySelector(".service-detail__status");
    const closeButton = dialog.querySelector(".service-detail__close");
    closeButton.setAttribute("aria-label", TEXT.close);
    closeButton.addEventListener("click", () => dialog.close());

    // 배경(backdrop) 클릭으로 닫기
    let backdropPressed = false;
    const isBackdrop = (event) => {
      const box = dialog.getBoundingClientRect();
      return (
        event.target === dialog &&
        (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)
      );
    };
    dialog.addEventListener("pointerdown", (event) => {
      backdropPressed = isBackdrop(event);
    });
    dialog.addEventListener("click", (event) => {
      if (backdropPressed && isBackdrop(event)) dialog.close();
      backdropPressed = false;
    });

    frame.addEventListener("load", onFrameLoad);
    dialog.addEventListener("close", onClose);
  }

  function showStatus(message, withLink) {
    status.replaceChildren(Object.assign(document.createElement("p"), { textContent: message }));
    if (withLink && pageUrl) {
      status.append(Object.assign(document.createElement("a"), { href: pageUrl.href, textContent: TEXT.openPage }));
    }
    status.hidden = false;
  }

  function fail() {
    clearTimeout(loadTimer);
    frame.classList.add("is-pending");
    frame.removeAttribute("aria-busy");
    showStatus(TEXT.failed, true);
  }

  function onFrameLoad() {
    if (!dialog.open || frame.getAttribute("src") === "about:blank") return;

    let doc;
    try {
      // 다른 출처로 이동했다면 여기서 접근이 막혀 예외가 발생한다.
      if (frame.contentWindow.location.origin !== window.location.origin) throw new Error("cross-origin");
      doc = frame.contentDocument;
    } catch (error) {
      fail();
      return;
    }

    // 로그인 페이지로 이동했거나 본문이 없는 경우(404 등)는 오류로 처리한다.
    if (!doc || doc.location.pathname.startsWith("/auth/") || !doc.querySelector(".container, main")) {
      fail();
      return;
    }

    if (!doc.getElementById(EMBED_STYLE_ID)) {
      const style = doc.createElement("style");
      style.id = EMBED_STYLE_ID;
      style.textContent = EMBED_CSS;
      (doc.head || doc.documentElement).append(style);
    }

    // 다른 출처 링크는 팝업 안이 아닌 새 창으로 연다(원본 파일은 그대로, iframe 안에서만 적용).
    doc.querySelectorAll("a[href]").forEach((link) => {
      if (link.origin && link.origin !== window.location.origin) {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }
    });

    // iframe 안의 키 입력은 부모 dialog로 전달되지 않으므로 Esc를 직접 받아 닫는다.
    frame.contentWindow.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && dialog.open) dialog.close();
    });

    clearTimeout(loadTimer);
    frame.classList.remove("is-pending");
    frame.removeAttribute("aria-busy");
    status.hidden = true;
  }

  function open(link, url) {
    if (!dialog) createDialog();

    const name = NAMES[link.dataset.serviceDetail] || link.textContent.trim();
    trigger = link;
    pageUrl = url;

    const embedUrl = new URL(url.href);
    embedUrl.searchParams.set("embed", "1");

    dialog.setAttribute("aria-label", TEXT.label(name));
    frame.title = TEXT.frameTitle(name);
    frame.classList.add("is-pending");
    frame.setAttribute("aria-busy", "true");
    showStatus(TEXT.loading, false);

    document.documentElement.classList.add("service-detail-open");
    // dialog는 닫힐 때 '열기 직전 포커스 요소'로 포커스를 되돌리므로, 클릭으로 포커스가 이동하지 않는
    // 환경(Safari 마우스 클릭, 스크립트 클릭)에서도 트리거로 복귀하도록 먼저 포커스를 맞춘다.
    link.focus({ preventScroll: true });
    dialog.showModal();
    link.setAttribute("aria-expanded", "true");

    clearTimeout(loadTimer);
    loadTimer = setTimeout(fail, LOAD_TIMEOUT_MS);
    frame.src = embedUrl.href;
  }

  function onClose() {
    clearTimeout(loadTimer);
    frame.src = "about:blank";
    frame.classList.add("is-pending");
    status.hidden = true;
    document.documentElement.classList.remove("service-detail-open");
    if (trigger) {
      trigger.setAttribute("aria-expanded", "false");
      trigger.focus({ preventScroll: true });
    }
    trigger = null;
    pageUrl = null;
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest && event.target.closest("a[data-service-detail]");
    if (!link) return;
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    // 600px 이하는 팝업 대신 기존 제품 페이지로 이동한다.
    if (MOBILE_QUERY.matches) return;

    const url = new URL(link.getAttribute("href"), window.location.href);
    if (url.origin !== window.location.origin) return;

    event.preventDefault();
    open(link, url);
  });
})();
