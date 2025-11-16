// ===== MOCK DATA =====
const PAGE_SIZE = 7;
let currentEditingId = null;

const requests = [
  {
    id: 1,
    title: "ไฟฟ้าดับ",
    dateRequested: "2025-12-01",
    reporter: "สมชาย",
    technician: "ช่างเอกชัย",
    category: "ไฟฟ้า",
    urgency: "none",
    status: "pending",
    location: "ตึกอาคารเรียน 2",
    room: "210",
    description: "ไฟฟ้าดับทั้งห้อง ไม่สามารถเปิดไฟและปลั๊กไฟได้"
  },
  {
    id: 2,
    title: "น้ำไม่ไหล",
    dateRequested: "2025-12-01",
    reporter: "ไอตี๋",
    technician: "ช่างธนภาค",
    category: "ประปา",
    urgency: "high",
    status: "inprogress",
    location: "หอพักนักศึกษา A",
    room: "304",
    description: "ในห้องน้ำไม่มีน้ำไหลจากฝักบัวและก๊อกอ่างล้างหน้า"
  },
  {
    id: 3,
    title: "เก้าอี้ชำรุด",
    dateRequested: "2025-12-02",
    reporter: "พิเชษฐ์",
    technician: "ช่างอดิศร",
    category: "เฟอร์นิเจอร์",
    urgency: "medium",
    status: "waiting",
    location: "ตึกเรียนรวม 1",
    room: "110",
    description: "ขาเก้าอี้โยกเยก มีโอกาสหักเมื่อมีคนใช้งาน"
  },
  {
    id: 4,
    title: "ประตูล็อกไม่ได้",
    dateRequested: "2025-12-02",
    reporter: "เมเปิ้ล",
    technician: "ช่างวีรัตน์",
    category: "ประตู/ล็อก",
    urgency: "low",
    status: "checking",
    location: "สำนักงานภาควิชา",
    room: "305",
    description: "ประตูปิดได้แต่บิดกุญแจแล้วไม่ล็อก"
  },
   {
    id: 5,
    title: "เครื่องปรับอากาศไม่เย็น",
    dateRequested: "2025-12-03",
    reporter: "พรปวีณ์",
    technician: "ช่างปวิชย์",
    category: "อื่นๆ",
    urgency: "low",
    status: "success",
    location: "ตึกเรียนรวม 3",
    room: "204",
    description: "เปิดแอร์แล้วลมออกแต่ไม่เย็น อุณหภูมิในห้องสูง",
    // >>> เพิ่มสองบรรทัดนี้ <<<
    feedbackRating: 5,
    feedbackComment: "งานซ่อมรอบนี้ดีมากค่ะ แอร์เย็นเร็ว ใช้งานได้ปกติ ขอบคุณทีมช่างค่ะ"
  },
  {
    id: 6,
    title: "ท่อหน้าห้องอุดตัน",
    dateRequested: "2025-12-03",
    reporter: "ริวา",
    technician: "ช่างศศิศ",
    category: "ประปา",
    urgency: "high",
    status: "waiting",
    location: "หอพักนักศึกษา B",
    room: "ทางเดินชั้น 2",
    description: "น้ำขังตรงหน้าห้องเวลาฝนตก ระบายไม่ทัน"
  },
  {
    id: 7,
    title: "อ่างล้างมือรั่ว",
    dateRequested: "2025-12-04",
    reporter: "คุณภูมิกรณ์",
    technician: "ช่างธรรมบุญ",
    category: "ประปา",
    urgency: "low",
    status: "checking",
    location: "ตึกปฏิบัติการ",
    room: "117",
    description: "มีน้ำหยดจากท่อใต้ซิงก์ตลอดเวลา"
  },
  // ---- page 2 ----
  {
    id: 8,
    title: "ปลั๊กไฟชำรุด",
    dateRequested: "2025-12-04",
    reporter: "สุพล",
    technician: "ช่างจรูญศักดิ์",
    category: "ไฟฟ้า",
    urgency: "medium",
    status: "inprogress",
    location: "ตึกเรียนรวม 2",
    room: "220",
    description: "ปลั๊กตรงมุมห้องหลวมและมีเสียงประกายไฟ"
  },
  {
    id: 9,
    title: "ไฟกะพริบ",
    dateRequested: "2025-12-05",
    reporter: "สุพล",
    technician: "ช่างจรูญศักดิ์",
    category: "ไฟฟ้า",
    urgency: "low",
    status: "wait_feedback",
    location: "ตึกเรียนรวม 2",
    room: "221",
    description: "หลอดไฟเพดานกะพริบตลอดเวลา"
  },
  {
    id: 10,
    title: "ก๊อกน้ำหลวม",
    dateRequested: "2025-12-05",
    reporter: "สมปอง",
    technician: "ช่างเอกชัย",
    category: "ประปา",
    urgency: "low",
    status: "waiting",
    location: "โรงอาหารกลาง",
    room: "โซนล้างจาน",
    description: "ก๊อกน้ำโยกไปมาเวลาบิดแรง ๆ"
  },
  {
    id: 11,
    title: "โคมไฟแตก",
    dateRequested: "2025-12-06",
    reporter: "อนงค์",
    technician: "ช่างธนากฤต",
    category: "ไฟฟ้า",
    urgency: "high",
    status: "inprogress",
    location: "ลานจอดรถ",
    room: "-",
    description: "โคมไฟนอกอาคารแตก เสี่ยงต่อการบาดเจ็บ"
  },
  {
    id: 12,
    title: "โต๊ะเรียนโยก",
    dateRequested: "2025-12-06",
    reporter: "ชัยวัฒน์",
    technician: "ช่างอดิศร",
    category: "เฟอร์นิเจอร์",
    urgency: "medium",
    status: "waiting",
    location: "ตึกเรียนรวม 4",
    room: "312",
    description: "โต๊ะเรียนโยกเยกใช้เขียนหนังสือลำบาก"
  },
  {
    id: 13,
    title: "ประตูล๊อกฝืด",
    dateRequested: "2025-12-07",
    reporter: "บรีนา",
    technician: "ช่างวีรวัตน์",
    category: "ประตู/ล็อก",
    urgency: "low",
    status: "checking",
    location: "ห้องสมุดกลาง",
    room: "ห้องประชุม",
    description: "ต้องออกแรงมากเวลาเปิดประตู"
  },
  {
    id: 14,
    title: "ผนังแตกลอก",
    dateRequested: "2025-12-07",
    reporter: "พิกษา",
    technician: "ช่างปวิชย์",
    category: "อื่นๆ",
    urgency: "low",
    status: "success",
    location: "ตึกเก่า",
    room: "105",
    description: "สีผนังลอกและเป็นคราบชื้น"
  },
  // ---- page 3 ----
  {
    id: 15,
    title: "พัดลมเพดานเสียงดัง",
    dateRequested: "2025-12-08",
    reporter: "พิมพ์ชนก",
    technician: "ช่างมนตรี",
    category: "อื่นๆ",
    urgency: "medium",
    status: "pending",
    location: "โรงอาหารคณะ",
    room: "ชั้น 1",
    description: "พัดลมมีเสียงดังเวลาเปิดความเร็วระดับ 3"
  },
  {
    id: 16,
    title: "สายแลนขาด",
    dateRequested: "2025-12-08",
    reporter: "ภคพงศ์",
    technician: "ช่างไอที",
    category: "เครือข่าย",
    urgency: "high",
    status: "inprogress",
    location: "ห้องแลบคอมพิวเตอร์",
    room: "Lab 2",
    description: "ไม่สามารถเชื่อมต่ออินเทอร์เน็ตได้"
  },
  {
    id: 17,
    title: "หลอดไฟบันไดดับ",
    dateRequested: "2025-12-09",
    reporter: "ณัฐวุฒิ",
    technician: "ช่างเอกชัย",
    category: "ไฟฟ้า",
    urgency: "low",
    status: "success",
    location: "บันไดหนีไฟ",
    room: "ชั้น 3",
    description: "หลอดไฟบันไดไม่ติด ทำให้ทางเดินมืด"
  },
  {
    id: 18,
    title: "ท่อน้ำทิ้งห้องน้ำตัน",
    dateRequested: "2025-12-09",
    reporter: "ธนากร",
    technician: "ช่างปวิชย์",
    category: "ประปา",
    urgency: "high",
    status: "waiting",
    location: "อาคารเรียนรวม",
    room: "ห้องน้ำชายชั้น 4",
    description: "กดชักโครกแล้วน้ำล้นออกมา"
  },
  {
    id: 19,
    title: "ไฟฉุกเฉินไม่ทำงาน",
    dateRequested: "2025-12-10",
    reporter: "สุกัญญา",
    technician: "ช่างวีรวัตน์",
    category: "ไฟฟ้า",
    urgency: "medium",
    status: "checking",
    location: "โถงหน้าลิฟต์",
    room: "ชั้น 1",
    description: "ทดสอบแล้วไฟฉุกเฉินไม่ติดเมื่อปิดเบรกเกอร์"
  },
  {
    id: 20,
    title: "ระบบเสียงไมค์ขัดข้อง",
    dateRequested: "2025-12-10",
    reporter: "กิตติคุณ",
    technician: "ช่างไอที",
    category: "อื่นๆ",
    urgency: "none",
    status: "pending",
    location: "หอประชุม",
    room: "-",
    description: "ไมค์ไร้สายมีเสียงขาด ๆ หาย ๆ"
  },
  {
    id: 21,
    title: "หน้าต่างปิดไม่สนิท",
    dateRequested: "2025-12-11",
    reporter: "ปวีณา",
    technician: "ช่างอดิศร",
    category: "อื่นๆ",
    urgency: "low",
    status: "success",
    location: "อาคารเรียนรวม 5",
    room: "508",
    description: "เวลาฝนตกมีน้ำซึมเข้ามาตามขอบกระจก"
  }
];

// ===== STATE =====
let currentPage = 1;
let canChangeUrgency = true; // ใช้ล็อก dropdown ความเร่งด่วน
let isEditMode = false;      // อยู่โหมดแก้ไข detail modal หรือไม่

// ===== DOM: ตาราง & filter =====
const tbody = document.querySelector("#requestTable tbody");
const paginationEl = document.querySelector("#pagination");
const prevBtn = document.querySelector("#prevBtn");
const nextBtn = document.querySelector("#nextBtn");
const searchInput = document.querySelector("#searchInput");

const filterBtn = document.querySelector("#filterBtn");
const filterPanel = document.querySelector("#filterPanel");
const filterClearBtn = document.querySelector("#filterClear");

// ===== DOM: DETAIL MODAL =====
const overlay = document.querySelector("#detailOverlay");
const detailTitle = document.querySelector("#detailTitle");
const detailDate = document.querySelector("#detailDate");
const detailCategory = document.querySelector("#detailCategory");
const detailLocation = document.querySelector("#detailLocation");
const detailRoom = document.querySelector("#detailRoom");
const detailDescription = document.querySelector("#detailDescription");
const detailReporter = document.querySelector("#detailReporter");
const detailTechnician = document.querySelector("#detailTechnician");
const detailCloseBtn = document.querySelector("#detailCloseBtn");

// footer buttons
const cancelBtn = document.querySelector("#footerCancelBtn");
const editBtn = document.querySelector("#footerEditBtn");
const detailFooter = document.querySelector("#detailFooter");
const confirmActions = document.querySelector(".confirm-actions");

// urgency dropdown in modal
const statusDropdownBtn = document.querySelector("#statusDropdownBtn");
const statusDropdownMenu = document.querySelector("#statusDropdownMenu");
const statusMainText = document.querySelector("#statusMainText");
const detailStatusPill = document.querySelector("#detailStatusPill");
const detailConfirmBtn = document.querySelector("#detailConfirmBtn");
const confirmInspectionBtn = document.querySelector("#footerConfirmInspectionBtn");

// ===== DOM: REPORT MODAL =====
const reportOverlay    = document.querySelector("#reportOverlay");
const reportCloseBtn   = document.querySelector("#reportCloseBtn");
const reportTitle      = document.querySelector("#reportTitle");
const reportDate       = document.querySelector("#reportDate");
const reportLocation   = document.querySelector("#reportLocation");
const reportReporter   = document.querySelector("#reportReporter");
const reportTechnician = document.querySelector("#reportTechnician");
const reportCategory   = document.querySelector("#reportCategory");
const reportCause      = document.querySelector("#reportCause");
const reportMethod     = document.querySelector("#reportMethod");
const reportNote       = document.querySelector("#reportNote");

// ===== DOM: FEEDBACK MODAL (ดูผลประเมิน) =====
const feedbackOverlay     = document.querySelector("#feedbackOverlay");
const feedbackTitle       = document.querySelector("#feedbackTitle");
const feedbackScoreText   = document.querySelector("#feedbackScoreText");
const feedbackStarsWrap   = document.querySelector("#feedbackStars");
const feedbackCommentView = document.querySelector("#feedbackCommentView");
const feedbackCloseBtn    = document.querySelector("#feedbackCloseBtn");


// ===== UTIL =====
function formatDate(iso) {
  if (!iso) return "-";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function createUrgencyChip(urgency) {
  const map = {
    none:   { text: "None",   cls: "chip chip-none" },
    high:   { text: "High",   cls: "chip chip-high" },
    medium: { text: "Medium", cls: "chip chip-medium" },
    low:    { text: "Low",    cls: "chip chip-low" }
  };
  const data = map[urgency] || map.none;
  return `<span class="${data.cls}">${data.text}</span>`;
}

function createStatusChip(status) {
  const map = {
    pending:       { text: "รอดำเนินการ",        cls: "status-chip status-pending" },
    inprogress:    { text: "กำลังดำเนินการ",     cls: "status-chip status-inprogress" },
    waiting:       { text: "อยู่ระหว่างซ่อม",     cls: "status-chip status-waiting" },
    checking:      { text: "กำลังตรวจสอบงานซ่อม", cls: "status-chip status-checking" },
    success:       { text: "สำเร็จ",             cls: "status-chip status-success" },
    wait_feedback: { text: "ยังไม่ได้ให้คะแนน",   cls: "status-chip status-wait-feedback" },
    cancelled:     { text: "ยกเลิกแล้ว",          cls: "status-chip status-cancelled" }
  };
  const data = map[status] || map.pending;
  return `<span class="${data.cls}">${data.text}</span>`;
}

function updateDetailStatusPill(status) {
  if (!detailStatusPill) return;

  // เอา text จาก chip เดิมมาใช้ (ภาษาไทยตรงกับ table)
  detailStatusPill.textContent =
    document
      .createRange()
      .createContextualFragment(createStatusChip(status))
      .textContent || "";

  // รีเซ็ต class ก่อน
  detailStatusPill.className = "status-pill";

  // map สถานะ → class สีเหมือนใน table
  const statusClsMap = {
    pending:       "status-pending",
    inprogress:    "status-inprogress",
    waiting:       "status-waiting",
    checking:      "status-checking",
    success:       "status-success",
    wait_feedback: "status-wait-feedback",
    cancelled:     "status-cancelled"
  };

  const cls = statusClsMap[status];
  if (cls) {
    detailStatusPill.classList.add(cls);
  }
}


// filter data ตาม search + checkbox
function getFilteredData() {
  const text = searchInput.value.trim().toLowerCase();

  const urgChecked = Array.from(
    document.querySelectorAll('input[data-type="urgency"]:checked')
  ).map((c) => c.value);

  const statusChecked = Array.from(
    document.querySelectorAll('input[data-type="status"]:checked')
  ).map((c) => c.value);

  return requests.filter((item) => {
    const searchOk =
      !text ||
      item.title.toLowerCase().includes(text) ||
      item.reporter.toLowerCase().includes(text) ||
      item.technician.toLowerCase().includes(text) ||
      item.category.toLowerCase().includes(text);

    const urgOk =
      urgChecked.length === 0 || urgChecked.includes(item.urgency);

    const statusOk =
      statusChecked.length === 0 || statusChecked.includes(item.status);

    return searchOk && urgOk && statusOk;
  });
}

// ===== TABLE + PAGINATION =====
function renderTableAndPagination() {
  const data = getFilteredData();
  const total = data.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = data.slice(start, start + PAGE_SIZE);

  tbody.innerHTML = "";

  pageItems.forEach((item) => {
    const tr = document.createElement("tr");
    tr.dataset.id = item.id;

    tr.innerHTML = `
      <td class="title-cell">${item.title}</td>
      <td>${formatDate(item.dateRequested)}</td>
      <td>${item.reporter}</td>
      <td>${item.technician}</td>
      <td>${item.category}</td>
      <td>${createUrgencyChip(item.urgency)}</td>
      <td>${createStatusChip(item.status)}</td>
      <td class="more-cell">
        <button class="more-btn" type="button">
          <span class="material-icons-outlined">more_horiz</span>
        </button>

        <div class="row-menu">
          <!-- ดูรายละเอียด (ทุกสถานะ) -->
          <button class="row-menu-item" data-action="detail">
            <span class="row-menu-item-icon material-icons-outlined">visibility</span>
            <span>ดูรายละเอียด</span>
          </button>

          <!-- รายงานการซ่อม (เฉพาะ success / wait_feedback) -->
          ${
            ["success", "wait_feedback"].includes(item.status)
              ? `
              <button class="row-menu-item" data-action="report">
                <span class="row-menu-item-icon material-icons-outlined">description</span>
                <span>รายงานการซ่อม</span>
              </button>
              `
              : ""
          }

          <!-- แก้ไข (เฉพาะ pending / inprogress) -->
          ${
            ["pending", "inprogress"].includes(item.status)
              ? `
              <button class="row-menu-item" data-action="edit">
                <span class="row-menu-item-icon material-icons-outlined">edit</span>
                <span>แก้ไข</span>
              </button>
              `
              : ""
          }

          <!-- ยกเลิกการแจ้งซ่อม (เฉพาะ pending / inprogress / waiting) -->
          ${
            ["pending", "inprogress", "waiting"].includes(item.status)
              ? `
              <button class="row-menu-item delete" data-action="cancel">
                <span class="row-menu-item-icon material-icons-outlined">cancel</span>
                <span>ยกเลิกการแจ้งซ่อม</span>
              </button>
              `
              : ""
          }
        </div>
      </td>
    `;

    tbody.appendChild(tr);
  });

  // เติมแถวเปล่าให้ครบ PAGE_SIZE แถว
  const remain = PAGE_SIZE - pageItems.length;
  for (let i = 0; i < remain; i++) {
    const trEmpty = document.createElement("tr");
    trEmpty.classList.add("empty-row");
    trEmpty.innerHTML = `<td colspan="8">&nbsp;</td>`;
    tbody.appendChild(trEmpty);
  }

  attachRowMenuHandlers();

  // pagination ปุ่มเลขหน้า
  paginationEl.innerHTML = "";
  for (let p = 1; p <= totalPages; p++) {
    const btn = document.createElement("button");
    btn.className = "page-number";
    if (p === currentPage) btn.classList.add("active");
    btn.textContent = p.toString().padStart(2, "0");
    btn.addEventListener("click", () => {
      currentPage = p;
      renderTableAndPagination();
    });
    paginationEl.appendChild(btn);
  }

  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPages;
  prevBtn.classList.toggle("disabled", isFirst);
  prevBtn.classList.toggle("hidden-keep-space", isFirst);
  nextBtn.classList.toggle("disabled", isLast);
}

// ===== REPORT MODAL =====
function openReportModal(data) {
  if (!reportOverlay) return;

  if (reportTitle)      reportTitle.textContent      = data.title || "";
  if (reportDate)       reportDate.textContent       = formatDate(data.dateRequested);
  if (reportLocation)   reportLocation.textContent   = data.location || "-";
  if (reportReporter)   reportReporter.textContent   = data.reporter || "-";
  if (reportTechnician) reportTechnician.textContent = data.technician || "-";
  if (reportCategory)   reportCategory.textContent   = data.category || "-";

  // ถ้าไม่มี field cause/method/note แยกใน mock data ก็ใช้ description ยัดใน cause ไว้ก่อน
  if (reportCause)  reportCause.textContent  = data.cause  || data.description || "";
  if (reportMethod) reportMethod.textContent = data.method || "";
  if (reportNote)   reportNote.textContent   = data.note   || "";

  reportOverlay.classList.add("show");
}

function closeReportModal() {
  if (!reportOverlay) return;
  reportOverlay.classList.remove("show");
}

if (reportCloseBtn) {
  reportCloseBtn.addEventListener("click", closeReportModal);
}
if (reportOverlay) {
  reportOverlay.addEventListener("click", (e) => {
    if (e.target === reportOverlay) closeReportModal();
  });
}

function openFeedbackModal(data) {
  if (!feedbackOverlay) return;

  const rating  = data.feedbackRating || 0;
  const comment = data.feedbackComment || "ยังไม่มีการประเมินจากผู้ใช้";

  if (feedbackTitle) feedbackTitle.textContent = data.title || "";
  if (feedbackScoreText) {
    feedbackScoreText.textContent = rating ? `${rating} / 5` : "-";
  }
  if (feedbackCommentView) feedbackCommentView.value = comment;

  if (feedbackStarsWrap) {
    feedbackStarsWrap.innerHTML = "";
    for (let i = 1; i <= 5; i++) {
      const span = document.createElement("span");
      span.className = "feedback-star" + (i <= rating ? " active" : "");
      span.textContent = "★";
      feedbackStarsWrap.appendChild(span);
    }
  }

  feedbackOverlay.classList.add("show");
}

function closeFeedbackModal() {
  if (!feedbackOverlay) return;
  feedbackOverlay.classList.remove("show");
}

if (feedbackCloseBtn) {
  feedbackCloseBtn.addEventListener("click", closeFeedbackModal);
}

if (feedbackOverlay) {
  feedbackOverlay.addEventListener("click", (e) => {
    if (e.target === feedbackOverlay) closeFeedbackModal();
  });
}

// ===== ROW MENU & DETAIL MODAL =====
function attachRowMenuHandlers() {
  function closeAllRowMenus() {
    document
      .querySelectorAll(".row-menu.show")
      .forEach((el) => el.classList.remove("show"));
  }

  document.querySelectorAll(".more-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const cell = btn.closest("td");
      const menu = cell.querySelector(".row-menu");
      const isOpen = menu.classList.contains("show");
      closeAllRowMenus();
      if (!isOpen) menu.classList.add("show");
    });
  });

  document.querySelectorAll(".row-menu-item").forEach((itemBtn) => {
    itemBtn.addEventListener("click", () => {
      const action = itemBtn.dataset.action;
      const tr = itemBtn.closest("tr");
      const id = Number(tr.dataset.id);
      const data = requests.find((r) => r.id === id);
      if (!data) return;

      if (action === "detail") {
        openDetailModal(data);
      } else if (action === "edit") {
        openDetailModal(data, true);    // เปิดแบบ edit mode ทันที
      } else if (action === "cancel") {
        const req = requests.find((r) => r.id === data.id);
        if (req) req.status = "cancelled";
        renderTableAndPagination();
      } else if (action === "report") {
        openReportModal(data);
      }

      closeAllRowMenus();
    });
  });

  document.addEventListener(
    "click",
    () => {
      closeAllRowMenus();
    },
    { once: true }
  );
}

function openDetailModal(data, startInEdit = false) {
  currentEditingId = data.id;
  isEditMode = false; // เริ่มจากโหมดดูอย่างเดียว

  // ใส่ข้อมูลพื้นฐาน
  detailTitle.textContent   = data.title;
  detailDate.value          = formatDate(data.dateRequested);
  detailCategory.value      = data.category;
  detailLocation.value      = data.location || "";
  detailRoom.value          = data.room || "";
  detailDescription.value   = data.description || "";
  detailReporter.value      = data.reporter;
  detailTechnician.value    = data.technician;

  // urgency บนปุ่ม
  setUrgencyOnMainBtn(data.urgency);

  // status pill
  // status pill (use correct color like table)
updateDetailStatusPill(data.status);


  // ===== จัด layout ปุ่ม footer ตามสถานะ =====
  cancelBtn.style.display = "inline-flex";
  editBtn.style.display   = "inline-flex";

  if (confirmInspectionBtn) confirmInspectionBtn.style.display = "none";

  cancelBtn.textContent = "ยกเลิกการแจ้งซ่อม";
  cancelBtn.className   = "btn-pill btn-danger";

  editBtn.textContent   = "แก้ไข";
  editBtn.className     = "btn-pill btn-warning";

  if (data.status === "pending" || data.status === "inprogress") {
    // layout default

    } else if (data.status === "waiting") {
    // มีแค่ ยกเลิกการแจ้งซ่อม
    editBtn.style.display = "none";
} else if (data.status === "checking") {
    // สถานะ "กำลังตรวจสอบงานซ่อม"
    // 1. ปุ่ม "รายงานการซ่อม" (ใช้ปุ่ม cancel เดิม)
    cancelBtn.textContent = "รายงานการซ่อม";
    cancelBtn.className   = "btn-pill btn-primary"; // สีน้ำเงิน
    
    // 2. ซ่อนปุ่ม "แก้ไข"
    editBtn.style.display = "none";

    // 3. !! แสดงปุ่มใหม่ "ยืนยันการตรวจสอบงาน" !!
    if (confirmInspectionBtn) {
      confirmInspectionBtn.style.display = "inline-flex";
      confirmInspectionBtn.className = "btn-pill btn-success"; // สีเขียว
    }

  } else if (data.status === "wait_feedback") {
    // สถานะ "ยังไม่ได้ให้คะแนน" (เหมือน checking แต่ไม่มีปุ่มยืนยัน)
    cancelBtn.textContent = "รายงานการซ่อม";
    cancelBtn.className   = "btn-pill btn-primary";
    editBtn.style.display = "none";
    // (confirmInspectionBtn จะถูกซ่อนไว้ตามที่ reset)

  } else if (data.status === "success") {
    // สำเร็จ → ปุ่มซ้าย = รายงาน, ปุ่มขวา = ดูผลประเมินงานซ่อม
    cancelBtn.textContent = "รายงานการซ่อม";
    cancelBtn.className   = "btn-pill btn-primary";

    editBtn.textContent   = "ประเมินงานซ่อม";
    editBtn.className     = "btn-pill btn-warning";  // ใช้ปุ่มเหลือง // หรือ btn-warning ตามชอบ
    editBtn.style.display = "inline-flex";

  } else if (data.status === "cancelled") {
    // ยกเลิกแล้ว → ไม่ต้องมีปุ่มซ้าย/ขวาแก้ไข
    cancelBtn.style.display = "none";
    editBtn.style.display   = "none";
  }

  // ===== การทำงานปุ่มใน footer =====
  cancelBtn.onclick = () => {
    // ถ้าเป็นปุ่ม "กดดูรายงานการซ่อม"
    if (["checking", "wait_feedback", "success"].includes(data.status)) {
      openReportModal(data);
      return;
    }

    // สถานะที่ยังยกเลิกได้จริง
    if (["pending", "inprogress", "waiting"].includes(data.status)) {
      const req = requests.find((r) => r.id === data.id);
      if (req) req.status = "cancelled";
      closeDetailModal();
      renderTableAndPagination();
    }
  };

    editBtn.onclick = () => {
    if (data.status === "success") {
      // แสดงผลประเมินงานซ่อม (read-only)
      openFeedbackModal(data);
    } else if (["pending", "inprogress"].includes(data.status)) {
      // เข้าโหมดแก้ไขรายละเอียด
      isEditMode = true;
      applyEditModeUI();
      if (detailFooter) detailFooter.classList.add("confirm-mode");
    }
  };

  if (confirmInspectionBtn) {
    confirmInspectionBtn.onclick = () => {
      // ตรวจสอบว่า ID ถูกต้อง และสถานะเป็น checking จริง
      if (!currentEditingId || data.status !== "checking") return;

      const req = requests.find((r) => r.id === currentEditingId);
      if (req) {
        // !! เปลี่ยนสถานะเป็น "ยังไม่ได้ให้คะแนน" !!
        req.status = "wait_feedback"; 
      }
      
      closeDetailModal();
      renderTableAndPagination();
    };
  }
  

  // ===== ล็อก / ปลดล็อก dropdown ความเร่งด่วน =====
  canChangeUrgency = !(
    data.status === "success" ||
    data.status === "checking" ||
    data.status === "waiting" ||
    data.status === "cancelled"
  );

  statusDropdownBtn.classList.remove(
    "disabled-urgency",
    "urg-none",
    "urg-high",
    "urg-medium",
    "urg-low"
  );

  setUrgencyOnMainBtn(data.urgency);
  applyEditModeUI();

  // ถ้าเรียกมาให้เริ่มที่ edit mode (จากเมนู 3 จุด)
  if (startInEdit && ["pending", "inprogress"].includes(data.status)) {
    isEditMode = true;
    applyEditModeUI();
    if (detailFooter) detailFooter.classList.add("confirm-mode");
  }

  overlay.classList.add("show");
}

// set สี + label ของปุ่ม urgency
function setUrgencyOnMainBtn(urgency) {
  statusDropdownBtn.classList.remove("urg-none", "urg-high", "urg-medium", "urg-low");
  let text = "None";
  let cls  = "urg-none";
  if (urgency === "high") {
    text = "High";   cls = "urg-high";
  } else if (urgency === "medium") {
    text = "Medium"; cls = "urg-medium";
  } else if (urgency === "low") {
    text = "Low";    cls = "urg-low";
  }
  statusMainText.textContent = text;
  statusDropdownBtn.classList.add(cls);
}

// จัด readonly / editable ของช่องต่าง ๆ ตามโหมด
function applyEditModeUI() {
  // 1) ปุ่ม dropdown ความเร่งด่วน
  statusDropdownBtn.classList.remove("view-mode", "edit-mode");
  if (isEditMode && canChangeUrgency) {
    statusDropdownBtn.classList.add("edit-mode");
  } else {
    statusDropdownBtn.classList.add("view-mode");
    statusDropdownMenu.classList.remove("show");
  }

  // 2) ช่องที่ต้อง readonly ตลอดเวลา
  const alwaysReadonlyFields = [
    detailDate,
    detailCategory,
    detailLocation,
    detailRoom,
    detailReporter,
    detailTechnician
  ];
  alwaysReadonlyFields.forEach((el) => {
    if (!el) return;
    el.setAttribute("readonly", "readonly");
    el.style.background = "#f9f9f9";
  });

  // 3) รายละเอียดงาน (ตัวเดียวที่แก้ได้)
if (isEditMode) {
  detailDescription.removeAttribute("readonly");
  detailDescription.style.background = "#ffffff";
  detailDescription.classList.add("detail-description-editing");
} else {
  detailDescription.setAttribute("readonly", "readonly");
  detailDescription.style.background = "#f9f9f9";
  detailDescription.classList.remove("detail-description-editing");
}

}

function closeDetailModal() {
  overlay.classList.remove("show");
  isEditMode = false;
  if (detailFooter) detailFooter.classList.remove("confirm-mode");
  applyEditModeUI();
}

// ===== EVENT: dropdown urgency =====
statusDropdownBtn.addEventListener("click", (e) => {
  if (!isEditMode || !canChangeUrgency) return;
  e.stopPropagation();
  statusDropdownMenu.classList.toggle("show");
});

document.querySelectorAll(".status-option").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (!canChangeUrgency) return;
    const value = btn.dataset.value; // high / medium / low
    setUrgencyOnMainBtn(value);
    statusDropdownMenu.classList.remove("show");
  });
});

// ปิด dropdown เมื่อคลิกนอก
document.addEventListener("click", () => {
  statusDropdownMenu.classList.remove("show");
});

// ปุ่มปิด detail modal
detailCloseBtn.addEventListener("click", closeDetailModal);
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) closeDetailModal();
});

// ปุ่ม "ยืนยัน" ใน detail modal
detailConfirmBtn.addEventListener("click", () => {
  if (!currentEditingId) return;
  const req = requests.find((r) => r.id === currentEditingId);
  if (!req) return;

  // เซฟความเร่งด่วน
  const newUrgency = statusMainText.textContent.trim().toLowerCase();
  req.urgency = newUrgency;

  // เซฟรายละเอียดงาน
  req.description = detailDescription.value.trim();

  // ปิดโหมดแก้ไข
  isEditMode = false;
  if (detailFooter) detailFooter.classList.remove("confirm-mode");
  applyEditModeUI();

  // refresh ตาราง
  renderTableAndPagination();

  // update ปุ่ม urgency ใน modal ตามค่าที่เพิ่งเซฟ
  setUrgencyOnMainBtn(req.urgency);
});

// ===== SEARCH & FILTER EVENTS =====
searchInput.addEventListener("input", () => {
  currentPage = 1;
  renderTableAndPagination();
});

filterBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  filterPanel.classList.toggle("show");
});

document.addEventListener("click", () => {
  filterPanel.classList.remove("show");
});

filterPanel.addEventListener("click", (e) => {
  e.stopPropagation();
});

document
  .querySelectorAll('input[data-type="urgency"], input[data-type="status"]')
  .forEach((chk) => {
    chk.addEventListener("change", () => {
      currentPage = 1;
      renderTableAndPagination();
    });
  });

filterClearBtn.addEventListener("click", () => {
  document
    .querySelectorAll('input[data-type="urgency"], input[data-type="status"]')
    .forEach((chk) => (chk.checked = false));
  currentPage = 1;
  renderTableAndPagination();
});

// ===== PREV / NEXT BUTTONS =====
prevBtn.addEventListener("click", () => {
  if (prevBtn.classList.contains("disabled")) return;
  currentPage = Math.max(1, currentPage - 1);
  renderTableAndPagination();
});

nextBtn.addEventListener("click", () => {
  if (nextBtn.classList.contains("disabled")) return;
  currentPage++;
  renderTableAndPagination();
});

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  renderTableAndPagination();
});
