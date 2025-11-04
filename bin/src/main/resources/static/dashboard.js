<<<<<<< HEAD
document.addEventListener("DOMContentLoaded", async () => {
  const tableBody = document.querySelector(".repair-table tbody");

  // Fetch all repair requests
  async function fetchReports() {
    try {
      const response = await fetch("/api/requests", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch reports");
      const reports = await response.json();
      renderTable(reports);
    } catch (err) {
      console.error("Error fetching reports:", err);
      tableBody.innerHTML = `<tr><td colspan="7">ไม่สามารถโหลดข้อมูลได้</td></tr>`;
    }
  }

  function renderTable(reports) {
    tableBody.innerHTML = "";
    reports.forEach(report => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${report.id}</td>
        <td>${report.reporter ? report.reporter.fullName : "ไม่ทราบ"}</td>
        <td>${report.location || "-"}</td>
        <td>${report.description || "-"}</td>

        <td>
          <select class="priority-select">
            ${["ปกติ", "ปานกลาง", "เร่งด่วน"].map(level => `
              <option value="${level}" ${report.priority === level ? "selected" : ""}>${level}</option>
            `).join("")}
          </select>
        </td>

        <td>
          <select class="status-select">
            ${["รอดำเนินการ", "กำลังดำเนินการ", "กำลังซ่อม", "เสร็จ", "ซ่อมเสร็จ"].map(status => `
              <option value="${status}" ${report.status === status ? "selected" : ""}>${status}</option>
            `).join("")}
          </select>
        </td>

        <td>
          <button class="update-btn">บันทึก</button>
        </td>
      `;

      // Add event listener for update
      row.querySelector(".update-btn").addEventListener("click", async () => {
        const newPriority = row.querySelector(".priority-select").value;
        const newStatus = row.querySelector(".status-select").value;
        await updateReport(report.id, newStatus, newPriority);
      });

      tableBody.appendChild(row);
    });
  }

  async function updateReport(id, status, priority) {
    try {
      const response = await fetch("/api/requests/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, status, priority })
      });

      if (!response.ok) throw new Error("Failed to update report");

      const updated = await response.json();
      alert(`✅ อัปเดตรายการ ${updated.id} สำเร็จ!`);
      await fetchReports();
    } catch (err) {
      console.error("Update failed:", err);
      alert("❌ อัปเดตไม่สำเร็จ");
    }
  }

  // Initial load
  fetchReports();
=======
const repairList = [
  {
    id: "R001",
    user: "สมชาย ใจดี",
    location: "อาคารเรียนรวม SC",
    detail: "แอร์เสีย ชั้น 2 ห้อง 205",
    urgent: "ปกติ",
    status: "รอดำเนินการ"
  },
  {
    id: "R002",
    user: "วรรยา จันทะคาม",
    location: "หอพักหญิง D",
    detail: "ไฟทางเดินดับ",
    urgent: "ด่วนมาก",
    status: "กำลังซ่อม"
  }
];

// โหลดข้อมูลในตาราง
const table = document.getElementById('repairList');
repairList.forEach((r) => {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${r.id}</td>
    <td>${r.user}</td>
    <td>${r.location}</td>
    <td>${r.detail}</td>
    <td>
      <select>
        <option ${r.urgent === 'ปกติ' ? 'selected' : ''}>ปกติ</option>
        <option ${r.urgent === 'ปานกลาง' ? 'selected' : ''}>ปานกลาง</option>
        <option ${r.urgent === 'ด่วนมาก' ? 'selected' : ''}>ด่วนมาก</option>
      </select>
    </td>
    <td>
      <select>
        <option ${r.status === 'รอดำเนินการ' ? 'selected' : ''}>รอดำเนินการ</option>
        <option ${r.status === 'กำลังซ่อม' ? 'selected' : ''}>กำลังซ่อม</option>
        <option ${r.status === 'ซ่อมเสร็จ' ? 'selected' : ''}>ซ่อมเสร็จ</option>
      </select>
    </td>
    <td><button onclick="updateRepair('${r.id}')">บันทึก</button></td>
  `;
  table.appendChild(row);
});

// ฟังก์ชันเมื่อกดบันทึก
function updateRepair(id) {
  alert(`บันทึกข้อมูลรายการแจ้งซ่อม ${id} เรียบร้อยแล้ว `);
}

// เมื่อคลิกที่แถวในตาราง ให้เปิดหน้า track.html พร้อมส่งข้อมูล
const rows = document.querySelectorAll("tbody tr");

rows.forEach(row => {
  row.addEventListener("click", (e) => {
    // ถ้าคลิกปุ่มลบ ให้ไม่เปิดหน้ารายละเอียด
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
>>>>>>> main
});
