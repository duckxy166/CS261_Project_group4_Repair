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

form.addEventListener("submit", (event) => {
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

    showMessage("ขอบคุณสำหรับความคิดเห็นของคุณ!", "success");

    // small delay so user can see the success message before redirect
    setTimeout(() => {
        window.location.href = "history.html"; // redirect to history page
    }, 1000);

});

updateStars(currentRating);
