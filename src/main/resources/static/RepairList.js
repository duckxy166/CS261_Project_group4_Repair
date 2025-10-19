document.addEventListener("DOMContentLoaded", async () => {
  const tableBody = document.querySelector("tbody");

  try {
    const res = await fetch("/api/requests");
    if (!res.ok) throw new Error("Failed to fetch repair list");

    const reports = await res.json();
    console.log("Fetched reports:", reports);

    // ✅ Show only status = "กำลังดำเนินการ" OR "กำลังซ่อม"
    const filtered = reports.filter(
      (r) => r.status === "กำลังดำเนินการ" || r.status === "กำลังซ่อม"
    );

    tableBody.innerHTML = ""; // clear placeholder rows

    filtered.forEach((report) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${new Date(report.createdAt).toLocaleDateString("th-TH")}</td>
        <td>${report.reporter?.fullName || "-"}</td>
        <td>${report.title}</td>
        <td>
          <a href="RepairReport.html?id=${report.id}" class="detail-link">
            รายละเอียดปัญหา <span class="material-icons">search</span>
          </a>
        </td>
        <td>
          ${
            report.status === "กำลังดำเนินการ"
              ? `<button class="accept-btn" data-id="${report.id}">รับงาน</button>`
              : `<span>${report.status}</span>`
          }
        </td>
      `;
      tableBody.appendChild(row);
    });

    // --- Handle “รับงาน” button ---
    document.querySelectorAll(".accept-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const reportId = btn.getAttribute("data-id");
        const confirmAccept = confirm("คุณต้องการรับงานนี้หรือไม่?");
        if (!confirmAccept) return;

        try {
          const response = await fetch(`/api/requests/${reportId}/update-status`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: "กำลังซ่อม",
              technician: "self",
              priority: null,
            }),
          });

          if (response.ok) {
            alert("รับงานเรียบร้อย!");
            window.location.reload();
          } else {
            const msg = await response.text();
            alert("ไม่สามารถรับงานได้: " + msg);
          }
        } catch (err) {
          console.error("Error updating status:", err);
          alert("เกิดข้อผิดพลาดในการรับงาน");
        }
      });
    });
  } catch (error) {
    console.error(error);
    tableBody.innerHTML =
      '<tr><td colspan="5">ไม่สามารถโหลดข้อมูลได้</td></tr>';
  }
});
//menu
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
//logout
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/logout", { method: "GET" });
      if (response.ok) {
        window.location.href = "login.html"; 
      } else {
        alert("ไม่สามารถออกจากระบบได้");
      }
    } catch (err) {
      console.error("Logout error:", err);
      alert("เกิดข้อผิดพลาดในการออกจากระบบ");
    }
  });
}
