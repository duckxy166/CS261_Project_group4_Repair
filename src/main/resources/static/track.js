/* Track Request page script */
const byId = (id) => document.getElementById(id);
window.addEventListener('pageshow', function(event) {

	if (event.persisted) {
		console.log('Page loaded from bfcache. Forcing reload from server...');

		window.location.reload();
	}
});

document.addEventListener('DOMContentLoaded', function() {

	const logoutBtn = document.getElementById('logoutBtn');
	if (logoutBtn) {
		logoutBtn.addEventListener('click', async function(e) {
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
});

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
			if (!window.location.pathname.endsWith('login.html')) {
				console.log('User not authenticated. Redirecting to login.');
				window.location.href = 'login.html?unauthenticated=true';
			}
		} else {
			console.warn('ไม่สามารถตรวจสอบผู้ใช้ปัจจุบันได้:', resp.status);
		}
	} catch (err) {
		console.error('เกิดข้อผิดพลาดระหว่างตรวจสอบผู้ใช้:', err);
	}
})();

(function() {
	const tbody = document.getElementById('trackTbody');
	const searchInput = document.getElementById('trackSearch');
	const paginationEl = document.getElementById('trackPagination');

	if (!tbody || !searchInput || !paginationEl) {
		return; // not on track page
	}

	const PAGE_SIZE = 10;
	let allItems = [];
	let filtered = [];
	let currentPage = 1;

	const statusMap = {
		'pending': { text: 'รอดำเนินการ', cls: 'status-pending' },
		'processing': { text: 'กำลังดำเนินการ', cls: 'status-processing' },
		'assigned': { text: 'อยู่ระหว่างซ่อม', cls: 'status-assigned' },
		'checking': { text: 'กำลังตรวจสอบ', cls: 'status-checking' },
		'done': { text: 'สำเร็จ', cls: 'status-success' },
		'cancelled': { text: 'ยกเลิก', cls: 'status-cancelled' }
	};

	function normalizeStatus(s) {
		if (!s) return 'pending';
		const v = String(s).trim(); // ไม่ใช้ .toLowerCase() กับภาษาไทยเพื่อความชัวร์

		// ✅ 1. จับคู่ตรงตัวตาม State Diagram เป๊ะๆ (สำคัญที่สุด)
		if (v === 'รอดำเนินการ') return 'pending';
		if (v === 'กำลังดำเนินการ') return 'processing';
		if (v === 'อยู่ระหว่างซ่อม') return 'assigned';
		if (v === 'กำลังตรวจสอบงานซ่อม') return 'checking'; // 🔥 ต้องตรงกับ DB ทุกตัวอักษร
		if (v === 'ซ่อมเสร็จ') return 'done';
		if (v === 'ยังไม่ได้ให้คะแนน') return 'done';
		if (v === 'สำเร็จ') return 'done';
		if (v === 'ยกเลิก') return 'cancelled';

		// 🔍 2. เผื่อกรณีมีช่องว่างหน้าหลัง หรือใช้คำภาษาอังกฤษ (Fallback)
		const vLower = v.toLowerCase();
		if (vLower === 'pending') return 'pending';
		if (vLower === 'processing') return 'processing';
		if (vLower === 'assigned') return 'assigned';
		if (vLower === 'checking') return 'checking';
		if (vLower === 'done' || vLower === 'success') return 'done';
		if (vLower === 'cancelled') return 'cancelled';

		// ⚠️ 3. จับคู่แบบบางส่วน (ใช้เฉพาะถ้าจำเป็นจริงๆ)
		// ต้องระวังคำว่า "ซ่อม" หรือ "เสร็จ" ที่อาจโผล่ในหลายสถานะ
		if (vLower.includes('ตรวจสอบ')) return 'checking';
		if (vLower.includes('อยู่ระหว่างซ่อม')) return 'assigned';

		// ถ้าไม่ตรงเลย ให้เป็น pending ไว้ก่อน
		return 'pending';
	}

	// Define which actions appear per status
	function getActions(statusKey) {
		if (statusKey === 'pending') {
			return [
				{ action: 'detail', text: 'รายละเอียด' },
				{ action: 'edit', text: 'แก้ไข' },
				{ action: 'delete', text: 'ยกเลิกคำขอ', warn: true }
			];
		}
		return [
			{ action: 'detail', text: 'รายละเอียด' }
		];
	}

	function truncate(str, length) {
		if (!str) return '-';
		return str.length > length ? str.substring(0, length) + '...' : str;
	}

	function fmtDate(dateStr) {
		try {
			const d = new Date(dateStr);
			if (isNaN(d.getTime())) return dateStr || '-';
			const dd = String(d.getDate()).padStart(2, '0');
			const mm = String(d.getMonth() + 1).padStart(2, '0');
			const yyyy = d.getFullYear();
			return `${dd}/${mm}/${yyyy}`;
		} catch (_) {
			return dateStr || '-';
		}
	}

	function render() {
		const start = (currentPage - 1) * PAGE_SIZE;
		const pageItems = filtered.slice(start, start + PAGE_SIZE);

		tbody.innerHTML = pageItems.map(item => {
			const statusKey = normalizeStatus(item.status);
			const statusInfo = statusMap[statusKey] || { text: item.status || '-', cls: 'status-default' };

			// 🔥 แก้ไขตรงนี้: ดึง description มาตัดคำเพื่อแสดงเป็นหัวข้อเรื่อง
			const subjectDisplay = truncate(item.title || item.subject, 30);

			const reporter = item.reporterFullName || item.reporterName || '-';
			const assignee = item.assigneeName || '-';
			const category = item.category || item.type || '-';
			const created = fmtDate(item.createdAt || item.created_at || item.date);
			const id = item.id || item._id || '';
			const actions = getActions(statusKey);

			// ส่วนสร้างเมนูจุดสามจุด (คงเดิมตามไฟล์ที่คุณส่งมาล่าสุด)
			const menuHtml = `
            <div class="more-menu" role="menu" aria-hidden="true" tabindex="-1">
              ${actions.map((a, i) => `
                ${i > 0 ? '<div class="mi-divider" role="separator"></div>' : ''}
                <button class="menu-item ${a.warn ? 'warn' : ''}" data-action="${a.action}" data-id="${escapeHtml(String(id))}" role="menuitem">
                  <span class="mi-icon">${a.action === 'detail' ? '🔎' : a.action === 'edit' ? '✏️' : '🗑️'}</span>
                  <span class="mi-text">${a.text}</span>
                </button>
              `).join('')}
            </div>`;

			return `
                <tr data-id="${escapeHtml(String(id))}">
                  <td title="${escapeHtml(item.description || '')}" style="font-weight:500;">
                    ${escapeHtml(subjectDisplay)}
                  </td>
                  <td>${escapeHtml(created)}</td>
                  <td>${escapeHtml(reporter)}</td>
                  <td>${escapeHtml(assignee)}</td>
                  <td>${escapeHtml(category)}</td>
                  <td><span class="status-badge ${statusInfo.cls}">${statusInfo.text}</span></td>
                  <td class="actions-cell">
                    <button class="more-btn" aria-label="เมนูอื่นๆ" data-id="${escapeHtml(String(id))}" aria-haspopup="true" aria-expanded="false">&#8226;&#8226;&#8226;</button>
                    ${menuHtml}
                  </td>
                </tr>
            `;
		}).join('');

		renderPagination();
	}

	function renderPagination() {
	    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	    let prevBtn = `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} data-page="prev">ย้อนกลับ</button>`;
	    let pagesHtml = '';

	    const pagesToShow = 7;
	    const start = Math.max(1, currentPage - 3);
	    const end = Math.min(totalPages, start + pagesToShow - 1);

	    for (let p = start; p <= end; p++) {
	        pagesHtml += `<button class="page-btn ${p === currentPage ? 'active' : ''}" data-page="${p}">${String(p).padStart(2, '0')}</button>`;
	    }

	    if (end < totalPages) {
	        pagesHtml += `<span class="ellipsis">...</span>`;
	        pagesHtml += `<button class="page-btn" data-page="${totalPages}">${String(totalPages).padStart(2, '0')}</button>`;
	    }

	    let nextBtn = `<button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} data-page="next">หน้าถัดไป</button>`;

	    paginationEl.innerHTML = `
	        ${prevBtn}
	        <div class="page-numbers">
	            ${pagesHtml}
	        </div>
	        ${nextBtn}
	    `;
	}

	function applySearch() {
		const q = (searchInput.value || '').toLowerCase().trim();
		if (!q) {
			filtered = allItems.slice();
		} else {
			filtered = allItems.filter(it => {
				const buf = [
					it.title,
					it.description,
					it.location,
					it.reporterName,
					it.technician,
					it.category,
					it.status
				].map(v => (v || '').toLowerCase()).join(' ');

				// เช็คว่าคำค้น (q) อยู่ใน buf หรือไม่
				return buf.includes(q);
			});
		}
		currentPage = 1;
		render();
	}

	function escapeHtml(str) {
		return String(str)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;');
	}

	async function loadData() {
		try {
			// พยายามเรียกเฉพาะรายการของผู้ใช้ปัจจุบันก่อน (ตามสคริปต์ที่คุณส่งมา)
			let res = await fetch('/api/requests/user-trackreports', { credentials: 'include' });
			if (!res.ok) {
				// fallback: เรียก endpoint เดิมที่ใช้สำหรับทดสอบ UI
				res = await fetch('/api/requests');
			}
			if (!res.ok) throw new Error('โหลดข้อมูลล้มเหลว');
			const data = await res.json();
			// 1. เก็บข้อมูลดิบไว้ในตัวแปรใหม่
			const rawData = Array.isArray(data) ? data : (data.items || []);

			// 2. เพิ่มตัวกรอง
			// กรองเอาเฉพาะรายการที่ "ไม่ใช่" สถานะ 'done' และ 'cancelled'
			allItems = rawData.filter((item) => {
				const statusKey = normalizeStatus(item.status); // ใช้ฟังก์ชัน normalizeStatus ที่มีอยู่แล้ว
				return statusKey !== 'done' && statusKey !== 'cancelled';
			});
			// จบส่วนที่เพิ่ม

			filtered = allItems.slice(); // 3. ส่งข้อมูลที่กรองแล้วไปแสดงผล
			render();
		} catch (err) {
			tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#d9534f;">ไม่สามารถโหลดรายการ (${escapeHtml(err.message)})</td></tr>`;
			paginationEl.innerHTML = '';
		}
	}

	// events
	searchInput.addEventListener('input', applySearch);
	// toggle and menu actions
	tbody.addEventListener('click', (e) => {
		const moreBtn = e.target.closest('.more-btn');
		const menuItem = e.target.closest('.menu-item');

		if (moreBtn) {
			e.preventDefault();
			const cell = moreBtn.closest('.actions-cell');
			const menu = cell && cell.querySelector('.more-menu');
			if (!menu) return;

			const isCurrentlyOpen = menu.classList.contains('open');
			closeAllMenus(); // ปิดทุกเมนูที่เปิดอยู่
			if (!isCurrentlyOpen) { // ถ้าเมนูที่เพิ่งคลิกไม่ได้เปิดอยู่ก่อนหน้านี้ ให้เปิด
				menu.classList.add('open');
				moreBtn.setAttribute('aria-expanded', 'true');
				menu.setAttribute('aria-hidden', 'false');
				menu.focus(); // โฟกัสไปที่เมนูเพื่อรับ input จากคีย์บอร์ด
			} else {
				// ถ้าเมนูเปิดอยู่แล้ว และถูกคลิกซ้ำ จะถูกปิดโดย closeAllMenus() ไปแล้ว
				moreBtn.setAttribute('aria-expanded', 'false');
			}
			return;
		}

		if (menuItem) {
			e.preventDefault();
			const action = menuItem.getAttribute('data-action');
			const id = menuItem.getAttribute('data-id');
			handleAction(action, id);
			closeAllMenus();
			return;
		}
	});

	tbody.addEventListener('keydown', (e) => {
		const moreBtn = e.target.closest('.more-btn');
		const menu = e.target.closest('.more-menu');

		if (moreBtn && (e.key === 'Enter' || e.key === ' ')) {
			e.preventDefault();
			moreBtn.click(); // Simulate click to toggle menu
		}

		if (menu) {
			const menuItems = Array.from(menu.querySelectorAll('.menu-item'));
			const currentIndex = menuItems.indexOf(document.activeElement);

			if (e.key === 'ArrowDown') {
				e.preventDefault();
				const nextIndex = (currentIndex + 1) % menuItems.length;
				menuItems[nextIndex].focus();
			} else if (e.key === 'ArrowUp') {
				e.preventDefault();
				const prevIndex = (currentIndex - 1 + menuItems.length) % menuItems.length;
				menuItems[prevIndex].focus();
			} else if (e.key === 'Escape') {
				e.preventDefault();
				closeAllMenus();
				moreBtn.focus(); // กลับไปโฟกัสที่ปุ่มที่เปิดเมนู
			} else if (e.key === 'Enter' || e.key === ' ') {
				if (document.activeElement.closest('.menu-item')) {
					document.activeElement.click();
				}
			}
		}
	});

	document.addEventListener('click', (e) => {
		if (!e.target.closest('.actions-cell')) {
			closeAllMenus();
		}
	});
	// เพิ่มการปิดเมนูเมื่อกด ESC ทั่วไปในเอกสาร
	document.addEventListener('keydown', (e) => {
	    if (e.key === 'Escape') {
	        closeAllMenus();
	    }
	});

	paginationEl.addEventListener('click', (e) => {
		const btn = e.target.closest('.page-btn');
		if (!btn) return;
		const val = btn.getAttribute('data-page');
		const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
		if (val === 'prev') currentPage = Math.max(1, currentPage - 1);
		else if (val === 'next') currentPage = Math.min(totalPages, currentPage + 1);
		else currentPage = parseInt(val, 10) || 1;
		render();
	});

	// init
	loadData();

	function closeAllMenus() {
		document.querySelectorAll('.more-menu.open').forEach(el => {
			el.classList.remove('open');
			el.setAttribute('aria-hidden', 'true');
			const moreBtn = el.previousElementSibling; // Assume more-btn is sibling before menu
			if (moreBtn && moreBtn.classList.contains('more-btn')) {
				moreBtn.setAttribute('aria-expanded', 'false');
			}
		});
	}

	async function handleAction(action, id) {
		if (!id) return;
		if (action === 'detail') {
			openDetailModal(id);
			return;
		}
		if (action === 'edit') {
			openDetailModal(id);
			enterEditMode();
			return;
		}
		if (action === 'delete') {
			showDeleteConfirm(id);
		}
	}

	// Custom confirm delete modal
	const overlay = document.getElementById('confirmOverlay');
	const modal = document.getElementById('confirmModal');
	const btnYes = document.getElementById('confirmYes');
	const btnNo = document.getElementById('confirmNo');
	let deleteTargetId = null;

	function showDeleteConfirm(id) {
		deleteTargetId = id;
		if (overlay) overlay.classList.add('show');
		if (modal) modal.classList.add('show');
		if (overlay) overlay.setAttribute('aria-hidden', 'false');
		if (modal) modal.setAttribute('aria-hidden', 'false');
	}

	function hideDeleteConfirm() {
		deleteTargetId = null;
		if (overlay) overlay.classList.remove('show');
		if (modal) modal.classList.remove('show');
		if (overlay) overlay.setAttribute('aria-hidden', 'true');
		if (modal) modal.setAttribute('aria-hidden', 'true');
	}

	if (btnNo) btnNo.addEventListener('click', hideDeleteConfirm);
	if (overlay) overlay.addEventListener('click', hideDeleteConfirm);
	if (btnYes) btnYes.addEventListener('click', async () => {
	    if (!deleteTargetId) return hideDeleteConfirm();
	    try {
			console.log('deleteTargetId:', deleteTargetId);

	        const resp = await fetch('/api/requests/update-status', {
	            method: 'POST',
	            headers: { 'Content-Type': 'application/json' },
	            body: JSON.stringify({
	                id: deleteTargetId,
	                status: 'ยกเลิก',
	                technicianId: null,
	                priority: null
	            }),
	            credentials: 'include'
	        });

	        if (!resp.ok) throw new Error('ไม่สามารถยกเลิกงานได้');

	        const result = await resp.json();
	        console.log('Update result:', result);
	        alert('ยกเลิกงานเรียบร้อยแล้ว');

	        allItems = allItems.filter(it => String(it.id || it._id) !== String(deleteTargetId));
	        applySearch();

	    } catch (err) {
	        console.error('Cancel request error:', err);
	        alert('เกิดข้อผิดพลาดขณะยกเลิกงาน');
	    } finally {
	        hideDeleteConfirm();
	    }
	});


	// Detail modal logic
	const dOverlay = document.getElementById('detailOverlay');
	const dModal = document.getElementById('detailModal');
	const dClose = document.getElementById('detailCloseBtn');
	const dCancel = document.getElementById('detailCancelBtn');
	const dEdit = document.getElementById('detailEditBtn');
	const dSave = document.getElementById('detailSaveBtn');
	const dAbort = document.getElementById('detailAbortBtn');
	let currentDetailId = null;
	let pendingFiles = [];

	// Elements for "รายละเอียดงาน" (work detail)
    const workLabel = byId('workLabel');
    const detailWorkInput = byId('detailWork');

	function populateSelect(el, options, selected) {
		if (!el) return;
		el.innerHTML = '';
		options.forEach(opt => {
			const o = document.createElement('option');
			o.value = String(opt);
			o.textContent = String(opt);
			if (String(opt) === String(selected)) o.selected = true;
			el.appendChild(o);
		});
	}

	function uniqueValues(key, fallback = []) {
		const set = new Set(fallback);
		allItems.forEach(it => {
			const v = it[key] || it[key === 'category' ? 'type' : key];
			if (v) set.add(v);
		});
		return Array.from(set);
	}

	// Searchable combo utilities - Updated to improve accessibility and keyboard navigation
	function setupCombo(prefix, values, current) {
		const combo = document.getElementById(prefix + 'Combo');
		const valueInput = document.getElementById(prefix + 'Value'); // This is the visible input field
		const panel = document.getElementById(prefix + 'Panel');
		const searchInput = document.getElementById(prefix + 'Search'); // Renamed to searchInput for clarity
		const optionsEl = document.getElementById(prefix + 'Options');
		if (!combo || !valueInput || !panel || !searchInput || !optionsEl) return {};

		let activeOptionIndex = -1; // For keyboard navigation

		// Callback function to handle value changes (specifically for category combo)
		let onChangeCallback = null;
		if (prefix === 'cat') {
			onChangeCallback = (value) => {
				if (workLabel && detailWorkInput) {
					if (value === 'อื่นๆ') { // If category is 'อื่นๆ'
						workLabel.classList.remove('hidden');
						detailWorkInput.readOnly = false;
						detailWorkInput.placeholder = 'กรอกรายละเอียดงาน';
					} else {
						workLabel.classList.add('hidden');
						detailWorkInput.readOnly = true;
						detailWorkInput.value = ''; // Clear value if not 'อื่นๆ'
					}
				}
			};
		}


		// render options
		function render(filter = '') {
			const f = filter.trim().toLowerCase();
			const list = values.filter(v => !f || String(v).toLowerCase().includes(f));
			optionsEl.innerHTML = list.map((v, idx) =>
				`<div class="combo-option" role="option" id="${prefix}Option-${idx}" data-val="${escapeHtml(String(v))}">${escapeHtml(String(v))}</div>`
			).join('');
			activeOptionIndex = -1; // Reset active index on re-render
		}
		render('');
		valueInput.value = current || '';
		if (onChangeCallback) onChangeCallback(current); // Call on initial setup

		// open/close
		function open() {
			panel.classList.add('open');
			valueInput.setAttribute('aria-expanded', 'true');
			searchInput.value = '';
			render('');
			searchInput.focus(); // Focus on search input when opened
		}
		function close() {
			panel.classList.remove('open');
			valueInput.setAttribute('aria-expanded', 'false');
			activeOptionIndex = -1; // Reset active index on close
		}

		function selectOption(optionElement) {
			if (!optionElement) return;
			const val = optionElement.getAttribute('data-val');
			valueInput.value = val || '';
			if (onChangeCallback) onChangeCallback(val); // Call callback on selection
			close();
			valueInput.focus(); // Return focus to the main input
		}

		// Event Listeners
		valueInput.addEventListener('focus', open);
		valueInput.addEventListener('click', open);

		searchInput.addEventListener('input', () => render(searchInput.value));
		searchInput.addEventListener('keydown', (e) => {
			const options = Array.from(optionsEl.querySelectorAll('.combo-option'));
			if (options.length === 0) return;

			if (e.key === 'ArrowDown') {
				e.preventDefault();
				activeOptionIndex = (activeOptionIndex + 1) % options.length;
				options[activeOptionIndex].focus();
			} else if (e.key === 'ArrowUp') {
				e.preventDefault();
				activeOptionIndex = (activeOptionIndex - 1 + options.length) % options.length;
				options[activeOptionIndex].focus();
			} else if (e.key === 'Enter') {
				e.preventDefault();
				if (activeOptionIndex !== -1) {
					selectOption(options[activeOptionIndex]);
				} else if (options.length === 1 && searchInput.value === options[0].textContent) {
					// If only one option matches exactly, select it on Enter
					selectOption(options[0]);
				}
			} else if (e.key === 'Escape') {
				e.preventDefault();
				close();
				valueInput.focus();
			}
		});

		optionsEl.addEventListener('click', (e) => {
			const opt = e.target.closest('.combo-option');
			if (!opt) return;
			selectOption(opt);
		});

		optionsEl.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				selectOption(document.activeElement);
			} else if (e.key === 'Escape') {
				e.preventDefault();
				close();
				valueInput.focus();
			}
		});

		// Close when clicking outside
		document.addEventListener('click', (e) => {
			if (!combo.contains(e.target)) close();
		});

		return { getValue: () => valueInput.value, setValue: (val) => { valueInput.value = val; if(onChangeCallback) onChangeCallback(val); } };
	}


	function fillDetailFields(item) {
		const statusKey = normalizeStatus(item.status);
		const statusInfo = statusMap[statusKey] || { text: item.status || '-', cls: 'status-default' };

		// ใช้ ID ใหม่ที่แก้ไขไปใน track.html
		byId('detailTitleInput').value = item.title || item.subject || '-';

		// แก้ไขส่วนแสดงสถานะ (stEl) ให้ถูกต้อง
		const stEl = byId('detailStatus');
		if (stEl) {
			stEl.textContent = statusInfo.text;
			stEl.className = `status-badge ${statusInfo.cls}`;
		}

		// ใช้ byId() ที่เราสร้างไว้ด้านบน
		byId('detailDate').value = fmtDate(item.createdAt || item.created_at || item.date);
		byId('detailReporter').value = item.reporterFullName || item.reporterName || '-';
		byId('detailLocation').value = item.location || item.place || '-';
		byId('detailAssignee').value = item.assigneeName || '-';
		byId('detailCategory').value = item.category || item.type || '-';
		byId('detailDesc').value = item.description || item.desc || '-';
		const extraField = byId('detailLocationExtra');
		if (extraField) {
			extraField.value = item.locationDetail || '-';
		}

		// Display "รายละเอียดงาน" if category is "อื่นๆ"
        if (workLabel && detailWorkInput) {
            const currentCategory = item.category || item.type || '';
            if (currentCategory === 'อื่นๆ') {
                workLabel.classList.remove('hidden');
                detailWorkInput.value = item.workDetail || '-'; // Set value from item.workDetail
                detailWorkInput.readOnly = true; // Readonly in view mode
            } else {
                workLabel.classList.add('hidden');
                detailWorkInput.value = ''; // Clear value if not 'อื่นๆ'
            }
        }


		const cancelBtn = document.getElementById('detailCancelBtn');
		if (cancelBtn) {
		  if (item.status === 'รอดำเนินการ') {
		    cancelBtn.style.display = 'inline-block';
		  } else {
		    cancelBtn.style.display = 'none';
		  }
		}
		// ส่วนแสดงไฟล์แนบ
		const filesBox = byId('detailFiles');
		filesBox.innerHTML = '';
		if (Array.isArray(item.files) && item.files.length) {
			item.files.forEach((f) => {
				const el = document.createElement('div');
				el.className = 'detail-file';
				if (f && f.url) {
					const img = document.createElement('img');
					img.src = f.url;
					el.appendChild(img);
				} else {
					el.textContent = 'ภาพ';
				}
				filesBox.appendChild(el);
			});
		} else {
			const el = document.createElement('div');
			el.className = 'detail-file';
			el.textContent = 'ไม่มีรูป';
			filesBox.appendChild(el);
		}

		// ปรับการแสดงปุ่มแก้ไข
		const dEdit = document.getElementById('detailEditBtn');
		if (dEdit) {
			dEdit.style.display = statusKey === 'pending' ? 'inline-block' : 'none';
		}
	}
	// ปุ่มยกเลิกการแจ้งซ่อม
	dCancel.addEventListener('click', async () => {
	  if (!currentDetailId) {
	    alert('ไม่พบรหัสคำขอ');
	    return;
	  }

	  if (!confirm('คุณต้องการยกเลิกงานนี้ใช่หรือไม่?')) return;

	  try {
	    const resp = await fetch('/api/requests/update-status', {
	      method: 'POST',
	      headers: { 'Content-Type': 'application/json' },
	      body: JSON.stringify({
	        id: currentDetailId,
	        status: 'ยกเลิก',
	        technicianId: null,
	        priority: null
	      }),
	      credentials: 'include'
	    });

	    if (!resp.ok) throw new Error('ไม่สามารถยกเลิกงานได้');

	    alert('ยกเลิกงานเรียบร้อยแล้ว');
	    closeDetailModal(); // ใช้ closeDetailModal() แทนการตั้งค่า attribute โดยตรง
	    location.reload(); // reload after cancel success
	  } catch (err) {
	    console.error('Cancel request error:', err);
	    alert('เกิดข้อผิดพลาดขณะยกเลิกงาน');
	  }
	});

	async function openDetailModal(id) {
	    const item = allItems.find(it => String(it.id || it._id) === String(id));
	    if (!item) return;
	    currentDetailId = String(item.id || item._id);
	    fillDetailFields(item); // Call fillDetailFields first to set initial values and visibility

	    exitEditMode(); // This will re-hide combo boxes and show readonly inputs

	    // --- Hide/Show Cancel Button based on status ---
		const cancelBtn = document.getElementById('detailCancelBtn');
		console.log('Item status:', item.status); // check the real value
		if (item.status && item.status.trim() === 'รอดำเนินการ') {
		    cancelBtn.style.display = 'inline-block';
		} else {
		    cancelBtn.style.display = 'none';
		}

	    // โหลดไฟล์แนบของงานนี้จาก backend
	    const filesBox = document.getElementById('detailFiles');
	    filesBox.innerHTML = '';

	    try {
	        const res = await fetch(`/api/files/${encodeURIComponent(id)}`, { credentials: 'include' });
	        if (res.ok) {
	            const files = await res.json(); // [{id, originalFilename, ...}]
	            if (Array.isArray(files) && files.length) {
	                files.forEach(f => {
	                    const el = document.createElement('div');
	                    el.className = 'detail-file';
	                    const img = document.createElement('img');
	                    img.src = `/api/files/${encodeURIComponent(id)}/${encodeURIComponent(f.id)}/download`;
	                    img.alt = f.originalFilename || 'image';
	                    el.appendChild(img);
	                    filesBox.appendChild(el);
	                });
	            } else {
	                filesBox.innerHTML = '<div class="placeholder">ไม่มีไฟล์แนบ</div>';
	            }
	        } else {
	            filesBox.innerHTML = '<div class="placeholder">โหลดไฟล์แนบไม่สำเร็จ</div>';
	        }
	    } catch {
	        filesBox.innerHTML = '<div class="placeholder">เกิดข้อผิดพลาดขณะโหลดไฟล์แนบ</div>';
	    }

	    // prepare combos with data each time we open
	    const locValues = uniqueValues('location', ['อาคาร SC', 'อาคาร บร.1', 'อาคาร บร.2', 'อาคาร บร.3']);
	    const catValues = uniqueValues('category', ['ไฟฟ้า', 'ประปา', 'ประตู/ล็อก', 'เฟอร์นิเจอร์', 'อื่นๆ']); // Added 'อื่นๆ'
	    window._locComboCtl = setupCombo('loc', locValues, item.location || item.place || '');
	    window._catComboCtl = setupCombo('cat', catValues, item.category || item.type || ''); // Pass initial category to setupCombo

	    if (dOverlay) dOverlay.classList.add('show');
	    if (dModal) dModal.classList.add('show');
	    if (dOverlay) dOverlay.setAttribute('aria-hidden', 'false');
	    if (dModal) dModal.setAttribute('aria-hidden', 'false');
	}


	function closeDetailModal() {
		if (dOverlay) dOverlay.classList.remove('show');
		if (dModal) dModal.classList.remove('show');
		if (dOverlay) dOverlay.setAttribute('aria-hidden', 'true');
		if (dModal) dModal.setAttribute('aria-hidden', 'true');
	}

	if (dClose) dClose.addEventListener('click', closeDetailModal);
	if (dOverlay) dOverlay.addEventListener('click', closeDetailModal);
	if (dCancel) 	dCancel.addEventListener('click', async () => {
	  if (!currentDetailId) {
	    alert('ไม่พบรหัสคำขอ');
	    return;
	  }
	  try {
	    const resp = await fetch('/api/requests/update-status', {
	      method: 'POST',
	      headers: { 'Content-Type': 'application/json' },
	      body: JSON.stringify({
	        id: currentDetailId,
	        status: 'ยกเลิก',
	        technicianId: null,
	        priority: null
	      }),
	      credentials: 'include'
	    });
	    if (!resp.ok) {
	      throw new Error('ไม่สามารถยกเลิกงานได้');
	    }
	    let result = null;
	    try {
	      result = await resp.json();
	      console.log('Update result:', result);
	    } catch {
	      console.warn('Response was not valid JSON (ignored)');
	    }

	  } catch (err) {
	    console.error('Cancel request error:', err);
	    alert('เกิดข้อผิดพลาดขณะยกเลิกงาน');
	  }
	});

	function enterEditMode() {
		const locInput = document.getElementById('detailLocation');
		const locCombo = document.getElementById('locCombo');
		const catInput = document.getElementById('detailCategory');
		const catCombo = document.getElementById('catCombo');
		const desc = document.getElementById('detailDesc');
		const uploadWrap = document.getElementById('uploadPanelContainer');
		const drop = document.getElementById('uploadDrop');
		const btn = document.getElementById('uploadBtn');
		const input = document.getElementById('uploadInput');
		const previewBox = document.getElementById('detailFiles');
		const titleInput = document.getElementById('detailTitleInput');
		if (titleInput) titleInput.readOnly = false;
		const locationExtra = document.getElementById('detailLocationExtra');
		   if (locationExtra) {
		       locationExtra.readOnly = false;
		       locationExtra.placeholder = "กรอกรายละเอียดเพิ่มเติมของสถานที่ (เช่น บริเวณ/ห้อง/ชั้น)";
		   }

		// Update Combo Box values with current item's data before showing them
		// and trigger their onChangeCallback to handle workDetail visibility
		if (window._locComboCtl) window._locComboCtl.setValue(locInput.value);
		if (window._catComboCtl) window._catComboCtl.setValue(catInput.value); // This will call the callback

		// toggle controls
		if (locInput && locCombo) { locInput.classList.add('hidden'); locCombo.classList.remove('hidden'); }
		if (catInput && catCombo) { catInput.classList.add('hidden'); catCombo.classList.remove('hidden'); }
		if (desc) { desc.readOnly = false; desc.placeholder = 'กรอกรายละเอียดที่ต้องการแก้ไข'; }
		if (uploadWrap) uploadWrap.classList.remove('hidden');

        // Ensure work detail input is editable if category is 'อื่นๆ'
        const currentCategoryValue = (window._catComboCtl ? window._catComboCtl.getValue() : catInput.value) || '';
        if (currentCategoryValue === 'อื่นๆ' && detailWorkInput) {
            detailWorkInput.readOnly = false;
            detailWorkInput.placeholder = 'กรอกรายละเอียดงาน';
        } else if (detailWorkInput) {
			detailWorkInput.readOnly = true; // Keep it readonly for other categories
		}


		// init upload handlers
		pendingFiles = [];
		function renderPendingPreviews() {
			// Clear existing placeholders and only show actual files/new uploads
			const existingFiles = Array.from(previewBox.querySelectorAll('.detail-file img')).map(img => ({ url: img.src }));
			previewBox.innerHTML = ''; // Clear existing previews
			existingFiles.forEach(f => { // Re-add existing images
				const el = document.createElement('div');
				el.className = 'detail-file';
				const img = document.createElement('img');
				img.src = f.url;
				el.appendChild(img);
				previewBox.appendChild(el);
			});

			pendingFiles.forEach(f => {
				const el = document.createElement('div');
				el.className = 'detail-file';
				const img = document.createElement('img');
				img.src = URL.createObjectURL(f);
				el.appendChild(img);
				previewBox.appendChild(el);
			});
		}
		function handleFiles(files) {
			const arr = Array.from(files || []);
			arr.forEach(f => {
				if (f.type && f.type.startsWith('image/')) pendingFiles.push(f);
			});
			renderPendingPreviews();
		}
		if (btn && input) {
			btn.addEventListener('click', () => input.click());
			input.addEventListener('change', (e) => handleFiles(e.target.files));
		}
		if (drop) {
			['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, (e) => { e.preventDefault(); e.stopPropagation(); drop.classList.add('highlight'); }));
			['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, (e) => { e.preventDefault(); e.stopPropagation(); drop.classList.remove('highlight'); }));
			drop.addEventListener('drop', (e) => handleFiles(e.dataTransfer.files));
		}
		// toggle actions
		if (dCancel) dCancel.classList.add('hidden');
		if (dEdit) dEdit.classList.add('hidden');
		if (dSave) dSave.classList.remove('hidden');
		if (dAbort) dAbort.classList.remove('hidden');
	}

	function exitEditMode() {
		const locInput = document.getElementById('detailLocation');
		const locCombo = document.getElementById('locCombo');
		const catInput = document.getElementById('detailCategory');
		const catCombo = document.getElementById('catCombo');
		const desc = document.getElementById('detailDesc');
		const uploadWrap = document.getElementById('uploadPanelContainer');
		const titleInput = document.getElementById('detailTitleInput');
		if (titleInput) titleInput.readOnly = true;
		const locationExtra = document.getElementById('detailLocationExtra');
		    if (locationExtra) {
		        locationExtra.readOnly = true;
		        locationExtra.placeholder = "-";
		    }
		// toggle controls
		if (locInput && locCombo) { locInput.classList.remove('hidden'); locCombo.classList.add('hidden'); }
		if (catInput && catCombo) { catInput.classList.remove('hidden'); catCombo.classList.add('hidden'); }
		if (desc) { desc.readOnly = true; desc.placeholder = '-'; }
		if (uploadWrap) uploadWrap.classList.add('hidden');

		// Hide work detail input and make it readonly
        if (workLabel && detailWorkInput) {
            workLabel.classList.add('hidden');
            detailWorkInput.readOnly = true;
            detailWorkInput.value = ''; // Clear its value
        }


		// toggle actions
		if (dCancel) dCancel.classList.remove('hidden');
		if (dEdit) dEdit.classList.remove('hidden');
		if (dSave) dSave.classList.add('hidden');
		if (dAbort) dAbort.classList.add('hidden');
	}

	if (dEdit) dEdit.addEventListener('click', () => {
		if (!currentDetailId) return;
		enterEditMode();
	});

	if (dAbort) dAbort.addEventListener('click', () => {
		exitEditMode();
		// Re-populate original data after abort
		const item = allItems.find(it => String(it.id || it._id) === String(currentDetailId));
		if (item) fillDetailFields(item);
	});

	if (dSave) dSave.addEventListener('click', async () => {
		if (!currentDetailId) return;

		try {
			
			const formData = new FormData();

			
			const locComboCtl = window._locComboCtl;
			const catComboCtl = window._catComboCtl; 
			const desc = document.getElementById('detailDesc');
			
			const titleInput = document.getElementById('detailTitleInput');
			const extraDetail = document.getElementById("detailLocationExtra");

			
			formData.append("title", titleInput ? titleInput.value.trim() : "-");
			formData.append("location", locComboCtl ? locComboCtl.getValue() : "");
			formData.append("description", desc ? desc.value : "");
			formData.append("category", catComboCtl ? catComboCtl.getValue() : "");
			formData.append("locationDetail", extraDetail ? extraDetail.value.trim() : "");
            
            if (catComboCtl && catComboCtl.getValue() === 'อื่นๆ' && detailWorkInput) {
                formData.append("workDetail", detailWorkInput.value.trim());
            } else {
                formData.append("workDetail", ""); 
            }


			
			
			formData.append("existingAttachments", JSON.stringify([]));
			formData.append("removedAttachments", JSON.stringify([]));

			
			if (pendingFiles && pendingFiles.length) {
				pendingFiles.forEach(f => formData.append("newAttachments", f));
			}

			try {
				const resp = await fetch(`/api/requests/${encodeURIComponent(currentDetailId)}`, {
					method: "PUT",
					credentials: "include",
					body: formData
				});

				console.log("Update response status:", resp.status);

				if (!resp.ok) {
					const errText = await resp.text();
					console.error("Update failed:", errText);
					alert("เกิดข้อผิดพลาดในการบันทึกการแก้ไข: " + errText);
					return;
				}

				alert("บันทึกการแก้ไขสำเร็จ!");
				window.location.reload();

			} catch (err) {
				console.error("Update error:", err);
				alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
			}

		} catch (err) {
			console.error("Outer try error:", err);
		}
	});

	// Image viewer for detail thumbnails
	const imageModal = document.getElementById('imageModal');
	const modalImg = document.getElementById('modalImg');
	const closeModal = document.getElementById('closeModal');
	const filesContainer = document.getElementById('detailFiles');
	if (filesContainer && imageModal && modalImg && closeModal) {
		filesContainer.addEventListener('click', (e) => {
			const imgEl = e.target.closest('.detail-file img');
			if (!imgEl) return;
			modalImg.src = imgEl.src;
			imageModal.classList.remove('hidden');
		});
		closeModal.addEventListener('click', () => {
			imageModal.classList.add('hidden');
		});
		imageModal.addEventListener('click', (e) => {
			if (e.target === imageModal) imageModal.classList.add('hidden');
		});
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') imageModal.classList.add('hidden');
		});
	}

})();