/* 팝업(자세히 보기) 전용: service-detail.js가 iframe 안에서만 불러온다. ★최종 원본에서 이식. */
(() => {
  const header = document.querySelector('.header');
  const toggle = header.querySelector('.menu-all');
  const sitemap = header.querySelector('.sitemap');
  const wrap = document.querySelector('.wrap');
  const background = [...wrap.children].filter(element => element !== header);
  const logo = header.querySelector('h1 a');
  const topShortcut = header.querySelector('.floating-top-btn');
  const sideShortcut = header.querySelector('.floating-service-btn');
  // A small threshold prevents flicker as scrolling settles at the top.
  const shortcutTopThreshold = 10;

  // These supplied photo sections have an intentional light or dark treatment.
  // For other photos or complex gradients, retain the requested white fallback.
  const knownLight = '.value .summary, .value .bg-features';
  const knownDark = '.value .visual, .container > .sub-header, .value .feature-card, .footer';
  function colorTone(color) {
    const channels = color.match(/[\d.]+/g)?.map(Number);
    if (!channels || channels.length < 3 || (channels[3] ?? 1) < .95) return null;
    const linear = channels.slice(0, 3).map(value => {
      const v = value / 255;
      return v <= .04045 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4);
    });
    const luminance = linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722;
    return luminance > .25 ? 'dark' : 'light';
  }
  function toneBehind(x, y) {
    const painted = document.elementsFromPoint(x, y).find(element => !header.contains(element));
    for (let element = painted; element; element = element.parentElement) {
      const style = getComputedStyle(element);
      // Transparent text/decoration inherits its containing surface's tone.
      if (Number(style.opacity) < .5) continue;
      if (element.matches(knownDark)) return 'light';
      if (element.matches(knownLight)) return 'dark';
      if (style.backgroundImage !== 'none' || element.matches('img, video, canvas')) return 'light';
      const tone = colorTone(style.backgroundColor);
      if (tone) return tone;
    }
    return 'light';
  }
  function controlTone(control) {
    const box = control.getBoundingClientRect();
    // A majority vote avoids flickering where two background sections meet.
    const samples = [.2, .5, .8].map(ratio => toneBehind(
      Math.min(innerWidth - 1, Math.max(0, box.left + box.width * ratio)),
      Math.min(innerHeight - 1, Math.max(0, box.top + box.height / 2))
    ));
    return samples.filter(tone => tone === 'dark').length >= 2 ? 'dark' : 'light';
  }
  function updateHeader() {
    const menuOpen = !sitemap.hidden;
    const atTop = window.scrollY <= shortcutTopThreshold;
    if (topShortcut) topShortcut.hidden = menuOpen || !atTop;
    if (sideShortcut) sideShortcut.hidden = menuOpen || atTop;
    header.dataset.logoTone = menuOpen ? 'light' : controlTone(logo);
    header.dataset.menuTone = menuOpen ? 'light' : controlTone(toggle);
  }
  let updatePending = false;
  function scheduleHeaderUpdate() {
    if (updatePending) return;
    updatePending = true;
    requestAnimationFrame(() => { updatePending = false; updateHeader(); });
  }

  function setSitemap(open) {
    sitemap.hidden = !open;
    sitemap.classList.toggle('open', open);
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? '사이트맵 닫기' : 'KNGIL 사이트맵');
    background.forEach(element => { element.inert = open; });
    updateHeader();
    toggle.focus({ preventScroll: true });
  }
  toggle.addEventListener('click', () => setSitemap(sitemap.hidden));
  updateHeader();
  window.addEventListener('scroll', scheduleHeaderUpdate, { passive: true });
  window.addEventListener('resize', scheduleHeaderUpdate);
  window.addEventListener('load', scheduleHeaderUpdate);
  document.addEventListener('load', scheduleHeaderUpdate, true);

  document.addEventListener('keydown', event => {
    // Let the inner guide handle Escape before closing the service preview.
    if (document.getElementById('guideModal')?.open) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (!sitemap.hidden) setSitemap(false);
      else if (parent !== window) parent.postMessage({ type: 'service-detail-close' }, location.origin);
    }
    if (event.key === 'Tab' && !sitemap.hidden) {
      const items = [...header.querySelectorAll('a[href],button')]
        .filter(element => element.getClientRects().length && !element.disabled && element.tabIndex >= 0);
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  }, true);
  document.querySelectorAll('a[aria-disabled="true"]').forEach(link => {
    link.addEventListener('click', event => event.preventDefault());
  });
  if (window.ScrollTrigger) ScrollTrigger.refresh();
})();
