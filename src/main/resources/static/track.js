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

// ===== LOAD REPAIR LIST =====
const repairList = document.getElementById("repairList");

let repairs = JSON.parse(localStorage.getItem("repairs")) || [];

function renderRepairs() {
  repairList.innerHTML = "";

  if (repairs.length === 0) {
    repairList.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#888;">ไม่มีข้อมูลการแจ้งซ่อม</td></tr>`;
    return;
  }

  repairs.forEach((r) => {
    const tr = document.createElement("tr");
    tr.classList.add("clickable-row");
    tr.setAttribute("data-id", r.id);
    tr.innerHTML = `
      <td>${r.date}</td>
      <td>${r.requester}</td>
      <td>${r.technician}</td>
      <td>${r.category}</td>
      <td>${r.status}</td>
      <td>
        <button class="icon-btn view"><span class="material-icons">search</span></button>
        <button class="icon-btn delete"><span class="material-icons">delete</span></button>
      </td>
    `;
    repairList.appendChild(tr);
  });

  attachRowEvents();
}

renderRepairs();

// ===== ROW CLICK -> GO TO DETAIL PAGE =====
function attachRowEvents() {
  document.querySelectorAll(".clickable-row").forEach((row) => {
    row.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;
      const id = row.getAttribute("data-id");
      localStorage.setItem("selectedRepairId", id);
      window.location.href = "track_detail.html";
    });
  });

    // Delete button with modal confirm
  const modal = document.getElementById("confirmModal");
  const closeModal = document.getElementById("closeModal");
  const cancelModal = document.getElementById("cancelModal");
  const confirmDelete = document.getElementById("confirmDelete");
  let selectedId = null;

  document.querySelectorAll(".icon-btn.delete").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const tr = e.target.closest("tr");
      selectedId = parseInt(tr.getAttribute("data-id"));
      modal.classList.add("show");
    });
  });

  // Close modal actions
  closeModal.onclick = () => modal.classList.remove("show");
  cancelModal.onclick = () => modal.classList.remove("show");
  window.onclick = (e) => {
    if (e.target === modal) modal.classList.remove("show");
  };

  // Confirm delete
  confirmDelete.addEventListener("click", () => {
    if (selectedId) {
      repairs = repairs.filter((r) => r.id !== selectedId);
      localStorage.setItem("repairs", JSON.stringify(repairs));
      renderRepairs();
    }
    modal.classList.remove("show");
  });


}
