// RepairList.js (full, cleaned)
// ------------------------------------------------
const byId = (id) => document.getElementById(id);

// ----- Global state -----
let allItems = [];
let filteredItems = [];
let currentPage = 1;
const PAGE_SIZE = 10;
let currentJobId = null;
let cameFromModal = null;

// ----- Helper: statuses that technician page should see -----
const VISIBLE_STATUSES = [
  "กำลังดำเนินการ",
  "กำลังซ่อม",
  "อยู่ระหว่างซ่อม",
  "อยู่ระหว่างการซ่อม"
];

// ----- Fetch list from backend -----
async function loadRepairList() {
  try {
    const res = await fetch("/api/requests", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include"
    });

    if (!res.ok) throw new Error("HTTP status " + res.status);

    const data = await res.json();

    // store
    allItems = Array.isArray(data) ? data : [];

    // initial filtered view for technician (only visible statuses)
    filteredItems = allItems.filter(it => VISIBLE_STATUSES.includes(it.status));

    currentPage = 1;
    renderTable();
  } catch (err) {
    console.error("Error fetching repair list:", err);

    // fallback: if there's a global mockRepairData, use it; otherwise empty
    if (window.mockRepairData && Array.isArray(window.mockRepairData)) {
      console.warn("Using mockRepairData as fallback");
      allItems = window.mockRepairData;
      filteredItems = allItems.filter(it => VISIBLE_STATUSES.includes(it.status));
      currentPage = 1;
      renderTable();
    } else {
      alert("ไม่สามารถโหลดข้อมูลรายการซ่อมได้");
      // show empty table
      filteredItems = [];
      renderTable();
    }
  }
}

// ----- Utility / UI helpers -----
function formatDate(dateStr) {
  try {
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return dateStr || '-';
  }
}

function getPriorityClass(priority) {
  switch ((priority || '').toLowerCase()) {
    case 'high': return 'priority-high';
    case 'medium'||'ปกติ': return 'priority-medium';
    case 'low'||'ปกติ': return 'priority-low';
    default: return '';
  }
}

function getStatusClass(status) {
  if (!status) return 'status-pending';
  if (status.includes('ดำเนินการ')) return 'status-processing';
  if (status.includes('ตรวจสอบ')) return 'status-checking';
  if (status.includes('รอดำเนินการ')) return 'status-pending';
  return 'status-pending';
}

function priorityBadge(p) {
  const cls = getPriorityClass(p);
  return `<span class="priority-badge ${cls}">${p || '-'}</span>`;
}

function statusBadge(s) {
  const cls = getStatusClass(s);
  return `<span class="status-badge ${cls}">${s || '-'}</span>`;
}

function showModal(modal, overlay) {
  if (!modal || !overlay) return;
  overlay.classList.add('show');
  modal.classList.add('show');
}

function hideModal(modal, overlay) {
  if (!modal || !overlay) return;
  overlay.classList.remove('show');
  modal.classList.remove('show');
}

// ----- Update status API call (for technician actions) -----
async function updateStatusFromTechnician(id, newStatus) {
  if (!id) return;
  try {
    const res = await fetch(`/api/requests/${id}/update-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        status: newStatus,
        technician: "self",
        priority: null
      })
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => 'no details');
      console.error("อัปเดตสถานะไม่สำเร็จ:", res.status, txt);
      return false;
    }
    return true;
  } catch (err) {
    console.error("เรียก API อัปเดตสถานะไม่ได้:", err);
    return false;
  }
}

// ----- Rendering table & pagination -----
function renderTable() {
  const tbody = byId('listTbody');
  const paginationEl = byId('listPagination');
  if (!tbody) return;

  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filteredItems.slice(start, start + PAGE_SIZE);

  if (pageItems.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 20px;">ไม่พบรายการซ่อม</td></tr>`;
    renderPagination();
    return;
  }

  tbody.innerHTML = pageItems.map(item => {
    const priorityClass = getPriorityClass(item.priority);
    const statusClass = getStatusClass(item.status);

    let menuItemsHtml = '';
    const status = item.status || '';

    if (status === 'กำลังดำเนินการ') {
      menuItemsHtml = `
        <button class="menu-item" data-action="accept-job" data-id="${item.id}">
          <span class="mi-text">รับงานซ่อม</span>
        </button>`;
    } else if (status === 'อยู่ระหว่างซ่อม' || status === 'อยู่ระหว่างการซ่อม' || status === 'กำลังซ่อม') {
      menuItemsHtml = `
        <button class="menu-item" data-action="submit-report" data-id="${item.id}">
          <span class="mi-text">ส่งรายงานซ่อม</span>
        </button>`;
    } else {
      menuItemsHtml = `
        <button class="menu-item" data-action="detail" data-id="${item.id}">
          <span class="mi-text">รายละเอียด</span>
        </button>`;
    }

    return `
		<tr data-id="${item.id}">
	    <td>${item.title || '-'}</td>
	    <td>${formatDate(item.createdAt)}</td>
	    <td>${item.reporter?.fullName || '-'}</td>
	    <td>${item.technician || '-'}</td>
	    <td>${item.category || '-'}</td>
	    <td><span class="priority-badge ${priorityClass}">${item.priority || '-'}</span></td>
	    <td><span class="status-badge ${statusClass}">${item.status || '-'}</span></td>
	    <td class="actions-cell">
	      <button class="more-btn" aria-label="เมนู" data-id="${item.id}">...</button>
	      <div class="more-menu" id="menu-${item.id}">${menuItemsHtml}</div>
	    </td>
	 	</tr>
    `;
  }).join('');

  renderPagination();
}

function renderPagination() {
  const paginationEl = byId('listPagination');
  if (!paginationEl) return;

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const prevBtn = `<button class="btn page-btn nav" ${currentPage === 1 ? 'disabled' : ''} data-page="prev">ย้อนกลับ</button>`;
  const nextBtn = `<button class="btn page-btn nav" ${currentPage === totalPages ? 'disabled' : ''} data-page="next">หน้าถัดไป</button>`;

  let pagesHtml = '';
  for (let p = 1; p <= totalPages; p++) {
    if (p === currentPage) pagesHtml += `<button class="btn page-btn active" data-page="${p}">${String(p).padStart(2,'0')}</button>`;
    else if (p === 1 || p === totalPages || (p >= currentPage - 2 && p <= currentPage + 2))
      pagesHtml += `<button class="btn page-btn" data-page="${p}">${String(p).padStart(2,'0')}</button>`;
    else if (p === currentPage - 3 || p === currentPage + 3) pagesHtml += `<span class="page-dots">...</span>`;
  }

  paginationEl.innerHTML = `${prevBtn}<div class="page-numbers">${pagesHtml}</div>${nextBtn}`;
}

// ----- Filtering & search (works on allItems -> filteredItems) -----
function applyFilterAndSearch() {
  const searchInput = byId('listSearch');
  const q = (searchInput?.value || '').toLowerCase().trim();

  filteredItems = allItems.filter(it => {
    const buffer = [
      it.subject, it.reporter, it.assignee, it.category, it.status, it.location, it.room
    ].join(' ').toLowerCase();

    const matchText = buffer.includes(q);

    // only visible statuses for technician
    const status = it.status || '';
    const isVisibleStatus = VISIBLE_STATUSES.includes(status);

    return matchText && isVisibleStatus;
  });

  currentPage = 1;
  renderTable();
}

// ----- Global event handlers (single binding) -----
document.addEventListener('DOMContentLoaded', async () => {
  // elements used by many functions
  const tbody = byId('listTbody');
  const paginationEl = byId('listPagination');
  const searchInput = byId('listSearch');
  const filterBtn = byId('filterBtn');
  const filterDropdown = byId('filterDropdown');

  const acceptOverlay = byId('acceptOverlay');
  const acceptModal = byId('acceptModal');
  const detailOverlay = byId('detailOverlay');
  const detailModal = byId('detailModal');

  const reportOverlay = byId('reportOverlay');
  const reportModal = byId('reportModal');
  const successOverlay = byId('successOverlay');
  const successModal = byId('successModal');

  const acceptConfirmBtn = byId('acceptConfirmBtn');
  const acceptCancelBtn = byId('acceptCancelBtn');
  const detailBackBtn = byId('detailBackBtn');
  const detailSubmitReportBtn = byId('detailSubmitReportBtn');
  const reportBackBtn = byId('reportBackBtn');
  const reportConfirmBtn = byId('reportConfirmBtn');
  const successBackToListBtn = byId('successBackToListBtn');

  const logoutBtn = byId('logoutBtn');

  // load data first
  await loadRepairList();

  // Pagination clicks
  if (paginationEl) {
    paginationEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.page-btn');
      if (!btn || btn.disabled) return;
      const val = btn.getAttribute('data-page');
      const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
      if (val === 'prev') currentPage = Math.max(1, currentPage - 1);
      else if (val === 'next') currentPage = Math.min(totalPages, currentPage + 1);
      else currentPage = parseInt(val, 10) || 1;
      renderTable();
    });
  }

  // table-level clicks (delegation for rows, more-btn, menu actions)
  if (tbody) {
    tbody.addEventListener('click', (e) => {
      const moreBtn = e.target.closest('.more-btn');
      const menuItem = e.target.closest('.menu-item');

      if (moreBtn) {
        e.preventDefault();
        const id = moreBtn.getAttribute('data-id');
        const menu = byId(`menu-${id}`);
        document.querySelectorAll('.more-menu.show').forEach(m => { if (m.id !== `menu-${id}`) m.classList.remove('show'); });
        if (menu) menu.classList.toggle('show');
        return;
      }

      if (menuItem) {
        e.preventDefault();
        const action = menuItem.getAttribute('data-action');
        const id = menuItem.getAttribute('data-id');
        currentJobId = id;
        closeAllMenus();
        if (action === 'accept-job') openAcceptModal();
        else if (action === 'detail') openDetailModal();
        else if (action === 'submit-report') { cameFromModal = 'list'; openReportModal(); }
        return;
      }

      const row = e.target.closest('tr[data-id]');
      if (row) {
        currentJobId = row.getAttribute('data-id');
        closeAllMenus();
        openDetailModal();
      }
    });
  }

  // close menu when click outside actions
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.actions-cell')) closeAllMenus();
  });

  // search input
  if (searchInput) searchInput.addEventListener('input', applyFilterAndSearch);

  // filter dropdown toggle
  if (filterBtn) {
    filterBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (filterDropdown) filterDropdown.classList.toggle('show');
    });
  }
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.filter-container')) {
      if (filterDropdown) filterDropdown.classList.remove('show');
    }
  });

  // modal backdrop / back buttons
  if (detailBackBtn && detailModal && detailOverlay) {
    detailBackBtn.addEventListener('click', () => hideModal(detailModal, detailOverlay));
    detailOverlay.addEventListener('click', (e) => { if (e.target === detailOverlay) hideModal(detailModal, detailOverlay); });
  }
  if (reportBackBtn && reportModal && reportOverlay) {
    reportBackBtn.addEventListener('click', () => { hideModal(reportModal, reportOverlay); if (cameFromModal === 'detail') openDetailModal(); cameFromModal = null; });
    reportOverlay.addEventListener('click', (e) => { if (e.target === reportOverlay) hideModal(reportModal, reportOverlay); });
  }
  if (successBackToListBtn && successModal && successOverlay) {
    successBackToListBtn.addEventListener('click', () => { hideModal(successModal, successOverlay); currentJobId = null; });
    successOverlay.addEventListener('click', (e) => { if (e.target === successOverlay) hideModal(successModal, successOverlay); });
  }

  // accept modal buttons
  if (acceptCancelBtn) acceptCancelBtn.addEventListener('click', () => hideModal(acceptModal, acceptOverlay));
  if (acceptConfirmBtn) {
    acceptConfirmBtn.addEventListener('click', async () => {
      if (!currentJobId) return hideModal(acceptModal, acceptOverlay);
      const item = allItems.find(i => String(i.id) === String(currentJobId));
      if (item) item.status = "อยู่ระหว่างซ่อม";
      await updateStatusFromTechnician(currentJobId, "อยู่ระหว่างซ่อม");
      applyFilterAndSearch();
      hideModal(acceptModal, acceptOverlay);
      currentJobId = null;
    });
  }

  // report confirm
  if (reportConfirmBtn) {
    reportConfirmBtn.addEventListener('click', async () => {
      const cause = byId('reportCause') ? byId('reportCause').value : '';
      const item = allItems.find(i => String(i.id) === String(currentJobId));
      if (item) item.status = "กำลังตรวจสอบงานซ่อม";
      await updateStatusFromTechnician(currentJobId, "กำลังตรวจสอบงานซ่อม");
      // remove from technician list
      allItems = allItems.filter(it => String(it.id) !== String(currentJobId));
      applyFilterAndSearch();
      hideModal(reportModal, reportOverlay);
      showModal(successModal, successOverlay);
    });
  }

  // logout demo
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      console.log('Logout');
      alert('ออกจากระบบ');
    });
  }
});

// ----- small helpers used by handlers -----
function closeAllMenus() {
  document.querySelectorAll('.more-menu.show').forEach(el => el.classList.remove('show'));
}

function openAcceptModal() {
  const acceptModal = byId('acceptModal');
  const acceptOverlay = byId('acceptOverlay');
  showModal(acceptModal, acceptOverlay);
}
async function loadRequestImages(requestId) {
    const container = document.getElementById('detailImages');
    if (!container) return;
    container.innerHTML = ''; // clear old images

    try {
        const res = await fetch(`/api/files/${encodeURIComponent(requestId)}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch attachments');
        const attachments = await res.json();

        if (Array.isArray(attachments) && attachments.length) {
            attachments.forEach(att => {
                const el = document.createElement('div');
                el.className = 'detail-file';

                const img = document.createElement('img');
                img.src = `/api/files/${encodeURIComponent(requestId)}/${encodeURIComponent(att.id)}/download`;
                img.alt = att.originalFilename || 'image';
                img.classList.add('detail-image'); // optional CSS

                el.appendChild(img);
                container.appendChild(el);
            });
        } else {
            container.innerHTML = '<div class="placeholder">ไม่มีไฟล์แนบ</div>';
        }

    } catch (err) {
        console.error('Error loading images:', err);
        container.innerHTML = '<div class="placeholder">เกิดข้อผิดพลาดขณะโหลดไฟล์แนบ</div>';
    }
}


function openDetailModal() {
  const item = allItems.find(i => String(i.id) === String(currentJobId));
  if (!item) return;
  // fill detail modal fields (assume elements exist)
  byId('detailTitle').textContent = item.title || '-';
  const pEl = byId('detailPriority'); if (pEl) { pEl.textContent = item.priority || '-'; pEl.className = `priority-badge ${getPriorityClass(item.priority)}`; }
  const sEl = byId('detailStatus'); if (sEl) { sEl.textContent = item.status || '-'; sEl.className = `status-badge ${getStatusClass(item.status)}`; }
  if (byId('detailDate')) byId('detailDate').textContent = formatDate(item.createdAt);
  if (byId('detailReporterName')) byId('detailReporterName').textContent = item.reporter?.fullName || '-';
  if (byId('detailAssigneeName')) byId('detailAssigneeName').textContent = item.technician || '-';
  if (byId('detailCategory')) byId('detailCategory').textContent = item.category || '-';
  if (byId('detailLocation')) byId('detailLocation').textContent = item.location || '-';
  if (byId('detailRoom')) byId('detailRoom').textContent = item.room || '-';
  if (byId('detailDescription')) byId('detailDescription').textContent = item.description || '-';

  // detail action button
  const detailSubmitBtn = byId("detailSubmitReportBtn");
  if (detailSubmitBtn) {
    detailSubmitBtn.style.display = "block";
    detailSubmitBtn.onclick = null;

    if (item.status === "กำลังดำเนินการ") {
      detailSubmitBtn.textContent = "รับงานซ่อม";
      detailSubmitBtn.onclick = () => {
        hideModal(byId('detailModal'), byId('detailOverlay'));
        showModal(byId('acceptModal'), byId('acceptOverlay'));
      };
    } else if (item.status === "อยู่ระหว่างซ่อม" || item.status === "อยู่ระหว่างการซ่อม" || item.status === "กำลังซ่อม") {
      detailSubmitBtn.textContent = "ส่งรายงานซ่อม";
      detailSubmitBtn.onclick = () => {
        hideModal(byId('detailModal'), byId('detailOverlay'));
        cameFromModal = 'detail';
        showModal(byId('reportModal'), byId('reportOverlay'));
      };
    } else {
      detailSubmitBtn.style.display = "none";
    }
  }
  if (item && item.id) {
    loadRequestImages(item.id);
  }

  showModal(byId('detailModal'), byId('detailOverlay'));
}

function openReportModal() {
  const item = allItems.find(i => String(i.id) === String(currentJobId));
  if (!item) return;

  if (byId('reportTitle')) byId('reportTitle').textContent = item.subject || '-';
  if (byId('reportPriority')) { byId('reportPriority').textContent = item.priority || '-'; byId('reportPriority').className = `priority-badge ${getPriorityClass(item.priority)}`; }
  if (byId('reportStatus')) { byId('reportStatus').textContent = item.status || '-'; byId('reportStatus').className = `status-badge ${getStatusClass(item.status)}`; }
  if (byId('reportDate')) byId('reportDate').textContent = formatDate(item.date);
  if (byId('reportLocation')) byId('reportLocation').textContent = item.location + (item.room ? ` (ห้อง ${item.room})` : '');
  if (byId('reportCategory')) byId('reportCategory').textContent = item.category || '-';
  if (byId('reportAssignee')) byId('reportAssignee').textContent = item.assignee || '-';
  if (byId('reportReporter')) byId('reportReporter').textContent = item.reporter || '-';

  // reset report fields
  if (byId('reportCause')) byId('reportCause').value = '';
  if (byId('reportMethod')) byId('reportMethod').value = '';
  if (byId('reportParts')) byId('reportParts').value = '';

  showModal(byId('reportModal'), byId('reportOverlay'));
}
