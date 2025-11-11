// ===== history.js (fresh) =====
/* eslint-disable no-console */
window.addEventListener("pageshow", (e) => { if (e.persisted) window.location.reload(); });

document.addEventListener("DOMContentLoaded", () => {
  // ===== Config =====
  const PAGE_SIZE = 8;
  const USE_MOCK = false; // <- set to false when wiring real APIs

  // ===== Elements: Header =====
  const logoutBtn = document.getElementById("logoutBtn");
  const nameEl = document.getElementById("currentUserName");
  const emailEl = document.getElementById("currentUserEmail");

  // ===== Elements: Table / Toolbar =====
  const tbody = document.getElementById("historyTbody");
  const emptyState = document.getElementById("emptyState");
  const pageNumbers = document.getElementById("pageNumbers");
  const nextPageBtn = document.getElementById("nextPageBtn");
  const backToTrack = document.getElementById("backToTrack");
  const searchInput = document.getElementById("searchInput");
  const filterBtn = document.getElementById("filterBtn");
  const filterPanel = document.getElementById("filterPanel");

  // ===== Elements: Detail Modal =====
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

  // ===== Elements: Report Modal =====
  const reportModal = document.getElementById("reportModal");
  const rmTitle = document.getElementById("rm-title");
  const rmStatus = document.getElementById("rm-status");
  const rmDate = document.getElementById("rm-date");
  const rmCategory = document.getElementById("rm-category");
  const rmLocation = document.getElementById("rm-location");
  const rmReporter = document.getElementById("rm-reporter");
  const rmAssignee = document.getElementById("rm-assignee");
  const rmText = document.getElementById("rm-text");
  const rmImage = document.getElementById("rm-image");
  const rmImgPh = document.getElementById("rm-imgPh");
  const rmCloseBtn = document.getElementById("rm-closeBtn");
  const rmFeedbackBtn = document.getElementById("rm-feedbackBtn");

  // ===== Elements: Feedback Modal =====
  const feedbackModal = document.getElementById("feedbackModal");
  const fbStarsWrap = document.getElementById("fb-stars");
  const fbText = document.getElementById("fb-text");
  const fbCount = document.getElementById("fb-count");
  const fbHint = document.getElementById("fb-hint");
  const fbSubmit = document.getElementById("fb-submit");
  const fbCancel = document.getElementById("fb-cancel");

  // ===== State =====
  let rawItems = [];
  let viewItems = [];
  let currentPage = 1;
  let __feedbackScore__ = 0;
  let __feedbackItem__ = null;

  // ===== Mock Data =====
  const MOCK_ITEMS = [
    {
      id: "R-250101-001",
      title: "ลิฟต์เสีย",
      reporter: { fullName: "สหรัฐ" },
      assignee: { fullName: "ช่างปวิธี" },
      createdAt: "2025-11-01T08:12:00+07:00",
      closedAt: "2025-11-05T16:40:00+07:00",
      status: "สำเร็จ",
      location: "อาคารกิจกรรมนักศึกษา",
      category: "อื่นๆ",
      description: "ลิฟต์ใช้งานไม่ได้บริเวณชั้น A",
      imageUrl: "",
      reportDate: "2025-11-05T16:30:00+07:00",
      reportText: "ลิฟต์ดับรอบ ตึก A แก้ไขโดยรีเซ็ตตู้ควบคุมและเปลี่ยนฟิวส์หลัก ทดสอบการทำงาน 10 รอบ ปกติ",
      reportImageUrl: ""
    },
    {
      id: "R-250104-002",
      title: "ต้นไม้ขวาง",
      reporter: { fullName: "สหรัฐ" },
      assignee: { fullName: "ช่างจุลชาติ" },
      createdAt: "2025-11-04T10:05:00+07:00",
      closedAt: "2025-11-04T18:25:00+07:00",
      status: "สำเร็จ",
      location: "หน้าอาคาร SC",
      category: "ทั่วไป",
      description: "กิ่งไม้ล้มกีดขวางทางเข้า",
      imageUrl: "",
      reportDate: "2025-11-04T18:00:00+07:00",
      reportText: "ตัดแต่งกิ่งและย้ายออกจากทางเข้า เรียบร้อย",
      reportImageUrl: ""
    },
    {
      id: "R-250103-003",
      title: "ไฟทางเดินชั้น 2 ไม่ติด (SC3)",
      reporter: { fullName: "ปรเมศวร์" },
      assignee: { fullName: "ช่างอรทัย" },
      createdAt: "2025-11-03T09:00:00+07:00",
      closedAt: "2025-11-06T14:10:00+07:00",
      status: "สำเร็จ",
      location: "SC3 ชั้น 2",
      category: "ไฟฟ้า",
      description: "หลอดไฟแถวกลางดับ 4 จุด",
      imageUrl: "",
      reportDate: "2025-11-06T14:05:00+07:00",
      reportText: "เปลี่ยนหลอด LED 18W จำนวน 4 ดวง ทดสอบสว่างปกติ",
      reportImageUrl: ""
    },
    {
      id: "R-250105-004",
      title: "น้ำรั่วห้องน้ำชาย",
      reporter: { fullName: "มยุรี" },
      assignee: { fullName: "ช่างจุลชาติ" },
      createdAt: "2025-11-05T11:35:00+07:00",
      closedAt: null,
      status: "กำลังซ่อม",
      location: "SC-105",
      category: "ประปา",
      description: "ท่อน้ำล้นใต้อ่าง",
      imageUrl: "",
      reportDate: "",
      reportText: "",
      reportImageUrl: ""
    },
    {
      id: "R-250102-005",
      title: "แอร์ไม่เย็น ห้อง SC-204",
      reporter: { fullName: "พิสิษฐ์" },
      assignee: { fullName: "ช่างปวิธี" },
      createdAt: "2025-11-02T13:22:00+07:00",
      closedAt: null,
      status: "รออะไหล่",
      location: "SC-204",
      category: "ไฟฟ้า",
      description: "คอมเพรสเซอร์มีเสียงดัง",
      imageUrl: "",
      reportDate: "",
      reportText: "",
      reportImageUrl: ""
    }
  ];

  // ===== Utils =====
  const fmtDate = (v) => {
    if (!v) return "—";
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("th-TH");
  };

  const truncate = (v, len = 40) => { // 40 คือความยาวสูงสุด
    if (!v) return "—";
    const s = String(v);
    if (s.length <= len) return s;
    return s.substring(0, len) + "...";
  };

  const pillClassByStatus = (s) => {
    const t = String(s || "").toLowerCase();
    if (["สำเร็จ", "เสร็จสิ้น", "completed", "done"].includes(t)) return "pill success";
    if (["กำลังซ่อม", "กำลังตรวจสอบ"].includes(t)) return "pill info";
    if (["รออะไหล่", "รออนุมัติ", "รอดำเนินการ", "รับเรื่อง"].includes(t)) return "pill warn";
    return "pill gray";
  };

  const kebabMenu = (id) => `<button class="kebab" data-id="${id}" title="เพิ่มเติม" aria-label="เพิ่มเติม">⋯</button>`;

  // ===== Header actions =====
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        const res = await fetch("/api/logout", { method: "POST" });
        if (res.ok || res.status === 401 || res.status === 403) {
          window.location.href = "login.html?logout=true";
        } else {
          alert("ไม่สามารถออกจากระบบได้: " + res.status);
        }
      } catch {
        window.location.href = "login.html?logout_error=true";
      }
    });
  }

  (async () => {
    try {
      const r = await fetch("/api/users/current");
      if (r.ok) {
        const u = await r.json();
        if (nameEl) nameEl.textContent = u?.fullName || "";
        if (emailEl) emailEl.textContent = u?.email || "";
      }
    } catch {/* no-op */}
  })();

  // ===== Toolbar actions =====
  backToTrack?.addEventListener("click", () => (window.location.href = "track.html"));
  filterBtn?.addEventListener("click", () => filterPanel.classList.toggle("hidden"));
  document.addEventListener("click", (e) => {
    if (filterPanel && !filterPanel.contains(e.target) && !filterBtn?.contains(e.target)) {
      filterPanel.classList.add("hidden");
    }
  });
  filterPanel?.addEventListener("change", () => { applySort(); render(); });

  searchInput?.addEventListener("input", () => { applySearch(); render(1); });
  nextPageBtn?.addEventListener("click", () => {
    const total = Math.ceil(viewItems.length / PAGE_SIZE);
    if (currentPage < total) { currentPage++; render(); }
  });

  // ===== Search / Sort / Render =====
  function applySort() {
    const sortBy = (document.querySelector('input[name="sortBy"]:checked')?.value) || "createdAt";
    viewItems.sort((a, b) => {
      const va = a?.[sortBy] ? new Date(a[sortBy]).getTime() : 0;
      const vb = b?.[sortBy] ? new Date(b[sortBy]).getTime() : 0;
      return vb - va;
    });
  }

  function applySearch() {
    const q = (searchInput?.value || "").trim().toLowerCase();
    if (!q) { viewItems = [...rawItems]; applySort(); return; }
    viewItems = rawItems.filter((r) => {
      const pieces = [
        (r.title || "").toLowerCase(),
        (r.reporter?.fullName || "").toLowerCase(),
        (r.assignee?.fullName || "").toLowerCase(),
        (r.location || "").toLowerCase()
      ];
      return pieces.some((s) => s.includes(q));
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
      tr.innerHTML = `
        <td>${truncate(r.title) || "-"}</td>
        <td>${fmtDate(r.createdAt)}</td>
        <td>${r.reporter?.fullName || "-"}</td>
        <td>${r.assignee?.fullName || "-"}</td>
        <td>${fmtDate(r.closedAt)}</td>
        <td class="td-status"><span class="${pillClassByStatus(r.status)}">${r.status || "-"}</span></td>
        <td class="td-actions">${kebabMenu(r.id)}</td>
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

  // ===== Detail Modal =====
  function openDetail(item) {
    dmTitle.textContent = item.title || "-";
    dmStatus.className = pillClassByStatus(item.status);
    dmStatus.textContent = item.status || "-";

    const created = item.createdAt ? new Date(item.createdAt) : null;
    dmCreated.value = created && !Number.isNaN(created.getTime())
      ? created.toLocaleDateString("th-TH")
      : "DD/MM/YYYY";

    dmReporter.textContent = item.reporter?.fullName || "-";
    dmAssignee.textContent = item.assignee?.fullName || "-";
    dmLocation.textContent = item.location || "-";
    dmCategory.textContent = item.category || "-";
    dmDesc.value = item.description || "";

    if (item.imageUrl) {
      dmImage.src = item.imageUrl;
      dmImage.style.display = "block";
      dmImgPh.style.display = "none";
    } else {
      dmImage.removeAttribute("src");
      dmImage.style.display = "none";
      dmImgPh.style.display = "flex";
    }

    dmReportBtn.onclick = () => openReport(item);
    dmCloseBtn.onclick = () => detailModal.classList.add("hidden");
    detailModal.classList.remove("hidden");
  }

  detailModal?.addEventListener("click", (e) => {
    if (e.target === detailModal) detailModal.classList.add("hidden");
  });

  // ===== Report Modal =====
  function openReport(item) {
    rmTitle.textContent = item.title || "-";
    rmStatus.className = pillClassByStatus(item.status);
    rmStatus.textContent = item.status || "-";

    const pickDate = (v) => {
      if (!v) return "DD/MM/YYYY";
      const d = new Date(v);
      return Number.isNaN(d.getTime()) ? "DD/MM/YYYY" : d.toLocaleDateString("th-TH");
    };

    rmDate.value = pickDate(item.reportDate || item.closedAt || item.createdAt);
    rmCategory.textContent = item.category || "-";
    rmLocation.textContent = item.location || "-";
    rmReporter.textContent = item.reporter?.fullName || "-";
    rmAssignee.textContent = item.assignee?.fullName || "-";
    rmText.value = item.reportText || item.description || "";

    if (item.reportImageUrl) {
      rmImage.src = item.reportImageUrl;
      rmImage.style.display = "block";
      rmImgPh.style.display = "none";
    } else {
      rmImage.removeAttribute("src");
      rmImage.style.display = "none";
      rmImgPh.style.display = "flex";
    }

    const lower = (item.status || "").toLowerCase();
    const isSuccess = ["สำเร็จ", "เสร็จสิ้น", "completed", "done"].includes(lower);
    if (isSuccess) {
      rmFeedbackBtn?.classList.remove("hidden");
      rmFeedbackBtn.onclick = () => openFeedback(item);
    } else {
      rmFeedbackBtn?.classList.add("hidden");
      rmFeedbackBtn.onclick = null;
    }

    reportModal.classList.remove("hidden");
  }

  rmCloseBtn?.addEventListener("click", () => reportModal.classList.add("hidden"));
  reportModal?.addEventListener("click", (e) => {
    if (e.target === reportModal) reportModal.classList.add("hidden");
  });

  // ===== Row click (kebab -> detail) =====
  tbody.addEventListener("click", (e) => {
    const btn = e.target.closest(".kebab");
    if (!btn) return;
    const id = btn.getAttribute("data-id");
    const item = rawItems.find((x) => String(x.id) === String(id));
    if (item) openDetail(item);
  });

  // ===== Feedback Modal =====
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

  function closeFeedback() {
    feedbackModal?.classList.add("hidden");
  }

  fbStarsWrap?.addEventListener("click", (e) => {
    const btn = e.target.closest(".star-btn");
    if (!btn) return;
    __feedbackScore__ = Number(btn.getAttribute("data-value") || 0);
    paintStars(__feedbackScore__);
    if (fbHint) fbHint.textContent = __feedbackScore__
      ? `ให้คะแนน ${__feedbackScore__} ดาว`
      : "ยังไม่ได้เลือกคะแนน";
  });

  fbText?.addEventListener("input", () => {
    if (fbCount) fbCount.textContent = String(fbText.value.length);
  });

  fbSubmit?.addEventListener("click", async () => {
    if (!__feedbackItem__) return;
    if (!__feedbackScore__) {
      alert("กรุณาให้คะแนนเป็นจำนวนดาวก่อนส่ง");
      return;
    }
    const payload = {
      requestId: __feedbackItem__.id,
      rating: __feedbackScore__,
      comment: (fbText?.value || "").trim()
    };
    try {
      if (USE_MOCK) {
        console.log("[MOCK] POST /api/feedback", payload);
        alert("ขอบคุณสำหรับความคิดเห็นของคุณ!");
        closeFeedback();
        reportModal?.classList.add("hidden");
        return;
      }
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("ส่งข้อมูลไม่สำเร็จ");
      alert("ขอบคุณสำหรับความคิดเห็นของคุณ!");
      closeFeedback();
      reportModal?.classList.add("hidden");
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการส่งความคิดเห็น");
    }
  });

  fbCancel?.addEventListener("click", closeFeedback);
  feedbackModal?.addEventListener("click", (e) => {
    if (e.target === feedbackModal) closeFeedback();
  });

  // ===== Load Data =====
  (async () => {
    try {
      if (USE_MOCK) {
        rawItems = MOCK_ITEMS;
      } else {
        let list = [];
        let res = await fetch("/api/requests/history");
        if (!res.ok) res = await fetch("/api/requests");
        if (res.ok) list = await res.json();
        rawItems = (Array.isArray(list) ? list : []).map((x) => ({
          id: x.id || x._id,
          title: x.title || "",
          reporter: x.reporter || { fullName: x.requesterName || "" },
          assignee: x.assignee || { fullName: x.technicianName || "" },
          createdAt: x.createdAt || x.requestDate || x.submittedAt,
          closedAt: x.closedAt || x.completedAt,
          status: x.status || x.currentStatus || "",
          location: x.location || x.locationDetail || "",
          category: x.category || "",
          description: x.description || x.problemDescription || "",
          imageUrl: x.imageUrl || "",
          reportDate: x.reportDate || x.completedAt || "",
          reportText: x.reportText || "",
          reportImageUrl: x.reportImageUrl || ""
        }));
     // กรองข้อมูลดิบ (rawItems) ให้เหลือเฉพาะสถานะ "สำเร็จ"
      rawItems = rawItems.filter((item) => {
        const status = String(item.status || "").trim();
        return status === "สำเร็จ";
      });
      window.__HISTORY_DATA__ = rawItems; // rawItems จะมีเฉพาะรายการที่สำเร็จ
      viewItems = [...rawItems];
      applySort();
      render(1);
    } catch (err) {
      console.error("Load history fail:", err);
      rawItems = [];
      viewItems = [];
      render(1);
    }
  })();
});
