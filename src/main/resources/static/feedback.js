const starButtons = Array.from(document.querySelectorAll(".star-button"));
const ratingOutput = document.getElementById("rating-output");
const form = document.querySelector(".feedback-form");
const messageBox = document.getElementById("form-message");
const recommendationInput = document.getElementById("recommendation-input");
const characterCount = document.getElementById("recommendation-help");

let currentRating = 0;
const ratingTexts = {
    0: "ยังไม่ได้เลือกคะแนน",
    1: "1 ดาว · ควรปรับปรุง",
    2: "2 ดาว · ยังไม่ค่อยพอใจ",
    3: "3 ดาว · พอใช้ได้",
    4: "4 ดาว · ดีมาก",
    5: "5 ดาว · ยอดเยี่ยม!"
};

function updateStars(rating) {
    starButtons.forEach((button) => {
        const value = Number(button.dataset.value);
        const isActive = value <= rating;
        button.dataset.active = isActive ? "true" : "false";
        button.setAttribute("aria-checked", isActive && value === rating ? "true" : "false");
    });
    ratingOutput.textContent = ratingTexts[rating];
}

function showMessage(text, type = "success") {
    messageBox.textContent = text;
    messageBox.className = `form-message ${type}`;
}

starButtons.forEach((button) => {
    const value = Number(button.dataset.value);

    // When clicked — set rating
    button.addEventListener("click", () => {
        currentRating = value;
        updateStars(currentRating);
        showMessage("", "");
    });

    // When hovering — preview stars
    button.addEventListener("mouseenter", () => {
        updateStars(value);
    });

    // When leaving — return to actual rating
    button.addEventListener("mouseleave", () => {
        updateStars(currentRating);
    });

    // Keyboard support (Enter or Space)
    button.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            button.click();
        }
    });
});


recommendationInput.addEventListener("input", () => {
    const remaining = 500 - recommendationInput.value.length;
    characterCount.textContent = `เหลือ ${remaining} ตัวอักษร`;
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!currentRating) {
        showMessage("กรุณาเลือกคะแนนก่อนส่ง", "error");
        return;
    }

    if (!recommendationInput.value.trim()) {
        showMessage("กรุณาเขียนข้อเสนอแนะ", "error");
        recommendationInput.focus();
        return;
    }

	const feedbackData = {
	        rating: currentRating,
	        recommendation: recommendationInput.value.trim()
	    };

	    try {
	        const response = await fetch("http://localhost:8080/api/feedback/submit", {
	            method: "POST",
	            headers: {
	                "Content-Type": "application/json"
	            },
	            body: JSON.stringify(feedbackData)
	        });

	        if (response.ok) {
	            showMessage("ขอบคุณสำหรับความคิดเห็นของคุณ!", "success");
				// small delay so user can see the success message before redirect
				setTimeout(() => {
	                window.location.href = "history.html";
	            }, 1000);
	        } else {
	            showMessage("เกิดข้อผิดพลาดในการส่งข้อมูล", "error");
	        }
	    } catch (error) {
	        console.error(error);
	        showMessage("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้", "error");
	    }

});
// 🟢 ตั้งค่าดาวเริ่มต้นให้เป็น “ยังไม่ได้เลือกคะแนน”
updateStars(currentRating);

// 🟣 โหลดหมายเลขฟอร์ม (ID) จาก backend
const formNumber = document.getElementById("form-number");

async function loadFormNumber() {
    try {
        const response = await fetch("http://localhost:8080/api/feedback/next-id");
        if (!response.ok) throw new Error("โหลดหมายเลขฟอร์มไม่สำเร็จ");
        const nextId = await response.text(); // รับหมายเลขเป็นข้อความ
        formNumber.textContent = `แบบฟอร์มเสนอแนะลำดับที่ ${nextId}`;
    } catch (error) {
        console.error(error);
        formNumber.textContent = "ไม่สามารถโหลดหมายเลขฟอร์มได้";
    }
}

loadFormNumber(); // เรียกตอนเปิดหน้า

