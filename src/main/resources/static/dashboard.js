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

  // ⭐ Sort by updatedAt descending (latest first)
  const sorted = [...requests].sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  );

  sorted.forEach((r) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.title}</td>
      <td>${r.createdAt}</td>
      <td>${r.reporter?.fullName ?? "-"}</td>
      <td>${r.technician}</td>
      <td>${r.category}</td>
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
  try {
    await loadDashboard();         
  } catch (e) {
    console.warn("Backend failed, using mock data");
    renderSummary(summary);
    renderLatestTable(dashboardMock.latestRequests);
  }
});
