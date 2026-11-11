import lenis from "./common.js?v=20260623-4";

// ------------------------------
// [1] ?�이??로딩 �??�렬
// ------------------------------

let jobList = [];
function fetchData() {
  $.getJSON("job_list.json").then(function (data1) {
    jobList = data1.jobList;
    setApplyTotal(jobList);
  });
}

// ------------------------------
// [2] 채용 리스??
// ------------------------------
function setApplyTotal(list) {
  const partInfoMap = {
    engineer: "엔지니어",
    developer: "개발자",
    designer: "디자이너",
    management: "경영기획/관리",
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  Object.keys(partInfoMap).forEach((key) => {
    let partCnt = 0;
    list.forEach((job, index) => {
      if (key == job.group) {
        const [y, m, d] = job.date.split(".");
        const targetDate = new Date(y, m - 1, d);
        targetDate.setHours(0, 0, 0, 0);

        const diff = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
        if (diff > 0) {
          partCnt++;
        }
      }
    });
    const PartItem = document.querySelector(`.intro .job .${key} .count em`);
    PartItem.textContent = partCnt > 9 ? partCnt : "0" + partCnt;
  });
}

// ------------------------------
// ?�행
// ------------------------------

fetchData();

// ?��S : way_more ?�업
$(function () {
  $('.way_pop[data-value="way_more"]').on("click", function () {
    const $this = $(this);
    const $wrap = $(".wrap");
    const value = $this.data("value");
    const html = `
        <div class="popup_wrap ${value}">
            <div class="popup_contents_wrap" data-lenis-prevent-wheel>
                
                <picture>
            <source
              media="(max-width:1400px)"
              srcset="../assets/img/recruit/m_recruit_${value}.jpg"
            />
            <source
              media="(min-width: 1401px)"
              srcset="../assets/img/recruit/recruit_${value}.jpg"
            />
           <img src="../assets/img/recruit/m_recruit_${value}.jpg" alt="">
          </picture>

            </div>
            <button class="btn_close"><i class="close"></i></button>
        </div>
        `;

    $wrap.after(html);
    const $popup = $wrap
      .closest("section")
      .children(".popup_wrap.way_more")
      .last();
    $popup.fadeIn(300);
  });
});
// E : way_more ?�업

// ?��S : sub1
$(function () {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  const tabs = document.querySelectorAll(".tab_wrap .tab");
  const tabContents = ["tab1", "tab2", "tab3"].map((id) =>
    document.getElementById(id)
  );
  let activeIndex = 0;
  let isClicking = false;
  const cultureSection = document.querySelector(".recruit.main section.sub1");
  const cultureStage = cultureSection.querySelector(".culture_stage");

  function getCulturePinStart() {
    if (!window.matchMedia("(min-width: 1401px)").matches) {
      cultureStage.style.removeProperty("--culture-scale");
      return "top top";
    }

    // 헤더 높이와 무관하게 제목과 패널 전체를 화면 중앙에 배치한다.
    const verticalInset = 32;
    const availableHeight = Math.max(1, window.innerHeight - verticalInset * 2);
    const stageHeight = cultureStage.offsetHeight;
    const scale = Math.min(1, availableHeight / stageHeight);
    cultureStage.style.setProperty("--culture-scale", scale);

    const stageTop = (window.innerHeight - stageHeight * scale) / 2;
    const sectionPadding = parseFloat(getComputedStyle(cultureSection).paddingTop);
    return `top ${stageTop - sectionPadding}px`;
  }

  function updateActiveTab(index, animate = true) {
    tabs.forEach((tab, i) => {
      tab.classList.toggle("active", i % 3 === index % 3);
    });

    const activeDataTab = tabs[index].getAttribute("data-tab");
    tabContents.forEach((content) => {
      if (content.id === activeDataTab) {
        if (!content.classList.contains("active")) {
          content.classList.add("active");
          if (animate) {
            gsap.fromTo(
              content,
              { y: 0, opacity: 1 },
              { y: 0, opacity: 1, duration: 0, ease: "power2.out" }
            );
          }
        }
      } else {
        if (content.classList.contains("active")) {
          content.classList.remove("active");
          gsap.set(content, { clearProps: "all" });
        }
      }
    });
  }

  const scrollTriggerInstance = ScrollTrigger.create({
    trigger: cultureSection,
    start: getCulturePinStart,
    end: "+=1000",
    pin: true,
    pinSpacing: false,
    onUpdate: (self) => {
      if (isClicking) return; // ?�릭 중엔 ?�태변�??�함

      let progress = self.progress;
      let newIndex = Math.min(
        tabs.length / 2 - 1,
        Math.floor(progress * (tabs.length / 2))
      );

      // ?�무 빠른 ?�덱???�프 방�?
      if (Math.abs(newIndex - activeIndex) > 1) return;

      if (newIndex !== activeIndex) {
        activeIndex = newIndex;
        updateActiveTab(activeIndex, true);
      }
    },
  });

  updateActiveTab(activeIndex, true);

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", (e) => {
      e.stopPropagation();
      // ?�릭 ??active ?�태 변�?????(updateActiveTab ?�출 X)
      //updateActiveTab(i, false);
      if (activeIndex === i % 3) return;
      lenis.stop();
      isClicking = true;
      // const tabCont = document.querySelector("#tab" + (i + 1));
      // ?�크롤만 ?�동
      gsap.to(window, {
        scrollTo:
          scrollTriggerInstance.start +
          Math.ceil(((i % 3) / (tabs.length / 2)) * 1000),
        duration: 0,
        ease: "power1.out",
        onComplete: () => {
          isClicking = false;
          lenis.start();
        },
      });
    });
  });

  // recruit_header ?�기�?
  const showNav_recruit = gsap
    .from("#header_recruit", {
      yPercent: -200,
      paused: true,
      duration: 0.2,
    })
    .progress(1);

  ScrollTrigger.create({
    start: "top top",
    end: 99999,
    onUpdate: (self) => {
      self.direction === -1
        ? showNav_recruit.play()
        : showNav_recruit.reverse();
    },
  });
});

// E : sub1

const liveBtn = document.querySelectorAll(".live_cont .live_pop");
liveBtn.forEach((item, index) => {
  item.addEventListener("click", function (e) {
    const liveCont = e.target.closest(".live_cont");
    const livePop = liveCont.querySelector("ul");
    if (!item.classList.contains("active")) {
      item.classList.add("active");
      livePop.classList.add("open");
    } else {
      item.classList.remove("active");
      livePop.classList.remove("open");
    }
  });
});

const reviewSwiper = new Swiper(".review_slider ", {
  direction: "horizontal",
  slidesPerView: "auto",
  loop: false,
  centeredSlides: false,
  autoHeight: false,
  pagination: {
    el: ".review_slider .swiper-pagination",
    clickable: true,
  },
  breakpoints: {
    1400: {
      spaceBetween: 16,
      autoHeight: false,
      centeredSlides: false,
    },
    0: {
      spaceBetween: 20,
      autoHeight: true,
      centeredSlides: true,
    },
  },
});

// ?��S : blobs ?�에 li 그리�?
$(function () {
  if (!$(".container").hasClass("recruit")) return;
  $("ul.blobs").each(function () {
    for (let i = 0; i < 4; i++) {
      const $li = $("<li></li>").addClass("blob-item");
      $(this).append($li);
    }
  });

  const blobs = document.querySelectorAll(".sub2 ul.blobs");
  gsap.registerPlugin(ScrollTrigger);
  gsap.to(blobs, {
    opacity: 0.3,
    duration: 0.3,
    ease: "power1.out",
  });
});
// E : blobs ?�에 li 그리�?
