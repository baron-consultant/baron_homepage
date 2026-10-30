import { ensureBaronSsoAuth } from "./baron-sso-auth.js?v=20260721-worker2";

// --window-inner-height: 실제 뷰포트 높이를 CSS 변수로 반영 (모바일 100vh 이슈 대응, kngil 레이아웃에서 사용)
function updateWindowInnerHeight() {
  document.documentElement.style.setProperty("--window-inner-height", window.innerHeight + "px");
}
updateWindowInnerHeight();
window.addEventListener("resize", updateWindowInnerHeight);

const pathSegments = location.pathname.split('/').filter(Boolean);
const rootMarkerSegments = ['ko', 'en', 'callback', 'assets', 'protected', 'public', 'recruit'];
const rootPrefix = pathSegments.length && !rootMarkerSegments.includes(pathSegments[0]) ? `/${pathSegments[0]}` : '';
const normalizePath = (path) => {
  const normalizedPath = (path || '/').replace(/\/index\.html$/i, '/');
  if (normalizedPath.length > 1 && normalizedPath.endsWith('/')) {
    return normalizedPath.slice(0, -1);
  }
  return normalizedPath;
};
const currentPath = normalizePath(location.pathname);
const matchesPublicPath = (path, entry) => {
  const normalizedEntry = normalizePath(entry);

  if (normalizedEntry.endsWith('_')) {
    return path.startsWith(normalizedEntry);
  }

  return path === normalizedEntry || path.startsWith(`${normalizedEntry}/`);
};
const landingPagePaths = [
  `${rootPrefix}/ko`,
  `${rootPrefix}/ko/`,
  `${rootPrefix}/ko/index.html`,
  `${rootPrefix}/en`,
  `${rootPrefix}/en/`,
  `${rootPrefix}/en/index.html`,
];
const publicPagePaths = [
  ...landingPagePaths,
  `${rootPrefix}/ko/sv_sw.html`,
  `${rootPrefix}/en/sv_sw.html`,
  `${rootPrefix}/ko/sv_sw_`,
  `${rootPrefix}/en/sv_sw_`,
  `${rootPrefix}/ko/egbim`,
  `${rootPrefix}/en/egbim`,
  `${rootPrefix}/ko/tova`,
  `${rootPrefix}/en/tova`,
  `${rootPrefix}/ko/pr_`,
  `${rootPrefix}/en/pr_`,
  `${rootPrefix}/ko/gaia`,
  `${rootPrefix}/en/gaia`,
  `${rootPrefix}/ko/kngil`,
  `${rootPrefix}/en/kngil`,
  `${rootPrefix}/ko/sv_bigroom.html`,
  `${rootPrefix}/en/sv_bigroom.html`,
];
const normalizedLandingPagePaths = landingPagePaths.map(normalizePath);
const isLandingPage = normalizedLandingPagePaths.includes(currentPath);
const isPublicInfoPage = publicPagePaths.some((entry) => matchesPublicPath(currentPath, entry));
const loginRequested = isPublicInfoPage && new URL(window.location.href).searchParams.get('login') === '1';

if (isLandingPage) {
  document.documentElement.dataset.baronPageMode = 'landing';
} else if (isPublicInfoPage) {
  document.documentElement.dataset.baronPageMode = 'public-info';
}

const authResult = await ensureBaronSsoAuth(
  isPublicInfoPage
    ? {
        publicPaths: publicPagePaths,
        forceAuth: loginRequested,
      }
    : {}
);

const isAuthenticated = Boolean(authResult?.session);
const isAnonymousPublicPage = Boolean(isPublicInfoPage && !isAuthenticated);

document.documentElement.dataset.baronAuthState = isAuthenticated ? 'authenticated' : 'anonymous';

// ── AJAX 관련 SCRIPT
$(function () {
  const includeVersion = '20260623-3';
  const navIncludeFile = isAnonymousPublicPage ? 'nav-public.html' : 'nav.html';
  const includeBase = `${rootPrefix}/_include`;

  $.ajaxSetup({ cache: false });

  // Share both in-flight and completed static includes within this page.
  const htmlRequests = new Map();

  function loadHTML(url, target, callback) {
    let request = htmlRequests.get(url);
    if (!request) {
      request = $.ajax({ url, cache: true, dataType: "html", timeout: 5000 });
      htmlRequests.set(url, request);
      request.fail(function () { htmlRequests.delete(url); });
    }
    request.done(function (data) {
      $(target).html(data);
      if (typeof callback === "function") callback();
    }).fail(function (xhr, status, error) {
      console.error(`Failed to load ${url}:`, error || status);
      if (typeof callback === "function") callback();
    });
  }

  function normalizeSiteLinks(root) {
    if (!root) {
      return;
    }

    root.querySelectorAll('a[href], img[src], source[src]').forEach((node) => {
      const attributeName = node.hasAttribute('href') ? 'href' : 'src';
      const rawValue = node.getAttribute(attributeName);

      if (!rawValue || /^(?:https?:|mailto:|tel:|javascript:|#)/i.test(rawValue)) {
        return;
      }

      const normalizedValue = rawValue
        .replace(/^\.\.\/(ko|en|recruit)\//, `${rootPrefix}/$1/`)
        .replace(/^\/(ko|en|recruit)\//, `${rootPrefix}/$1/`)
        .replace(/^\.\.\/callback\.html$/, `${rootPrefix}/callback.html`)
        .replace(/^\/callback\.html$/, `${rootPrefix}/callback.html`);

      if (normalizedValue !== rawValue) {
        node.setAttribute(attributeName, normalizedValue);
      }
    });
  }

  // nav 연결 (depth3 지원)
  function connectNavToMapList() {
    const currentPathname = location.pathname; // 전체 경로로 비교 (egbim/tova/gaia value.html 구분)
    const navLinks = document.querySelectorAll(
      "header .corp nav ol li.depth1 ul.depth2 li a"
    );

    let matchedLink = null;

    navLinks.forEach((link) => {
      const href = link.getAttribute("href"); // 절대경로 그대로 사용
      if (href === currentPathname || currentPathname.endsWith(href)) {
        if (matchedLink && matchedLink.closest('.depth3')) {
          return;
        }
        if (!matchedLink || link.closest('.depth3')) {
          matchedLink = link;
        }
      }
    });

    if (matchedLink) {
      const mapList = document.querySelector(".map_list");
      if (mapList) {
        mapList.innerHTML = "";
        matchedLink.closest(".depth1").classList.add("active");

        const hasDepth3 = matchedLink.closest("li.has_depth3");
        if (hasDepth3) {
          matchedLink.closest(".depth1").querySelectorAll("li.has_depth3").forEach(el => {
            el.classList.remove("active");
          });
          hasDepth3.classList.add("active");
        }

        const liHome = document.createElement("li");
        liHome.innerHTML = '<i class="home"></i>';
        mapList.appendChild(liHome);

        const categoryTitle = matchedLink
          .closest(".depth1")
          ?.querySelector("span")
          ?.textContent.trim();
        const subTitle = matchedLink
          .closest(".depth1")
          ?.querySelector("em")
          ?.textContent.trim();
        const mainTitle = categoryTitle.replace(subTitle, "").trim();

        const liCategory = document.createElement("li");
        liCategory.textContent = mainTitle || "";
        mapList.appendChild(liCategory);

        const depth3El = matchedLink.closest('.depth3');
        if (depth3El) {
          const depth2Link = matchedLink.closest('.has_depth3')?.querySelector('a');
          const depth2Title = depth2Link ? depth2Link.textContent.trim() : "";
          const liDepth2 = document.createElement("li");
          liDepth2.textContent = depth2Title;
          mapList.appendChild(liDepth2);

          const targetTitle = matchedLink.textContent.trim();
          const liOn = document.createElement("li");
          liOn.classList.add("on");
          liOn.textContent = targetTitle || "";
          mapList.appendChild(liOn);
        } else {
          const targetTitle = matchedLink.textContent.trim();
          const liOn = document.createElement("li");
          liOn.classList.add("on");
          liOn.textContent = targetTitle || "";
          mapList.appendChild(liOn);
        }
      }
    }
  }

  // PC GNB 패키지 S/W / 서비스 S/W 3depth 탭 전환 기능
  // 드롭다운이 여러 개(패키지 S/W, 서비스 S/W 등) 존재할 수 있으므로 각각 독립적으로 스코프 처리
  function initPackageSWTab() {
    $('.package_sw_dropdown').each(function () {
      const $dropdown = $(this);
      const $menuItems = $dropdown.find('> li.has_depth3');
      if (!$menuItems.length) return;

      // 1depth 메뉴 호버 시 드롭다운이 열리면 첫 번째 항목 기본 활성화
      $dropdown.closest('.depth1').on('mouseenter', function () {
        if (!$menuItems.filter('.active').length) {
          $menuItems.removeClass('active');
          $menuItems.first().addClass('active');
        }
      });

      // 2depth 메뉴 호버 시 active 클래스 전환
      $menuItems.on('mouseenter', function () {
        $menuItems.removeClass('active');
        $(this).addClass('active');
      });
    });
  }

  function trimPopupDepth3Nav() {
    const popupNav = document.querySelector('.popup_wrap.sitemap .popup_contents_wrap nav');

    if (!popupNav) {
      return;
    }

    popupNav.querySelectorAll('li.has_depth3 > .depth3').forEach((depth3) => {
      depth3.remove();
    });
  }

  function trimPublicNav(root) {
    if (!isAnonymousPublicPage || !root) {
      return;
    }

    const allowedLabels = ['패키지 S/W', '서비스 S/W', '빅룸', '홍보센터'];
    const topLevels = root.querySelectorAll('ol > li.depth1');
    topLevels.forEach((item) => {
      const label = item.querySelector('span')?.textContent.replace(/\s+/g, ' ').trim() || '';
      const shouldKeep = allowedLabels.some((allowedLabel) => label.includes(allowedLabel));

      if (!shouldKeep) {
        // li는 유지하고 링크만 비워 sitemap 팝업의 :nth-child 기반 3depth 스타일 위치를 보존한다.
        item.classList.add('menu_hidden');
        const depth2 = item.querySelector(':scope > ul.depth2');
        if (depth2) {
          depth2.innerHTML = '';
        }
      }
    });
  }

  function configureHeaderActions(root) {
    if (!root) {
      return;
    }

    const loginWrap = root.querySelector('.header_login');
    const loginLink = root.querySelector('.header_login_link');
    if (!loginWrap || !loginLink) {
      return;
    }

    if (isAuthenticated) {
      loginWrap.hidden = false;
      loginLink.textContent = '로그아웃';
      loginLink.href = '#';
      loginLink.onclick = (event) => {
        event.preventDefault();
        window.baronSsoLogout?.();
      };
      return;
    }

    if (!isPublicInfoPage) {
      loginWrap.hidden = true;
      return;
    }

    loginWrap.hidden = false;
    loginLink.textContent = '로그인';
    loginLink.href = `${location.pathname}?login=1`;
    loginLink.onclick = null;
  }

  function loadSitemapNav() {
    if (!$('.container').hasClass('recruit')) {
      loadHTML(`${includeBase}/${navIncludeFile}?v=${includeVersion}`, '.popup_wrap.sitemap .popup_contents_wrap nav', function () {
        normalizeSiteLinks(document.querySelector('.popup_wrap.sitemap .popup_contents_wrap nav'));
        trimPublicNav(document.querySelector('.popup_wrap.sitemap .popup_contents_wrap nav'));
        mobileMenu();
      });
    } else {
      loadHTML(`${includeBase}/nav_recruit.html?v=${includeVersion}`, '.popup_wrap.sitemap .popup_contents_wrap nav', function () {
        mobileMenu();
      });
    }
  }

  if (!$('.container').hasClass('recruit')) {
    loadHTML(`${includeBase}/header.html?v=${includeVersion}`, '#header', function () {
      normalizeSiteLinks(document.querySelector('#header'));
      loadHTML(`${includeBase}/${navIncludeFile}?v=${includeVersion}`, '#header .corp .nav', function () {
        normalizeSiteLinks(document.querySelector('#header .corp .nav'));
        connectNavToMapList();
        initPackageSWTab();
        trimPublicNav(document.querySelector('#header .corp .nav'));
      });
      configureHeaderActions(document.querySelector('#header'));
      loadSitemapNav();
    });
  } else {
    loadHTML(`${includeBase}/header_recruit.html?v=${includeVersion}`, "#header_recruit", function () {
      loadSitemapNav();
      if (!$(".container").hasClass("recruit")) {
      } else {
        const currentPath = location.pathname.split("/").pop();
        const navLinks = document.querySelectorAll(
          "header .recruit nav ol li.depth1 a"
        );
        navLinks.forEach((link) => {
          const href = link.getAttribute("href").split("/").pop();
          if (href === currentPath) {
            link.closest(".depth1").classList.add("active");
          }
        });
      }
    });
  }

  loadHTML(`${includeBase}/footer.html?v=${includeVersion}`, '#footer', function () {
    normalizeSiteLinks(document.querySelector('#footer'));
    loadHTML(`${includeBase}/${navIncludeFile}?v=${includeVersion}`, '#footer .nav', function () {
      normalizeSiteLinks(document.querySelector('#footer .nav'));
      trimPublicNav(document.querySelector('#footer .nav'));
    });
  });
});

// ── TITLE 관련 SCRIPT
// ── S: title 다일링기

$(function () {
  const currentPath = location.pathname;
  if (currentPath.indexOf("/recruit/") > 0) {
    document.querySelector("head title").textContent =
      "인재채용 | (주)바론컨설턴트";
  } else {
    document.querySelector("head title").textContent = "(주)바론컨설턴트";
  }
});

// E : title 다일링기

// ── S : header 숨기기
$(function () {
  const showNav = gsap
    .from("#header, #header_recruit", {
      yPercent: -200,
      paused: true,
      duration: 0.2,
      onStart: () => {
        const stHeader = document.querySelector("header");
        if (window.scrollY > 100) {
          stHeader.classList.add("open");
        }
      },
      onReverseComplete: () => {
        const stHeader = document.querySelector("header");
        stHeader.classList.remove("open");
      },
    })
    .progress(1);

  let showMapList = null;
  const headerNavMM = gsap.matchMedia();
  headerNavMM.add("(max-width: 1400px)", () => {
    showMapList = gsap
      .from(".map_list", {
        y: -40,
        autoAlpha: 0,
        paused: true,
        duration: 0.2,
      })
      .progress(1);
    return () => {
      showMapList = null;
    };
  });

  ScrollTrigger.create({
    start: "top top",
    end: 99999,
    onUpdate: (self) => {
      if (lenis && lenis.isStopped) return;
      if (self.direction === -1) {
        showNav.play();
        showMapList && showMapList.play();
      } else {
        showNav.reverse();
        showMapList && showMapList.reverse();
      }
    },
  });
});
// E : header 숨기기

// ── POPUP SCRIPT
// ── S : 팝업 열기
$(function () {
  $(document).on("click", "button", function () {
    const button = this;
    const value = button.getAttribute("data-value");
    const popup = document.querySelector(`.popup_wrap.${value}`);

    if (popup) {
      // 현재 스크롤 위치 저장
      const scrollY = window.scrollY;
      document.body.setAttribute("data-scroll-lock", scrollY);

      // body 고정
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";

      // Lenis 일시 중단
      if (lenis) {
        lenis.destroy();
      }

      // 팝업 표시
      popup.style.display = "block";

      // 팝업 내부 스크롤 강제 활성화
      const popupContents = popup.querySelector(".popup_contents_wrap");
      if (popupContents) {
        popupContents.removeAttribute("data-lenis-prevent-wheel");
        popupContents.removeAttribute("data-lenis-prevent");
        popupContents.style.cssText = `
          overflow-y: auto !important;
          -webkit-overflow-scrolling: touch !important;
          overscroll-behavior: contain !important;
          height: 100vh !important;
          touch-action: pan-y !important;
        `;

        // 터치 이벤트 강제 허용
        popupContents.addEventListener(
          "touchstart",
          function (e) {
            e.stopPropagation();
          },
          { passive: true }
        );

        popupContents.addEventListener(
          "touchmove",
          function (e) {
            e.stopPropagation();
          },
          { passive: true }
        );
      }
    }
  });
});
// E : 팝업 열기

// ── S : 팝업 닫기
$(function () {
  $(document).on("click", function (e) {
    const $target = $(e.target);

    // 닫기 버튼 클릭 시
    if ($target.closest(".btn_close").length) {
      const $popupWrap = $target.closest(".popup_wrap");
      if ($popupWrap.length) {
        $popupWrap.hide();
        enableBodyScroll();
      }
      return;
    }

    // popup_contents_wrap 클릭 자체가 배경 클릭인 경우 닫기
    const $popupContents = $target.closest(".popup_contents_wrap");
    if ($popupContents.length && $target.is(".popup_contents_wrap")) {
      const $popupWrap = $target.closest(".popup_wrap");
      if ($popupWrap.length) {
        $popupWrap.hide();
        enableBodyScroll();
      }
    }
  });

  // 팝업 닫힐 때 body 스크롤 복원
  function enableBodyScroll() {
    // body 스크롤 위치 복원
    const scrollY = document.body.style.top;
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    window.scrollTo({
      top: parseInt(scrollY || "0") * -1,
      left: 0,
      behavior: "instant", // 또는 'auto'
    });

    // Lenis 재시작
    handleStartLenis();
  }
});
// E : 팝업 닫기

// ── S : map list 움직이기 /* 250604추가 */
let lastScrollY = window.scrollY;
const stickyBox = document.querySelector(".map_list");

window.addEventListener("scroll", () => {
  const currentScrollY = window.scrollY;
  const width = window.innerWidth;
  if (width > 1440) {
    //250604 추가
    if (stickyBox != null) {
      if (currentScrollY > lastScrollY) {
        // 아래로 스크롤할 때
        stickyBox.style.top = "24px";
      } else {
        // 위로 스크롤할 때
        stickyBox.style.top = "124px";
      }
    }
  } else {
    if (stickyBox != null) {
      if (currentScrollY > lastScrollY) {
        // 아래로 스크롤할 때
        stickyBox.style.top = "24px";
      } else {
        // 위로 스크롤할 때
        stickyBox.style.top = "74px";
      }
    }
  }

  lastScrollY = currentScrollY;
});
// E : map list 움직이기

// ── SCROLL SCRIPT
// ── AOS
if (window.AOS && typeof window.AOS.init === "function") {
  window.AOS.init();
}

// ── Lenis

let lenis;
let lenisTickerCallback;

function handleStartLenis() {
  if (lenisTickerCallback) {
    gsap.ticker.remove(lenisTickerCallback);
    lenisTickerCallback = null;
  }

  if (lenis) {
    lenis.destroy();
    lenis = null;
  }

  if (typeof window.Lenis !== "function") {
    return;
  }

  lenis = new Lenis({
    lerp: 0.1, // 스크롤의 부드러운 정도
    smoothWheel: true,
    smoothTouch: false,
  });

  lenis.on('scroll', () => {
    if (window.ScrollTrigger) {
      window.ScrollTrigger.update();
    }
  });

  lenisTickerCallback = (time) => {
    if (!lenis || typeof lenis.raf !== "function") return;
    lenis.raf(time * 1000);
  };

  gsap.ticker.add(lenisTickerCallback);
  gsap.ticker.lagSmoothing(0);
}
handleStartLenis();

export default lenis;

// ── 로드 UI fallback 해제
function releaseLoadingUI() {
  document.documentElement.classList.remove("loading");
  document.body.classList.remove("loading", "is-loading");

  [".loading", ".loading_wrap", ".loader", ".preloader"].forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      el.style.display = "none";
      el.setAttribute("aria-hidden", "true");
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", releaseLoadingUI, { once: true });
} else {
  releaseLoadingUI();
}

window.addEventListener("load", releaseLoadingUI, { once: true });
window.setTimeout(releaseLoadingUI, 5000);
window.addEventListener("pageshow", releaseLoadingUI);
window.addEventListener("error", releaseLoadingUI);
window.addEventListener("unhandledrejection", releaseLoadingUI);

function mobileMenu() {
  const mNav = document.querySelectorAll(".sitemap ol > li.depth1");

  mNav.forEach((item) => {
    const trigger = item.querySelector(":scope > span");
    const depth2 = item.querySelector(":scope > .depth2");

    if (!trigger || !depth2 || trigger.dataset.mobileMenuBound === "true") {
      return;
    }

    trigger.dataset.mobileMenuBound = "true";
    trigger.addEventListener("click", function () {
      if (window.innerWidth > 1440) {
        return;
      }

      const isActive = item.classList.contains("active");

      // 다른 모든 활성화된 메뉴 닫기 (아코디언 동작)
      mNav.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.classList.remove("active");
          const otherDepth2 = otherItem.querySelector(":scope > .depth2");
          if (otherDepth2) {
            otherDepth2.style.maxHeight = null;
          }
        }
      });

      if (!isActive) {
        item.classList.add("active");
        depth2.style.maxHeight = depth2.scrollHeight + "px";
      } else {
        item.classList.remove("active");
        depth2.style.maxHeight = null;
      }
    });
  });
}
