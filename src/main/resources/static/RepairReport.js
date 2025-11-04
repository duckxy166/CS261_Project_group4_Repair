document.addEventListener("DOMContentLoaded", async () => {
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

  // ===== FETCH REPORT DETAIL =====
  const params = new URLSearchParams(window.location.search);
  const reportId = params.get("id");
  const container = document.querySelector(".repair-details");

  if (!reportId) {
    container.innerHTML = "<p>ไม่พบข้อมูลการแจ้งซ่อม</p>";
    return;
  }

  try {
    // Fetch report details
    const resReport = await fetch(`/api/requests/${reportId}`);
    if (!resReport.ok) throw new Error("ไม่สามารถโหลดข้อมูลได้");
    const report = await resReport.json();

    // Fetch attachments
    const resFiles = await fetch(`/api/files/${reportId}`);
    const files = resFiles.ok ? await resFiles.json() : [];

    const filesHTML = files.length
      ? files.map(f => {
          const ext = (f.originalFilename || "").split(".").pop().toLowerCase();
          const downloadUrl = `/api/files/${reportId}/${f.id}/download`;
          if (["png", "jpg", "jpeg", "gif", "bmp", "webp"].includes(ext)) {
            return `<img src="${downloadUrl}" alt="${f.originalFilename}" class="report-img"/>`;
          } else {
            return `<a href="${downloadUrl}" target="_blank">${f.originalFilename}</a>`;
          }
        }).join("")
      : `<img src="image/picIcon.png" alt="Pic" class="placeholder"/>`;

    const createdAt = new Date(report.createdAt).toLocaleDateString("th-TH");

    container.innerHTML = `
      <p><strong>วันที่แจ้งซ่อม :</strong> ${createdAt}</p>
      <p><strong>ชื่อผู้แจ้ง :</strong> ${report.reporterName}</p>
      <p><strong>ผู้รับผิดชอบ :</strong> ${report.technician || "-"}</p>
      <p><strong>ประเภทของงาน :</strong> ${report.title}</p>
      <p><strong>สถานที่ :</strong> ${report.location}</p>
      <p><strong>รายละเอียดงาน :</strong> ${report.description}</p>
      <p><strong>สถานะการซ่อม :</strong> ${report.status} <span class="status-dot"></span></p>
      <div class="repair-image">${filesHTML}</div>
      <div class="button-group">
        <a href="RepairReportCRS.html?id=${report.id}" class="card">
          <button class="btn-report">รายงานการซ่อม</button>
        </a>
        <a href="RepairList.html" class="card">
          <button class="btn-back">ย้อนกลับ</button>
        </a>
      </div>
    `;

    // ===== IMAGE MODAL =====
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImg");
    const captionText = document.getElementById("caption");
    const closeBtn = modal.querySelector(".close");

    document.querySelectorAll(".report-img").forEach(img => {
      img.addEventListener("click", (e) => {
        e.stopPropagation(); // prevent bubbling
        modal.style.display = "block";
        modalImg.src = img.src;
        captionText.innerText = img.alt || "";
      });
    });

    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      modal.style.display = "none";
    });

    // Clicking outside image closes modal
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.style.display = "none";
    });

    // Prevent clicks on image or caption from closing modal
    modalImg.addEventListener("click", (e) => e.stopPropagation());
    captionText.addEventListener("click", (e) => e.stopPropagation());

  } catch (err) {
    console.error(err);
    container.innerHTML = `<p>เกิดข้อผิดพลาดในการโหลดข้อมูล</p>`;
  }
});
document.addEventListener("DOMContentLoaded", () => {
  // 🔹 Get request ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const requestId = urlParams.get("id");

  console.log("Repair Request ID:", requestId);

  // Example: maybe fetch details using requestId
  // fetch(`/api/requests/${requestId}`)
  //   .then((res) => res.json())
  //   .then((data) => console.log(data));

  // 🔹 When click to go to RepairReportCRS
  const goToCRSBtn = document.getElementById("goToCRS");
  if (goToCRSBtn) {
    goToCRSBtn.addEventListener("click", () => {
      // Pass same requestId to RepairReportCRS.html
      window.location.href = `RepairReportCRS.html?id=${requestId}`;
    });
  }
});