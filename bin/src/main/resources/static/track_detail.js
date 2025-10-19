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

// ===== LOAD SELECTED REPAIR =====
const id = parseInt(localStorage.getItem("selectedRepairId"));
let repairs = JSON.parse(localStorage.getItem("repairs")) || [];
const repair = repairs.find((r) => r.id === id);

const container = document.querySelector(".container");
if (repair) {
  container.innerHTML = `
    <p>วันที่แจ้งซ่อม : ${repair.date}</p>
    <p>ชื่อผู้แจ้ง : ${repair.requester}</p>
    <p>ผู้รับผิดชอบ : ${repair.technician}</p>
    <p>ประเภทของงาน : ${repair.category}</p>
    <p>สถานที่ : ${repair.location}</p>
    <p>รายละเอียดงาน : ${repair.description}</p>
    <p>สถานะการซ่อม : ${repair.status} <span class="dot"></span></p>

    <div class="image-box">
        ${
            repair.image
                ? `<img src="${repair.image}" alt="Uploaded" />`
                : `<img src="image/picIcon.png" alt="Pic" class="placeholder">`
        }
    </div>


    <div class="actions">
      <button class="cancel" id="cancelRequest">ยกเลิกการแจ้งซ่อม</button>
      <button class="back" onclick="window.history.back()">ย้อนกลับ</button>
    </div>
  `;
}

// ===== CANCEL REQUEST MODAL =====
const modal = document.getElementById("confirmModal");
const cancelBtn = document.getElementById("cancelRequest");
const closeModal = document.getElementById("closeModal");
const cancelModal = document.getElementById("cancelModal");
const confirmDelete = document.getElementById("confirmDelete");

cancelBtn.addEventListener("click", () => {
  modal.classList.add("show");
});

closeModal.onclick = () => modal.classList.remove("show");
cancelModal.onclick = () => modal.classList.remove("show");

window.onclick = (e) => {
  if (e.target === modal) modal.classList.remove("show");
};

confirmDelete.addEventListener("click", () => {
  repairs = repairs.filter((r) => r.id !== id);
  localStorage.setItem("repairs", JSON.stringify(repairs));
  modal.classList.remove("show");
//   alert("การแจ้งซ่อมถูกยกเลิกเรียบร้อยแล้ว");
  window.location.href = "track.html";
});
