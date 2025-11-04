// ===== MENU TOGGLE =====
const toggleBtn = document.getElementById("menu-toggle");
const menuPopup = document.getElementById("menu-popup");

toggleBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  menuPopup.classList.toggle("show");
});

window.addEventListener("click", (e) => {
  if (!e.target.closest("#menu-popup") && !e.target.closest("#menu-toggle")) {
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
  const confirmDelete = document.getElementById("confirmDelete");

  cancelBtn.addEventListener("click", () => modal.classList.add("show"));

  closeModal.onclick = () => modal.classList.remove("show");
  cancelModal.onclick = () => modal.classList.remove("show");
  window.onclick = (e) => e.target === modal && modal.classList.remove("show");

  confirmDelete.addEventListener("click", async () => {
    try {
      const res = await fetch(`/api/requests/${reportId}`, { method: "DELETE" });
      if (res.ok) {
        modal.classList.remove("show");
        window.location.href = "track.html";
      } else {
        alert("ไม่สามารถยกเลิกการแจ้งซ่อมได้");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("เกิดข้อผิดพลาดในการยกเลิกการแจ้งซ่อม");
    }
  });
}

// logout
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/logout", { method: "GET" });
      if (res.ok) window.location.href = "login.html";
      else alert("ไม่สามารถออกจากระบบได้");
    } catch (err) {
      console.error("Logout error:", err);
      alert("เกิดข้อผิดพลาดในการออกจากระบบ");
    }
  });
}

//init
loadReportDetail();
