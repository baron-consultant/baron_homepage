// 헤더 로그인 팝오버 보조 스크립트
// - 기존 CSS의 hover/focus-within 표시는 그대로 두고, 클릭(터치) 열기·바깥 클릭 닫기·Esc 닫기·aria-expanded만 보완한다.
// - 로그인/로그아웃 링크의 주소, 문구, 노출 여부는 common.js(configureHeaderActions)가 SSO 상태에 맞춰 설정하므로 여기서 다루지 않는다.
// - 헤더는 AJAX로 늦게 삽입되므로 document 이벤트 위임으로 처리한다.
const WRAPPER_SELECTOR = ".header_login";
const TRIGGER_SELECTOR = ".header_login_trigger";

function setExpanded(wrapper, expanded) {
  wrapper.querySelector(TRIGGER_SELECTOR)?.setAttribute("aria-expanded", String(expanded));
}

function openMenu(wrapper) {
  document.querySelectorAll(`${WRAPPER_SELECTOR}.is-open`).forEach((other) => {
    if (other !== wrapper) closeMenu(other);
  });
  wrapper.classList.remove("is-dismissed");
  wrapper.classList.add("is-open");
  setExpanded(wrapper, true);
}

// dismiss: hover/focus가 남아 있어도 포인터·포커스가 벗어날 때까지 닫힌 상태를 유지한다(Esc).
function closeMenu(wrapper, { dismiss = false } = {}) {
  wrapper.classList.remove("is-open");
  wrapper.classList.toggle("is-dismissed", dismiss);
  setExpanded(wrapper, false);
}

function isMenuVisible(wrapper) {
  if (wrapper.hidden || wrapper.classList.contains("is-dismissed")) return false;
  return wrapper.classList.contains("is-open") || wrapper.matches(":hover, :focus-within");
}

if (!window.__baronHeaderLoginBound) {
  window.__baronHeaderLoginBound = true;

  document.addEventListener("pointerover", (event) => {
    if (event.pointerType === "touch") return;
    const wrapper = event.target.closest?.(WRAPPER_SELECTOR);
    if (wrapper && !wrapper.contains(event.relatedTarget) && !wrapper.classList.contains("is-dismissed")) {
      setExpanded(wrapper, true);
    }
  });

  document.addEventListener("pointerout", (event) => {
    if (event.pointerType === "touch") return;
    const wrapper = event.target.closest?.(WRAPPER_SELECTOR);
    if (wrapper && !wrapper.contains(event.relatedTarget) && !wrapper.contains(document.activeElement)) {
      closeMenu(wrapper);
    }
  });

  document.addEventListener("focusin", (event) => {
    const wrapper = event.target.closest?.(WRAPPER_SELECTOR);
    if (wrapper && !wrapper.classList.contains("is-dismissed")) setExpanded(wrapper, true);
  });

  document.addEventListener("focusout", (event) => {
    const wrapper = event.target.closest?.(WRAPPER_SELECTOR);
    if (wrapper && !wrapper.contains(event.relatedTarget) && !wrapper.matches(":hover")) {
      closeMenu(wrapper);
    }
  });

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest?.(TRIGGER_SELECTOR);
    const wrapper = trigger?.closest(WRAPPER_SELECTOR);
    if (wrapper) {
      openMenu(wrapper);
      return;
    }
    if (!event.target.closest?.(WRAPPER_SELECTOR)) {
      document.querySelectorAll(`${WRAPPER_SELECTOR}.is-open`).forEach((openWrapper) => closeMenu(openWrapper));
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const wrapper = [...document.querySelectorAll(WRAPPER_SELECTOR)].find(isMenuVisible);
    if (!wrapper) return;
    const hadFocus = wrapper.contains(document.activeElement);
    closeMenu(wrapper, { dismiss: true });
    if (hadFocus) wrapper.querySelector(TRIGGER_SELECTOR)?.focus({ preventScroll: true });
  });
}
