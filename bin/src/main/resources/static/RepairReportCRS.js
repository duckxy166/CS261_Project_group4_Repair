const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");
const placeholder = document.getElementById("placeholder");
const statusSelect = document.getElementById("statusSelect");
const statusOptions = document.getElementById("statusOptions");
const btnReport = document.getElementById("btnReport");
const btnCancel = document.getElementById("btnCancel");
const success = document.getElementById("success");

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