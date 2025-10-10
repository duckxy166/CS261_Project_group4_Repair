// --------------------------
// 🍔 แสดง / ซ่อน เมนูเบอร์เกอร์
// --------------------------
const toggleBtn = document.getElementById('menu-toggle');
const menu = document.getElementById('menu-content');
toggleBtn.addEventListener('click', () => menu.classList.toggle('show'));

// --------------------------
// 🗑 Modal การยืนยันการลบ
// --------------------------
const deleteButtons = document.querySelectorAll('.delete-btn');
const modal = document.getElementById('confirmModal');
const closeModal = document.getElementById('closeModal');
const cancelModal = document.getElementById('cancelModal');
const confirmDelete = document.getElementById('confirmDelete');
let selectedRow = null;

deleteButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation(); // ✅ ป้องกันการคลิกแถวพร้อมกัน
    selectedRow = e.target.closest('tr');
    modal.style.display = 'flex';
  });
});

const close = () => {
  modal.style.display = 'none';
  selectedRow = null;
};

closeModal.onclick = close;
cancelModal.onclick = close;
window.onclick = (e) => {
  if (e.target === modal) close();
};

confirmDelete.addEventListener('click', () => {
  if (selectedRow) selectedRow.remove();
  close();
});

// --------------------------
// 📄 คลิกแถวเพื่อเปิดหน้า track.html
// --------------------------
const rows = document.querySelectorAll("tbody tr");

rows.forEach(row => {
  row.addEventListener("click", (e) => {
    // ถ้าคลิกที่ปุ่มลบให้ข้าม
    if (e.target.closest(".delete-btn")) return;

    const cells = row.querySelectorAll("td");
    const requestData = {
      date: cells[0].innerText,
      name: cells[1].innerText,
      type: cells[2].innerText,
      detail: cells[3].innerText,
      status: cells[4].innerText
    };

    // เก็บข้อมูลใน localStorage
    localStorage.setItem("selectedRequest", JSON.stringify(requestData));

    // เปิดหน้า track.html
    window.location.href = "track.html";
  });
});
