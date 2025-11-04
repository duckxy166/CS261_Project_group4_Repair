const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");
const placeholder = document.getElementById("placeholder");
const statusSelect = document.getElementById("statusSelect");
const statusOptions = document.getElementById("statusOptions");
const btnReport = document.getElementById("btnReport");
const btnCancel = document.getElementById("btnCancel");
const success = document.getElementById("success");


document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const requestId = params.get("id");

  const form = document.getElementById("reportForm");
  const successScreen = document.getElementById("success");

  if (form && requestId) {
    form.action = `/api/files/${requestId}`;
    console.log("Form action set to:", form.action);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // stop page reload

    const formData = new FormData(form);
    const status = document.getElementById("statusSelect").value;

    if (!status) {
      alert("กรุณาเลือกสถานะการซ่อม");
      return;
    }

    try {
      // 1️⃣ Upload file + description
      const uploadRes = await fetch(form.action, {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const msg = await uploadRes.text();
        alert("อัปโหลดไฟล์ไม่สำเร็จ: " + msg);
        return;
      }

      console.log("File uploaded successfully.");

      // 2️⃣ Update status
      const updateRes = await fetch(`/api/requests/${requestId}/update-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: status === "done" ? "เสร็จสมบูรณ์" : "กำลังดำเนินการ",
          technician: "self",
          priority: null,
        }),
      });

      if (!updateRes.ok) {
        const msg = await updateRes.text();
        alert("อัปเดตสถานะไม่สำเร็จ: " + msg);
        return;
      }

      console.log("Status updated successfully.");

      // 3️⃣ Show success screen
      form.style.display = "none";
      successScreen.style.display = "flex";

    } catch (err) {
      console.error("Error:", err);
      alert("เกิดข้อผิดพลาดในการส่งข้อมูล");
    }
  });
});


// แสดงตัวเลือกสถานะเพิ่มเติม
statusSelect.addEventListener("change", (e) => {
  statusOptions.style.display = e.target.value ? "block" : "none";
});

// อัปโหลดรูป/วิดีโอ
fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  preview.innerHTML = "";
  placeholder.style.display = "none";
  preview.style.display = "block";

  if (file.type.startsWith("image/")) {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    preview.appendChild(img);
  } else if (file.type.startsWith("video/")) {
    const vid = document.createElement("video");
    vid.src = URL.createObjectURL(file);
    vid.controls = true;
    preview.appendChild(vid);
  }
});

// ปุ่มรายงาน
btnReport.addEventListener("click", () => {
  success.style.display = "flex";
});

// ปุ่มยกเลิก
btnCancel.addEventListener("click", () => {
  document.getElementById("reportForm").reset();
  preview.innerHTML = "";
  preview.style.display = "none";
  placeholder.style.display = "block";
  statusOptions.style.display = "none";
  success.style.display = "none";
});