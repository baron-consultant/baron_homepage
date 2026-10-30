document.addEventListener('DOMContentLoaded', (event)=> {

    // ---------------------------------------------
    // 주요기능의 라인 애니, 카드 애니
    // 사용 클래스 : js__ani
    // ---------------------------------------------
    let hasAnimationRun = false;
    const featuresAni = document.querySelector('.js__ani');
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: [0, 0.7] // Observe both 0% and 70% visibility
    };
    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (!hasAnimationRun && entry.intersectionRatio >= 0.7) {
                featuresAni.classList.add('card_ani');
                featuresAni.querySelector('.lines').classList.add('move_ani');
                setTimeout(() => {
                    featuresAni.classList.remove('card_ani');
                }, 1200);
                hasAnimationRun = true; 
                observer.unobserve(featuresAni);
            }
        });
    };
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    observer.observe(featuresAni);

    // ---------------------------------------------
    // js__height 배경 서서히 나타나기
    // 사용 클래스 : js__height_trigger, js__height_item
    // ---------------------------------------------
    // 초기 상태 설정: js__height_item, js__height_text
    gsap.set(".js__height_item", {transform: "translate(-50%, 0%) scale(0.6)", top: "24%"});
    
    const bottomToCenter = gsap.timeline();
    let guideSampleCalled = false;
    
    // ScrollTrigger 설정
    ScrollTrigger.create({
        animation: bottomToCenter,
        trigger: ".js__height_trigger",
        start: "top top",
        // Match the TOVA popup: enough wheel travel even inside a short iframe.
        end: () => '+=' + Math.max(1900, Math.round(window.innerHeight * 2.4)),
        invalidateOnRefresh: true,
        pin: true,
        duration: 0.5,
        // markers: true,
        // scrub: true,
        // anticipatePin: 1,
        onUpdate: (self) => {
            const item = document.querySelector(".js__height_item");
            const contents = item.querySelectorAll(".js__height_item > ul");
            const mouseMark = document.querySelector(".js__mouse_mark")

            if (self.progress > 0.5) {
                if (!guideSampleCalled) {
                    guideSample();
                    guideSampleCalled = true;
                };
                item.classList.add("full");
                item.style.transition = '0.5s'
                item.style.transform = 'translate(-50%, -50%) scale(1)';
                item.style.top = '50%';
                // mouseMark.style.opacity = '0';
                // mouseMark.style.display = 'none';
                contents.forEach(content => {
                    content.style.display = '';
                });
            } else {
                item.style.backgroundImage = 'url(img/value_screen1.jpg)'
                item.classList.remove("full");
                item.style.transition = '0.5s'
                item.style.transform = 'translate(-50%, 0%) scale(0.6)';
                item.style.top = '24%';
                // mouseMark.style.opacity = '1';
                // mouseMark.style.display = 'flex';
                contents.forEach(content => {
                    content.style.display = 'none';
                });
            }
        },
        onLeave: () => {
            document.querySelector(".js__height_item").style.backgroundImage = 'url(img/value_screen1.jpg)'
        }
    });
})

function preventScroll(event) {
    event.preventDefault();
}

// 고정 슬라이드
document.addEventListener('DOMContentLoaded', function() {
  const screenM = document.querySelector('.screen.m');
  const sections = screenM.querySelectorAll('#sec1, #sec2, #sec3, #sec4, #sec5, #sec6');
  const tabs = screenM.querySelectorAll('.tabs li');
  const subs = screenM.querySelectorAll('.subs li');
  const imgs = screenM.querySelectorAll('.imgs li');

  const observerOptions = {
      root: null,
      rootMargin: '20px',
      threshold: 0.5
  };

  const observerCallback = (entries) => {
      entries.filter(entry => entry.isIntersecting).forEach(entry => {
          const id = entry.target.id;
          [tabs, subs, imgs].forEach(group => 
              group.forEach((el, index) => 
                // TODO
                el.classList.toggle('on', id === `sec${index + 1}`),
              ),
          );
      });
  };

  const observer = new IntersectionObserver(observerCallback, observerOptions);
  sections.forEach(section => observer.observe(section));
});

function guideSample() {
    console.log('애니메이션 시작');

    const guide = document.querySelector ('.js__height_item');
    guide.classList.add('show_ani');

    setTimeout(() => {
        window.removeEventListener('wheel', preventScroll);
        window.removeEventListener('touchmove', preventScroll);
        guide.classList.remove('show_ani');
    }, 4500);
};



document.addEventListener('DOMContentLoaded', () => {
    const tabMenus = document.querySelectorAll('.js__height_item > .tab_menu > li');
    const tabItems = document.querySelectorAll('.js__height_item > .tab_item');

    console.log('here')
    console.log(tabItems)
    function hideAllTabs() {
        tabItems.forEach(tabItem => {
            tabItem.style.display = 'none';
        });
    }

    // Show the tab item based on index
    function showTab(index) {
        hideAllTabs();
        const targetTab = document.querySelector(`.tab_item.i${index + 1}`);
        if (targetTab) {
            targetTab.style.display = 'block';
        }
    }
    showTab(0);
    tabMenus.forEach((menuItem, index) => {
        menuItem.addEventListener('mouseenter', () => {
            showTab(index);
        });
    });
});