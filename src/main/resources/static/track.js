// Menu 
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

//Fetch Track Reports from Backend
const repairList = document.getElementById("repairList");

async function fetchRepairs() {
  try {
    const response = await fetch("/api/requests/user-trackreports", {
      credentials: "include"
    });
    if (!response.ok) throw new Error("Failed to fetch reports");

    const repairs = await response.json();
    renderRepairs(repairs);
  } catch (err) {
    console.error(err);
    repairList.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#888;">ไม่สามารถโหลดข้อมูลได้</td></tr>`;
  }
}

//Render Report
function renderRepairs(repairs) {
  repairList.innerHTML = "";

  if (!repairs || repairs.length === 0) {
    repairList.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#888;">ไม่มีข้อมูลการแจ้งซ่อม</td></tr>`;
    return;
  }

  repairs.forEach((r) => {
    const tr = document.createElement("tr");
    tr.classList.add("clickable-row");
    tr.setAttribute("data-id", r.id);

    tr.innerHTML = `
      <td>${new Date(r.createdAt).toLocaleDateString()}</td>
      <td>${r.reporterName}</td>
      <td>${r.technician || "-"}</td>
      <td>${r.title}</td>
      <td>${r.status}</td>
      <td>
        <button class="icon-btn view"><span class="material-icons">search</span></button>
        ${r.status === "รอดำเนินการ" ? 
          `<button class="icon-btn delete"><span class="material-icons">delete</span></button>` : ""}
      </td>
    `;
    repairList.appendChild(tr);
  });

  attachRowEvents();
}

//row
function attachRowEvents() {
  const modal = document.getElementById("confirmModal");
  const closeModal = document.getElementById("closeModal");
  const cancelModal = document.getElementById("cancelModal");
  const confirmDelete = document.getElementById("confirmDelete");
  let selectedId = null;

  // Open detail
  document.querySelectorAll(".clickable-row").forEach((row) => {
	row.addEventListener("click", (e) => {
	  if (e.target.closest("button")) return;
	  const id = row.getAttribute("data-id");
	  window.location.href = `track_detail.html?id=${id}`;
	});

  });

  // Delete
  document.querySelectorAll(".icon-btn.delete").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const tr = e.target.closest("tr");
      selectedId = tr.getAttribute("data-id");
      modal.classList.add("show");
    });
  });

  // Modal controls
  closeModal.onclick = () => modal.classList.remove("show");
  cancelModal.onclick = () => modal.classList.remove("show");
  window.onclick = (e) => {
    if (e.target === modal) modal.classList.remove("show");
  };

  // Confirm delete
  confirmDelete.onclick = async () => {
    if (!selectedId) return;
    try {
      const response = await fetch(`/api/requests/${selectedId}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!response.ok) throw new Error("ลบรายการไม่สำเร็จ");
      await fetchRepairs();
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการลบรายการ");
    } finally {
      modal.classList.remove("show");
      selectedId = null;
    }
  };
}

//logout
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/logout", {
        method: "GET",
        credentials: "include"
      });
      if (response.ok) {
        window.location.href = "login.html";
      } else {
        alert("ไม่สามารถออกจากระบบได้");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการออกจากระบบ");
    }
  });
}

// Initial Load
fetchRepairs();
