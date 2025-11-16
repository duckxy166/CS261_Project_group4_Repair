window.addEventListener('pageshow', function(event) {
  // event.persisted จะเป็น true เมื่อหน้าเว็บถูกดึงมาจาก bfcache (เช่นการกด Back)
  if (event.persisted) {
    console.log('Page loaded from bfcache. Forcing reload from server...');
    // สั่งให้โหลดหน้าเว็บใหม่จากเซิร์ฟเวอร์
    window.location.reload(); 
  }
});

/**************************************************
 * Status chip helper
 **************************************************/
function getStatusChip(status) {
  switch (status) {
    case "รอดำเนินการ":
      return '<span class="status-chip status-pending">รอดำเนินการ</span>';
    case "กำลังดำเนินการ":
      return '<span class="status-chip status-inprogress">กำลังดำเนินการ</span>';
    case "อยู่ระหว่างซ่อม":
      return '<span class="status-chip status-waiting">อยู่ระหว่างซ่อม</span>';
    case "กำลังตรวจสอบงานซ่อม":
      return '<span class="status-chip status-checking">กำลังตรวจสอบงานซ่อม</span>';
    case "สำเร็จ":
      return '<span class="status-chip status-success">สำเร็จ</span>';
    default:
      return "";
  }
}

/**************************************************
 * Render summary cards
 **************************************************/
function renderSummary(data) {
  document.getElementById("totalJobs").textContent = data.total;
  document.getElementById("completedJobs").textContent = data.completed;
  document.getElementById("pendingJobs").textContent = data.notCompleted;
}

/**************************************************
 * Render latest table
 **************************************************/
function renderLatestTable(requests) {
  const tbody = document.querySelector("#latestTable tbody");
  tbody.innerHTML = "";

  // 1. ⭐ กรองสถานะ "สำเร็จ", "ยังไม่ได้ให้คะแนน" และ "ยกเลิก" ออก
  const filtered = requests.filter(
    (r) =>
      r.status !== "สำเร็จ" &&
      r.status !== "ยังไม่ได้ให้คะแนน" && // <--- แก้ไขตามที่แจ้งครับ
      r.status !== "ยกเลิก"
  );

  // 2. เรียงลำดับตาม updatedAt (ล่าสุดก่อน)
  const sorted = filtered.sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  );

  // 3. จำกัดให้แสดงผล 10 รายการล่าสุด
  const latest10 = sorted.slice(0, 10);

  // 4. วนลูปเพื่อสร้างแถวในตาราง
  latest10.forEach((r) => {
    const tr = document.createElement("tr");

    // 5. ทำให้แถวคลิกได้ และไปยังหน้า RequestControl.html
    tr.style.cursor = "pointer";
    tr.onclick = () => {
      window.location.href = `RequestControl.html?id=${r.id}`;
    };

    // 6. ตัดข้อความ Title ให้สั้นลง (ไม่เกิน 25 ตัวอักษร)
    const title = r.title ?? "";
    const shortTitle =
      title.length > 25 ? title.substring(0, 25) + "..." : title;

    // 7. ตัดนามสกุลผู้แจ้ง (แสดงเฉพาะชื่อ)
    const fullName = r.reporter?.fullName ?? "-";
    const displayName = fullName.split(" ")[0]; // เอาเฉพาะส่วนแรกของชื่อ

    // 8. จัดรูปแบบวันที่ (YYYY-MM-DD)
    const shortDate = r.createdAt ? r.createdAt.split("T")[0] : "-";

    // 9. สร้าง HTML ของแถว
    tr.innerHTML = `
      <td>${shortTitle}</td>
      <td>${shortDate}</td>
      <td>${displayName}</td>
      <td>${r.technician ?? "-"}</td>
      <td>${r.category ?? "-"}</td>
      <td>${getStatusChip(r.status)}</td>
    `;
    tbody.appendChild(tr);
  });
}
/**************************************************
 * Load data from backend
 **************************************************/
async function loadDashboard() {
  const res = await fetch("/api/requests");
  const reports = await res.json();

  // Compute summary
  const total = reports.length;
  const completed = reports.filter(r => r.status === "สำเร็จ").length;
  const notCompleted = reports.filter(
    r => r.status !== "สำเร็จ" && r.status !== "ยกเลิก"
  ).length;

  const summary = { total, completed, notCompleted };
  renderSummary(summary);

  // ⭐ Show ALL RepairRequest in the table
  renderLatestTable(reports);
}


/**************************************************
 * Startup
 **************************************************/
document.addEventListener("DOMContentLoaded", async () => {
	(async () => {
	      try {
	          const resp = await fetch('/api/users/current');
	          if (resp.ok) {
	              const user = await resp.json();
	              
	              const nameEl = document.getElementById('currentUserName'); 
	              if (nameEl && user && user.fullName) {
	                  nameEl.textContent = user.fullName;
	              }
	              
	              const emailEl = document.getElementById('currentUserEmail'); 
	              if (emailEl && user && user.email) {
	                  emailEl.textContent = user.email;
	              }

	          } else if (resp.status === 401 || resp.status === 403) {
	              alert('เซสชั่นหมดอายุ กรุณาเข้าสู่ระบบใหม่');
	              window.location.href = 'login.html?session_expired=true';
	          } else {
	              console.warn('ไม่สามารถตรวจสอบผู้ใช้ปัจจุบันได้:', resp.status);
	          }
	      } catch (err) {
	          console.error('เกิดข้อผิดพลาดระหว่างตรวจสอบผู้ใช้:', err);
	      }
	  })();

	  const logoutBtn = document.getElementById('logoutBtn');
	  if (logoutBtn) {
	      logoutBtn.addEventListener('click', async (e) => {
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
	
	try {
    await loadDashboard();         
  } catch (e) {
    console.warn("Backend failed, using mock data");
    renderSummary(summary);
    renderLatestTable(dashboardMock.latestRequests);
  }
});
