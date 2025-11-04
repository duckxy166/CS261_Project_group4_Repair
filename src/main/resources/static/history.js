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

//fetch /api/requests/user-reports
async function loadUserReports() {
  const tbody = document.querySelector("table tbody");
  try {
    const response = await fetch("/api/requests/user-reports", {
      method: "GET",
      credentials: "include", // include session cookie
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const reports = await response.json();

    // Filter
    const finishedReports = reports.filter(r => r.status === "ซ่อมเสร็จ");

    tbody.innerHTML = "";

    if (finishedReports.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">ไม่มีประวัติการซ่อมเสร็จ</td></tr>`;
      return;
    }

    finishedReports.forEach((r) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${r.createdAt ? new Date(r.createdAt).toLocaleDateString("th-TH") : "-"}</td>
        <td>${r.reporter?.fullName || "-"}</td>
        <td>${r.title || "-"}</td>
        <td>${r.description || "-"}</td>
        <td>${r.status}</td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error("Error loading reports:", err);
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:red;">เกิดข้อผิดพลาดในการโหลดข้อมูล</td></tr>`;
  }
}

// init
loadUserReports();

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
