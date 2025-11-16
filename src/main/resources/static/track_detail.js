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
      ? files
          .map((f) => {
            const ext = (f.originalFilename || "").split(".").pop().toLowerCase();
            const downloadUrl = `/api/files/${reportId}/${f.id}/download`;
            if (f.contentType && f.contentType.startsWith("image/")) {
	        return `<img src="${downloadUrl}" alt="${f.originalFilename}" />`;
	      } else {
	        return `<a href="${downloadUrl}" target="_blank">${f.originalFilename}</a>`;
	      }
	    }).join("")
	  : `<img src="image/picIcon.png" alt="Pic" class="placeholder">`;


    // Render
    const container = document.querySelector(".container");
    container.innerHTML = `
      <p>วันที่แจ้งซ่อม : ${report.createdAt ? report.createdAt.replace("T", " ").slice(0, 16) : "-"}</p>
      <p>ชื่อผู้แจ้ง : ${report.reporterName || "-"}</p>
      <p>ผู้รับผิดชอบ : ${report.technician || "-"}</p>
      <p>ประเภทของงาน : ${report.title || "-"}</p>
      <p>สถานที่ : ${report.location || "-"}</p>
	  <p>รายละเอียดสถานที่เพิ่มเติม : ${report.locationDetail || "-"}</p>
      <p>รายละเอียดงาน : ${report.description || "-"}</p>
      <p>สถานะการซ่อม : ${report.status || "-"} <span class="dot"></span></p>

      <div class="image-box" style="display: flex; flex-wrap: wrap; align-items: center;">${filesHTML}</div>

      <div class="actions">
        ${report.status === "รอดำเนินการ" ? `<button class="cancel" id="cancelRequest">ยกเลิกการแจ้งซ่อม</button>` : ""}
        <button class="back" onclick="window.history.back()">ย้อนกลับ</button>
      </div>

      <div id="imageModal" style="display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.8);">
        <span id="closeImageModal" style="position: absolute; top: 20px; right: 35px; color: #f1f1f1; font-size: 40px; font-weight: bold; cursor: pointer;">&times;</span>
        <img id="modalImage" style="margin: auto; display: block; max-width: 80%; max-height: 80%; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);" />
      </div>
    `;

    // MODIFIED: Call setup functions after rendering
    setupImageModal(); // Call the new modal setup function
    if (report.status === "รอดำเนินการ") setupCancelButton();

  } catch (err) {
    console.error(err);
    document.querySelector(".container").innerHTML = `<p>${err.message}</p>`;
  }
}

// ===== NEW FUNCTION: IMAGE MODAL =====
function setupImageModal() {
  const modal = document.getElementById("imageModal");
  if (!modal) return; 

  const modalImg = document.getElementById("modalImage");
  const closeBtn = document.getElementById("closeImageModal");

  // Get all images with the class 'report-image'
  const images = document.querySelectorAll(".report-image");

  images.forEach(img => {
    img.addEventListener("click", () => {
      modal.style.display = "block";
      modalImg.src = img.dataset.src || img.src; // Use data-src or src
    });
  });

  // Close modal when 'x' is clicked
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Close modal when overlay is clicked
  modal.addEventListener("click", (e) => {
    if (e.target === modal) { // Check if click is on the overlay itself
      modal.style.display = "none";
    }
  });
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