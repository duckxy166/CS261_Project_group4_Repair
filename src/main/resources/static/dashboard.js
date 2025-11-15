/**************************************************
 * MOCK DATA (you can replace with backend later)
 **************************************************/
const dashboardMock = {
  total: 278,
  completed: 131,
  notCompleted: 147,
  latestRequests: [
    {
      id: 1,
      title: "ไฟฟ้าดับ",
      date: "03/12/2025",
      reporter: "สมชาย",
      technician: "-",
      category: "ไฟฟ้า",
      status: "pending" // รอดำเนินการ
    },
    {
      id: 2,
      title: "น้ำไม่ไหล",
      date: "03/12/2025",
      reporter: "ใจดี",
      technician: "ช่างธนกฤต",
      category: "ประปา",
      status: "inprogress" // กำลังดำเนินการ
    },
    {
      id: 3,
      title: "โต๊ะหัก",
      date: "03/12/2025",
      reporter: "พิเชษฐ์",
      technician: "ช่างอดิศร",
      category: "เฟอร์นิเจอร์",
      status: "waiting" // อยู่ระหว่างซ่อม
    },
    {
      id: 4,
      title: "ประตูเสีย",
      date: "03/12/2025",
      reporter: "เปมิกา",
      technician: "ช่างวีรฉัต",
      category: "ประตู/ล็อก",
      status: "checking" // กำลังตรวจสอบงานซ่อม
    }
  ]
};

/**************************************************
 * Status chip helper
 **************************************************/
function getStatusChip(status) {
  switch (status) {
    case "pending":
      return '<span class="status-chip status-pending">รอดำเนินการ</span>';
    case "inprogress":
      return '<span class="status-chip status-inprogress">กำลังดำเนินการ</span>';
    case "waiting":
      return '<span class="status-chip status-waiting">อยู่ระหว่างซ่อม</span>';
    case "checking":
      return '<span class="status-chip status-checking">กำลังตรวจสอบงานซ่อม</span>';
    case "success":
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

  requests.forEach((r) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.title}</td>
      <td>${r.date}</td>
      <td>${r.reporter}</td>
      <td>${r.technician}</td>
      <td>${r.category}</td>
      <td>${getStatusChip(r.status)}</td>
    `;
    tbody.appendChild(tr);
  });
}

/**************************************************
 * Later: load data from backend instead of mock
 **************************************************/
// async function loadDashboard() {
//   const res = await fetch('/api/dashboard');
//   const data = await res.json();
//   renderSummary(data);
//   renderLatestTable(data.latestRequests);
// }

document.addEventListener("DOMContentLoaded", () => {
  // for now use mock
  renderSummary(dashboardMock);
  renderLatestTable(dashboardMock.latestRequests);

  // when backend ready:
  // loadDashboard();
});
