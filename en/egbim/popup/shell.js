/* 팝업(자세히 보기) 전용: service-detail.js가 iframe 안에서만 불러온다. ★최종 원본에서 이식. */
window.goto=id=>{const target=document.getElementById(id);if(target)gsap.to(window,{duration:.4,scrollTo:{y:target,offsetY:76}})};
(() => {
 const header=document.querySelector('.egbim-original-header');
 const sitemap=document.querySelector('#sitemap');
 const toggle=header.querySelector('[aria-controls="sitemap"]');
 document.querySelectorAll('.floating_menu a[aria-disabled="true"]').forEach(link=>link.addEventListener('click',event=>event.preventDefault()));
 function showSitemap(open){sitemap.hidden=!open;header.classList.toggle('sitemap-open',open);toggle.parentElement.classList.toggle('btn_map_close',open);toggle.setAttribute('aria-expanded',String(open));if(open){sitemap.scrollTop=0;sitemap.querySelector('a').focus({preventScroll:true})}}
 toggle.addEventListener('click',event=>{event.preventDefault();showSitemap(sitemap.hidden)});
 document.addEventListener('keydown',event=>{if(event.key!=='Escape')return;event.preventDefault();if(!sitemap.hidden){showSitemap(false);toggle.focus()}else if(parent!==window)parent.postMessage({type:'service-detail-close'},location.origin)});
  if (window.ScrollTrigger) ScrollTrigger.refresh();
})();
