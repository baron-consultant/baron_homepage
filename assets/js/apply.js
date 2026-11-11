// ------------------------------
// [1] ?�이??로딩 �??�렬
// ------------------------------

const urlParams = new URL(location.href).searchParams;
const group = urlParams.get("cate");
let jobList = [],
  jobPart = {};

function fetchData() {
  $.getJSON("job_list.json")
    .then(function (data1) {
      jobList = sortDateAsc(data1.jobList);
      renderJobList(jobList);
      return $.getJSON("job_part.json");
    })
    .then(function (data2) {
      jobPart = data2;
      renderJobCategories(jobPart);
      handleCheckboxEvents();
      handleParams();
    });
}
function sortDateAsc(list) {
  return list.sort((a, b) => new Date(a.date) - new Date(b.date));
}

// ------------------------------
// [2] 채용 리스???�더�?
// ------------------------------
function renderJobList(list) {
  const ulItemsWrap = document.querySelector(".apply_list .list_wrap");

  if (!ulItemsWrap) {
    console.error("ulItemsWrap 요소 없음");
    return;
  }

  ulItemsWrap.innerHTML = "";
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  list.forEach((job, index) => {
    const [y, m, d] = job.date.split(".");
    const targetDate = new Date(y, m - 1, d);
    targetDate.setHours(0, 0, 0, 0);
    const diff = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
    if (diff > 0) {
      const li = document.createElement("li");
      li.className = "show";
      li.dataset.cate = job.group;
      li.id = `job_${job.group}_${job.id}`;
      li.innerHTML = createJobListHTML(job, index, diff);
      ulItemsWrap.appendChild(li);
    }
  });

  setApplyTotal(group);
}

function createJobListHTML(job, index, diff) {
  let ddayText = diff > 0 ? `D-${diff}` : diff === 0 ? "D-Day" : "마감";
  return `
    <a href="recruit_view.html?seq=${index}&cate=${job.group}">
      <dl class="main">
        <dt><span id="info_part">[${job.part}]</span>
            <span id="info_title">${job.title}</span></dt>
        <dd>
            <span class="dday" id="info_dday">${ddayText}</span>
            <span class="date" id="info_date">~${job.date}</span>
        </dd>
      </dl>
      <div class="sub">
        <span class="info_job" id="info_job">${job.job}</span>
        <span class="info_career" id="info_career">${job.career}</span>
      </div>
    </a>
  `;
}

function updateJobList() {
  const listItems = document.querySelectorAll(".list_wrap li[data-cate]");
  listItems.forEach((item) => {
    const itemId = item.getAttribute("id");
    const relatedCheckbox = document.querySelector(
      `.depth2 input[id='${itemId}']:not(:disabled)`
    );
    if (relatedCheckbox) {
      if (relatedCheckbox.checked) {
        item.classList.add("show");
      } else {
        item.classList.remove("show");
      }
    }
  });

  updateTotalCount();
}
// ------------------------------
// [3] 카테고리 ?�더�?
// ------------------------------
function renderJobCategories(categories) {
  const container = document.querySelector(".apply_left .depth1");
  container.innerHTML = "";
  categories.forEach((cat) => {
    const li = document.createElement("li");
    li.className = `nav_${cat.id}`;
    let inner = `<div class="job_name">${createCategoryCheckbox(
      cat.id,
      "all",
      cat.name,
      cat.enName
    )}</div>`;

    if (cat.partList.length) {
      inner += "<ul class='depth2'>";
      cat.partList.forEach((sub) => {
        inner += `<li>${createCategoryCheckbox(cat.id, sub[1], sub[0])}</li>`;
      });
      inner += "</ul>";
    }

    li.innerHTML = inner;
    container.appendChild(li);
  });
}

function createCategoryCheckbox(depth1, id, name, enName = "") {
  const isAll = id === "all";
  const checkboxId = `job_${depth1}_${id}`;

  // 공고 존재 ?��? ?�단
  const groupItems = document.querySelectorAll(
    `.apply_list [id*="${depth1}"]:not(:disabled)`
  ).length;
  const partItems = document.querySelectorAll(
    `.apply_list [id*="${id}"]:not(:disabled)`
  ).length;
  const groupCheck = groupItems > 0 ? "checked" : "disabled";
  const partCheck = partItems > 0 ? "checked" : "disabled";

  let state;
  if (group === null) {
    state = isAll ? groupCheck : partCheck;
  } else {
    if (depth1 === group) {
      state = isAll ? groupCheck : partCheck;
    } else {
      state = isAll
        ? groupItems > 0
          ? ""
          : "disabled"
        : partItems > 0
        ? " "
        : "disabled";
    }
  }

  return `
    <a class="checkbox_container">
      <input type="checkbox" id="${checkboxId}" ${state}>
      <label for="${checkboxId}">
        ${name}${isAll ? `<span class='en'>${enName}</span>` : ""}
      </label>
    </a>
  `;
}

// ------------------------------
// [4] 체크박스 ?�태 ?�기??�??�벤??처리
// ------------------------------

function handleCheckboxEvents() {
  const checkboxes = document.querySelectorAll(
    ".apply_left input[type='checkbox']"
  );

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const id = checkbox.id;

      if (id.endsWith("job_all")) {
        checkAllNavInputs(checkbox.checked);
      } else if (id.endsWith("_all")) {
        checkAllSubCheckboxes(checkbox);
      } else {
        const match = id.match(/^job_(\w+)_(\w+)/);
        if (match) {
          const parentcategory = match[1];
          const category = match[2];
          updateParentCheckbox(parentcategory);
          filterListByCategory(parentcategory);
          checkCategoryCheckboxes(parentcategory, category);
        }
      }
      updateJobList();
    });
  });
}
function checkAllNavInputs(isChecked) {
  const checkboxes = document.querySelectorAll(
    ".apply_left input[type='checkbox']"
  );
  checkboxes.forEach((link) => {
    link.checked = isChecked && !link.disabled;
  });
}
function checkAllSubCheckboxes(parentCheckbox) {
  const parentId = parentCheckbox.id;
  const group = parentId.replace("job_", "").replace("_all", "");

  const parentLi = document.querySelector(`.nav_${group}`);

  if (parentLi) {
    const subList = parentLi.querySelector(".depth2");
  }

  const subCheckboxes = document.querySelectorAll(
    `.nav_${group} .depth2 input[type='checkbox']`
  );
  subCheckboxes.forEach((checkbox) => {
    checkbox.checked = parentCheckbox.checked && !checkbox.disabled;
  });

  if (parentCheckbox.checked) {
    filterListByCategory(group);
    checkCategoryCheckboxes(group, "");
    isAllChecked();
  } else {
    const jobAllCheck = document.querySelector(`#job_all`);
    jobAllCheck.checked = false;
  }
}

function updateParentCheckbox(group) {
  const subCheckboxes = document.querySelectorAll(
    `.nav_${group} .depth2 input[type='checkbox']`
  );
  const allChecked = Array.from(subCheckboxes).every((cb) => cb.checked);
  const parentCheckbox = document.querySelector(`#job_${group}_all`);
  if (parentCheckbox) {
    parentCheckbox.checked = allChecked;
  }
  isAllChecked();
}

function checkCategoryCheckboxes(parentCate, category) {
  const parentCheckbox = document.querySelector(`#job_${parentCate}_all`);
  const subCheckboxes = document.querySelectorAll(
    `.nav_${parentCate} .depth2 input[type='checkbox']:not(:disabled)`
  );
  const checkboxes = document.querySelectorAll(
    `input#job_${parentCate}_${category}`
  );

  let subCnt = 0;
  checkboxes.forEach((checkbox) => {
    const id = checkbox.id;
    checkbox.checked = checkbox.checked;
  });
  subCheckboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      subCnt++;
    }
    if (subCnt == subCheckboxes.length) {
      parentCheckbox.checked = true;
    } else {
      parentCheckbox.checked = false;
    }
  });
}

function isAllChecked() {
  const CheckAll = document.querySelector(`#job_all`);
  const checkboxes = document.querySelectorAll(
    ".depth1 input[type='checkbox']:not(:disabled)"
  );
  let navCnt = 0;
  checkboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      navCnt++;
    }
    if (navCnt == checkboxes.length) {
      CheckAll.checked = true;
    } else {
      CheckAll.checked = false;
    }
  });
}

// ------------------------------
// [5] ?�터�? 총합, 메시지 ?�시
// ------------------------------

function filterListByCategory(parentCate, category) {
  const allItems = document.querySelectorAll(".apply_list .list_wrap li[data-cate]");
  let visibleCount = 0;

  allItems.forEach((item) => {
    const itemGroup = item.getAttribute("data-cate");
    const shouldShow =
      !category || category === "all" || itemGroup === category;
    item.classList.toggle("show", shouldShow);
    if (shouldShow) visibleCount++;
  });

  updateTotalCount(visibleCount);
  renderEmptyMessage(visibleCount);
}

function updateTotalCount() {
  const displayCount = document.querySelectorAll(
    ".apply_list .list_wrap li[data-cate].show"
  ).length;
  const totalElement = document.querySelector(".apply_list .total b");
  if (totalElement) {
    totalElement.textContent = `총 ${displayCount}개`;
  }
  renderEmptyMessage(displayCount);
}

function renderEmptyMessage(count) {
  const ul = document.querySelector(".apply_list .list_wrap");
  const existing = ul.querySelector(".list_none");

  if (count === 0) {
    if (!existing) {
      const li = document.createElement("li");
      li.className = "list_none";
      li.textContent = "현재 모집중인 공고가 없습니다.";
      ul.appendChild(li);
    }
  } else {
    if (existing) existing.remove();
  }
}

const navList = document.querySelector(".apply_left");
const filterBtn = document.querySelector(".btn_filter");
filterBtn.addEventListener("click", function (e) {
  e.preventDefault();
  navList.classList.add("open");
  document.querySelector("body").style.overflowY = "hidden";
});

const filterCloseBtn = document.querySelector(".apply_left .btn-close");
filterCloseBtn.addEventListener("click", function (e) {
  e.preventDefault();
  navList.classList.remove("open");
  document.querySelector("body").style.overflowY = "initial";
});

navList.addEventListener("click", function (e) {
  const filterCloseBtn = document.querySelector(".apply_left .btn-close");
  const navWrap = navList.querySelector(".nav_wrap");
  if (navList.classList.contains("open")) {
    if (
      navWrap &&
      !navWrap.contains(e.target) &&
      !filterCloseBtn.contains(e.target)
    ) {
      navList.classList.remove("open");
    }
  }
});

const reviewSwiper = new Swiper(".sub-inner .tab_wrap", {
  direction: "horizontal",
  slidesPerView: "auto",
  loop: false,
  autoHeight: false,
  breakpoints: {
    1400: {
      spaceBetween: 60,
    },
    0: {
      spaceBetween: 24,
    },
  },
});

// ------------------------------
// [6] ??�?초기 ?�태 처리
// ------------------------------
function setApplyTotal() {
  const partInfoMap = {
    engineer: "엔지니어",
    developer: "개발자",
    designer: "디자이너",
    management: "경영기획/관리",
  };

  const tabs = document.querySelectorAll(".tab_wrap .tabs button");

  // ?�체 공고 ??처리
  const allItemsCount = document.querySelectorAll(
    ".apply_list .list_wrap li[data-cate]"
  ).length;
  const allCountFormatted =
    allItemsCount > 9 ? allItemsCount : `0${allItemsCount}`;
  const allTab = tabs[0].querySelector(".badge");
  if (allTab) allTab.textContent = allCountFormatted;
  updateTotalCount();
  // 카테고리�?공고 ??처리
  tabs.forEach((tab) => {
    const cate = tab.getAttribute("data-cate");
    if (partInfoMap.hasOwnProperty(cate)) {
      const categoryCount = document.querySelectorAll(
        `.apply_list [id*="${cate}"]`
      ).length;
      const formattedCount =
        categoryCount > 9 ? categoryCount : `0${categoryCount}`;
      const badge = tab.querySelector(".badge");
      if (badge) badge.textContent = formattedCount;
    }

    // ???�릭 ???�당 카테고리 ??���?보여�?
    tab.addEventListener("click", () => {
      document
        .querySelectorAll(".tab_wrap .tabs button")
        .forEach((btn) => btn.classList.remove("active"));
      tab.classList.add("active");

      const selectedCate = tab.getAttribute("data-cate");
      checkRemoveAll();
      const parentCheckbox = document.querySelector(
        selectedCate === "all" ? "#job_all" : `#job_${selectedCate}_all`
      );
      if (parentCheckbox && !parentCheckbox.disabled) {
        parentCheckbox.click();
      }
      updateJobList();

      //updateParentCheckbox(selectedCate);
    });
  });
}

function checkRemoveAll() {
  const navCheckList = document.querySelectorAll(
    ".apply_left .nav_all input[type=checkbox]"
  );
  navCheckList.forEach((item, index) => {
    item.checked = false;
  });
}
function handleParams() {
  const btn = document.querySelector(`.tabs button[data-cate="${group}"]`);
  if (btn) {
    btn.click();
  }
}

// ------------------------------
// ?�행
// ------------------------------
fetchData();
