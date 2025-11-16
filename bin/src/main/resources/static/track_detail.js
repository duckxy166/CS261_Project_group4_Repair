// ===== MENU TOGGLE =====
const toggleBtn = document.getElementById("menu-toggle");
const menuPopup = document.getElementById("menu-popup");

if (toggleBtn && menuPopup) {
  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    menuPopup.classList.toggle("show");
  });
}

window.addEventListener("click", (e) => {
  if (menuPopup && !e.target.closest("#menu-popup") && !e.target.closest("#menu-toggle")) {
    menuPopup.classList.remove("show");
  }
});

// ===== FETCH REPORT DETAIL ======
const params = new URLSearchParams(window.location.search);
const reportId = params.get("id");

async function loadReportDetail() {
  if (!reportId) {
    document.querySelector(".container").innerHTML = "<p>ไม่พบข้อมูลการแจ้งซ่อม</p>";
    return;
  }

  try {
    // Fetch report detail
    const resReport = await fetch(`/api/requests/${reportId}`); 
    if (!resReport.ok) throw new Error("ไม่สามารถโหลดข้อมูลได้");
    const report = await resReport.json();

    // Fetch attachments
    const resFiles = await fetch(`/api/files/${reportId}`);
    const files = resFiles.ok ? await resFiles.json() : [];

    // Render files
	const filesHTML = files.length
	  ? files.map(f => {
	      const ext = (f.originalFilename || "").split(".").pop().toLowerCase();
	      const downloadUrl = `/api/files/${reportId}/${f.id}/download`;
	      if (["png","jpg","jpeg","gif","bmp","webp"].includes(ext)) {
	        return `<img src="${downloadUrl}" alt="${f.originalFilename}" />`;
	      } else {
	        return `<a href="${downloadUrl}" target="_blank">${f.originalFilename}</a>`;
	      }
	    }).join("")
	  : `<img src="image/picIcon.png" alt="Pic" class="placeholder">`;


    // Render 
    const container = document.querySelector(".container");
    container.innerHTML = `
      <p>วันที่แจ้งซ่อม : ${report.createdAt ? report.createdAt.replace("T", " ").slice(0,16) : "-"}</p>
      <p>ชื่อผู้แจ้ง : ${report.reporterName || "-"}</p>
      <p>ผู้รับผิดชอบ : ${report.technician || "-"}</p>
      <p>ประเภทของงาน : ${report.title || "-"}</p>
      <p>สถานที่ : ${report.location || "-"}</p>
	  <p>รายละเอียดสถานที่เพิ่มเติม : ${report.locationDetail || "-"}</p>
      <p>รายละเอียดงาน : ${report.description || "-"}</p>
      <p>สถานะการซ่อม : ${report.status || "-"} <span class="dot"></span></p>

      <div class="image-box">${filesHTML}</div>

      <div class="actions">
        ${report.status === "รอดำเนินการ" ? `<button class="cancel" id="cancelRequest">ยกเลิกการแจ้งซ่อม</button>` : ""}
        <button class="back" onclick="window.history.back()">ย้อนกลับ</button>
      </div>
    `;

    // cancel button 
    if (report.status === "รอดำเนินการ") setupCancelButton();
  } catch (err) {
    console.error(err);
    document.querySelector(".container").innerHTML = `<p>${err.message}</p>`;
  }
}

// ===== CANCEL REQUEST =====
function setupCancelButton() {
  const cancelBtn = document.getElementById("cancelRequest");
  const modal = document.getElementById("confirmModal");
  const closeModal = document.getElementById("closeModal");
  const cancelModal = document.getElementById("cancelModal");
  const confirmDelete = document.getElementById("confirmDelete"); // นี่คือปุ่ม "ยืนยัน"

  if (cancelBtn) cancelBtn.addEventListener("click", () => modal.classList.add("show"));
  if (closeModal) closeModal.onclick = () => modal.classList.remove("show");
  if (cancelModal) cancelModal.onclick = () => modal.classList.remove("show");
  
  window.onclick = (e) => e.target === modal && modal.classList.remove("show");

  // --- ★★★ START: FIX - แก้ไขปุ่มยืนยัน ★★★ ---
  if (confirmDelete) confirmDelete.addEventListener("click", async () => {
    try {
      
      // ★★★ นี่คือโค้ดที่แก้ไข ★★★
      // เปลี่ยนจาก "DELETE" เป็น "POST" และเปลี่ยน URL ไปที่ .../cancel
      const res = await fetch(`/api/requests/${encodeURIComponent(reportId)}/cancel`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
          // ไม่ต้องส่ง body
      });
      // ★★★ จบส่วนที่แก้ไข ★★★

      if (res.ok) {
        alert('ยกเลิกงานเรียบร้อยแล้ว'); // แจ้งเตือนก่อน
        modal.classList.remove("show");
        window.location.href = "track.html"; // ค่อย redirect
      } else {
        const errorText = await res.text();
        console.error('Server response:', errorText);
        alert(`ไม่สามารถยกเลิกการแจ้งซ่อมได้: ${errorText || res.status}`);
      }
    } catch (err) {
      console.error("Cancel error:", err); // เปลี่ยนจาก Delete error
      alert("เกิดข้อผิดพลาดในการยกเลิกการแจ้งซ่อม");
    }
  });
  // --- ★★★ END: FIX ★★★ ---
}

// logout
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      // (เปลี่ยนเป็น /api/logout และ POST ให้เหมือน track.js)
      const res = await fetch("/api/logout", { method: "POST" }); 
      if (res.ok || res.status === 401 || res.status === 403) {
        window.location.href = "login.html?logout=true";
      } else {
        alert("ไม่สามารถออกจากระบบได้");
      }
    } catch (err) {
      console.error("Logout error:", err);
      alert("เกิดข้อผิดพลาดในการออกจากระบบ");
    }
  });
}

//init
loadReportDetail();