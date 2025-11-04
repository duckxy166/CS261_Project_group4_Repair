/*
  สคริปต์หน้าแจ้งซ่อม (Single Page)
  หน้าที่หลัก:
  - จัดการ dropdown สถานที่และประเภทงาน พร้อมอัปเดตสเต็ป 1–2
  - อัปโหลด/พรีวิวรูป และดูรูปแบบเต็มจอผ่านมอดอล
  - ตรวจสอบความถูกต้องของฟอร์ม และอัปเดตสเต็ป 3–4
  - ปุ่มล้างแบบฟอร์ม: รีเซ็ตค่าทั้งหมดและสถานะสเต็ป
  - โหมดพรีวิว: เมื่อรันที่พอร์ต 8000 จะไม่ส่งจริง แต่ซ่อนฟอร์มและแสดง successSection บนหน้าเดียว
*/

document.addEventListener('DOMContentLoaded', function() {
    // ยูทิลสำหรับ UI Validation
    const titleInput = document.getElementById('title');
    const titleError = document.getElementById('titleError');
    const locationError = document.getElementById('locationError');
    const typeError = document.getElementById('typeError');
    const detailsError = document.getElementById('detailsError');

    // ดึงผู้ใช้ปัจจุบันจาก backend เพื่อนำชื่อไปใส่ในช่อง "ชื่อผู้แจ้ง" (ถ้ามี)
    (async () => {
        try {
            const resp = await fetch('/api/users/current');
            if (resp.ok) {
                const user = await resp.json();
                if (titleInput && user && user.fullName) {
                    titleInput.value = user.fullName;
                }
                const nameEl = document.getElementById('currentUserName');
                if (nameEl && user && user.fullName) {
                    nameEl.textContent = user.fullName;
                }
            } else if (resp.status === 401 || resp.status === 403) {
                alert('กรุณาเข้าสู่ระบบก่อนทำการแจ้งซ่อม');
                window.location.href = 'login.html';
            } else {
                // ไม่บังคับ redirect กรณี backend ไม่พร้อม (เช่น พรีวิว/404)
                console.warn('ไม่สามารถตรวจสอบผู้ใช้ปัจจุบันได้:', resp.status);
            }
        } catch (err) {
            console.error('เกิดข้อผิดพลาดระหว่างตรวจสอบผู้ใช้:', err);
        }
    })();

    function showError(el, msgEl) {
        if (el) el.classList.add('error');
        if (msgEl) msgEl.classList.remove('hidden');
    }
    function clearError(el, msgEl) {
        if (el) el.classList.remove('error');
        if (msgEl) msgEl.classList.add('hidden');
    }
    if (titleInput) {
        titleInput.addEventListener('input', function() {
            if (this.value.trim()) clearError(titleInput, titleError);
        });
    }

    // ดร็อปดาวน์สถานที่
    const locationInput = document.getElementById('location');
    const locationDropdown = document.getElementById('locationDropdown');
    if (locationInput && locationDropdown) {
        locationInput.addEventListener('click', function() {
            locationDropdown.style.display = locationDropdown.style.display === 'block' ? 'none' : 'block';
        });
        document.querySelectorAll('#locationDropdown a').forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                locationInput.value = this.getAttribute('data-value');
                clearError(locationInput, locationError);
                const locExtra = document.getElementById('locationExtra');
                if (locExtra) {
                    locExtra.classList.remove('hidden');
                }
                const steps = document.querySelectorAll('.steps .step');
                const stepLines = document.querySelectorAll('.steps .step-line');
                if (steps.length > 0) {
                    steps[0].classList.add('completed');
                    steps[0].classList.remove('active');
                    const numEl = steps[0].querySelector('.step-number');
                    if (numEl) numEl.textContent = '✓';
                    if (steps[1]) steps[1].classList.add('active');
                    if (stepLines[0]) stepLines[0].classList.add('completed');
                }
                locationDropdown.style.display = 'none';
            });
        });
    }

    // ดร็อปดาวน์ประเภทงาน
    const typeInput = document.getElementById('type');
    const typeDropdown = document.getElementById('typeDropdown');
    if (typeInput && typeDropdown) {
        typeInput.addEventListener('click', function() {
            typeDropdown.style.display = typeDropdown.style.display === 'block' ? 'none' : 'block';
        });
        document.querySelectorAll('#typeDropdown a').forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const val = this.getAttribute('data-value');
                typeInput.value = val;
                clearError(typeInput, typeError);
                const typeExtra = document.getElementById('typeOtherExtra');
                if (typeExtra) {
                    if (val === 'อื่นๆ') {
                        typeExtra.classList.remove('hidden');
                    } else {
                        typeExtra.classList.add('hidden');
                    }
                }
                const steps = document.querySelectorAll('.steps .step');
                const stepLines = document.querySelectorAll('.steps .step-line');
                if (steps.length > 1) {
                    steps[1].classList.add('completed');
                    steps[1].classList.remove('active');
                    const numEl = steps[1].querySelector('.step-number');
                    if (numEl) numEl.textContent = '✓';
                    if (steps[2]) steps[2].classList.add('active');
                    if (stepLines[1]) stepLines[1].classList.add('completed');
                }
                typeDropdown.style.display = 'none';
            });
        });
    }

    // อัปโหลดรูปภาพและพรีวิว
    const uploadBtn = document.getElementById('uploadBtn');
    const imageInput = document.getElementById('image');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const previewName = document.getElementById('previewName');
    const imageIcon = document.querySelector('.image-upload-area .image-icon');
    const uploadInfoEl = document.querySelector('.image-upload-area .upload-info');
    const imageModal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImg');
    const closeModal = document.getElementById('closeModal');
    let currentObjectUrl = null;
    const detailsInput = document.getElementById('details');

    if (uploadBtn && imageInput) {
        uploadBtn.addEventListener('click', function() {
            imageInput.click();
        });
        imageInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const file = this.files[0];
                if (previewName) previewName.textContent = file.name;
                if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
                currentObjectUrl = URL.createObjectURL(file);
                if (previewImg) previewImg.src = currentObjectUrl;
                if (imagePreview) imagePreview.classList.remove('hidden');
                if (imageIcon) imageIcon.style.display = 'none';
                if (uploadBtn) uploadBtn.style.display = 'none';
                if (uploadInfoEl) uploadInfoEl.style.display = 'none';
                if (previewName) previewName.style.display = 'none';
            }
        });
    }
    if (imagePreview && closeModal && imageModal && modalImg && previewImg) {
        imagePreview.addEventListener('click', function() {
            if (!previewImg.src) return;
            modalImg.src = previewImg.src;
            imageModal.classList.remove('hidden');
        });
        closeModal.addEventListener('click', function() {
            imageModal.classList.add('hidden');
        });
    }

    // เมื่อกรอก "รายละเอียดปัญหา" อัปเดตสถานะขั้นตอนที่ 3
    if (detailsInput) {
        detailsInput.addEventListener('input', function() {
            const val = this.value.trim();
            const steps = document.querySelectorAll('.steps .step');
            const stepLines = document.querySelectorAll('.steps .step-line');
            if (steps.length > 2) {
                const numEl = steps[2].querySelector('.step-number');
                if (val.length > 0) {
                    clearError(detailsInput, detailsError);
                    steps[2].classList.add('completed');
                    steps[2].classList.remove('active');
                    if (numEl) numEl.textContent = '✓';
                    if (steps[3]) steps[3].classList.add('active');
                    if (stepLines[2]) stepLines[2].classList.add('completed');
                } else {
                    steps[2].classList.remove('completed');
                    steps[2].classList.add('active');
                    if (numEl) numEl.textContent = '3';
                    if (steps[3]) steps[3].classList.remove('active');
                    if (stepLines[2]) stepLines[2].classList.remove('completed');
                }
            }
        });
    }

    // ปิดดร็อปดาวน์เมื่อคลิกนอกองค์ประกอบ
    document.addEventListener('click', function(e) {
        if (locationInput && locationDropdown) {
            if (!locationInput.contains(e.target) && !locationDropdown.contains(e.target)) {
                locationDropdown.style.display = 'none';
            }
        }
        if (typeInput && typeDropdown) {
            if (!typeInput.contains(e.target) && !typeDropdown.contains(e.target)) {
                typeDropdown.style.display = 'none';
            }
        }
    });

    // ออกจากระบบ
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            try {
                const response = await fetch('/logout', { method: 'GET' });
                if (response.ok) {
                    window.location.href = 'login.html';
                } else {
                    alert('ไม่สามารถออกจากระบบได้');
                }
            } catch (err) {
                console.error('Logout error:', err);
                alert('เกิดข้อผิดพลาดในการออกจากระบบ');
            }
        });
    }

    // ล้างแบบฟอร์ม
    const clearLink = document.getElementById('clearForm');
    if (clearLink) {
        clearLink.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('repairForm').reset();
            const locExtra = document.getElementById('locationExtra');
            const typeExtra = document.getElementById('typeOtherExtra');
            if (locExtra) locExtra.classList.add('hidden');
            if (typeExtra) typeExtra.classList.add('hidden');
            document.querySelectorAll('.error-msg').forEach(el => el.classList.add('hidden'));
            document.querySelectorAll('.form-control.error').forEach(el => el.classList.remove('error'));
            if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
            currentObjectUrl = null;
            previewImg.removeAttribute('src');
            previewName.textContent = '';
            imagePreview.classList.add('hidden');
            if (imageIcon) imageIcon.style.display = '';
            if (uploadBtn) uploadBtn.style.display = '';
            if (uploadInfoEl) uploadInfoEl.style.display = '';
            if (previewName) previewName.style.display = '';

            // รีเซ็ตสถานะสเต็ปและเส้นคั่นให้กลับเป็นค่าเริ่มต้น
            const steps = document.querySelectorAll('.steps .step');
            steps.forEach((el, idx) => {
                el.classList.remove('completed', 'active');
                const numEl = el.querySelector('.step-number');
                if (numEl) numEl.textContent = String(idx + 1);
            });
            if (steps[0]) steps[0].classList.add('active');
            document.querySelectorAll('.steps .step-line').forEach(line => line.classList.remove('completed'));
        });
    }

    // ตรวจสอบฟอร์มเมื่อกดยืนยัน (ให้ส่งไปเซิร์ฟเวอร์เมื่อ valid)
    const formEl = document.getElementById('repairForm');
    const stepsBlock = document.querySelector('.steps');
    const successSection = document.getElementById('successSection');
    if (formEl) {
        formEl.addEventListener('submit', async function(e) {
            let valid = true;
            if (!titleInput.value.trim()) { showError(titleInput, titleError); valid = false; }
            if (!locationInput.value.trim()) { showError(locationInput, locationError); valid = false; }
            if (!typeInput.value.trim()) { showError(typeInput, typeError); valid = false; }
            if (!detailsInput.value.trim()) { showError(detailsInput, detailsError); valid = false; }
            if (!valid) {
                e.preventDefault();
                const firstError = document.querySelector('.form-control.error');
                if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }
            // ทำขั้นสุดท้ายเป็นเขียวก่อนเปลี่ยนหน้า
            const steps = document.querySelectorAll('.steps .step');
            if (steps[3]) {
                steps[3].classList.add('completed');
                steps[3].classList.remove('active');
                const numEl4 = steps[3].querySelector('.step-number');
                if (numEl4) numEl4.textContent = '✓';
            }
          
            e.preventDefault();
            try {
                const repairData = {
                    title: titleInput.value.trim(),
                    description: detailsInput.value.trim(),
                    priority: 'ปกติ',
                    location: locationInput.value.trim(),
                    category: typeInput.value.trim()
                };

                // 1) สร้างคำขอแจ้งซ่อม
                const response = await fetch('/api/requests', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(repairData)
                });

                if (response.status === 401 || response.status === 403) {
                    alert('กรุณาเข้าสู่ระบบก่อนทำการแจ้งซ่อม');
                    window.location.href = 'login.html';
                    return;
                }
                if (!response.ok) throw new Error('Failed to create repair request');

                const createdRequest = await response.json();
                const requestId = createdRequest.id;

                // 2) อัปโหลดไฟล์แนบถ้ามี
                if (imageInput && imageInput.files && imageInput.files.length > 0) {
                    const formData = new FormData();
                    formData.append('file', imageInput.files[0]);
                    formData.append('description', ' ');

                    const fileResp = await fetch(`/api/files/${requestId}`, {
                        method: 'POST',
                        body: formData
                    });
                    if (fileResp.status === 401 || fileResp.status === 403) {
                        alert('กรุณาเข้าสู่ระบบก่อนทำการแจ้งซ่อม');
                        window.location.href = 'login.html';
                        return;
                    }
                    if (!fileResp.ok) throw new Error('Failed to upload attachment');
                }

                // 3) แสดงผลสำเร็จบนหน้าเดียว (หรือเปลี่ยนเป็น redirect ตามต้องการ)
                if (stepsBlock) stepsBlock.classList.add('hidden');
                if (formEl) formEl.classList.add('hidden');
                if (successSection) {
                    successSection.classList.remove('hidden');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
               
                // window.location.href = 'track.html';
            } catch (err) {
                console.error(err);
                alert('ไม่สามารถส่งคำขอได้: ' + err.message);
            }
        });
    }
});