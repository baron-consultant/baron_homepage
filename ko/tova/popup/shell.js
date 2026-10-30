/* 팝업(자세히 보기) 전용: service-detail.js가 iframe 안에서만 불러온다. ★최종 원본에서 이식. */
window.goto = id => {
  const target = document.getElementById(id);
  if (target) gsap.to(window, { duration:.4, scrollTo:{ y:target, offsetY:48 } });
};
(() => {
  const header = document.querySelector('.service-original-header');
  const sitemap = document.getElementById('sitemap');
  const toggle = header.querySelector('[aria-controls="sitemap"]');
  const close = sitemap.querySelector('.btn_map_close a');
  function showSitemap(open) {
    sitemap.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    document.documentElement.classList.toggle('service-sitemap-open', open);
    // Keep keyboard focus in the original sitemap while it covers the page.
    [...document.body.children].forEach(element => {
      if (element !== sitemap && element.tagName !== 'SCRIPT') element.inert = open;
    });
    if (open) { sitemap.scrollTop = 0; close.focus({ preventScroll:true }); }
    else toggle.focus({ preventScroll:true });
  }
  toggle.addEventListener('click', event => { event.preventDefault(); showSitemap(true); });
  close.addEventListener('click', event => { event.preventDefault(); showSitemap(false); });
  document.querySelectorAll('a[aria-disabled="true"]').forEach(link => link.addEventListener('click', event => event.preventDefault()));
  document.addEventListener('keydown', event => {
    if (event.key === 'Tab' && !sitemap.hidden) {
      const links = [...sitemap.querySelectorAll('a[href]')].filter(link => link.getClientRects().length && link.getAttribute('aria-disabled') !== 'true');
      const first = links[0], last = links[links.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    if (event.key !== 'Escape') return;
    event.preventDefault();
    if (!sitemap.hidden) showSitemap(false);
    else if (parent !== window) parent.postMessage({ type:'service-detail-close' }, location.origin);
  });
  if (window.ScrollTrigger) ScrollTrigger.refresh();
})();
