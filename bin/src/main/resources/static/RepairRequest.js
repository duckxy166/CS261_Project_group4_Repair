// =========================
<<<<<<< HEAD
// 🚀 Fetch Current User on Page Load
=======
// 🚀 FETCH CURRENT USER ON PAGE LOAD
>>>>>>> main
// =========================
document.addEventListener("DOMContentLoaded", async () => {
  const reporterNameInput = document.getElementById("reporterName");

  try {
    // 1. เรียก API ที่เราสร้างขึ้นใน Backend
<<<<<<< HEAD
    const response = await fetch("/api/users/current"); 
	// 2. ตรวจสอบว่าการเรียกสำเร็จหรือไม่
    if (response.ok) {
      const user = await response.json(); // แปลงข้อมูล JSON เป็น object
	  // 3. นำชื่อเต็ม (fullName) ของผู้ใช้ไปใส่ในช่อง input
      reporterNameInput.value = user.fullName; 
    } else {
	  // ถ้าไม่สำเร็จ (เช่น session หมดอายุ หรือยังไม่ได้ login)
      console.error("User not authenticated");
	  // อาจจะ redirect ไปหน้า login
=======
    const response = await fetch("/api/users/current");

    // 2. ตรวจสอบว่าการเรียกสำเร็จหรือไม่
    if (response.ok) {
      const user = await response.json(); // แปลงข้อมูล JSON เป็น object
      // 3. นำชื่อเต็ม (fullName) ของผู้ใช้ไปใส่ในช่อง input
      reporterNameInput.value = user.fullName;
    } else {
      // ถ้าไม่สำเร็จ (เช่น session หมดอายุ หรือยังไม่ได้ login)
      console.error("User not authenticated");
      // อาจจะ redirect ไปหน้า login
>>>>>>> main
      alert("กรุณาเข้าสู่ระบบก่อนทำการแจ้งซ่อม");
      window.location.href = "login.html"; // เปลี่ยนเป็นหน้า login ของคุณ
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    reporterNameInput.value = "ไม่สามารถโหลดข้อมูลผู้ใช้ได้";
  }
});

// =========================
<<<<<<< HEAD
// 📝 Form Submission & Validation
=======
// 📝 FORM VALIDATION + SAVE + SUCCESS
>>>>>>> main
// =========================
const form = document.getElementById("requestForm");
const errorMsg = document.getElementById("errorMsg");
const successMessage = document.getElementById("successMessage");
<<<<<<< HEAD
const imageInput = document.getElementById("image");

form.addEventListener("submit", async function (e) {
  e.preventDefault(); // Prevent page reload

  // 🔹 Collect form values
  const reporterName = document.getElementById("reporterName").value.trim();
  const location = document.getElementById("location").value.trim();
  const category = document.getElementById("category").value.trim();
  const description = document.getElementById("description").value.trim();

  // 🔹 Validate required fields
  if (!reporterName || !location || !category || !description) {
    errorMsg.style.display = "block";
    errorMsg.textContent = "กรุณากรอกข้อมูลให้ครบถ้วน";
    return;
  }
  errorMsg.style.display = "none";

  // 🔹 Prepare repair request data to send to backend
  const repairData = {
    title: category,
    description: description,
    priority: "ปกติ", 
	location: location
  };

  try {
    // =========================
    //  POST RepairRequest to backend
    // =========================
    const response = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(repairData)
    });

    if (!response.ok) throw new Error("Failed to create repair request");

    const createdRequest = await response.json(); // Get new request data including `id`
    const requestId = createdRequest.id; // Store requestId to associate attachments

    // =========================
    // 2️⃣ Upload image (attachment) if provided
    // =========================
    if (imageInput && imageInput.files.length > 0) {
      const formData = new FormData();
      formData.append("file", imageInput.files[0]); // Add file to FormData
	  formData.append("description", " ")
	  
      const fileResp = await fetch(`/api/files/${requestId}`, {
        method: "POST",
        body: formData
      });

      if (!fileResp.ok) throw new Error("Failed to upload attachment");
    }

    // =========================
    // 3️⃣ Show success message
    // =========================
    form.style.display = "none";
    successMessage.style.display = "flex";

  } catch (err) {
    console.error(err);
    errorMsg.textContent = "ไม่สามารถส่งคำขอได้: " + err.message;
    errorMsg.style.display = "block";
  }
});

// Image Preview
=======

form.addEventListener("submit", async function (e) {
  e.preventDefault(); // prevent page reload

  // Collect form values
  const title = document.getElementById("category").value.trim() + " - " + document.getElementById("location").value.trim();
  const description = document.getElementById("description").value.trim();
  const priority = "Normal";
  const reporterName = document.getElementById("reporterName").value.trim();
  const location = document.getElementById("location").value.trim();
  const category = document.getElementById("category").value.trim();
  

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
    reader.onload = async function (e) {
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
	  
	  // 🌐 ส่งข้อมูลไปยัง Backend
	       const repairData = {
	         title: category,
	         description: description,
	         priority: "normal" // ปรับได้ตามต้องการ
	       };

	       try {
	         const response = await fetch('/api/requests', {
	           method: 'POST',
	           headers: {
	             'Content-Type': 'application/json'
	           },
	           body: JSON.stringify(repairData)
	         });

	         if (response.ok) {
	           // ✅ Show success message
	           form.style.display = "none";
	           successMessage.style.display = "flex";
	         } else {
	           // กรณี Server ตอบกลับมาว่ามีปัญหา
	           const errorData = await response.json();
	           errorMsg.textContent = "เกิดข้อผิดพลาด: " + (errorData.message || "ไม่สามารถส่งคำขอได้");
	           errorMsg.style.display = "block";
	         }
	       } catch (error) {
	         // กรณี Network Error
	         console.error("Fetch Error:", error);
	         errorMsg.textContent = "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้";
	         errorMsg.style.display = "block";
	       }
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

  // ✅ Show success animation
  form.style.display = "none";
  successMessage.style.display = "flex";
  
  // 🌐 ส่งข้อมูลไปยัง Backend (no image)
    const repairData = {
      title: category,
      description: description,
      priority: "normal"
    };

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(repairData)
      });

      if (response.ok) {
        // ✅ Show success message
        form.style.display = "none";
        successMessage.style.display = "flex";
      } else {
        // กรณี Server ตอบกลับมาว่ามีปัญหา
        const errorData = await response.json();
        errorMsg.textContent = "เกิดข้อผิดพลาด: " + (errorData.message || "ไม่สามารถส่งคำขอได้");
        errorMsg.style.display = "block";
      }
    } catch (error) {
      // กรณี Network Error
      console.error("Fetch Error:", error);
      errorMsg.textContent = "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้";
      errorMsg.style.display = "block";
    }
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
>>>>>>> main
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

<<<<<<< HEAD
// Clear Form Button
const clearBtn = document.getElementById("clearBtn");
clearBtn.addEventListener("click", () => {
  form.reset();
  errorMsg.style.display = "none";
  const inputs = form.querySelectorAll("input, select, textarea");
  inputs.forEach((i) => (i.style.borderColor = "#D9D9D9"));
});

//  Footer Popup Menu
=======
// =========================
// 🍔 FOOTER POPUP MENU
// =========================
>>>>>>> main
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

<<<<<<< HEAD
// Go to Track Page Button
=======
// =========================
// 🚀 GO TO TRACK PAGE BUTTON (Manual click only)
// =========================
>>>>>>> main
const goTrackBtn = document.getElementById("goTrackBtn");
if (goTrackBtn) {
  goTrackBtn.addEventListener("click", () => {
    window.location.href = "track.html";
  });
<<<<<<< HEAD
}
//logout
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/logout", { method: "GET" });
      if (response.ok) {
        window.location.href = "login.html"; 
      } else {
        alert("ไม่สามารถออกจากระบบได้");
      }
    } catch (err) {
      console.error("Logout error:", err);
      alert("เกิดข้อผิดพลาดในการออกจากระบบ");
    }
  });
}

=======
}
>>>>>>> main
