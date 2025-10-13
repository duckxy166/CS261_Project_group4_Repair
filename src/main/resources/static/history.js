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

// ===== DELETE CONFIRMATION =====
const deleteButtons = document.querySelectorAll(".delete-btn");
const modal = document.getElementById("confirmModal");
const closeModal = document.getElementById("closeModal");
const cancelModal = document.getElementById("cancelModal");
const confirmDelete = document.getElementById("confirmDelete");
let selectedRow = null;

// When clicking bin icon
deleteButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    selectedRow = e.target.closest("tr"); // get that row
    modal.classList.add("show");
  });
});

// Close modal
closeModal.onclick = () => modal.classList.remove("show");
cancelModal.onclick = () => modal.classList.remove("show");
window.onclick = (e) => {
  if (e.target === modal) modal.classList.remove("show");
};

// Confirm delete
confirmDelete.addEventListener("click", () => {
  if (selectedRow) selectedRow.remove();
  modal.classList.remove("show");
});

