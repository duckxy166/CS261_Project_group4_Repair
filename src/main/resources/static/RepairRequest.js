// =========================
// 📝 FORM VALIDATION + SAVE + SUCCESS
// =========================
const form = document.getElementById("requestForm");
const errorMsg = document.getElementById("errorMsg");
const successMessage = document.getElementById("successMessage");

form.addEventListener("submit", function (e) {
  e.preventDefault(); // prevent page reload

  // Collect form values
  const reporterName = document.getElementById("reporterName").value.trim();
  const location = document.getElementById("location").value.trim();
  const category = document.getElementById("category").value.trim();
  const description = document.getElementById("description").value.trim();

  // Validate required fields
  if (!reporterName || !location || !category || !description) {
    errorMsg.style.display = "block";
    errorMsg.textContent = "กรุณากรอกข้อมูลให้ครบถ้วน";

    // Highlight empty fields
    [reporterName, location, category, description].forEach((val, i) => {
      const input = [
        document.getElementById("reporterName"),
        document.getElementById("location"),
        document.getElementById("category"),
        document.getElementById("description"),
      ][i];
      input.style.borderColor = val ? "#D9D9D9" : "#b20838";
    });
    return;
  }

  // Hide error message
  errorMsg.style.display = "none";

  // ✅ Save to localStorage for Track page
  const repairs = JSON.parse(localStorage.getItem("repairs")) || [];
    // Read image if uploaded
  let imageData = "";
  if (imageInput && imageInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      imageData = e.target.result;

      const newRepair = {
        id: Date.now(),
        date: new Date().toLocaleDateString("th-TH"),
        requester: reporterName,
        technician: "ยังไม่ระบุ",
        category: category,
        status: "กำลังดำเนินการ",
        location: location,
        description: description,
        image: imageData, // ✅ store image base64
      };

      repairs.push(newRepair);
      localStorage.setItem("repairs", JSON.stringify(repairs));

      // ✅ Show success message
      form.style.display = "none";
      successMessage.style.display = "flex";
    };
    reader.readAsDataURL(imageInput.files[0]);
    return; // prevent running code below until image is read
  }

  // ✅ if no image uploaded
  const newRepair = {
    id: Date.now(),
    date: new Date().toLocaleDateString("th-TH"),
    requester: reporterName,
    technician: "ยังไม่ระบุ",
    category: category,
    status: "กำลังดำเนินการ",
    location: location,
    description: description,
    image: "", // empty
  };

  repairs.push(newRepair);
  localStorage.setItem("repairs", JSON.stringify(repairs));

  form.style.display = "none";
  successMessage.style.display = "flex";


  repairs.push(newRepair);
  localStorage.setItem("repairs", JSON.stringify(repairs));

  // ✅ Show success animation
  form.style.display = "none";
  successMessage.style.display = "flex";
});

// =========================
// 🧹 CLEAR FORM BUTTON
// =========================
const clearBtn = document.getElementById("clearBtn");
clearBtn.addEventListener("click", () => {
  form.reset();
  errorMsg.style.display = "none";

  // reset input borders
  const inputs = form.querySelectorAll("input, select, textarea");
  inputs.forEach((i) => (i.style.borderColor = "#D9D9D9"));
});

// =========================
// 🖼️ IMAGE PREVIEW
// =========================
const imageInput = document.getElementById("image");
const imgPreview = document.getElementById("imgPreview");
const defaultIcon = document.getElementById("defaultIcon");

if (imageInput) {
  imageInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imgPreview.src = e.target.result;
        imgPreview.style.display = "block";
        defaultIcon.style.display = "none"; // hide placeholder icon
      };
      reader.readAsDataURL(file);
    } else {
      imgPreview.style.display = "none";
      defaultIcon.style.display = "block"; // show icon again if cleared
    }
  });
}

// =========================
// 🍔 FOOTER POPUP MENU
// =========================
const toggleBtn = document.getElementById("menu-toggle");
const menuPopup = document.getElementById("menu-popup");

toggleBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  menuPopup.classList.toggle("show");
});

window.addEventListener("click", (e) => {
  if (!e.target.closest("#menu-popup") && !e.target.closest("#menu-toggle")) {
    menuPopup.classList.remove("show");
  }
});

// =========================
// 🚀 GO TO TRACK PAGE BUTTON (Manual click only)
// =========================
const goTrackBtn = document.getElementById("goTrackBtn");
if (goTrackBtn) {
  goTrackBtn.addEventListener("click", () => {
    window.location.href = "track.html";
  });
}
