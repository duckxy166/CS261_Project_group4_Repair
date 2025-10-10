// =========================
// 🟥 HEADER + FOOTER BEHAVIOR
// =========================
const header = document.querySelector('header');
const footer = document.querySelector('.footer-band');

let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.scrollY;

  if (currentScroll > lastScroll && currentScroll > 50) {
    // scroll down → hide header
    header.classList.add('hide');
    footer.classList.add('show');
  } else {
    // scroll up → show header
    header.classList.remove('hide');
    footer.classList.remove('show');
  }

  lastScroll = currentScroll;
});


// =========================
// 🍔 SIDE MENU TOGGLE
// =========================
const menuButton = document.getElementById("menuButton");
const sideMenu = document.getElementById("sideMenu");

menuButton.addEventListener("click", () => {
  sideMenu.classList.toggle("show");
});

// Hide menu when clicking outside
document.addEventListener("click", (e) => {
  if (!sideMenu.contains(e.target) && !menuButton.contains(e.target)) {
    sideMenu.classList.remove("show");
  }
});


// =========================
// 📝 FORM VALIDATION + SUCCESS MESSAGE
// =========================
const form = document.getElementById("requestForm");
const errorMsg = document.getElementById("errorMsg");
const successMessage = document.getElementById("successMessage");

form.addEventListener("submit", function (e) {
  e.preventDefault(); // stop normal submit

  // Get form field values
  const reporterName = document.getElementById("reporterName").value.trim();
  const location = document.getElementById("location").value.trim();
  const category = document.getElementById("category").value.trim();
  const description = document.getElementById("description").value.trim();

  // Validate required fields
  if (!reporterName || !location || !category || !description) {
    errorMsg.style.display = "block";
    errorMsg.textContent = "กรุณากรอกข้อมูลให้ครบถ้วน";

    // highlight empty fields
    [reporterName, location, category, description].forEach((val, i) => {
      const input = [ 
        document.getElementById("reporterName"),
        document.getElementById("location"),
        document.getElementById("category"),
        document.getElementById("description")
      ][i];
      input.style.borderColor = val ? "#D9D9D9" : "#b20838";
    });
    return;
  }

  // Hide error and form, show success message
  errorMsg.style.display = "none";
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
  inputs.forEach(i => i.style.borderColor = "#D9D9D9");
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
        defaultIcon.style.display = "none"; // hide the placeholder icon
      };
      reader.readAsDataURL(file);
    } else {
      imgPreview.style.display = "none";
      defaultIcon.style.display = "block"; // show icon again if no file
    }
  });
}

