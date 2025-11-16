/* ===== history.js (3-status, feedback only on "ยังไม่ได้คะแนน") ===== */
/* eslint-disable no-console */
window.addEventListener("pageshow", (e) => { if (e.persisted) location.reload(); });

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Config ---------- */
  const PAGE_SIZE = 8;
  const USE_MOCK = false; // set false when wiring real APIs

  /* ---------- Header ---------- */
  const logoutBtn = document.getElementById("logoutBtn");
  const nameEl = document.getElementById("currentUserName");
  const emailEl = document.getElementById("currentUserEmail");

  /* ---------- Toolbar / Table ---------- */
  const tbody = document.getElementById("historyTbody");
  const emptyState = document.getElementById("emptyState");
  const pageNumbers = document.getElementById("pageNumbers");
  const nextPageBtn = document.getElementById("nextPageBtn");
  const backToTrack = document.getElementById("backToTrack");
  const searchInput = document.getElementById("searchInput");
  const filterBtn = document.getElementById("filterBtn");
  const filterPanel = document.getElementById("filterPanel");

  /* ---------- Detail Modal ---------- */
  const detailModal = document.getElementById("detailModal");
  const dmTitle = document.getElementById("dm-title");
  const dmStatus = document.getElementById("dm-status");
  const dmCreated = document.getElementById("dm-created");
  const dmReporter = document.getElementById("dm-reporter");
  const dmAssignee = document.getElementById("dm-assignee");
  const dmLocation = document.getElementById("dm-location");
  const dmCategory = document.getElementById("dm-category");
  const dmDesc = document.getElementById("dm-desc");
  const dmImage = document.getElementById("dm-image");
  const dmImgPh = document.getElementById("dm-imgPh");
  const dmCloseBtn = document.getElementById("dm-closeBtn");
  const dmReportBtn = document.getElementById("dm-reportBtn");

  /* ---------- Report Modal ---------- */
  const reportModal = document.getElementById("reportModal");
  const rmTitle = document.getElementById("rm-title");
  const rmStatus = document.getElementById("rm-status");
  const rmDate = document.getElementById("rm-date");
  const rmCategory = document.getElementById("rm-category");
  const rmLocation = document.getElementById("rm-location");
  const rmReporter = document.getElementById("rm-reporter");
  const rmAssignee = document.getElementById("rm-assignee");
  const rmText = document.getElementById("rm-text"); // kept for backward compatibility (not used now)
  const rmImage = document.getElementById("rm-image");
  const rmImgPh = document.getElementById("rm-imgPh");
  const rmCloseBtn = document.getElementById("rm-closeBtn");
  const rmFeedbackBtn = document.getElementById("rm-feedbackBtn");

  // NEW: 4 text areas (สาเหตุ/วิธี/ชิ้นส่วน/ค่าใช้จ่าย)
  const rmCause = document.getElementById("rm-cause");
  const rmMethod = document.getElementById("rm-method");
  const rmParts = document.getElementById("rm-parts");
  const rmCost  = document.getElementById("rm-cost");

  /* ---------- Feedback Modal ---------- */
  const feedbackModal = document.getElementById("feedbackModal");
  const fbStarsWrap = document.getElementById("fb-stars");
  const fbText = document.getElementById("fb-text");
  const fbCount = document.getElementById("fb-count");
  const fbHint = document.getElementById("fb-hint");
  const fbSubmit = document.getElementById("fb-submit");
  const fbCancel = document.getElementById("fb-cancel");

  /* ---------- State ---------- */
  let rawItems = [];
  let viewItems = [];
  let currentPage = 1;
  let __feedbackScore__ = 0;
  let __feedbackItem__ = null;

  /* ---------- Mock ---------- */
  const MOCK_USER = { fullName: "Burapa Jindalert", email: "6709650441@tu.ac.th" };
  const MOCK_ITEMS = [
    {
      id:"R-250111-001", title:"ลิฟต์เสีย", reporter:{fullName:"สหรัฐ"}, assignee:{fullName:"ช่างปวิธี"},
      createdAt:"2025-11-01T08:12:00+07:00", closedAt:"2025-11-05T16:40:00+07:00", status:"ยังไม่ได้คะแนน",
      location:"อาคารกิจกรรมนักศึกษา", category:"อื่นๆ", description:"ลิฟต์ใช้งานไม่ได้บริเวณชั้น A",
      imageUrl:"",
      reportDate:"2025-11-05T16:30:00+07:00",
      reportText:"",
      reportImageUrl:"",
      // NEW: 4 blocks
      reportCause:"สวิตช์เซนเซอร์ประตูเสื่อม ทำให้ระบบป้องกันประตูทำงานผิดพลาดและลิฟต์หยุด",
      reportMethod:"ทำความสะอาด/ปรับตั้งเซนเซอร์ รีเซ็ตตู้ควบคุม ทดสอบเปิด-ปิด 10 รอบ",
      reportParts:"เซนเซอร์ประตู 1 ชุด + สายสัญญาณ",
      reportCost:"ค่าอะไหล่ 800 บาท + ค่าแรง 350 บาท = รวม 1,150 บาท"
    },
    {
      id:"R-250111-002", title:"ต้นไม้ขวาง", reporter:{fullName:"สหรัฐ"}, assignee:{fullName:"ช่างจุลชาติ"},
      createdAt:"2025-11-04T10:05:00+07:00", closedAt:"2025-11-04T18:25:00+07:00", status:"สำเร็จ",
      location:"หน้าอาคาร SC", category:"ทั่วไป", description:"กิ่งไม้ล้มกีดขวางทางเข้า",
      imageUrl:"", reportDate:"2025-11-04T18:00:00+07:00", reportText:"ตัดแต่งกิ่งและย้ายออกจากทางเข้า เรียบร้อย", reportImageUrl:"",
      reportCause:"พายุลมแรงทำให้กิ่งไม้หัก",
      reportMethod:"ตัดแต่งกิ่งและเก็บเศษกิ่งออกจากพื้นที่",
      reportParts:"-",
      reportCost:"ไม่มีค่าใช้จ่าย"
    },
    {
      id:"R-250110-003", title:"ไฟทางเดินชั้น 2 ไม่ติด (SC3)", reporter:{fullName:"ปรเมศวร์"}, assignee:{fullName:"ช่างอรทัย"},
      createdAt:"2025-11-03T09:00:00+07:00", closedAt:"2025-11-06T14:10:00+07:00", status:"เสร็จสิ้น",
      location:"SC3 ชั้น 2", category:"ไฟฟ้า", description:"หลอดไฟแถวกลางดับ 4 จุด",
      imageUrl:"", reportDate:"2025-11-06T14:05:00+07:00", reportText:"เปลี่ยนหลอด LED 18W จำนวน 4 ดวง ทดสอบสว่างปกติ", reportImageUrl:"",
      reportCause:"อายุการใช้งานหลอดหมด",
      reportMethod:"เปลี่ยนหลอด LED 18W ใหม่ 4 ดวง",
      reportParts:"LED 18W x4",
      reportCost:"ค่าอะไหล่ 720 บาท"
    },
    {
      id:"R-250109-004", title:"น้ำรั่วห้องน้ำชาย", reporter:{fullName:"มยุรี"}, assignee:{fullName:"ช่างจุลชาติ"},
      createdAt:"2025-11-05T11:35:00+07:00", closedAt:null, status:"ยกเลิก",
      location:"SC-105", category:"ประปา", description:"ท่อน้ำล้นใต้อ่าง",
      imageUrl:"", reportDate:"", reportText:"", reportImageUrl:"",
      reportCause:"-", reportMethod:"-", reportParts:"-", reportCost:"-"
    }
  ];

  /* ---------- Status normalization (ONLY 3 labels) ---------- */
const SUCCESS_WORDS = ["สำเร็จ", "เสร็จสิ้น", "completed", "complete", "done"];
const CANCEL_WORDS  = ["ยกเลิก", "cancelled", "canceled", "cancel", "rejected"];

// 2. เพิ่ม "ซ่อมเสร็จ" เข้ามาในกลุ่ม NORATE เพื่อให้ระบบรู้ว่าต้องรอประเมิน
const NORATE_WORDS  = ["ยังไม่ได้คะแนน", "ยังไม่ให้คะแนน", "not rated", "no rating", "ซ่อมเสร็จ", "รอประเมิน"];
function normalizeStatus(raw) {
  const t = String(raw || "").trim().toLowerCase();
  if (NORATE_WORDS.some(w => t.includes(w))) return "ยังไม่ได้ให้คะแนน";
  if (CANCEL_WORDS.some(w => t.includes(w))) return "ยกเลิก";
  if (SUCCESS_WORDS.some(w => t.includes(w))) return "สำเร็จ";
  return null; 
}

function pillClassByNormalized(s) {
  if (s === "ยังไม่ได้ให้คะแนน") return "pill warn";
  if (s === "สำเร็จ") return "pill success";
  if (s === "ยกเลิก") return "pill gray";
  return "pill gray";
}

  const kebabBtnHTML = (id) => `<button class="kebab" data-id="${id}" title="เพิ่มเติม" aria-label="เพิ่มเติม">⋯</button>`;

  /* ---------- Header actions ---------- */
  if (USE_MOCK) {
    nameEl && (nameEl.textContent = MOCK_USER.fullName);
    emailEl && (emailEl.textContent = MOCK_USER.email);
  } else {
    (async () => {
      try {
        const r = await fetch("/api/users/current");
        if (r.ok) {
          const u = await r.json();
          nameEl && (nameEl.textContent = u?.fullName || "");
          emailEl && (emailEl.textContent = u?.email || "");
        }
      } catch {}
    })();
  }
  logoutBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/logout", { method: "POST" });
      if (res.ok || res.status === 401 || res.status === 403) location.href = "login.html?logout=true";
      else alert("ไม่สามารถออกจากระบบได้: " + res.status);
    } catch { location.href = "login.html?logout_error=true"; }
  });

  /* ---------- Toolbar ---------- */
  backToTrack?.addEventListener("click", () =>   {
      const total = Math.ceil(viewItems.length / PAGE_SIZE);
      if (currentPage > total) { currentPage--; render(); }
    });
  filterBtn?.addEventListener("click", () => filterPanel.classList.toggle("hidden"));
  document.addEventListener("click", (e) => {
    if (filterPanel && !filterPanel.contains(e.target) && !filterBtn?.contains(e.target)) filterPanel.classList.add("hidden");
  });
  filterPanel?.addEventListener("change", () => { applySort(); render(); });

  let searchTimer = null;
  searchInput?.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { applySearch(); render(1); }, 120);
  });

  nextPageBtn?.addEventListener("click", () => {
    const total = Math.ceil(viewItems.length / PAGE_SIZE);
    if (currentPage < total) { currentPage++; render(); }
  });

  /* ---------- Utils ---------- */
  const fmtDate = (v) => {
    if (!v) return "DD/MM/YYYY";
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? "DD/MM/YYYY" : d.toLocaleDateString("th-TH");
  };
  const truncate = (v, len = 40) => (!v ? "—" : (String(v).length <= len ? v : String(v).slice(0, len) + "..."));

  /* ---------- Search / Sort / Render ---------- */
  function applySort() {
    const sortBy = (document.querySelector('input[name="sortBy"]:checked')?.value) || "createdAt";
    viewItems.sort((a, b) => {
		const va = a?.[sortBy] ? new Date(a[sortBy]).getTime() : (sortBy === 'closedAt' ? new Date(a.createdAt).getTime() : 0);
		const vb = b?.[sortBy] ? new Date(b[sortBy]).getTime() : (sortBy === 'closedAt' ? new Date(b.createdAt).getTime() : 0);
    });
  }

  function applySearch() {
    const q = (searchInput?.value || "").trim().toLowerCase();
    if (!q) { viewItems = [...rawItems]; applySort(); return; }
    viewItems = rawItems.filter((r) => {
      const fields = [
        (r.title || "").toLowerCase(),
        (r.reporter?.fullName || "").toLowerCase(),
        (r.assignee?.fullName || "").toLowerCase(),
        (r.location || "").toLowerCase()
      ];
      return fields.some((s) => s.includes(q));
    });
    applySort();
  }

  function render(page) {
    if (page) currentPage = page;
    const totalPages = Math.max(1, Math.ceil(viewItems.length / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = totalPages;

    tbody.innerHTML = "";
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageData = viewItems.slice(start, start + PAGE_SIZE);

    pageData.forEach((r) => {
      const tr = document.createElement("tr");
      tr.setAttribute("data-id", r.id);
      tr.tabIndex = 0;
      tr.innerHTML = `
        <td>${truncate(r.title) || "-"}</td>
        <td>${fmtDate(r.createdAt)}</td>
        <td>${r.reporter?.fullName || "-"}</td>
        <td>${r.assignee?.fullName || "-"}</td>
        <td>${fmtDate(r.updatedAt)}</td>
        <td class="td-status">
          <span class="${pillClassByNormalized(r._normalizedStatus)}">${r._normalizedStatus}</span>
        </td>
        <td class="td-actions">${kebabBtnHTML(r.id)}</td>
      `;
      tbody.appendChild(tr);
    });

    emptyState?.classList.toggle("hidden", pageData.length > 0);

    pageNumbers.innerHTML = "";
    for (let p = 1; p <= totalPages; p++) {
      const btn = document.createElement("button");
      btn.className = "page-chip" + (p === currentPage ? " active" : "");
      btn.textContent = String(p).padStart(2, "0");
      btn.addEventListener("click", () => render(p));
      pageNumbers.appendChild(btn);
    }
  }

  /* ---------- Detail Modal ---------- */
  function openDetail(item) {
    dmTitle.textContent = item.title || "-";
    dmStatus.className = pillClassByNormalized(item._normalizedStatus);
    dmStatus.textContent = item._normalizedStatus || "-";

    dmCreated.value = item.createdAt ? new Date(item.createdAt).toLocaleDateString("th-TH") : "DD/MM/YYYY";
    dmReporter.textContent = item.reporter?.fullName || "-";
    dmAssignee.textContent = item.assignee?.fullName || "-";
    dmLocation.textContent = item.location || "-";
    dmCategory.textContent = item.category || "-";
    dmDesc.value = item.description || "";

    if (item.imageUrl) {
      dmImage.src = item.imageUrl; dmImage.style.display = "block"; dmImgPh.style.display = "none";
    } else {
      dmImage.removeAttribute("src"); dmImage.style.display = "none"; dmImgPh.style.display = "flex";
    }

    dmReportBtn.onclick = () => openReport(item);
    dmCloseBtn.onclick = () => detailModal.classList.add("hidden");
    detailModal.classList.remove("hidden");
  }
  detailModal?.addEventListener("click", (e) => { if (e.target === detailModal) detailModal.classList.add("hidden"); });

  /* ---------- Report Modal (UPDATED to fill 4 blocks) ---------- */
  function openReport(item) {
    rmTitle.textContent = item.title || "-";
    rmStatus.className = pillClassByNormalized(item._normalizedStatus);
    rmStatus.textContent = item._normalizedStatus || "-";

    const pickDate = (v) => (!v ? "DD/MM/YYYY" : (isNaN(new Date(v)) ? "DD/MM/YYYY" : new Date(v).toLocaleDateString("th-TH")));
    rmDate.value = pickDate(item.reportDate || item.closedAt || item.createdAt);
    rmCategory.textContent = item.category || "-";
    rmLocation.textContent = item.location || "-";
    rmReporter.textContent = item.reporter?.fullName || "-";
    rmAssignee.textContent = item.assignee?.fullName || "-";

    // Fill 4 text areas
    if (rmCause)  rmCause.value  = item.reportCause  || item.description || "";
    if (rmMethod) rmMethod.value = item.reportMethod || "";
    if (rmParts)  rmParts.value  = item.reportParts  || "";
    if (rmCost)   rmCost.value   = item.reportCost   || "";

    if (item.reportImageUrl) {
      rmImage.src = item.reportImageUrl; rmImage.style.display = "block"; rmImgPh.style.display = "none";
    } else {
      rmImage.removeAttribute("src"); rmImage.style.display = "none"; rmImgPh.style.display = "flex";
    }

    // Feedback only if "ยังไม่ได้คะแนน"
if (item._normalizedStatus === "ยังไม่ได้ให้คะแนน") {
      rmFeedbackBtn?.classList.remove("hidden");
      rmFeedbackBtn.onclick = () => openFeedback(item);
    } else {
      rmFeedbackBtn?.classList.add("hidden");
      rmFeedbackBtn.onclick = null;
    }
    reportModal.classList.remove("hidden");
}
  rmCloseBtn?.addEventListener("click", () => reportModal.classList.add("hidden"));
  reportModal?.addEventListener("click", (e) => { if (e.target === reportModal) reportModal.classList.add("hidden"); });

  /* ---------- Floating Kebab Menu ---------- */
  const kebabMenuEl = document.createElement("div");
  kebabMenuEl.className = "more-menu hidden";
  kebabMenuEl.innerHTML = `
    <button class="more-item js-more-detail">
      <span class="more-ic ic-search">🔍</span><span>รายละเอียด</span>
    </button>
    <button class="more-item js-more-rate">
      <span class="more-ic ic-star">⭐</span><span>ประเมินงานซ่อม</span>
    </button>
    <div style="height:1px;background:#eee;margin:4px 0;"></div>
    <button class="more-item js-more-report">
      <span class="more-ic ic-chat">💬</span><span>รายงานการซ่อม</span>
    </button>
  `;
  document.body.appendChild(kebabMenuEl);

  let __menuForId__ = null;

  function hideKebabMenu() {
    __menuForId__ = null;
    kebabMenuEl.classList.add("hidden");
  }

  function showKebabMenuFor(btn, item) {
    __menuForId__ = item.id;
    const rect = btn.getBoundingClientRect();
    const menuWidth = 220;
    const margin = 8;

    const top = window.scrollY + rect.bottom + 6;
    let left = window.scrollX + rect.right - menuWidth;

    // clamp inside viewport
    const maxLeft = window.scrollX + window.innerWidth - menuWidth - margin;
    left = Math.max(margin, Math.min(left, maxLeft));

    kebabMenuEl.style.top = `${top}px`;
    kebabMenuEl.style.left = `${left}px`;
    kebabMenuEl.classList.remove("hidden");

    // Show "ประเมินงานซ่อม" ONLY if ยังไม่ได้คะแนน
    const rateBtn = kebabMenuEl.querySelector(".js-more-rate");
    rateBtn.style.display = item._normalizedStatus === "ยังไม่ได้ให้คะแนน" ? "flex" : "none";
  }

  kebabMenuEl.querySelector(".js-more-detail").addEventListener("click", () => {
    if (!__menuForId__) return;
    const item = rawItems.find(x => String(x.id) === String(__menuForId__));
    hideKebabMenu(); if (item) openDetail(item);
  });
kebabMenuEl.querySelector(".js-more-rate").addEventListener("click", () => {
    if (!__menuForId__) return;
    const item = rawItems.find(x => String(x.id) === String(__menuForId__));
    hideKebabMenu(); 
    if (item && item._normalizedStatus === "ยังไม่ได้ให้คะแนน") openFeedback(item);
});
  kebabMenuEl.querySelector(".js-more-report").addEventListener("click", () => {
    if (!__menuForId__) return;
    const item = rawItems.find(x => String(x.id) === String(__menuForId__));
    hideKebabMenu(); if (item) openReport(item);
  });

  document.addEventListener("click", (e) => {
    if (!kebabMenuEl.classList.contains("hidden")) {
      if (!kebabMenuEl.contains(e.target) && !e.target.closest(".kebab")) hideKebabMenu();
    }
  });
  window.addEventListener("scroll", hideKebabMenu, { passive: true });
  window.addEventListener("resize", hideKebabMenu);

  /* ---------- Row interactions ---------- */
  tbody.addEventListener("click", (e) => {
    const kebabBtn = e.target.closest(".kebab");
    if (kebabBtn) {
      const row = kebabBtn.closest("tr"); if (!row) return;
      const id = row.getAttribute("data-id");
      const item = rawItems.find(x => String(x.id) === String(id));
      if (!item) return;
      showKebabMenuFor(kebabBtn, item);
      return;
    }
    const row = e.target.closest("tr");
    if (!row) return;
    const id = row.getAttribute("data-id");
    const item = rawItems.find((x) => String(x.id) === String(id));
    if (item) openDetail(item);
  });

  tbody.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const row = e.target.closest("tr"); if (!row) return;
    const id = row.getAttribute("data-id");
    const item = rawItems.find((x) => String(x.id) === String(id));
    if (item) openDetail(item);
  });

  /* ---------- Feedback ---------- */
  function paintStars(score) {
    const buttons = fbStarsWrap?.querySelectorAll(".star-btn") || [];
    buttons.forEach((btn) => {
      const val = Number(btn.getAttribute("data-value") || 0);
      if (val <= score) btn.classList.add("is-filled");
      else btn.classList.remove("is-filled");
      btn.setAttribute("aria-checked", val === score ? "true" : "false");
    });
  }

  function openFeedback(item) {
    __feedbackItem__ = item;
    __feedbackScore__ = 0;
    if (fbText) fbText.value = "";
    if (fbCount) fbCount.textContent = "0";
    if (fbHint) fbHint.textContent = "ยังไม่ได้เลือกคะแนน";
    paintStars(0);
    feedbackModal?.classList.remove("hidden");
  }
  function closeFeedback() { feedbackModal?.classList.add("hidden"); }

  fbStarsWrap?.addEventListener("click", (e) => {
    const btn = e.target.closest(".star-btn"); if (!btn) return;
    __feedbackScore__ = Number(btn.getAttribute("data-value") || 0);
    paintStars(__feedbackScore__);
    fbHint.textContent = __feedbackScore__ ? `ให้คะแนน ${__feedbackScore__} ดาว` : "ยังไม่ได้เลือกคะแนน";
  });

  fbText?.addEventListener("input", () => { fbCount && (fbCount.textContent = String(fbText.value.length)); });

fbSubmit?.addEventListener("click", async () => {
    if (!__feedbackItem__) return;
    if (!__feedbackScore__) {
      alert("กรุณาให้คะแนนเป็นจำนวนดาวก่อนส่ง");
      return;
    }
    const payload = {
      reportId: __feedbackItem__.id,
      rating: __feedbackScore__,
      message: (fbText?.value || "").trim()
    };
    try {
      if (USE_MOCK) {
        console.log("[MOCK] POST /api/feedback", payload);
        alert("ขอบคุณสำหรับความคิดเห็นของคุณ!");
        closeFeedback();
        reportModal?.classList.add("hidden");
        
        // (ส่วนนี้สำหรับ MOCK ถูกต้องแล้ว)
        const itemToUpdate = rawItems.find(x => x.id === __feedbackItem__.id);
        if (itemToUpdate) {
          itemToUpdate.status = "สำเร็จ";
          itemToUpdate._normalizedStatus = normalizeStatus("สำเร็จ");
        }
        applySearch(); 
        render(); // Re-render current page
        
        return; 
      }
  
      // ===== API LOGIC =====
      const res = await fetch("/api/feedback", {
        method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("ส่งข้อมูลไม่สำเร็จ");
      
      alert("ขอบคุณสำหรับความคิดเห็นของคุณ!");
      closeFeedback(); 
      reportModal?.classList.add("hidden");
  
      await loadData(); 
  
    } catch (err) {
      console.error(err); alert("เกิดข้อผิดพลาดในการส่งความคิดเห็น");
    }
  });

  fbCancel?.addEventListener("click", closeFeedback);
  feedbackModal?.addEventListener("click", (e) => { if (e.target === feedbackModal) closeFeedback(); });

 /* ---------- Load Data ---------- */
  async function loadData() {
    try {
      let list;
      if (USE_MOCK) {
        list = MOCK_ITEMS;
      } else {
        // 2. เพิ่ม { cache: "no-store" } เพื่อบังคับโหลดใหม่ ไม่ติดแคช
        const res = await fetch("/api/requests/user-reports", { cache: "no-store" });
        list = res.ok ? await res.json() : [];
      }

   rawItems = (Array.isArray(list) ? list : []).map((x) => {
	      const mapped = {
	          id: x.id || x._id,
	          title: x.title || "",
	          reporter: x.reporter || { fullName: x.requesterName || "" },
	          assignee: x.assignee || { fullName: x.technicianName || "" },
	          createdAt: x.createdAt || x.requestDate || x.submittedAt,
	          closedAt: x.closedAt || x.completedAt,
			  updatedAt: x.updatedAt || x.completedAt,
	          status: x.status || x.currentStatus || "",
	          location: x.location || x.locationDetail || "",
	          category: x.category || "",
	          description: x.description || x.problemDescription || "",
	          imageUrl: x.imageUrl || "",
	          reportDate: x.reportDate || x.completedAt || "",
	          reportText: x.reportText || "",
	          reportImageUrl: x.reportImageUrl || "",
	          reportCause: x.reportCause || "",
	          reportMethod: x.reportMethod || "",
	          reportParts: x.reportParts || "",
	          reportCost: x.reportCost || ""
	      };
        mapped._normalizedStatus = normalizeStatus(mapped.status);
	      return mapped;
	  }).filter(it => it._normalizedStatus !== null); 


      window.__HISTORY_DATA__ = rawItems;
      viewItems = [...rawItems];
      applySort();
      render(1); // สั่งให้ render หน้า 1 เสมอ
    } catch (err) {
      console.error("Load history fail:", err);
      rawItems = []; viewItems = []; render(1);
    }
  }

  // 3. สั่งให้ฟังก์ชันนี้ทำงานครั้งแรกเมื่อเปิดหน้า
  loadData();

});