const byId = (id) => document.getElementById(id);

const mockRepairData = [
	{
		id: "R001",
		subject: "น้ำไม่ไหล",
		date: "2025-03-31",
		reporter: "ไอติม",
		assignee: "ช่างธนกฤต",
		category: "ประปา",
		priority: "High",
		status: "กำลังดำเนินการ",
		isAccepted: true,
		location: "ตึก โดม",
		room: "ห้องน้ำชั้น 2",
		description: "น้ำไม่ไหลเลยตั้งแต่เช้า ที่ห้องน้ำหญิงชั้น 2 ตึกโดม",
		images: []
	},
	{
		id: "R002",
		subject: "ไฟดับ",
		date: "2025-08-26",
		reporter: "สมชาย",
		assignee: "เอกชัย",
		category: "ไฟฟ้า",
		priority: "Low",
		status: "รอดำเนินการ",
		isAccepted: false,
		location: "อาคารบร.1",
		room: "ห้อง 201",
		description: "ไฟไม่ติดบริเวณโถงอาคารบร.1",
		images: ["image_placeholder.png"]
	},
	{
		id: "R003",
		subject: "เก้าอี้เสีย",
		date: "2025-10-08",
		reporter: "พิเชษฐ์",
		assignee: "ช่างอภิเดช",
		category: "เฟอร์นิเจอร์",
		priority: "Medium",
		status: "กำลังตรวจสอบงานซ่อม",
		isAccepted: true,
		location: "ตึก พีช",
		room: "ห้อง 304",
		description: "ขาเก้าอี้หัก 1 ตัว",
		images: []
	},
	{
		id: "R004",
		subject: "แอร์ไม่เย็น",
		date: "2025-10-10",
		reporter: "สุชาติ",
		assignee: "เอกชัย",
		category: "ไฟฟ้า",
		priority: "Medium",
		status: "รอดำเนินการ",
		isAccepted: false,
		location: "ตึก SC",
		room: "ห้อง 501",
		description: "แอร์มีแต่ลม",
		images: []
	},
	{
		id: "R005",
		subject: "ประตูบิด",
		date: "2025-10-11",
		reporter: "มานี",
		assignee: "ช่างอภิเดช",
		category: "เฟอร์นิเจอร์",
		priority: "Low",
		status: "รอดำเนินการ",
		isAccepted: false,
		location: "ตึก โดม",
		room: "ห้อง 101",
		description: "ลูกบิดประตูเสีย",
		images: []
	},
	{
		id: "R006",
		subject: "ท่อตัน",
		date: "2025-10-12",
		reporter: "ปิติ",
		assignee: "ช่างธนกฤต",
		category: "ประปา",
		priority: "High",
		status: "รอดำเนินการ",
		isAccepted: false,
		location: "ตึก พีช",
		room: "ห้องน้ำชั้น 1",
		description: "ท่อระบายน้ำที่อ่างล้างหน้าตัน",
		images: []
	},
	{
		id: "R007",
		subject: "หลอดไฟกระพริบ",
		date: "2025-10-13",
		reporter: "ชูใจ",
		assignee: "เอกชัย",
		category: "ไฟฟ้า",
		priority: "Low",
		status: "รอดำเนินการ",
		isAccepted: false,
		location: "อาคารบร.1",
		room: "ห้อง 202",
		description: "ไฟกระพริบตลอดเวลา",
		images: []
	},
	{
		id: "R008",
		subject: "น้ำรั่ว",
		date: "2025-10-14",
		reporter: "สมปอง",
		assignee: "ช่างธนกฤต",
		category: "ประปา",
		priority: "Medium",
		status: "รอดำเนินการ",
		isAccepted: false,
		location: "ตึก SC",
		room: "ห้อง 303",
		description: "น้ำหยดจากฝ้าเพดาน",
		images: []
	},
	{
		id: "R009",
		subject: "โต๊ะหัก",
		date: "2025-10-15",
		reporter: "วิชัย",
		assignee: "ช่างอภิเดช",
		category: "เฟอร์นิเจอร์",
		priority: "High",
		status: "รอดำเนินการ",
		isAccepted: false,
		location: "ตึก โดม",
		room: "ห้อง 102",
		description: "ขาโต๊ะหัก",
		images: []
	},
	{
		id: "R010",
		subject: "ปลั๊กไฟไหม้",
		date: "2025-10-16",
		reporter: "อารี",
		assignee: "เอกชัย",
		category: "ไฟฟ้า",
		priority: "High",
		status: "กำลังดำเนินการ",
		isAccepted: true,
		location: "ตึก พีช",
		room: "ห้อง 404",
		description: "มีรอยไหม้ที่ปลั๊กไฟ",
		images: []
	},
	{
		id: "R011",
		subject: "หน้าต่างแตก",
		date: "2025-10-17",
		reporter: "สมคิด",
		assignee: "ช่างอภิเดช",
		category: "เฟอร์นิเจอร์",
		priority: "Medium",
		status: "รอดำเนินการ",
		isAccepted: false,
		location: "อาคารบร.1",
		room: "ห้อง 301",
		description: "กระจกหน้าต่างแตก",
		images: []
	},
	{
		id: "R012",
		subject: "ก๊อกน้ำเสีย",
		date: "2025-10-18",
		reporter: "มานะ",
		assignee: "ช่างธนกฤต",
		category: "ประปา",
		priority: "Low",
		status: "รอดำเนินการ",
		isAccepted: false,
		location: "ตึก SC",
		room: "ห้องน้ำชั้น 2",
		description: "ก๊อกน้ำปิดไม่สนิท",
		images: []
	}
];


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
			let menuItemsHtml = '';

			if (status === 'กำลังดำเนินการ') {
				menuItemsHtml = `
			        <button class="menu-item" data-action="accept-job" data-id="${item.id}">
			            <span class="mi-text">รับงานซ่อม</span>
			        </button>`;
			} else if (status === 'อยู่ระหว่างซ่อม' || status === 'อยู่ระหว่างการซ่อม') {
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
		logoutBtn.addEventListener('click', () => {
			console.log('Logout');
			alert('ออกจากระบบ');
		});
	}


	function loadData() {
		allItems = mockRepairData;
		applyFilterAndSearch();
	}

	loadData();
});