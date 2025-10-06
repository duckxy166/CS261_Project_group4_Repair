const form = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');
const loginBox = document.getElementById('loginBox');
const successBox = document.getElementById('successBox');
const togglePassword = document.getElementById('togglePassword');
const passwordField = document.getElementById('password');
const goHomeBtn = document.getElementById('goHomeBtn');

// แสดง/ซ่อนรหัสผ่าน
togglePassword.addEventListener('click', () => {
  const isPassword = passwordField.getAttribute('type') === 'password';
  passwordField.setAttribute('type', isPassword ? 'text' : 'password');
  togglePassword.classList.toggle('fa-eye');
  togglePassword.classList.toggle('fa-eye-slash');
});

// ตรวจสอบรหัส (mock)
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = passwordField.value.trim();

  if (username === "tuuser" && password === "1234") {
    loginBox.classList.add('hidden');
    successBox.classList.remove('hidden');
  } else {
    errorMsg.classList.remove('hidden');
  }
});

