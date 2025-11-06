/* === COMMON SCRIPT === */
/* โค้ดส่วนกลางที่ใช้ในทุกหน้า (เช่น กันย้อนกลับ, ปุ่ม Log out) */

window.addEventListener('pageshow', function(event) {

  if (event.persisted) {
    console.log('Page loaded from bfcache. Forcing reload from server...');

    window.location.reload(); 
  }
});

document.addEventListener('DOMContentLoaded', function() {
  
  // --- โค้ดปุ่ม Log out ---
  // (ย้ายมาจาก RepairRequest.js)
  const logoutBtn = document.getElementById('logoutBtn'); 
  if (logoutBtn) {
      logoutBtn.addEventListener('click', async function(e) {
          e.preventDefault();
          try {
              const response = await fetch('/api/logout', { method: 'POST' });
              if (response.ok || response.status === 401 || response.status === 403) {
                  window.location.href = 'login.html?logout=true';
              } else {
                  alert('ไม่สามารถออกจากระบบได้: ' + response.status);
              }
          } catch (err) {
              console.error('Logout error:', err);
			  
              window.location.href = 'login.html?logout_error=true';
          }
      });
  }

});