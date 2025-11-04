<<<<<<< HEAD
//menu
=======
// ===== MENU TOGGLE =====
>>>>>>> main
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

<<<<<<< HEAD
//fetch /api/requests/user-reports
=======
// ===== FETCH USER REPORTS =====
>>>>>>> main
async function loadUserReports() {
  const tbody = document.querySelector("table tbody");
  try {
    const response = await fetch("/api/requests/user-reports", {
      method: "GET",
      credentials: "include", // include session cookie
    });

<<<<<<< HEAD
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
=======
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reports = await response.json();
    tbody.innerHTML = ""; // clear table rows

    if (reports.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">ไม่มีประวัติการแจ้งซ่อม</td></tr>`;
      return;
    }

    reports.forEach((r) => {
>>>>>>> main
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${r.createdAt ? new Date(r.createdAt).toLocaleDateString("th-TH") : "-"}</td>
        <td>${r.reporter?.fullName || "-"}</td>
        <td>${r.title || "-"}</td>
        <td>${r.description || "-"}</td>
<<<<<<< HEAD
        <td>${r.status}</td>
=======
        <td>${r.status || "กำลังดำเนินการ"}</td>
        <td>
          <button class="delete-btn" data-id="${r.id}">
            <span class="material-icons">delete</span>
          </button>
        </td>
>>>>>>> main
      `;
      tbody.appendChild(tr);
    });

<<<<<<< HEAD
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
=======
    attachDeleteEvents(); // bind delete buttons
  } catch (err) {
    console.error("Error loading reports:", err);
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:red;">เกิดข้อผิดพลาดในการโหลดข้อมูล</td></tr>`;
  }
}

// ===== DELETE CONFIRMATION =====
const modal = document.getElementById("confirmModal");
const closeModal = document.getElementById("closeModal");
const cancelModal = document.getElementById("cancelModal");
const confirmDelete = document.getElementById("confirmDelete");
let selectedReportId = null;

function attachDeleteEvents() {
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      selectedReportId = btn.dataset.id;
      modal.classList.add("show");
    });
  });
}

// close modal
closeModal.onclick = () => modal.classList.remove("show");
cancelModal.onclick = () => modal.classList.remove("show");
window.onclick = (e) => {
  if (e.target === modal) modal.classList.remove("show");
};

// confirm delete
confirmDelete.addEventListener("click", async () => {
  if (!selectedReportId) return;

  try {
    const response = await fetch(`/api/requests/${selectedReportId}`, { // updated path
      method: "DELETE",
      credentials: "include",
    });

    if (response.ok) {
      modal.classList.remove("show");
      await loadUserReports(); // refresh table after delete
    } else {
      console.error("Failed to delete report:", response.status);
    }
  } catch (err) {
    console.error("Error deleting report:", err);
  }
});

// ===== INIT =====
loadUserReports();
>>>>>>> main
