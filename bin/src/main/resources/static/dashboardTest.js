document.addEventListener("DOMContentLoaded", async () => {
  const tableBody = document.querySelector(".repair-table tbody");

  // --- กำหนดค่าคงที่สำหรับ Dropdowns ---
  // นี่คือรายการสถานะทั้งหมดในระบบ
  // ซึ่งสอดคล้องกับตรรกะที่พบใน dashboard.js (รวมทั้งจาก getStatusChip และ filter)
  const ALL_STATUSES = [
    "รอดำเนินการ",
    "กำลังดำเนินการ",
    "อยู่ระหว่างซ่อม",
    "กำลังตรวจสอบงานซ่อม",
    "ยังไม่ได้ให้คะแนน",
    "สำเร็จ",
    "ยกเลิก"
  ];

  const ALL_PRIORITIES = [
    "ปกติ",
    "ปานกลาง",
    "เร่งด่วน"
  ];
  // -------------------------------------

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

    // Helper function สำหรับสร้าง <option>
    const createOptions = (list, selectedValue) => {
      return list.map(item => `
        <option value="${item}" ${item === selectedValue ? "selected" : ""}>${item}</option>
      `).join("");
    };

    reports.forEach(report => {
      const row = document.createElement("tr");

      // สร้าง HTML ของ options จากค่าคงที่
      const priorityOptions = createOptions(ALL_PRIORITIES, report.priority);
      const statusOptions = createOptions(ALL_STATUSES, report.status);

      row.innerHTML = `
        <td>${report.id}</td>
        <td>${report.reporter ? report.reporter.fullName : "ไม่ทราบ"}</td>
        <td>${report.location || "-"}</td>
        <td>${report.description || "-"}</td>

        <td>
          <select class="priority-select">
            ${priorityOptions}
          </select>
        </td>

        <td>
          <select class="status-select">
            ${statusOptions}
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