(function () {
  var STORAGE_KEY = 'kngil_notice_popup_hide_date';
  // 게시기간은 한국 시간 기준입니다. 종료 시각은 포함하지 않습니다.
  var START_AT = new Date('2026-10-21T16:00:00+09:00').getTime();
  var CHANGE_AT = new Date('2026-10-26T00:00:00+09:00').getTime();
  var EXPIRE_AT = new Date('2026-11-06T10:00:00+09:00').getTime();
  // Cloudflare R2의 기존 홈페이지 이미지 경로를 사용합니다.
  var IMAGE_BASE = '/ko/kngil/img/popup/';

  function getLocalDateString() {
    return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
  }

  function isHiddenToday() {
    try {
      return window.localStorage.getItem(STORAGE_KEY) === getLocalDateString();
    } catch (err) {
      return false;
    }
  }

  function hideToday() {
    try {
      window.localStorage.setItem(STORAGE_KEY, getLocalDateString());
    } catch (err) {
      /* ignore */
    }
  }

  function initSwiper(wrap) {
    var el = wrap.querySelector('.notice-pop-swiper');
    if (!el || typeof window.Swiper === 'undefined') return;
    new window.Swiper(el, {
      slidesPerView: 1,
      spaceBetween: 0,
      loop: false,
      pagination: {
        el: el.querySelector('.notice-pop-swiper__pagination'),
        clickable: true,
      },
    });
  }

  function isOpen(wrap) {
    return wrap.classList.contains('is-open');
  }

  function openPopup(wrap) {
    wrap.classList.add('is-open');
  }

  function closePopup(wrap) {
    if (!isOpen(wrap)) return;
    wrap.classList.remove('is-open');
  }

  function init() {
    var wrap = document.getElementById('pop_notice');
    if (!wrap) return;

    var dismissed = false;
    var currentPeriod = null;

    function refreshNotice() {
      var now = Date.now();
      var nextChange;
      if (now < START_AT) {
        closePopup(wrap);
        nextChange = START_AT;
      } else if (now >= EXPIRE_AT) {
        closePopup(wrap);
        return;
      } else {
        var firstPeriod = now < CHANGE_AT;
        if (currentPeriod !== firstPeriod) {
          var desktop = wrap.querySelector('.notice-pop-desktop');
          var swiperElement = wrap.querySelector('.notice-pop-swiper');
          var mobileImages = firstPeriod
            ? ['261021_pop_mo1.png', '261021_pop_mo2.png']
            : ['261021_pop_mo2.png'];

          wrap.style.setProperty('--notice-pc-width', firstPeriod ? '980px' : '490px');
          desktop.src = IMAGE_BASE + (firstPeriod ? '261021_pop.png' : '261025_pop.png');
          desktop.alt = '큰길 서비스 고도화 안내';
          if (swiperElement.swiper) swiperElement.swiper.destroy(true, true);
          swiperElement.querySelector('.swiper-wrapper').innerHTML = mobileImages.map(function (image) {
            return '<div class="swiper-slide"><img src="' + IMAGE_BASE + image + '" alt="큰길 서비스 고도화 안내" /></div>';
          }).join('');
          if (!dismissed && !isHiddenToday()) openPopup(wrap);
          initSwiper(wrap);
          currentPeriod = firstPeriod;
        }
        nextChange = firstPeriod ? CHANGE_AT : EXPIRE_AT;
      }
      // 페이지를 열어둔 상태에서도 시작·이미지 전환·종료 시각을 적용합니다.
      window.setTimeout(refreshNotice, Math.min(nextChange - now, 2147483647));
    }

    refreshNotice();

    var noShowBtn = document.getElementById('pop-no-show-btn');
    if (noShowBtn) {
      noShowBtn.addEventListener('click', function () {
        dismissed = true;
        hideToday();
        closePopup(wrap);
      });
    }

    var closeBtn = wrap.querySelector('.pop-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        dismissed = true;
        closePopup(wrap);
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen(wrap)) {
        dismissed = true;
        closePopup(wrap);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
