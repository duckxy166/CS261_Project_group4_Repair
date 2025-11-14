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
            ${["รอดำเนินการ", "กำลังดำเนินการ", "อยู่ระหว่างซ่อม", "กำลังตรวจสอบงานซ่อม", "ยังไม่ให้คะแนน" , "สำเร็จ", "ยกเลิก"].map(status => `
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
});
