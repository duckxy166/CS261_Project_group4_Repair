// =========================
// 🍔 SIDE MENU TOGGLE
// =========================
const menuButton = document.getElementById("menuButton");
const sideMenu = document.getElementById("sideMenu");

menuButton.addEventListener("click", () => {
  sideMenu.classList.toggle("show");
});

document.addEventListener("click", (e) => {
  if (!sideMenu.contains(e.target) && !menuButton.contains(e.target)) {
    sideMenu.classList.remove("show");
  }
});

// =========================
// 💾 Load stored data
// =========================
window.addEventListener("DOMContentLoaded", () => {
  const data = JSON.parse(localStorage.getItem("selectedRequest"));
  if (!data) return;

  document.getElementById("req-date").textContent = data.date;
  document.getElementById("req-name").textContent = data.name;
  document.getElementById("req-type").textContent = data.type;
  document.getElementById("req-detail").textContent = data.detail;
  document.getElementById("req-status").textContent = data.status;
});

// ========== CANCEL REQUEST MODAL ==========
const cancelBtn = document.querySelector(".main-cancel-btn");
const modal = document.getElementById("cancelModal");
const closeModal = document.getElementById("closeModal");
const cancelClose = document.getElementById("cancelClose");
const confirmCancel = document.getElementById("confirmCancel");

// open modal
cancelBtn.addEventListener("click", () => {
  modal.style.display = "flex";
});

// close modal
closeModal.addEventListener("click", () => {
  modal.style.display = "none";
});

cancelClose.addEventListener("click", () => {
  modal.style.display = "none";
});

// click outside to close
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

// ✅ confirm action (delete data + redirect)
confirmCancel.addEventListener("click", () => {
  const data = JSON.parse(localStorage.getItem("selectedRequest"));

  // remove selected request
  if (data) {
    let history = JSON.parse(localStorage.getItem("repairHistory")) || [];
    history = history.filter(
      item =>
        !(item.date === data.date && item.detail === data.detail && item.name === data.name)
    );
    localStorage.setItem("repairHistory", JSON.stringify(history));
  }

  // clear the selected one
  localStorage.removeItem("selectedRequest");

  modal.style.display = "none";
  alert("✅ ยกเลิกการแจ้งซ่อมสำเร็จ");

  // go back to history
  window.location.href = "history.html";
});
