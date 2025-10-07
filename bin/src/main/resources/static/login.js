const form = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');
const loginBox = document.getElementById('loginBox');
const successBox = document.getElementById('successBox');
const togglePassword = document.getElementById('togglePassword');
const passwordField = document.getElementById('password');
const goHomeBtn = document.getElementById('goHomeBtn');

togglePassword.addEventListener('click', () => {
  const isPassword = passwordField.getAttribute('type') === 'password';
  passwordField.setAttribute('type', isPassword ? 'text' : 'password');
  togglePassword.classList.toggle('fa-eye');
  togglePassword.classList.toggle('fa-eye-slash');
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = passwordField.value.trim();

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (res.ok) {
      const data = await res.json();
      // แสดง success แล้ว redirect ตาม role
      loginBox.classList.add('hidden');
      successBox.classList.remove('hidden');
      setTimeout(() => {
        if (data.role === 'admin') {
          window.location.href = 'dashboard.html';
        } else {
          window.location.href = 'index.html';
        }
      }, 1200);
    } else {
      errorMsg.classList.remove('hidden');
    }
  } catch (err) {
    errorMsg.classList.remove('hidden');
  }
});