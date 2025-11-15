window.addEventListener('pageshow', function(event) {
  if (event.persisted) {
    console.log('Page loaded from bfcache. Forcing reload from server...');
    window.location.reload(); 
  }
});


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
=======

document.addEventListener('DOMContentLoaded', () => {

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
	
	(async () => {
		    try {
		        const resp = await fetch('/api/users/current');
		        if (resp.ok) {
		            const user = await resp.json();
		            
		            // (สมมติว่าใน header มี id="currentUserName")
		            const nameEl = byId('currentUserName'); 
		            if (nameEl && user && user.fullName) {
		                nameEl.textContent = user.fullName;
		            }
		            
		            // (สมมติว่าใน header มี id="currentUserEmail" - เพิ่มให้ตามคำขอ)
		            const emailEl = byId('currentUserEmail'); 
		            if (emailEl && user && user.email) {
		                emailEl.textContent = user.email;
		            }

		        } else if (resp.status === 401 || resp.status === 403) {
		            alert('เซสชั่นหมดอายุ กรุณาเข้าสู่ระบบใหม่');
		            window.location.href = 'login.html?session_expired=true';
		        } else {
		            console.warn('ไม่สามารถตรวจสอบผู้ใช้ปัจจุบันได้:', resp.status);
		            const nameEl = byId('currentUserName');
		            if(nameEl) nameEl.textContent = "Error";
		        }
		    } catch (err) {
		        console.error('เกิดข้อผิดพลาดระหว่างตรวจสอบผู้ใช้:', err);
		        const nameEl = byId('currentUserName');
		        if(nameEl) nameEl.textContent = "Offline";
		    }
		})();
		
	// ปิด detailModal เมื่อกดปุ่มย้อนกลับ
	if (detailBackBtn && detailModal && detailOverlay) {
	    detailBackBtn.addEventListener('click', () => {
	        hideModal(detailModal, detailOverlay);
	    });

	    detailOverlay.addEventListener('click', (e) => {
	        if (e.target === detailOverlay) {
	            hideModal(detailModal, detailOverlay);
	        }
	    });
	}

	// ปิด reportModal
	if (reportBackBtn && reportModal && reportOverlay) {
	    reportBackBtn.addEventListener('click', () => {
	        hideModal(reportModal, reportOverlay);
	    });

	    reportOverlay.addEventListener('click', (e) => {
	        if (e.target === reportOverlay) {
	            hideModal(reportModal, reportOverlay);
	        }
	    });
	}

	// ปิด successModal
	if (successBackToListBtn && successModal && successOverlay) {
	    successBackToListBtn.addEventListener('click', () => {
	        hideModal(successModal, successOverlay);
	    });

	    successOverlay.addEventListener('click', (e) => {
	        if (e.target === successOverlay) {
	            hideModal(successModal, successOverlay);
	        }
	    });
	}

	const logoutBtn = byId('logoutBtn');

	let allItems = [];
	let filteredItems = [];
	let currentPage = 1;
	const PAGE_SIZE = 10;
	let currentJobId = null;
	let cameFromModal = null;

	async function updateStatusFromTechnician(id, newStatus) {
		if (!id) return;

		try {
			const res = await fetch(`/api/requests/${id}/update-status`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					status: newStatus,
					technician: "self",   // ให้ backend ผูกช่างจาก session ปัจจุบัน
					priority: null
				})
			});

			if (!res.ok) {
				console.error("อัปเดตสถานะไม่สำเร็จ:", await res.text());
			}
		} catch (err) {
			console.error("เรียก API อัปเดตสถานะไม่ได้:", err);
		}
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

	function hideAllModals() {
		[acceptModal, detailModal, reportModal, successModal].forEach(modal => {
			if (modal) modal.classList.remove('show');
		});
		[acceptOverlay, detailOverlay, reportOverlay, successOverlay].forEach(overlay => {
			if (overlay) overlay.classList.remove('show');
		});
	}


	function getPriorityClass(priority) {
		switch (priority?.toLowerCase()) {
			case 'high': return 'priority-high';
			case 'medium': return 'priority-medium';
			case 'low': return 'priority-low';
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

	function formatDate(dateStr) {
		try {
			const d = new Date(dateStr);
			const dd = String(d.getDate()).padStart(2, '0');
			const mm = String(d.getMonth() + 1).padStart(2, '0');
			const yyyy = d.getFullYear();
			return `${dd}/${mm}/${yyyy}`;
		} catch {
			return dateStr;
		}
	}

	function renderTable() {
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

				const status = item.status || '';
				
				let menuItemsHtml = `
					<button class="menu-item" data-action="detail" data-id="${item.id}">
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.7;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
						<span class="mi-text">รายละเอียด</span>
					</button>
				`;

				if (status === 'กำลังดำเนินการ') {
					menuItemsHtml += `
						<button class="menu-item" data-action="accept-job" data-id="${item.id}">
							<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.7;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
							<span class="mi-text">รับงานซ่อม</span>
						</button>`;
				} 

				else if (status === 'อยู่ระหว่างซ่อม' || status === 'อยู่ระหว่างการซ่อม') {
					menuItemsHtml += `
						<button class="menu-item" data-action="submit-report" data-id="${item.id}">
							<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.7;"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
							<span class="mi-text">ส่งรายงานซ่อม</span>
						</button>`;
				}

				return `
					<tr data-id="${item.id}">
						<td>${item.subject || '-'}</td>
						<td>${formatDate(item.date)}</td>
						<td>${item.reporter || '-'}</td>
						<td>${item.assignee || '-'}</td>
						<td>${item.category || '-'}</td>
						<td><span class="priority-badge ${priorityClass}">${item.priority || '-'}</span></td>
						<td><span class="status-badge ${statusClass}">${item.status || '-'}</span></td>
						<td class="actions-cell">
							<button class="more-btn" aria-label="เมนู" data-id="${item.id}">...</button>
							<div class="more-menu" id="menu-${item.id}">
								${menuItemsHtml}
							</div>
						</td>
					</tr>
				`;
			}).join('');

			renderPagination();
		}

	function renderPagination() {
		const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));

		const prevBtn = `<button class="btn page-btn nav" ${currentPage === 1 ? 'disabled' : ''} data-page="prev">ย้อนกลับ</button>`;
		const nextBtn = `<button class="btn page-btn nav" ${currentPage === totalPages ? 'disabled' : ''} data-page="next">หน้าถัดไป</button>`;

		let pagesHtml = '';
		for (let p = 1; p <= totalPages; p++) {
			if (p === currentPage) {
				pagesHtml += `<button class="btn page-btn active" data-page="${p}">${String(p).padStart(2, '0')}</button>`;
			} else if (p === 1 || p === totalPages || (p >= currentPage - 2 && p <= currentPage + 2)) {
				pagesHtml += `<button class="btn page-btn" data-page="${p}">${String(p).padStart(2, '0')}</button>`;
			} else if (p === currentPage - 3 || p === currentPage + 3) {
				pagesHtml += `<span class="page-dots">...</span>`;
			}
		}

		paginationEl.innerHTML = `
            ${prevBtn}
            <div class="page-numbers">
                ${pagesHtml}
            </div>
            ${nextBtn}
        `;
	}

	function applyFilterAndSearch() {
		const q = (searchInput.value || '').toLowerCase().trim();

		filteredItems = allItems.filter(it => {
			const buffer = [
				it.subject, it.reporter, it.assignee, it.category, it.status, it.location, it.room
			].join(' ').toLowerCase();

			const matchText = buffer.includes(q);

			const status = it.status || '';
			// ให้ช่างเห็นเฉพาะงานที่ยังต้องทำ: กำลังดำเนินการ + อยู่ระหว่างซ่อม
			const isVisibleStatus =
				status === 'กำลังดำเนินการ' ||
				status === 'อยู่ระหว่างซ่อม' ||
				status === 'อยู่ระหว่างการซ่อม'; // กันเผื่อสะกดแบบมี "การ"

			return matchText && isVisibleStatus;
		});

		currentPage = 1;
		renderTable();
	}

	if (tbody) {
		tbody.addEventListener('click', (e) => {
			const moreBtn = e.target.closest('.more-btn');
			const menuItem = e.target.closest('.menu-item');
			if (moreBtn) {
				e.preventDefault();
				const id = moreBtn.getAttribute('data-id');
				const menu = byId(`menu-${id}`);
				document.querySelectorAll('.more-menu.show').forEach(m => {
					if (m.id !== `menu-${id}`) m.classList.remove('show');
				});
				if (menu) menu.classList.toggle('show');
				return;
			}

			if (menuItem) {
				e.preventDefault();
				const action = menuItem.getAttribute('data-action');
				const id = menuItem.getAttribute('data-id');
				currentJobId = id;
				closeAllMenus();

				if (action === 'accept-job') {
					openAcceptModal();
				} else if (action === 'detail') {
					openDetailModal();
				} else if (action === 'submit-report') {
					cameFromModal = 'list';
					openReportModal();
				}
				return;
			}

			const row = e.target.closest('tr[data-id]');
			if (row) {
				const id = row.getAttribute('data-id');
				currentJobId = id;
				closeAllMenus();
				openDetailModal();
			}
		});
	}

	document.addEventListener('click', (e) => {
		if (!e.target.closest('.actions-cell')) {
			closeAllMenus();
		}
	});

	function closeAllMenus() {
		document.querySelectorAll('.more-menu.show').forEach(el => {
			el.classList.remove('show');
		});
	}

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

	if (searchInput) searchInput.addEventListener('input', applyFilterAndSearch);

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


	const currentItem = () => allItems.find(item => item.id === currentJobId);

	function openAcceptModal() {
		showModal(acceptModal, acceptOverlay);
	}
	if (acceptConfirmBtn) {
		acceptConfirmBtn.addEventListener('click', async () => {
			console.log(`ยืนยันรับงาน ID: ${currentJobId}`);
			const item = currentItem();
			if (item) {
				item.status = "อยู่ระหว่างซ่อม";  // 🔁 เปลี่ยนสถานะใน UI
			}

			// 🔁 ยิง API ให้ backend เปลี่ยนสถานะ + ผูกช่าง
			await updateStatusFromTechnician(currentJobId, "อยู่ระหว่างซ่อม");

			applyFilterAndSearch();
			hideModal(acceptModal, acceptOverlay);
			currentJobId = null;
		});
	}

	if (acceptCancelBtn) acceptCancelBtn.addEventListener('click', () => hideModal(acceptModal, acceptOverlay));


	function openDetailModal() {
	    const item = currentItem();
	    if (!item) return;

	    byId('detailTitle').textContent = item.subject;
	    byId('detailPriority').textContent = item.priority;
	    byId('detailPriority').className = `priority-badge ${getPriorityClass(item.priority)}`;
	    byId('detailStatus').textContent = item.status;
	    byId('detailStatus').className = `status-badge ${getStatusClass(item.status)}`;
	    byId('detailDate').textContent = formatDate(item.date);
	    byId('detailReporterName').textContent = item.reporter || '-';
	    byId('detailAssigneeName').textContent = item.assignee || '-';
	    byId('detailCategory').textContent = item.category || '-';
	    byId('detailLocation').textContent = item.location;
	    byId('detailRoom').textContent = item.room || '-';
	    byId('detailDescription').textContent = item.description || '-';

	    const detailSubmitBtn = byId("detailSubmitReportBtn");

	    // reset state
	    detailSubmitBtn.style.display = "block";
	    detailSubmitBtn.onclick = null;

	    // ============ กรณีรับงาน ============
	    if (item.status === "กำลังดำเนินการ") {

	        detailSubmitBtn.textContent = "รับงานซ่อม";

			detailSubmitBtn.onclick = () => {

			    // ปิดหน้าต่าง detail ก่อน
			    hideModal(detailModal, detailOverlay);

			    // แสดง popup ยืนยันรับงาน
			    showModal(acceptModal, acceptOverlay);

			    acceptConfirmBtn.onclick = async () => {
			        item.status = "อยู่ระหว่างซ่อม";
			        await updateStatusFromTechnician(currentJobId, "อยู่ระหว่างซ่อม");

			        applyFilterAndSearch();
			        hideModal(acceptModal, acceptOverlay);
			    };

			    acceptCancelBtn.onclick = () => {
			        hideModal(acceptModal, acceptOverlay);
			    };
			};
	    }

	    // ============ กรณีส่งรายงาน ============
	    else if (item.status === "อยู่ระหว่างซ่อม" || item.status === "อยู่ระหว่างการซ่อม") {
	        detailSubmitBtn.textContent = "ส่งรายงานซ่อม";
	        detailSubmitBtn.onclick = () => {
	            hideModal(detailModal, detailOverlay);
	            openReportModal();
	        };
	    }

	    // ============ สถานะอื่น → ไม่ให้แก้ ============
	    else {
	        detailSubmitBtn.style.display = "none";
	    }

	    showModal(detailModal, detailOverlay);
	}

	function openReportModal() {
		const item = currentItem();
		if (!item) return;

		byId('reportTitle').textContent = item.subject;
		byId('reportPriority').textContent = item.priority;
		byId('reportPriority').className = `priority-badge ${getPriorityClass(item.priority)}`;
		byId('reportStatus').textContent = item.status;
		byId('reportStatus').className = `status-badge ${getStatusClass(item.status)}`;

		byId('reportDate').textContent = formatDate(item.date);
		byId('reportLocation').textContent = item.location + (item.room ? ` (ห้อง ${item.room})` : '');
		byId('reportCategory').textContent = item.category;
		byId('reportAssignee').textContent = item.assignee;
		byId('reportReporter').textContent = item.reporter;

		byId('reportCause').value = '';
		byId('reportMethod').value = '';
		byId('reportParts').value = '';

		const uploadInput = byId('reportUploadInput');
		const uploadBtn = byId('reportUploadBtn');
		if (uploadBtn && uploadInput) {
			uploadBtn.onclick = () => uploadInput.click();
			uploadInput.onchange = () => {
				console.log('ไฟล์รูป/วิดีโอ:', uploadInput.files);
			};
		}

		const fileUploadInput = byId('reportFileUploadInput');
		const fileUploadBtn = byId('reportFileUploadBtn');
		if (fileUploadBtn && fileUploadInput) {
			fileUploadBtn.onclick = () => fileUploadInput.click();
			fileUploadInput.onchange = () => {
				console.log('ไฟล์แนบ:', fileUploadInput.files);
			};
		}

		showModal(reportModal, reportOverlay);
	}

	if (reportBackBtn) {
		reportBackBtn.addEventListener('click', () => {
			hideModal(reportModal, reportOverlay);
			if (cameFromModal === 'detail') {
				openDetailModal();
			}
			cameFromModal = null;
		});
	}

	if (reportConfirmBtn) {
		reportConfirmBtn.addEventListener('click', async () => {
			const cause = byId('reportCause').value;
			console.log(`ยืนยันส่งรายงาน ID: ${currentJobId} ด้วยสาเหตุ: ${cause}`);

			const item = currentItem();
			if (item) {
				item.status = "กำลังตรวจสอบงานซ่อม";  // 🔁 สถานะใหม่ให้แอดมินตรวจ
			}

			await updateStatusFromTechnician(currentJobId, "กำลังตรวจสอบงานซ่อม");

			// เอาออกจาก list หน้าช่าง (เหลือฝั่งแอดมิน)
			allItems = allItems.filter(it => it.id !== currentJobId);
			applyFilterAndSearch();

			hideModal(reportModal, reportOverlay);
			openSuccessModal();
		});
	}


	function openSuccessModal() {
		showModal(successModal, successOverlay);
	}
	if (successBackToListBtn) {
		successBackToListBtn.addEventListener('click', () => {
			hideModal(successModal, successOverlay);
			currentJobId = null;
		});
	}

		if (logoutBtn) {
			logoutBtn.addEventListener('click', async (e) => {
				e.preventDefault();
				console.log('Logout');
				
				try {
				    const response = await fetch('/api/logout', { method: 'POST' });
				    
				    // ไม่ว่าเซิร์ฟเวอร์จะตอบ OK (200) หรือ 401/403 (ไม่มีสิทธิ์)
				    // ผลลัพธ์คือต้องไปหน้า login
				    if (response.ok || response.status === 401 || response.status === 403) {
				        window.location.href = 'login.html?logout=true';
				    } else {
				        alert('ไม่สามารถออกจากระบบได้: ' + response.status);
				    }
				} catch (err) {
				    console.error('Logout error:', err);
				    // ถ้าเน็ตเวิร์คมีปัญหา ก็ส่งไปหน้า login อยู่ดี
				    window.location.href = 'login.html?logout_error=true';
				}
			});
		}


	function loadData() {
		allItems = mockRepairData;
		applyFilterAndSearch();
	}

	loadData();
});
>>>>>>> refs/remotes/origin/main
