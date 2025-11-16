window.addEventListener('pageshow', function(event) {
  // event.persisted จะเป็น true เมื่อหน้าเว็บถูกดึงมาจาก bfcache (เช่นการกด Back)
  if (event.persisted) {
    console.log('Page loaded from bfcache. Forcing reload from server...');
    // สั่งให้โหลดหน้าเว็บใหม่จากเซิร์ฟเวอร์
    window.location.reload(); 
  }
});

// ===== MOCK DATA =====
const PAGE_SIZE = 7;
let currentEditingId = null;

let allRequests = [];

// ===== STATE =====
let currentPage = 1;
let canChangeUrgency = true; // ใช้ล็อก dropdown ความเร่งด่วน
let isEditMode = false;      // อยู่โหมดแก้ไข detail modal หรือไม่

async function fetchRequests() {
  try {
    // เรียกไปยัง Endpoint ที่อยู่ใน ReportController
    const response = await fetch('/api/requests'); 
    if (!response.ok) {
      throw new Error(`Failed to fetch requests: ${response.statusText}`);
    }
    allRequests = await response.json(); // นำข้อมูลที่ได้มาเก็บใน allRequests
    
    // (Optional) ตรวจสอบข้อมูลที่ดึงมาได้ใน console
    console.log('Fetched data from API:', allRequests);

  } catch (error) {
    console.error('Error fetching requests:', error);
    allRequests = []; // หากดึงข้อมูลไม่สำเร็จ ให้ใช้ค่าว่างแทน
  }
}

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
function formatDate(dateStr) {
  if (!dateStr) return "-";

  const d = new Date(dateStr);

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
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
  // Map นี้จะใช้ "ภาษาไทย" ที่มาจาก DB เป็นคีย์
  const map = {
    "รอดำเนินการ":        { text: "รอดำเนินการ",        cls: "status-chip status-pending" },
    "กำลังดำเนินการ":     { text: "กำลังดำเนินการ",     cls: "status-chip status-inprogress" },
    "อยู่ระหว่างซ่อม":     { text: "อยู่ระหว่างซ่อม",     cls: "status-chip status-waiting" },
    "กำลังตรวจสอบงานซ่อม": { text: "กำลังตรวจสอบงานซ่อม", cls: "status-chip status-checking" },
"สำเร็จ":             { text: "สำเร็จ",             cls: "status-chip status-success" },
    "ซ่อมเสร็จ":          { text: "ยังไม่ได้ให้คะแนน",   cls: "status-chip status-wait-feedback" }, // <--- แก้ไขตรงนี้
    "ยกเลิก":          { text: "ยกเลิกแล้ว",          cls: "status-chip status-cancelled" }
  };
  // ถ้าไม่เจอสถานะไหนเลย ให้ยึด "รอดำเนินการ" เป็น default
  const data = map[status] || map["รอดำเนินการ"]; 
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

  // map สถานะ (คีย์ภาษาไทย) → class สีเหมือนใน table
  const statusClsMap = {
    "รอดำเนินการ":        "status-pending",
    "กำลังดำเนินการ":     "status-inprogress",
    "อยู่ระหว่างซ่อม":     "status-waiting",
"กำลังตรวจสอบงานซ่อม": "status-checking",
"สำเร็จ":             "status-success",
    "ซ่อมเสร็จ":          "status-wait-feedback", // <--- แก้ไขตรงนี้
    "ยกเลิก":          "status-cancelled"
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

  return allRequests.filter((item) => {
    const searchOk =
      !text ||
      item.title.toLowerCase().includes(text) ||
      item.reporter?.fullName.toLowerCase().includes(text) ||
      item.technician.toLowerCase().includes(text) ||
      item.category.toLowerCase().includes(text);

const urgOk =
      urgChecked.length === 0 || urgChecked.includes(item.priority);

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
      <td>${formatDate(item.createdAt)}</td>
      <td>${item.reporter?.fullName ?? "-"}</td>
      <td>${item.technician}</td>
      <td>${item.category}</td>
   <td>${createUrgencyChip(item.priority)}</td>
      <td>${createStatusChip(item.status)}</td>
      <td class="more-cell">
        <button class="more-btn" type="button">
          <span class="material-icons-outlined">more_horiz</span>
        </button>

        <div class="row-menu">
          <button class="row-menu-item" data-action="detail" onclick="openDetailModal(${item.id})">
            <span class="row-menu-item-icon material-icons-outlined">visibility</span>
            <span>ดูรายละเอียด</span>
          </button>

         ${
            ["สำเร็จ", "ซ่อมเสร็จ"].includes(item.status) // <--- แก้ไขตรงนี้
              ? `
              <button class="row-menu-item" data-action="report">
                <span class="row-menu-item-icon material-icons-outlined">description</span>
                <span>รายงานการซ่อม</span>
              </button>
              `
              : ""
          }
          
          ${
            item.status === "สำเร็จ"
              ? `
              <button class="row-menu-item" data-action="feedback">
                <span class="row-menu-item-icon material-icons-outlined">star_half</span>
                <span>ประเมินงานซ่อม</span>
              </button>
              `
              : ""
          }

          ${
            ["รอดำเนินการ", "กำลังดำเนินการ"].includes(item.status)
              ? `
              <button class="row-menu-item" data-action="edit">
                <span class="row-menu-item-icon material-icons-outlined">edit</span>
                <span>แก้ไข</span>
              </button>
              `
              : ""
          }

          ${
            ["รอดำเนินการ", "กำลังดำเนินการ", "อยู่ระหว่างซ่อม"].includes(item.status)
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
	console.log("🟦 openDetailModal CALLED with:", data);
  if (!reportOverlay) return;

  if (reportTitle)      reportTitle.textContent      = data.title || "";
  if (reportDate)       reportDate.textContent       = formatDate(data.createdAt);
  if (reportLocation)   reportLocation.textContent   = data.location || "-";
  if (reportReporter)   reportReporter.textContent   = data.reporter?.fullName || "-";
  if (reportTechnician) reportTechnician.textContent = data.technician || "-";
  if (reportCategory)   reportCategory.textContent   = data.category || "-";

  // ถ้าไม่มี field cause/method/note แยกใน mock data ก็ใช้ description ยัดใน cause ไว้ก่อน
  if (reportCause)  reportCause.textContent  = data.cause  || "";
  if (reportMethod) reportMethod.textContent = data.method || "";
  if (reportNote)   reportNote.textContent   = data.parts   || "";

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
    // ❗️ ทำให้ event listener เป็น async
    itemBtn.addEventListener("click", async () => { 
      const action = itemBtn.dataset.action;
      const tr = itemBtn.closest("tr");
      const id = Number(tr.dataset.id);
      
      const data = allRequests.find((r) => r.id === id);
      if (!data) return;

      if (action === "detail") {
        openDetailModal(data);
      } else if (action === "edit") {
        openDetailModal(data, true);    // เปิดแบบ edit mode ทันที
      } else if (action === "cancel") {
        
        if (!confirm("คุณต้องการยกเลิกใบแจ้งซ่อมนี้ใช่หรือไม่?")) return;
        
        const updateData = {
          id: data.id,
          status: "ยกเลิก", // ส่งภาษาไทย
          priority: data.priority || "low"
        };
        
        try {
          const response = await fetch('/api/requests/update-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData),
          });
          if (!response.ok) throw new Error('API Error');
          
          await fetchRequests(); // ดึงข้อมูลใหม่
          renderTableAndPagination(); // วาดตารางใหม่

        } catch (error) {
          console.error("Failed to cancel request:", error);
          alert("เกิดข้อผิดพลาดในการยกเลิก");
        }
        
      } else if (action === "report") {
        openReportModal(data);

      // ⭐️ [เพิ่มใหม่] ⭐️ เพิ่ม else if สำหรับ feedback
      } else if (action === "feedback") {
        openFeedbackModal(data);
      }

      closeAllRowMenus();
    });
  });

  document.addEventListener(
    "click",
    () => {
      closeAllRowMenus();
    }
  );
}
//renderAttachment
function renderAttachments(files) {
    const box = document.getElementById("attachmentBox");
    if (!box) return;

    box.innerHTML = files.map(f => `
        <div class="file-item">
            <a href="/api/requests/attachments/${f.id}/download" target="_blank">
                📄 ${f.fileName}
            </a>
        </div>
    `).join("");
}
//function laod file
async function loadAttachments(requestId) {
    try {
        const res = await fetch(`/api/files/${requestId}`);
        const files = await res.json();

        const container = document.getElementById("attachmentList");
        if (!container) {
            console.warn("No attachmentList element found in DOM");
            return files; // return files เผื่อใช้งานต่อ
        }

        container.innerHTML = "";

        if (files.length === 0) {
            container.innerHTML = `<p style="color:#888">ไม่มีไฟล์แนบ</p>`;
            return [];
        }

        files.forEach(file => {
            container.innerHTML += `
                <div class="file-item">
                    <span>${file.originalFilename}</span>
                    <a href="/api/files/${requestId}/${file.id}/download" target="_blank">ดาวน์โหลด</a>
                </div>
            `;
        });

        return files;
    } catch (err) {
        console.error("Error loading attachments:", err);
        return [];
    }
}


//load image
async function loadPreviewImage(requestId, attachmentId) {
    const previewImg = document.getElementById("previewImage");
    const noImageIcon = document.getElementById("noImageIcon");
    const noImageText = document.getElementById("noImageText");

    try {
        const res = await fetch(`/api/files/${requestId}/${attachmentId}/download`);
        if (!res.ok) {
            console.log("No image found or API error", res.status);
            previewImg.style.display = "none";
            noImageIcon.style.display = "inline";
            noImageText.style.display = "block";
            return;
        }

        const contentType = res.headers.get("content-type");
        if (!contentType.startsWith("image/")) {
            console.log("File is not an image:", contentType);
            previewImg.style.display = "none";
            noImageIcon.style.display = "inline";
            noImageText.style.display = "block";
            return;
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);

        previewImg.src = url;
        previewImg.style.display = "block";
        noImageIcon.style.display = "none";
        noImageText.style.display = "none";

        console.log("Preview image loaded:", url);
    } catch (err) {
        console.error("Error loading preview:", err);
    }
}

async function openDetailModal(data, startInEdit = false) {
  currentEditingId = data.id;
  isEditMode = false; // เริ่มจากโหมดดูอย่างเดียว

  // ใส่ข้อมูลพื้นฐาน
  detailTitle.textContent   = data.title;
  detailDate.value          = formatDate(data.createdAt);
  detailCategory.value      = data.category;
  detailLocation.value      = data.location || "";
  detailRoom.value          = data.locationDetail || "";
  detailDescription.value   = data.description || "";
  detailReporter.value      = data.reporter?.fullName;
  detailTechnician.value    = data.technician;

  // urgency บนปุ่ม
  setUrgencyOnMainBtn(data.priority);

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

  if (data.status === "รอดำเนินการ" || data.status === "กำลังดำเนินการ") {
    // layout default
  
  } else if (data.status === "อยู่ระหว่างซ่อม") {
    // มีแค่ ยกเลิกการแจ้งซ่อม
    editBtn.style.display = "none";
  
  } else if (data.status === "กำลังตรวจสอบงานซ่อม") {
    // สถานะ "กำลังตรวจสอบงานซ่อม"
    cancelBtn.textContent = "รายงานการซ่อม";
    cancelBtn.className   = "btn-pill btn-primary"; 
    editBtn.style.display = "none";
    if (confirmInspectionBtn) {
      confirmInspectionBtn.style.display = "inline-flex";
      confirmInspectionBtn.className = "btn-pill btn-success"; 
    }
  
} else if (data.status === "ซ่อมเสร็จ") { // <--- แก้ไขตรงนี้
    // สถานะ "ยังไม่ได้ให้คะแนน" (ที่จริงคือ "ซ่อมเสร็จ")
    cancelBtn.textContent = "รายงานการซ่อม";
    cancelBtn.className   = "btn-pill btn-primary";
    editBtn.style.display = "none";
  
  } else if (data.status === "สำเร็จ") {
    // สำเร็จ
    cancelBtn.textContent = "รายงานการซ่อม";
    cancelBtn.className   = "btn-pill btn-primary";
    editBtn.textContent   = "ประเมินงานซ่อม";
    editBtn.className     = "btn-pill btn-warning"; 
    editBtn.style.display = "inline-flex";
  
  } else if (data.status === "ยกเลิก") {
    // ยกเลิกแล้ว
    cancelBtn.style.display = "none";
    editBtn.style.display   = "none";
  }
  // ===== การทำงานปุ่มใน footer =====
cancelBtn.onclick = async () => { // <--- 1. เติม async
    // ถ้าเป็นปุ่ม "กดดูรายงานการซ่อม"
if (["กำลังตรวจสอบงานซ่อม", "ซ่อมเสร็จ", "สำเร็จ"].includes(data.status)) { // <--- ✨✨ แก้ไขเป็น "ซ่อมเสร็จ" ✨✨
      openReportModal(data);
      return;
    }

    // สถานะที่ยังยกเลิกได้จริง
    if (["รอดำเนินการ", "กำลังดำเนินการ", "อยู่ระหว่างซ่อม"].includes(data.status)) {
      if (!confirm("คุณต้องการยกเลิกใบแจ้งซ่อมนี้ใช่หรือไม่?")) return;

      // 2. สร้าง object ที่จะส่งไป API
const updateData = {
        id: currentEditingId,
        status: "ยกเลิก", // <--- ✨✨ แก้ไขเป็น "ยกเลิก" ✨✨
        priority: data.priority || "low"
      };

      try {
        // 4. ยิง API
        const response = await fetch('/api/requests/update-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) throw new Error('API Error');

        // 5. ถ้าสำเร็จ: ปิด Modal, ดึงข้อมูลใหม่, วาดตารางใหม่
        closeDetailModal();
        await fetchRequests();
        renderTableAndPagination();

      } catch (error) {
        console.error("Failed to cancel request:", error);
        alert("เกิดข้อผิดพลาดในการยกเลิก");
      }
    }
  };


   editBtn.onclick = () => {
    // ❗️ [แก้ไข] ❗️ เปลี่ยน "success" เป็น "สำเร็จ"
    if (data.status === "สำเร็จ") {
      // แสดงผลประเมินงานซ่อม (read-only)
      openFeedbackModal(data);
    // ❗️ [แก้ไข] ❗️ เปลี่ยน "pending", "inprogress" เป็นภาษาไทย
    } else if (["รอดำเนินการ", "กำลังดำเนินการ"].includes(data.status)) {
      // เข้าโหมดแก้ไขรายละเอียด
      isEditMode = true;
      applyEditModeUI();
      if (detailFooter) detailFooter.classList.add("confirm-mode");
    }
  };

if (confirmInspectionBtn) {
    confirmInspectionBtn.onclick = async () => { // <--- 1. เติม async
      // ตรวจสอบว่า ID ถูกต้อง และสถานะเป็น checking จริง
      if (!currentEditingId || data.status !== "กำลังตรวจสอบงานซ่อม") return;

      // 2. สร้าง object ที่จะส่งไป API
const updateData = {
        id: currentEditingId,
        status: "ซ่อมเสร็จ", // <--- 3. [แก้ไข] เปลี่ยนเป็นคำที่ history.js รู้จัก
        priority: data.priority || "low"
      };

      try {
        // 4. ยิง API
        const response = await fetch('/api/requests/update-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) throw new Error('API Error');

        // 5. ถ้าสำเร็จ: ปิด Modal, ดึงข้อมูลใหม่, วาดตารางใหม่
        closeDetailModal();
        await fetchRequests();
        renderTableAndPagination();

      } catch (error) {
        console.error("Failed to confirm inspection:", error);
        alert("เกิดข้อผิดพลาดในการยืนยันงาน");
      }
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
  const attachments = await loadAttachments(data.id);

      if (!attachments || attachments.length === 0) {
          console.log("No attachments");
      } else {
          renderAttachments(attachments);
      }
  setUrgencyOnMainBtn(data.priority);
  applyEditModeUI();

  // ถ้าเรียกมาให้เริ่มที่ edit mode (จากเมนู 3 จุด)
if (startInEdit && ["รอดำเนินการ", "กำลังดำเนินการ"].includes(data.status)) {
    isEditMode = true;
    applyEditModeUI();
    if (detailFooter) detailFooter.classList.add("confirm-mode");
  }
  overlay.classList.add("show");
  console.log("Request ID =", data.id);
  console.log("Attachment ID =", data.attachmentId);

   if (!attachments || attachments.length === 0) {
      console.log("No attachments");
  } else {
      renderAttachments(attachments);
      if (attachments.length > 0) {
          loadPreviewImage(data.id, attachments[0].id);
      }
  }
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
detailConfirmBtn.addEventListener("click", async () => { 
  if (!currentEditingId) return;

  // ❗️ 2. ต้องค้นหาจาก allRequests (ข้อมูลจริง)
  const req = allRequests.find((r) => r.id === currentEditingId); 
  if (!req) return;

  // 3. ดึงค่าใหม่จาก UI
  const newUrgency = statusMainText.textContent.trim().toLowerCase();
  
  // 4. สร้าง Logic สถานะ (เหมือนที่คุณทำไว้)
  let newStatus = req.status; 
  if (req.status === "รอดำเนินการ") {
    newStatus = "กำลังดำเนินการ"; 
  }

  // ❗️ 5. สร้าง object ที่จะส่งไป API (ส่งทั้ง status และ priority)
  const updateData = {
    id: currentEditingId,
    status: newStatus,     
    priority: newUrgency   // <--- ตัวนี้คือความเร่งด่วนที่เลือกใหม่
  };
  
  console.log("Sending update to API:", updateData); // สำหรับ Debug

  try {
    // ❗️ 6. ยิง Fetch API เพื่อบันทึก
    const response = await fetch('/api/requests/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) throw new Error('API Error');

    // 7. ถ้าสำเร็จ: ปิดโหมดแก้ไข, ดึงข้อมูลใหม่, วาดตารางใหม่
    isEditMode = false;
    if (detailFooter) detailFooter.classList.remove("confirm-mode");
    applyEditModeUI();
    
    await fetchRequests(); // ดึงข้อมูลล่าสุด
    renderTableAndPagination(); // วาดตารางใหม่

    // 8. อัปเดต UI ใน Modal ทันที
    const updatedReq = allRequests.find((r) => r.id === currentEditingId);
    if(updatedReq) {
      setUrgencyOnMainBtn(updatedReq.priority); // อัปเดตปุ่ม Urgency
      updateDetailStatusPill(updatedReq.status); // อัปเดตป้ายสถานะ
    }

  } catch (error) {
    console.error("Failed to update request:", error);
    alert("เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
  }
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
document.addEventListener("DOMContentLoaded", async () => {
	(async () => {
	      try {
	          const resp = await fetch('/api/users/current');
	          if (resp.ok) {
	              const user = await resp.json();
	              
	              const nameEl = document.getElementById('currentUserName'); 
	              if (nameEl && user && user.fullName) {
	                  nameEl.textContent = user.fullName;
	              }
	              
	              const emailEl = document.getElementById('currentUserEmail'); 
	              if (emailEl && user && user.email) {
	                  emailEl.textContent = user.email;
	              }

	          } else if (resp.status === 401 || resp.status === 403) {
	              alert('เซสชั่นหมดอายุ กรุณาเข้าสู่ระบบใหม่');
	              window.location.href = 'login.html?session_expired=true';
	          } else {
	              console.warn('ไม่สามารถตรวจสอบผู้ใช้ปัจจุบันได้:', resp.status);
	          }
	      } catch (err) {
	          console.error('เกิดข้อผิดพลาดระหว่างตรวจสอบผู้ใช้:', err);
	      }
	  })();

	  const logoutBtn = document.getElementById('logoutBtn');
	  if (logoutBtn) {
	      logoutBtn.addEventListener('click', async (e) => {
	          e.preventDefault();
	          try {
	              const response = await fetch('/api/logout', { method: 'POST' });
	              
	              if (response.ok || response.status === 401 || response.status === 403) {
	                  window.location.href = 'login.html?logout=true';
	              } else {
	                  alert('ไม่สามารถออกจากระบบได้: ' + response.status);
	              }
	          } catch (err) {
	              console.error('Logout error:', err);
	              window.location.href = 'login.html?logout_error=true';
	          }
	      });
	  }
	
  // ทำให้เป็น async
  // 1. สั่งดึงข้อมูลจาก API และรอจนกว่าจะเสร็จ
  await fetchRequests();

  // 2. เมื่อได้ข้อมูลแล้ว ค่อยสั่งให้ render ตาราง
  renderTableAndPagination();
});