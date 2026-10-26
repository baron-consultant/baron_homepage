import lenis from "./common.js";

$(function () {
  gsap.registerPlugin(ScrollTrigger);
  /*
  gsap.set(".contents_wrap", { opactiy: 0, pointerEvents: "none" });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".dx",
      start: "top top",
      end: "+=10%", // 필요시 조절 가능
      pin: true,
      scrub: true,
    },
  });

  tl.to(".contents_wrap", {
    opacity: 1,
    duration: 0.5,
    pointerEvents: "initial",
  });*/
});

$(function () {
  const images = [
    [
      "poster_p01.jpg",
      "도로건설의 디지털 전환은?<br> <em>BIM & OSC 구현 Total Solution</em>",
      "a",
    ],
    [
      "poster_p02.jpg",
      "무책임한, 빨리빨리만 외치는, 아날로그 방식의 <br><em>현재의 건설엔지니어링은 유죄</em>",
      "a",
    ],
    [
      "poster_p03.jpg",
      "하던 대로만 하는 <em>우리의 건설산업</em> <br>이대로 <em>괜찮은가요?</em>",
      "a",
    ],
    [
      "poster_p04.jpg",
      "디지털전환 시대,  <br><em>도면과 BIM모델을 하나의</em> S/W로",
      "a",
    ],
    [
      "poster_p05.jpg",
      "용지 및 조서 작성 <br><em>쉽고! 빠르고! 정확하게!</em>",
      "b",
    ],
    ["poster_p06.jpg", "<em>GIS + BIM + Web + 사업관리</em>를 한번에!", "b"],
    ["poster_p07.jpg", "<em>KNGIL에서 공간정보의 꽃을 피우다</em>", "b"],
    [
      "poster_p08.jpg",
      "건설 솔루션을 위한 <br><em>디지털 GIS 공간</em>을 만들다",
      "b",
    ],
    [
      "poster_p09.jpg",
      "Web 기반 시추조사 및 지반정보 관리서비스 <br><em>모든 지층 정보는 GAIA</em>가 관리",
      "b",
    ],
    [
      "poster_p10.jpg",
      "데이터로 그리는 <em>교통의 청사진</em> <br>한국형 통합 <em>교통 수요분석 </em>프로그램",
      "b",
    ],
    ["poster_p11.jpg", "<em>독자적 그래픽 엔진 자체 개발</em>", "c"],
    [
      "poster_p12.jpg",
      "<em>StrAna-Core</em><br> 우리 기술로 자체 개발한 구조해석 엔진",
      "c",
    ],
    [
      "poster_p13.jpg",
      "<em>StrAna</em> <br> <em>쉽고 편리한 모델링 환경, 빠르고 정확한 해석!</em>",
      "c",
    ],
    [
      "poster_p14.jpg",
      "<em>도로 설계·시공 엔지니어링 기술</em>의<br> <em>디지털 전환</em>",
      "d",
    ],
    ["poster_p15.jpg", "토공의 설계·시공", "d"],
    ["poster_p16.jpg", "배수공의 설계·시공", "d"],
    ["poster_p17.jpg", "포장공의 설계·시공", "d"],
    ["poster_p18.jpg", "부대공의 설계·시공", "d"],
    [
      "poster_p19.jpg",
      "쉽고, 빠른 <br><em>BIM 기반 상·하수관로 설계</em>",
      "d",
    ],
    [
      "poster_p20.jpg",
      "<em>기후변화 대응</em> 및 <em>직관적</em> 단면결정을 위한<br> <em>BIM 기반 배수 설계</em>",
      "d",
    ],
    [
      "poster_p21.jpg",
      "<em>BIM 기반 설계 및 시공 기술 <br>Bulb T Girder</em>",
      "e",
    ],
    [
      "poster_p22.jpg",
      "<em>독자적인 DfMA</em>를 적용한 <em>Nodular Girder</em>, OSC 건설 <br><em>교량 설계·시공 기술</em>",
      "e",
    ],
    [
      "poster_p23.jpg",
      "<em>BIM 기반 도로 구조물</em> <br>Expert Systems & Soutions",
      "e",
    ],
    [
      "poster_p24.jpg",
      "<em>환경에 순응</em>하고 <em>사용자 편의성을 제공</em>하는 <br><em>BIM 기반 터널 설계·시공</em>",
      "e",
    ],
    [
      "poster_p25.jpg",
      "이용자를 고려한 <br><em>BIM 기반 횡단통로 설계·시공</em>",
      "e",
    ],
    [
      "poster_p26.jpg",
      "사용자 중심의 <em>편안한!</em> 안전에 <em>충분한!</em> <br>자연스러운 <em>곡선형 옹벽</em>",
      "e",
    ],
    [
      "poster_p27.jpg",
      "누구나 쉽고 빠르게 단가에서 공정관리까지 <br><em>HM 단가·공정 Solution</em>",
      "f",
    ],
    [
      "poster_p28.jpg",
      "Rectangular To Circle <br><em>R2C 기술로 침수로부터 안전한 도시를 만듭니다</em>",
      "f",
    ],
    [
      "poster_p29.jpg",
      "사회적 요구 &middot; 법 의무이행 &middot; 생산성과 품질확보 <br><em>BIM 기반 시공상세도</em>",
      "f",
    ],
    [
      "poster_p30.jpg",
      "GIS & BIM 기반 공정관리 <br><em>&quot; 지면이 공간이 되다! &quot; 터파기부터 도로건설까지!!!</em>",
      "f",
    ],
    [
      "poster_p31.jpg",
      "<em>아직도,</em> 아바타를 <em>핸드폰</em>으로 보시나요? <br>도로건설 설계 &middot; 시공 전용 <em>공학용 사이니지</em>",
      "f",
    ],
  ];

  const categoryOrder = ["a", "b", "c", "d", "e", "f"];
  const categoryTitles = {
    a: "D/X",
    b: "조사 및 GIS",
    c: "구조해석 및 엔지니어링",
    d: "BIM 도로 설계/시공",
    e: "BIM 구조물 설계/시공",
    f: "시공 및 유지관리",
  };

  // HTML 내 .filter li 텍스트 자동 삽입
  for (const key in categoryTitles) {
    $(`.filter .swiper-slide[data-category="${key}"]`).text(
      categoryTitles[key]
    );
  }

  const mainWrapper = document.getElementById("p-main");
  const mainThumbWrapper = document.getElementById("p-thumb-main");
  const thumbWrapper = document.getElementById("p-thumb");
  const filterWrapper = document.querySelector(".filter_slide .filter");

  let mainSwiper, thumbSwiper, filterSwiper, thumbListSwiper;
  const categoryStartIndex = {};
  const dxImageBaseUrl = new URL("../img/dx/", import.meta.url);

  function createSlidesAllSorted() {
    mainWrapper.innerHTML = "";
    thumbWrapper.innerHTML = "";

    const sortedImages = categoryOrder.flatMap((category) =>
      images.filter((img) => img[2] === category)
    );

    // 카테고리별 시작 인덱스 계산
    const firstIndexByCategory = {};
    let currentIndex = 0;
    categoryOrder.forEach((category) => {
      const count = images.filter((img) => img[2] === category).length;
      if (count > 0) {
        categoryStartIndex[category] = currentIndex;
        firstIndexByCategory[category] = currentIndex;
        currentIndex += count;
      }
    });

    // 슬라이드 DOM 생성
    sortedImages.forEach(([filename, title, cate], i) => {
      const imgUrl = new URL(filename, dxImageBaseUrl).href;

      // 메인 슬라이드
      const mainSlide = document.createElement("div");
      const mainThumbSlide = document.createElement("div");
      mainSlide.className = "swiper-slide";
      mainThumbSlide.className = "swiper-slide";
      //mainSlide.innerHTML = `<div class="swiper-zoom-container"><img src="${imgUrl}" alt="${title}"></div>`;
      mainSlide.innerHTML = `<img src="${imgUrl}" alt="${title}">`;
      mainThumbSlide.innerHTML = `<img src="${imgUrl}" alt="${title}">`;
      mainWrapper.appendChild(mainSlide);
      mainThumbWrapper.appendChild(mainThumbSlide);

      // 썸네일 슬라이드
      const thumbSlide = document.createElement("div");
      thumbSlide.className = "swiper-slide";
      thumbSlide.innerHTML = `
          <div class="slide-box" data-cate="${cate}"><img src="${imgUrl}" alt="${title}"/>
          <p>${title}</p></div>`;
      thumbWrapper.appendChild(thumbSlide);
    });

    // 카테고리 타이틀 삽입
    let offset = 0;
    for (const category of categoryOrder) {
      const index = firstIndexByCategory[category];
      if (typeof index === "number") {
        const title = categoryTitles[category];
        const targetSlide = thumbWrapper.children[index + offset];
        const div = document.createElement("div");
        div.className = `slide_tit ${category}`;
        div.textContent = title;
        //thumbWrapper.insertBefore(div, targetSlide);
        $(targetSlide).prepend(div);
        //offset++; // 타이틀 하나 삽입될 때마다 offset 증가
      }
    }

    // 기존 swiper 제거
    if (mainSwiper) mainSwiper.destroy();
    if (thumbListSwiper) thumbListSwiper.destroy();
    if (filterSwiper) filterSwiper.destroy();
    if (thumbSwiper) thumbSwiper.destroy();

    filterSwiper = new Swiper(".tab_item_list .filter_slide", {
      direction: "vertical",
      slidesPerView: "auto",
      mousewheel: true,
      spaceBetween: 24,
      loop: false,
      centeredSlides: false,
      breakpoints: {
        1660: {
          direction: "vertical", // 1440px 이상은 세로
        },
        0: {
          direction: "horizontal", // 0~1439px은 가로
        },
      },
    });

    filterSwiper.slides.forEach((slide, index) => {
      slide.addEventListener("click", () => {
        filterSwiper.slideTo(index);
      });
    });

    // Swiper 초기화

    thumbListSwiper = new Swiper(".thumbListSwiper.img", {
      direction: "vertical",
      slidesPerView: "auto",
      mousewheel: {
        enabled: true,
        forceToAxis: true,
        releaseOnEdges: false,
        sensitivity: 1,
        invert: false,
      },
      allowTouchMove: true,
      spaceBetween: 10,
      freeMode: true,
      slideToClickedSlide: true,
      loop: false,
      scrollbar: {
        el: ".thumbListSwiper.img .swiper-scrollbar",
        draggable: true,
      },
      breakpoints: {
        // 956px 이하 (모바일)
        0: {
          scrollbar: false, // 또는 제거
          mousewheel: false,
          allowTouchMove: false,
        },
        // 957px 이상 (PC)
        957: {
          scrollbar: {
            el: ".thumbListSwiper.img .swiper-scrollbar",
            draggable: true,
          },
          mousewheel: {
            enabled: true,
            forceToAxis: true,
            releaseOnEdges: false,
            sensitivity: 1,
            invert: false,
          },
          allowTouchMove: true,
        },
      },
      on: {
        click: function (swiper, event) {
          const clickedIndex = swiper.clickedIndex;
          const clickedSlide = swiper.clickedSlide;
          if (!clickedSlide) return;
          if (event.target.closest(".slide-box")) {
            if (window.innerWidth <= 956) {
              const mainSlide = document.querySelector(".slide_wrap");
              mainSlide.classList.add("open");
              document.body.style.overflow = "hidden";
              lenis.stop();
            } else {
              mainSwiper.slideTo(clickedIndex);
            }
          }
        },
        slideChange: function () {
          const realIndex = this.realIndex;
          mainSwiper.slideTo(realIndex);
        },
      },
      
    });

    thumbSwiper = new Swiper(".thumbSwiper.img", {
      direction: "horizontal",
      slidesPerView: "auto",
      mousewheel: true,
      spaceBetween: 10,
      freeMode: true,
      centeredSlides: true,
      slideToClickedSlide: true,
      loop: false,
      pagination: {
        el: ".thumbSwiper.img .swiper-pagination",
        type: "fraction", // 1/4 형태
      },
    });

    mainSwiper = new Swiper(".mainSwiper.img", {
      loop: false,
      mousewheel: true,
      slidesPerView: 1,
      spaceBetween: 20,
      /*
      zoom: {
        maxRatio: 3, // 최대 확대 비율
        minRatio: 1, // 최소 비율 (기본값)
      },*/
      keyboard: {
        enabled: true, // 키보드 방향키 활성화
        onlyInViewport: true, // 슬라이더가 뷰포트 안에 있을 때만 반응
      },
      navigation: {
        nextEl: ".mainSwiper.img .swiper-button-next",
        prevEl: ".mainSwiper.img .swiper-button-prev",
      },

      thumbs: {
        swiper: thumbSwiper,
      },

      on: {
        slideChange: function () {
          const realIndex = this.realIndex;
          thumbListSwiper.slideTo(realIndex);
          let currentCategory = null;
          let count = 0;
          for (const category of categoryOrder) {
            const imagesInCategory = images.filter(
              (img) => img[2] === category
            ).length;
            if (realIndex < count + imagesInCategory) {
              currentCategory = category;
              break;
            }
            count += imagesInCategory;
          }

          if (currentCategory) {
            $(".filter .swiper-slide").removeClass("on");
            $(
              `.filter .swiper-slide[data-category="${currentCategory}"]`
            ).addClass("on");
          }

          if (window.innerWidth <= 956) {
            const filserListItem = document.querySelectorAll(
              ".thumbListSwiper.img .swiper-slide"
            );
            filserListItem.forEach((item, index) => {
              if (index == realIndex) {
                item.scrollIntoView({
                  behavior: "smooth", // 부드럽게 스크롤
                  block: "center", // 수직 정렬 기준 (start, center, end)
                  inline: "center", // 수평 정렬 기준
                });
              }
            });
          }
        },
      },
    });

    const slideBtn = document.querySelector(".slide_wrap .btn_close");
    slideBtn.addEventListener("click", function (e) {
      e.preventDefault();
      const mainSlide = document.querySelector(".slide_wrap");
      mainSlide.classList.remove("open");
      document.body.style.overflow = "";
      lenis.start();
    });
  }

  $(".filter .swiper-slide").on("click", function () {
    const category = $(this).data("category");
    const index = categoryStartIndex[category];

    if (typeof index === "number" && mainSwiper) {
      mainSwiper.slideToLoop(index, 500);
    }

    $(".filter .swiper-slide").removeClass("on");
    $(this).addClass("on");

    // ✅ thumbSwiper 업데이트로 스크롤 영역 재계산
    setTimeout(() => {
      if (thumbListSwiper) {
        thumbListSwiper.update(); // Swiper 내부 구조 재계산
      }
    }, 100); // 약간의 딜레이를 두면 더 안정적
  });

  // 초기 실행
  createSlidesAllSorted();
});
// 동영상 임시 비활성화: 목록과 재생 코드는 추후 재공개를 위해 보존합니다.
// 재공개 시 true로 변경하고 ko/dx.html의 YouTube API 주석과 영상 UI 숨김을 해제합니다.
const DX_VIDEOS_ENABLED = false;
var players = [];
$(function () {
  // display: none만으로는 재생이 중단되지 않으므로 플레이어/썸네일 생성 전에 종료합니다.
  if (!DX_VIDEOS_ENABLED) return;

  const videos = [
    ["TRVL7Rtn08E", " 원주청광터교차로", "a"],
    ["wAKT5PQgdgA", "PG착공식_자율주행영상", "a"],
    ["a_dWqOR3s98", "원주청 하왕도교차로 개선공사", "a"],
    ["omL383gPRXg", "이라크 Habbaniyah 공항", "a"],
    ["FiQ1g21SbtQ", "논산 강경~채운", "a"],
    ["iA6d33DtE1Q", "대산당진신규모델", "a"],
    ["wsLoehdQgFg", "인주~염치", "a"],
    ["ncnBbFEoZNc", "안동수상대로", "a"],
    ["tRy2d9g4OYA", "당진시 면천도시계획도로", "a"],
    ["kwR6kiKRng8", "자유로지하화", "a"],
    ["ahCy-dClDmI", "평택지산교차로2차", "a"],
    ["CUh4hM7dxyw", "청도운문마일 주민설명회", "a"],
    ["_Q852TT7oV4", "[경상북도]상대~하대", "b"],
    ["sa2aMGaxJyg", "부산 영화의전당 지하차도", "b"],
    ["tIudVr3KvZs", "삼선산 수목원", "b"],
    ["VN6ERIDynPM", "유곡역촌주민설명회", "b"],
    ["b5wiXw5oaJc", "계양강화", "b"],
    ["rxRP9rIrNgM", "영월봉래산명소화사업", "b"],
    ["u6yOXLI_zgA", "함양합천실사화", "b"],
    ["qmwl80W8pKs", "은화삼단지", "b"],
    ["qXg1rlAIh-M", "영가대교웅부", "b"],
    ["24w1L-PFY-c", "청송 진보 ~ 영양 입암", "b"],
    ["GWmyBliEllM", "함안여항~창원내서", "b"],
    ["j6ace-2esoc", "대전청 행정~읍내", "b"],
    ["XdXAIUs5yrw", "노들섬서킷", "c"],
  ];

  const categoryVideoOrder = ["a", "b", "c"];
  const categoryVideoTitles = {
    a: "카테고리 A",
    b: "카테고리 B",
    c: "카테고리 C",
  };

  function onYouTubeIframeAPIReady() {
    // 영상 ID 배열 (슬라이드마다 다른 영상)
    // 각 슬라이드에 대해 YouTube 플레이어를 생성
    window.YT.ready(function () {
      videos.forEach(function ([videoID, title], index) {
        players[index] = new window.YT.Player("player" + index, {
          height: "100%",
          width: "100%",
          videoId: videoID, // 유튜브 영상 ID
          playerVars: {
            autoplay: 0, // 자동 재생
            controls: 1, // 컨트롤러 표시
            rel: 0, // 관련 동영상 표시 안함
            showinfo: 0, // 영상 정보 안 보이게
            modestbranding: 1, // 브랜딩 최소화
          },
          events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
          },
        });
      });
    });
  }
  function onPlayerReady(event) {
    // 재공개 후에도 페이지 진입만으로 숨겨진 영상이 자동 재생되지 않게 합니다.
    event.target.stopVideo();
    // event.target.playVideo();
  }
  function onPlayerStateChange(event) {
    if (event.data == "0") {
      event.target.seekTo(0);
      event.target.stopVideo();
    }
  }

  for (const key in categoryVideoTitles) {
    //$(`.filter li[data-category="${key}"]`).text(categoryVideoTitles[key]);
  }

  const mainVideoWrapper = document.getElementById("v-main");
  const thumVideobWrapper = document.getElementById("v-thumb-main");
  const thumListVideobWrapper = document.getElementById("v-thumb");

  let mainVideoSwiper, thumbVideoSwiper, thumbListVideoSwiper;
  const categoryStartIndex = {};

  function createSlidesAllSorted() {
    mainVideoWrapper.innerHTML = "";
    thumVideobWrapper.innerHTML = "";
    thumListVideobWrapper.innerHTML = "";

    const sortedVideos = categoryVideoOrder.flatMap((category) =>
      videos.filter((v) => v[2] === category)
    );

    sortedVideos.forEach(([videoId, title], i) => {
      const thumbUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      const videoUrl = `https://www.youtube.com/embed/${videoId}?rel=0&controls=1`; // 메인 슬라이드: iframe

      const mainSlide = document.createElement("div");
      const thumbSlide = document.createElement("div");
      mainSlide.className = "swiper-slide";
      thumbSlide.className = "swiper-slide";
      //mainSlide.innerHTML = `<iframe src="${videoUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      mainSlide.innerHTML = `<div class="video_box"><div id="player${i}"></div></div>`;
      thumbSlide.innerHTML = `<img src="${thumbUrl}" alt="${title}"/>`;
      mainVideoWrapper.appendChild(mainSlide); // 썸네일 슬라이드: 이미지 + 제목
      thumVideobWrapper.appendChild(thumbSlide); // 썸네일 슬라이드: 이미지 + 제목

      const thumbListSlide = document.createElement("div");
      thumbListSlide.className = "swiper-slide";
      /*  
      thumbSlide.innerHTML = `
         <div class="slide-box"><img src="${thumbUrl}" alt="${title}"/>
        <p>${title}</p></div>`;
*/
      thumbListSlide.innerHTML = `
         <div class="slide-box"><img src="${thumbUrl}" alt="${title}"/>
        <p>임시 타이틀_${i}</p></div>`;
      thumListVideobWrapper.appendChild(thumbListSlide);
    }); // 카테고리 타이틀

    if (mainVideoSwiper) mainVideoSwiper.destroy();
    if (thumbVideoSwiper) thumbVideoSwiper.destroy();
    if (thumbListVideoSwiper) thumbListVideoSwiper.destroy();

    thumbListVideoSwiper = new Swiper(".thumbListSwiper.vod", {
      direction: "vertical",
      slidesPerView: "auto",
      spaceBetween: 10,
      freeMode: true,
      mousewheel: {
        enabled: true,
        forceToAxis: true,
        releaseOnEdges: false,
        sensitivity: 1,
        invert: false,
      },
      watchSlidesProgress: true,
      scrollbar: {
        el: ".thumbListSwiper.vod .swiper-scrollbar",
      },
      loop: false,
      breakpoints: {
        // 956px 이하 (모바일)
        0: {
          mousewheel: false,
        },
        // 957px 이상 (PC)
        957: {
          mousewheel: {
            enabled: true,
            forceToAxis: true,
            releaseOnEdges: false,
            sensitivity: 1,
            invert: false,
          },
        },
      },
      on: {
        click: function (swiper, event) {
          const clickedSlide = swiper.clickedSlide;
          if (!clickedSlide) return;
          if (window.innerWidth <= 956) {
            const mainSlide = document.querySelector(".slide_wrap");
            mainSlide.classList.add("open");
            document.body.style.overflow = "hidden";
            lenis.stop();
          }
        },
      },
    });

    thumbVideoSwiper = new Swiper(".thumbSwiper.vod", {
      direction: "horizontal",
      slidesPerView: "auto",
      spaceBetween: 10,
      freeMode: true,
      mousewheel: true,
      centeredSlides: true,
      watchSlidesProgress: true,
      loop: false,
      pagination: {
        el: ".thumbSwiper.vod .swiper-pagination",
        type: "fraction", // 1/4 형태
      },
    });

    mainVideoSwiper = new Swiper(".mainSwiper.vod", {
      loop: false,
      mousewheel: true,
      keyboard: {
        enabled: true, // 키보드 방향키 활성화
        onlyInViewport: true, // 슬라이더가 뷰포트 안에 있을 때만 반응
      },
      navigation: {
        nextEl: ".mainSwiper.vod .swiper-button-next",
        prevEl: ".mainSwiper.vod .swiper-button-prev",
      },
      thumbs: {
        swiper: thumbVideoSwiper,
      },
      on: {
        slideChange: function () {
          var activeIndex = this.activeIndex;
          thumbListVideoSwiper.slideTo(activeIndex);
          players.forEach(function (player, index) {
            if (index !== activeIndex) {
              player.pauseVideo(); // 다른 슬라이드 영상 일시정지
            } else {
              player.playVideo();
            }
          });
          if (window.innerWidth <= 956) {
            const filserListItem = document.querySelectorAll(
              ".thumbListSwiper.vod .swiper-slide"
            );
            filserListItem.forEach((item, index) => {
              if (index == realIndex) {
                item.scrollIntoView({
                  behavior: "smooth", // 부드럽게 스크롤
                  block: "center", // 수직 정렬 기준 (start, center, end)
                  inline: "center", // 수평 정렬 기준
                });
              }
            });
          }
        },
      },
    });
  }

  createSlidesAllSorted();

  onYouTubeIframeAPIReady();

  thumbListVideoSwiper.on("click", function (swiper) {
    const clickedIndex = swiper.clickedIndex;
    if (typeof clickedIndex !== "undefined") {
      mainVideoSwiper.slideTo(clickedIndex); // 이 시점에 mainSwiper가 진짜 Swiper 인스턴스여야 함!
    }
  });

  $(".tab_menu li").on("click", function () {
    const $this = $(this);
    const idx = $this.index();

    if (!$this.hasClass("on")) {
      $(".tab_menu li").removeClass("on");
      $this.addClass("on");
      $(".tab_item_list").hide();
      $(".tab_item_list").eq(idx).show();
      $(".mainSwiper ").hide();
      $(".mainSwiper").eq(idx).show();

      const videoIdx = mainVideoSwiper.realIndex;
      players.forEach(function (player, index) {
        if (index == videoIdx && idx > 0) {
          player.playVideo();
        } else {
          player.pauseVideo(); // 다른 슬라이드 영상 일시정지
        }
      });
      if (window.innerWidth <= 956) {
        $(".slide_wrap  .thumbSwiper  ").hide();
        $(".slide_wrap .thumbSwiper ").eq(idx).show();
      } else {
        $(".thumbSwiper").hide();
      }
    }
  });
});
