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
});
