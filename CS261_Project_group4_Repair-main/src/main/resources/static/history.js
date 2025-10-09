// แสดง/ซ่อนเมนูเบอร์เกอร์
const toggleBtn = document.getElementById('menu-toggle');
const menu = document.getElementById('menu-content');
toggleBtn.addEventListener('click', () => menu.classList.toggle('show'));

// Modal การยืนยัน
const deleteButtons = document.querySelectorAll('.delete-btn');
const modal = document.getElementById('confirmModal');
const closeModal = document.getElementById('closeModal');
const cancelModal = document.getElementById('cancelModal');
const confirmDelete = document.getElementById('confirmDelete');
let selectedRow = null;

deleteButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
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