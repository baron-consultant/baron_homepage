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
})

document.addEventListener('DOMContentLoaded', () => {
    const section = document.querySelector('.js__height_trigger');
    if (!section) return;

    gsap.matchMedia().add('(min-width: 993px)', () => {
        const item = section.querySelector('.js__height_item');
        const button = section.querySelector('.js__height_btn');
        const mouseMark = document.querySelector('.js__mouse_mark');
        const menuTexts = item.querySelectorAll('.menu_text');
        let expanded;
        let sampled = false;

        function setExpanded(next) {
            // Only change modes at the boundary, so scrolling does not reset the guide button.
            if (expanded === next) return;
            expanded = next;
            item.classList.toggle('full', next);
            item.style.backgroundImage = 'url(img/value_screen1.png)';
            button.classList.remove('on');
            gsap.set(button, {
                left: next ? 'calc(11% - 60px)' : 'calc(50% - 60px)',
                opacity: next ? 1 : 0,
                pointerEvents: next ? '' : 'none'
            });
            if (mouseMark) gsap.set(mouseMark, { opacity: next ? 0 : 1 });
            menuTexts.forEach(text => { text.style.display = next ? '' : 'none'; });
            if (next && !sampled) {
                guideSample();
                sampled = true;
            }
            if (!next) item.classList.remove('show_ani');
        }

        gsap.set(item, { bottom: '50%', transition: 'none' });
        setExpanded(false);
        const timeline = gsap.timeline({ paused: true });
        // 10% introduction, 50% scroll-driven enlargement, 40% at full size for reading.
        timeline.fromTo(item, { yPercent: 70, scale: 0.5 }, {
            yPercent: 50, scale: 1, duration: 0.5, ease: 'none'
        }, 0.1).to({}, { duration: 0.4 });
        timeline.eventCallback('onUpdate', () => setExpanded(timeline.progress() >= 0.6 - 0.0001));

        ScrollTrigger.create({
            animation: timeline,
            trigger: section,
            start: 'top top',
            // Keep enough wheel travel even in a short iframe; recalculate after resizing.
            end: () => '+=' + Math.max(1900, Math.round(window.innerHeight * 2.4)),
            pin: true,
            scrub: 0.25,
            invalidateOnRefresh: true
        });

        return () => {
            item.classList.remove('full', 'show_ani');
            item.style.removeProperty('background-image');
            button.classList.remove('on');
            menuTexts.forEach(text => text.style.removeProperty('display'));
        };
    });
});


// 고정 슬라이드
document.addEventListener('DOMContentLoaded', function() {
    const screenM = document.querySelector('.screen.m');
    const sections = screenM.querySelectorAll('#sec1, #sec2, #sec3, #sec4');
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
                    el.classList.toggle('on', id === `sec${index + 1}`)
                )
            );
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach(section => observer.observe(section));
});



function guideSample() {
    console.log('애니메이션 시작');

    const guide = document.querySelector('.js__height_item');
    guide.classList.add('show_ani');

    setTimeout(() => {
        window.removeEventListener('wheel', preventScroll);
        window.removeEventListener('touchmove', preventScroll);
        guide.classList.remove('show_ani');
    }, 3000);
};

function preventScroll(event) {
    event.preventDefault();
}

function preventScroll(event) {
    event.preventDefault();
}

function guideSample() {
    console.log('애니메이션 시작');

    const guide = document.querySelector ('.js__height_item');
    guide.classList.add('show_ani');

    setTimeout(() => {
        window.removeEventListener('wheel', preventScroll);
        window.removeEventListener('touchmove', preventScroll);
        guide.classList.remove('show_ani');
    }, 3000);
};



document.addEventListener('DOMContentLoaded', function() {
    const guide = document.querySelector ('.js__height_item')
    const dim = guide.querySelector('.dim');
    const mask = guide.querySelector('.mask')
    const button = document.querySelector('.js__height_btn');
    const list = guide.querySelector('ul')
    const listItems = list.querySelectorAll('li');
    const listClassNames = ['li1', 'li2', 'li3', 'li4', 'li5', 'li6', 'li7', 'li8'];

    button.addEventListener('click', function() {
        if (button.classList.contains('on')) {
            button.classList.remove('on');
            guide.style.backgroundImage = 'url(img/value_screen1.png)'
            listItems.forEach(item => {
                const menuText = item.querySelector('.menu_text');
                if (menuText) {
                    menuText.style.display = '';
                }
            });
            
        } else {
            button.classList.add('on');
            guide.style.backgroundImage = 'url(img/value_screen2.png)'
            guide.style.transition = '0s'
            listItems.forEach(item => {
                const menuText = item.querySelector('.menu_text');
                if (menuText) {
                    menuText.style.display = 'block';
                }
            });
        }
    });

    listItems.forEach((item, index) => {
        item.addEventListener('mouseenter', () => {
            listClassNames.forEach(className => mask.classList.remove(className));
            dim.style.display = 'block';
            mask.style.display = "block";
            mask.classList.add(listClassNames[index]);
            item.style.zIndex = '100';
        });
    
        item.addEventListener('mouseleave', () => {
            listClassNames.forEach(className => mask.classList.remove(className));
            dim.style.display = '';
            mask.style.display = '';
            item.style.zIndex = ''
        });
    });
});
