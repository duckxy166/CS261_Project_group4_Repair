window.addEventListener('pageshow', function(event) {
  if (event.persisted) {
    console.log('Page loaded from bfcache. Forcing reload from server...');
    window.location.reload(); 
  }
});

const byId = (id) => document.getElementById(id);



let currentUserFullName = '';
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
	
	
		
	async function loadRepairRequests() {
	        try {
	            const resp = await fetch('/api/requests', { credentials: 'include' });
	            if (resp.ok) {
	                const data = await resp.json();
	                // Filter only statuses that the technician should see
	                allItems = data.filter(item => {
	                    const status = item.status || '';
	                    return status === 'กำลังดำเนินการ' || status === 'อยู่ระหว่างซ่อม' || status === 'อยู่ระหว่างการซ่อม';
	                });
	                applyFilterAndSearch();
	            } else {
	                console.error('ไม่สามารถโหลดรายการซ่อมได้', resp.status);
	                tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:20px;">ไม่สามารถโหลดรายการซ่อมได้</td></tr>`;
	            }
	        } catch (err) {
	            console.error('เกิดข้อผิดพลาดในการเรียก API:', err);
	            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:20px;">เกิดข้อผิดพลาดในการเชื่อมต่อ</td></tr>`;
	        }
	 }
	 async function loadDetailImages(id) {
	     const imagesBox = byId('detailImages');
	     imagesBox.innerHTML = '';

	     try {
	         const res = await fetch(`/api/files/${encodeURIComponent(id)}`, { credentials: 'include' });
	         if (!res.ok) throw new Error('โหลดไฟล์ไม่สำเร็จ');

	         const files = await res.json();
	         console.log('Files from server:', files);

	         // Filter only images
	         const imageFiles = files.filter(f => f.contentType?.startsWith('image/'));

	         if (imageFiles.length) {
	             imageFiles.forEach(f => {
	                 const el = document.createElement('div');
	                 el.className = 'detail-image';

	                 const img = document.createElement('img');
	                 img.src = `/api/files/${encodeURIComponent(id)}/${encodeURIComponent(f.id)}/download`;
	                 img.alt = f.originalFilename || 'image';

	                 el.appendChild(img);
	                 imagesBox.appendChild(el);
	             });
	         } else {
	             imagesBox.innerHTML = '<div class="placeholder">ไม่มีรูปภาพ</div>';
	         }

	     } catch (err) {
	         console.error(err);
	         imagesBox.innerHTML = '<div class="placeholder">เกิดข้อผิดพลาดขณะโหลดรูปภาพ</div>';
	     }
	 }



	 (async () => {
	     try {
	         const resp = await fetch('/api/users/current', { credentials: 'include' });
	         if (resp.ok) {
	             const user = await resp.json();
	             currentUserFullName = user.fullName || '';
	             // update header
	             const nameEl = byId('currentUserName');
	             if (nameEl) nameEl.textContent = currentUserFullName;

	             const emailEl = byId('currentUserEmail');
	             if (emailEl) emailEl.textContent = user.email || '';
	         }
	     } catch (err) {
	         console.error('Error fetching current user:', err);
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

	async function updateStatusFromTechnician(id, status, technician = "self") {
	    const body = {
	        status: status,
	        technician: technician || "self",
	        priority: null
	    };
		
		console.log("Sending body:", body);
		
	    const res = await fetch(`/api/requests/${id}/update-status`, {
	        method: "POST",
	        headers: { "Content-Type": "application/json" },
	        body: JSON.stringify(body)
	    });

	    if (!res.ok) {
	        console.error('Failed to update status', res.status);
	        return;
	    }

	    const data = await res.json();
	    console.log("Updated report:", data);
	    return data;
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
						<td>${item.title || '-'}</td>
						<td>${formatDate(item.createdAt)}</td>
						<td>${item.reporter?.fullName || '-'}</td>
						<td>${item.technician || '-'}</td>
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
			    it.title, it.reporter, it.assignee, it.category, it.status, it.location, it.locationDetail
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


	const currentItem = () => allItems.find(item => item.id == currentJobId);

	function openAcceptModal() {
		showModal(acceptModal, acceptOverlay);
	}
	if (acceptConfirmBtn) {
		acceptConfirmBtn.addEventListener('click', async () => {
			console.log(`ยืนยันรับงาน ID: ${currentJobId}`);
			const item = currentItem();
			if (item) {
				item.status = "กำลังดำเนินการ";  // 🔁 เปลี่ยนสถานะใน UI
				item.technician = currentUserFullName;
			}

			// 🔁 ยิง API ให้ backend เปลี่ยนสถานะ + ผูกช่าง
			await updateStatusFromTechnician(currentJobId, "อยู่ระหว่างซ่อม");

			applyFilterAndSearch();
			hideModal(acceptModal, acceptOverlay);
			currentJobId = null;
			
			window.location.reload();
		});
	}

	if (acceptCancelBtn) acceptCancelBtn.addEventListener('click', () => hideModal(acceptModal, acceptOverlay));


	function openDetailModal() {
	    const item = currentItem();
	    if (!item) return;

	    byId('detailTitle').textContent = item.title;
	    byId('detailPriority').textContent = item.priority;
	    byId('detailPriority').className = `priority-badge ${getPriorityClass(item.priority)}`;
	    byId('detailStatus').textContent = item.status;
	    byId('detailStatus').className = `status-badge ${getStatusClass(item.status)}`;
	    byId('detailDate').textContent = formatDate(item.createdAt);
	    byId('detailReporterName').textContent = item.reporter?.fullName || '-';
	    byId('detailAssigneeName').textContent = item.technician || '-';
	    byId('detailCategory').textContent = item.category || '-';
	    byId('detailLocation').textContent = item.location;
	    byId('detailRoom').textContent = item.locationDetail || '-';
	    byId('detailDescription').textContent = item.description || '-';

	    const detailSubmitBtn = byId("detailSubmitReportBtn");

	    // reset state
	    detailSubmitBtn.style.display = "block";
	    detailSubmitBtn.onclick = null;

	    // ============ กรณีรับงาน ============
		if (item.status === "กำลังดำเนินการ") {
		    detailSubmitBtn.textContent = "รับงานซ่อม";
		    detailSubmitBtn.onclick = () => {
		        const item = currentItem();
		        if (!item) return;

		        if (item.status === "กำลังดำเนินการ") {
		            showModal(acceptModal, acceptOverlay);
		        } else if (item.status === "อยู่ระหว่างซ่อม" || item.status === "อยู่ระหว่างการซ่อม") {
		            hideModal(detailModal, detailOverlay);
		            openReportModal();
		        }
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
		loadDetailImages(item.id);
	    showModal(detailModal, detailOverlay);
	}

	function openReportModal() {
		const item = currentItem();
		if (!item) return;

		byId('reportTitle').textContent = item.title;
		byId('reportPriority').textContent = item.priority;
		byId('reportPriority').className = `priority-badge ${getPriorityClass(item.priority)}`;
		byId('reportStatus').textContent = item.status;
		byId('reportStatus').className = `status-badge ${getStatusClass(item.status)}`;

		byId('reportDate').textContent = formatDate(item.createdAt);
		byId('reportLocation').textContent = item.location + (item.locationDetail ? ` (ห้อง ${item.locationDetail})` : '');
		byId('reportCategory').textContent = item.category;
		byId('reportAssignee').textContent = item.technician;
		byId('reportReporter').textContent = item.reporter?.fullName;

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

	reportConfirmBtn.addEventListener('click', async () => {
	    if (!currentJobId) return;

	    const item = currentItem();
	    if (!item) return;

	    // 1. Get form values
	    const cause = byId('reportCause').value.trim();
	    const method = byId('reportMethod').value.trim();
	    const parts = byId('reportParts').value.trim();

	    // 2. Combine them into one string
	    const description = `สาเหตุ: ${cause}\nวิธีซ่อม: ${method}\nรายละเอียดที่เปลี่ยน: ${parts}`;

	    console.log(`ยืนยันส่งรายงาน ID: ${currentJobId} ด้วย description:\n${description}`);

	    // 3. Update UI
	    item.status = "กำลังตรวจสอบงานซ่อม";

	    // 4. Call backend to update status
	    await updateStatusFromTechnician(currentJobId, "กำลังตรวจสอบงานซ่อม", "self");

	    // 5. Upload files (images/videos)
	    const uploadInput = byId('reportUploadInput');
	    const fileUploadInput = byId('reportFileUploadInput');

	    // Combine all files into one array
	    const files = [
	        ...(uploadInput?.files || []),
	        ...(fileUploadInput?.files || [])
	    ];

	    for (let f of files) {
	        const formData = new FormData();
	        formData.append('file', f);
	        formData.append('description', description);

	        await fetch(`/api/files/${currentJobId}`, {
	            method: 'POST',
	            body: formData
	        });
	    }

	    // 6. Remove from list for technician view
	    allItems = allItems.filter(it => it.id !== currentJobId);
	    applyFilterAndSearch();

	    // 7. Close modal & show success
	    hideModal(reportModal, reportOverlay);
	    openSuccessModal();

	    currentJobId = null;
	});



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


	loadRepairRequests();
});