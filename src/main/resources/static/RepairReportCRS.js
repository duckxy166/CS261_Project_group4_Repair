const form = document.querySelector("form");
const card = document.getElementById("card");
const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");
const placeholder = document.getElementById("placeholder");
const statusSelect = document.getElementById("statusSelect");
const btnReport = document.getElementById("btnReport");
const btnCancel = document.getElementById("btnCancel");
const success = document.getElementById("success");

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

// ส่งฟอร์มไป backend
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const actionUrl = form.action; // เช่น /api/files/7

  try {
    const res = await fetch(actionUrl, {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      // ✅ แสดงหน้าสำเร็จ
      card.style.display = "none";
      success.style.display = "flex";
    } else {
      const errText = await res.text();
      alert("❌ การอัปโหลดล้มเหลว: " + errText);
    }
  } catch (error) {
    console.error("Upload error:", error);
    alert("⚠️ เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
  }
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

// =========================
// 📱 เมนูด้านล่าง (Toggle)
// =========================
const menuToggle = document.getElementById("menu-toggle");
const menuPopup = document.getElementById("menu-popup");

menuToggle.addEventListener("click", () => {
  menuPopup.classList.toggle("show");
});