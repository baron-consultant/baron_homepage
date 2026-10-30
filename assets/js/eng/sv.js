// 📌📌📌 sv_공통.html의 SCRIPT
// 💚S : btn_more 클릭시 팝업
$(function () {
  $(".btn_more")
    .not(
      '[data-value="op_more"], [data-value="kngil_more"], [data-value="cs_more"]'
    )
    .on("click", function () {
      const $this = $(this);
      const $wrap = $(".wrap");
      const value = $this.data("value");

      if (!value) {
        console.log("data-value 없음, popup 실행하지 않음");
        return;
      }

      const pageType = ["solution", "sw", "bigroom"].find((cls) =>
        $(".container").hasClass(cls)
      );

      const html = `
        <div class="popup_wrap ${value}">
            <div class="popup_contents_wrap" data-lenis-prevent-wheel>
                <picture>
                    <source
                      media="(max-width:1400px)"
                      srcset="../assets/img/sv/eng/m_${pageType}_${value}.jpg"
                    />
                    <source
                      media="(min-width: 1401px)"
                      srcset="../assets/img/sv/eng/${pageType}_${value}.jpg"
                    />
                  <img src="../assets/img/sv/eng/${pageType}_${value}.jpg">
                </picture>
            </div>
            <button class="btn_close"><i class="close"></i></button>
        </div>
        `;

      $wrap.after(html);
      console.log(`${value} 작성 완료`);

      const $popup = $wrap.next(".popup_wrap." + value);
      $popup.fadeIn(300);
    });
});
// E : btn_more 클릭시 팝업

// 💚S : svg 라인 그리기
$(function () {
  gsap.registerPlugin(ScrollTrigger);

  const path = document.querySelectorAll("[class^=objs_line] svg path");
  for (let i = 0; i < path.length; i++) {
    const pathLength = path[i].getTotalLength();

    path[i].style.stroke = "url(#lineGradient2)";
    path[i].style.strokeWidth = "2";
    path[i].style.fill = "none";
    path[i].style.strokeDasharray = pathLength;
    path[i].style.strokeDashoffset = pathLength;
    gsap.to(path[i], {
      strokeDashoffset: 0,
      scrollTrigger: {
        trigger: ".objs_line_" + (i + 1),
        start: "top center",
        end: "bottom bottom",
        scrub: 3,
        // markers: true,
      },
      ease: "none",
    });
  }
});
// E : svg 라인 그리기

// 📌📌📌 sv_solution.html의 SCRIPT
// 💚S : op_more 팝업
var players = [];
$(function () {
  function onYouTubeIframeAPIReady() {
    // 영상 ID 배열 (슬라이드마다 다른 영상)
    var videoIDs = ["bq3AVI8HgA0", "Hmy6Ako3j_4", "zg8Rogrmpns", "2HiPL3iCWSM"];

    // 각 슬라이드에 대해 YouTube 플레이어를 생성
    videoIDs.forEach(function (videoID, index) {
      players[index] = new YT.Player("video" + (index + 1), {
        height: "315",
        width: "100%",
        videoId: videoID, // 유튜브 영상 ID
        playerVars: {
          autoplay: 1, // 자동 재생
          controls: 1, // 컨트롤러 표시
          rel: 0, // 관련 동영상 표시 안함
          showinfo: 0, // 영상 정보 안 보이게
          modestbranding: 1, // 브랜??최소??
        },
        events: {
          onStateChange: onPlayerStateChange,
        },
      });
    });
  }
  function onPlayerStateChange(event) {
    if (event.data == "0") {
      event.target.seekTo(0);
      event.target.stopVideo();
    }
  }
  $('.btn_more[data-value="op_more"]').on("click", function () {
    const $this = $(this);
    const $wrap = $(".wrap");
    const pageType = ["solution", "sw", "bigroom"].find((cls) =>
      $(".container").hasClass(cls)
    );

    const html = `
        <div class="popup_wrap op_more">
            <div class="popup_contents_wrap" data-lenis-prevent-wheel>
                <!-- video src="../assets/img/sv/solution_op_more_v1.mp4" playsinline muted></video>
                <video src="../assets/img/sv/solution_op_more_v2.mp4" playsinline muted></video>
                <video src="../assets/img/sv/solution_op_more_v3.mp4" playsinline muted></video>
                <video src="../assets/img/sv/solution_op_more_v4.mp4" playsinline muted></video -->
                <div class="solution_wrap">
                <picture>
                    <source
                      media="(max-width:1400px)"
                      srcset="../assets/img/sv/eng/m_${pageType}_op_more.jpg"
                    />
                    <source
                      media="(min-width: 1401px)"
                      srcset="../assets/img/sv/eng/${pageType}_op_more.jpg"
                    />
                  <img src="../assets/img/sv/eng/${pageType}_op_more.jpg">
                </picture>
                   
                     <ul class="video_list">
                        <li>
                            <div><div id="video1"></div></div>
                        </li> 
                        <li>
                            <div><div id="video2"></div></div>
                        </li> 
                        <li>
                            <div><div id="video3"></div></div>
                        </li> 
                        <li>
                           <div><div id="video4"></div></div>
                        </li> 
                    </ul>
                </div>
            </div>
            <button class="btn_close"><i class="close"></i></button>
        </div>
        `;

    $wrap.after(html);
    console.log(`op_more 작성 완료`);

    const $popup = $wrap.next(".popup_wrap.op_moree");
    $popup.fadeIn(300);
    onYouTubeIframeAPIReady();
  });
});

// E : op_more 팝업

// 📌📌📌 sv_sw.html의 SCRIPT
// 💚S : kngil 자세히 보기
// 🤍kngil_more 팝업
$(function () {
  $('.btn_more[data-value="kngil_more"]').on("click", function () {
    const $this = $(this);
    const $wrap = $(".wrap");
    const html = `
        <div class="popup_wrap kngil_more">
            <div class="popup_contents_wrap flip_wrap">
                <div class="flipbook"></div>
                <div class="flip-controls">
                    <button class="prev"></button>
                    <button class="next"></button>
                </div>
            </div>
            <button class="btn_close"><i class="close"></i></button>
        </div>
        `;

    //$this.after(html);
    $wrap.after(html);
    console.log(`kngil_more 작성 완료`);

    //const $popup = $this.next(".popup_wrap.kngil_more");
    const $popup = $wrap.next(".popup_wrap.kngil_more");
    $popup.fadeIn(300, function () {
      window.initFlipbook($popup.find(".flipbook"));
    });
  });
});

// 🤍kngil_more 플립북
$(function () {
  if (!$(".container").hasClass("sw")) return;

  const url = "../assets/img/sv/sw_kngil_more.pdf";
  const pdfjsLib = window["pdfjs-dist/build/pdf"];
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

  window.initFlipbook = async ($flipbook) => {
    const pdf = await pdfjsLib.getDocument(url).promise;
    const imgs = [];
    let firstViewport = null;
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const scale = 2.0;
      const v = page.getViewport({ scale });

      // 첫 페이지 뷰포트 저장 (비율 계산용)
      if (!firstViewport) firstViewport = v;

      const c = document.createElement("canvas");
      c.width = v.width;
      c.height = v.height;

      await page.render({ canvasContext: c.getContext("2d"), viewport: v })
        .promise;
      imgs.push(
        `<div class="page"><img src="${c.toDataURL()}" style="width:100%;height:auto;"></div>`
      );
    }

    $flipbook.html(imgs.join(""));
    const updateFlipbookSize = () => {
      const containerWidth = Math.min(
        $flipbook.closest(".popup_wrap").width(),
        1120
      );
      const aspectRatio = firstViewport.height / firstViewport.width;
      const pageWidth = containerWidth / 2; // 펼쳐진 양 페이지니까
      const pageHeight = pageWidth * aspectRatio;

      $flipbook.turn("size", pageWidth * 2, pageHeight); // 양면 기준
      $flipbook.css({
        width: pageWidth * 2,
        height: pageHeight,
        margin: "0 auto",
      });
    };

    if ($flipbook.data("turn")) $flipbook.turn("destroy");

    $flipbook.turn({
      autoCenter: true,
      when: { turned: (e, p) => nav($flipbook, p) },
    });

    updateFlipbookSize();
    $(window).off("resize.flipbook").on("resize.flipbook", updateFlipbookSize);

    const $w = $flipbook.closest(".popup_wrap");
    $w.find(".prev")
      .off()
      .on("click", () => $flipbook.turn("previous"));
    $w.find(".next")
      .off()
      .on("click", () => $flipbook.turn("next"));
    nav($flipbook, 1);
  };

  function nav($f, p) {
    const t = $f.turn("pages"),
      $w = $f.closest(".popup_wrap");
    $w.find(".prev").css({
      opacity: p === 1 ? 0 : 1,
      "pointer-events": p === 1 ? "none" : "auto",
    });
    $w.find(".next").css({
      opacity: p === t || p === t - 1 ? 0 : 1,
      "pointer-events": p === t || p === t - 1 ? "none" : "auto",
    });
  }
});
// E : kngil 자세히 보기

// 💚S : cs_more 팝업
$(function () {
  $('.btn_more[data-value="cs_more"]').on("click", function () {
    const $this = $(this);
    const $wrap = $(".wrap");
    const value = $this.data("value");
    const $next = $wrap.next();
    const isAlreadyInserted = $next.hasClass("popup_wrap cs_more");
    if (!isAlreadyInserted) {
      const html = `
        <div class="popup_wrap cs_more">
            <div class="popup_contents_wrap">
              <div class="popup_contents">
                <div class="pop_head">
                <button class="btn_close"><i class="close"></i></button>
                </div>
                <div class="pop_body">
                  <div class="tit_box">
                    <div class="img_box">
                      <img src="../assets/img/sv/img_apply_pop.png" alt="">
                    </div>
                    <h2>Please, <b>Send a usage inquiry email</b><br>to the software manager</h2>
                  </div>
                  <div class="txt_box">
                    <dl>
                        <dt>Email</dt>
                        <dd><span class="email">baroncs@baroncs.co.kr</span> <button class="btn copy" onclick="btnCopy();"><span>Copy</span><i></i></button></dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
        </div>
        `;

      $wrap.after(html);
      console.log(`cs_more 작성 완료`);

      const $popup = $this
        .closest("section")
        .children(".popup_wrap.cs_more")
        .last();
      $popup.fadeIn(300);
    } else {
      const popup = document.querySelector(".popup_wrap.cs_more");
      popup.style.display = "block";
      console.log(`이미 ${value} 팝업이 존재합니다.`);
    }
  });
});
// E : cs_more 팝업

// 💚S : FAQ 아코디언
$(function () {
  if (!$(".container").hasClass("sw")) return;

  $(".acodi_wrap li").on("click", function () {
    const $this = $(this);

    const $targetDiv = $this.find("div");

    if ($targetDiv.hasClass("open")) {
      $targetDiv.removeClass("open");
    } else {
      $(".acodi_wrap li div.open").removeClass("open");
      $targetDiv.addClass("open");
    }
  });
});
// E : FAQ 아코디언

// 카피버튼
function btnCopy() {
  const copyBtn = document.querySelector(".btn.copy");
  const emailAdd = document.querySelector(".email");
  const btnSpan = copyBtn.querySelector("span");

  console.log(emailAdd.textContent);

  copyBtn.addEventListener("click", function () {
    const textToCopy = emailAdd.textContent;
    const tempInput = document.createElement("input");
    document.body.appendChild(tempInput);
    tempInput.value = textToCopy;
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);

    // Add 'complete' class to button
    copyBtn.classList.add("complete");
    btnSpan.textContent = "완료";

    // Remove 'complete' class after 2 seconds
    setTimeout(function () {
      copyBtn.classList.remove("complete");
      if (copyBtn.classList.contains("mail")) {
        btnSpan.textContent = "메일주소 복사";
      } else {
        btnSpan.textContent = "복사";
      }
    }, 600);
  });
}
