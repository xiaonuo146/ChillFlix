
import { getMovieDetails } from "../../../js/api.js";

// ======================================
// 1. LẤY THÔNG TIN TỪ URL
// ======================================
const params = new URLSearchParams(window.location.search);

const movieId = params.get("movieId") || "693134";
const dateParam = params.get("date");
const roomParam = params.get("roomType") || "couple";

// ======================================
// 2. DỮ LIỆU PHÒNG MẪU
// ======================================
const roomPrices = {
    couple: 120000,
    group4: 180000,
    vip: 350000
};

// ======================================
// 3. LẤY CÁC PHẦN TỬ HTML
// ======================================
const selectedMovie = document.getElementById("selectedMovie");
const selectedDate = document.getElementById("selectedDate");
const selectedRoom = document.getElementById("selectedRoom");
const duration = document.getElementById("duration");

const timeSlots = document.getElementById("timeSlots");
const timeMessage = document.getElementById("timeMessage");
const continueButton = document.getElementById("continueBooking");

const roomCards = document.querySelectorAll(".room-card");

const summaryMovie = document.getElementById("summaryMovie");
const summaryDate = document.getElementById("summaryDate");
const summaryRoom = document.getElementById("summaryRoom");
const summaryTime = document.getElementById("summaryTime");
const summaryDuration = document.getElementById("summaryDuration");
const summaryPrice = document.getElementById("summaryPrice");

// ======================================
// 4. BIẾN LƯU TRẠNG THÁI
// ======================================
let movieTitle = "Đang tải phim...";
let selectedTime = null;

// ======================================
// 5. CÁC HÀM DÙNG CHUNG
// ======================================

// Lấy ngày theo giờ địa phương
function getLocalDate(date) {
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
    ].join("-");
}

// Định dạng tiền Việt Nam
function formatMoney(value) {
    return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}

// Định dạng thời lượng
function formatDuration(hours) {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);

    if (minutes === 0) {
        return wholeHours + " giờ";
    }

    return wholeHours + " giờ " + minutes + " phút";
}

// Tính tiền phòng
function getRoomTotal() {
    const pricePerHour = roomPrices[selectedRoom.value] || 0;
    const hours = Number(duration.value);

    return pricePerHour * hours;
}

// ======================================
// 6. THIẾT LẬP NGÀY VÀ PHÒNG BAN ĐẦU
// ======================================
const today = getLocalDate(new Date());

selectedDate.min = today;

// Ưu tiên ngày được truyền từ trang chi tiết phim
selectedDate.value =
    dateParam && dateParam >= today ? dateParam : today;

// Ưu tiên phòng được truyền từ URL
if (Object.hasOwn(roomPrices, roomParam)) {
    selectedRoom.value = roomParam;
}

// ======================================
// 7. TẢI THÔNG TIN PHIM
// ======================================
async function loadMovie() {
    try {
        const movie = await getMovieDetails(movieId);

        movieTitle = movie.title || "Phim chưa có tên";
    } catch (error) {
        console.error("Không tải được phim:", error);
        movieTitle = "Phim chưa xác định";
    }

    selectedMovie.value = movieTitle;

    updateSummary();
}

// ======================================
// 8. CẬP NHẬT BẢNG THÔNG TIN ĐẶT CHỖ
// ======================================
function updateSummary() {
    summaryMovie.textContent = movieTitle;

    summaryDate.textContent =
        selectedDate.value || "Chưa chọn";

    summaryRoom.textContent =
        selectedRoom.options[selectedRoom.selectedIndex].text.trim();

    summaryTime.textContent =
        selectedTime || "Chưa chọn";

    summaryDuration.textContent =
        formatDuration(Number(duration.value));

    summaryPrice.textContent =
        formatMoney(getRoomTotal());

    // Chỉ cho tiếp tục khi đã chọn ngày và giờ
    continueButton.disabled =
        !selectedTime || !selectedDate.value;
}

// ======================================
// 9. ĐỒNG BỘ CÁC THẺ CHỌN PHÒNG
// ======================================
function updateRoomCards() {
    roomCards.forEach(card => {
        const isSelected =
            card.dataset.room === selectedRoom.value;

        card.classList.toggle("active", isSelected);

        card.setAttribute(
            "aria-pressed",
            String(isSelected)
        );
    });
}

// Khi nhấn vào thẻ phòng
roomCards.forEach(card => {
    card.addEventListener("click", () => {
        const room = card.dataset.room;

        if (!Object.hasOwn(roomPrices, room)) {
            return;
        }

        selectedRoom.value = room;

        updateRoomCards();

        // Chọn phòng mới thì cần chọn lại giờ
        renderTimeSlots();
    });
});

// Khi thay đổi bằng ô select
selectedRoom.addEventListener("change", () => {
    updateRoomCards();
    renderTimeSlots();
});

// ======================================
// 10. HIỂN THỊ KHUNG GIỜ
// ======================================
function renderTimeSlots() {
    timeSlots.replaceChildren();

    // Khi đổi ngày, phòng hoặc thời lượng
    // cần chọn lại giờ bắt đầu
    selectedTime = null;

    const hours = Number(duration.value);

    if (!selectedDate.value) {
        timeMessage.textContent =
            "Vui lòng chọn ngày chiếu.";

        updateSummary();
        return;
    }

    const now = new Date();
    let availableCount = 0;

    // Giờ hoạt động mẫu: 09:00 đến 22:00
    for (let hour = 9; hour <= 22; hour++) {
        const endHour = hour + hours;

        // Không cho kết thúc sau 22:00
        if (endHour > 22) {
            continue;
        }

        const time =
            String(hour).padStart(2, "0") + ":00";

        const button = document.createElement("button");

        button.type = "button";
        button.className = "time-slot";
        button.textContent = time;

        // Kiểm tra khung giờ đã qua
        const slotStart = new Date(
            selectedDate.value + "T" + time + ":00"
        );

        if (slotStart <= now) {
            button.disabled = true;
            button.title = "Khung giờ đã qua";
        } else {
            availableCount++;
        }

        // Xử lý khi chọn giờ
        button.addEventListener("click", () => {
            if (button.disabled) {
                return;
            }

            selectedTime = time;

            timeSlots.querySelectorAll(".time-slot").forEach(
                item => item.classList.remove("selected")
            );

            button.classList.add("selected");

            updateSummary();
        });

        timeSlots.appendChild(button);
    }

    if (availableCount === 0) {
        timeMessage.textContent =
            "Không còn khung giờ phù hợp. " +
            "Vui lòng chọn ngày khác.";
    } else {
        timeMessage.textContent =
            "Khung giờ đang là dữ liệu mẫu, " +
            "chưa kiểm tra phòng trống thực tế.";
    }

    updateSummary();
}

// ======================================
// 11. XỬ LÝ ĐỔI NGÀY VÀ THỜI LƯỢNG
// ======================================
selectedDate.addEventListener("change", () => {
    const currentDate = getLocalDate(new Date());

    // Không cho chọn ngày quá khứ
    if (selectedDate.value && selectedDate.value < currentDate) {
        selectedDate.value = currentDate;
    }

    renderTimeSlots();
});

duration.addEventListener("change", renderTimeSlots);

// ======================================
// 12. LƯU THÔNG TIN ĐẶT PHÒNG
// ======================================
function saveBookingData() {
    const bookingData = {
        movieId: movieId,
        movieTitle: movieTitle,
        date: selectedDate.value,
        roomType: selectedRoom.value,
        startTime: selectedTime,
        duration: Number(duration.value),
        roomTotal: getRoomTotal(),

        // Dữ liệu đồ ăn sẽ được cập nhật ở Bước 2
        foodItems: [],
        foodTotal: 0,
        grandTotal: getRoomTotal()
    };

    sessionStorage.setItem(
        "chillflixBooking",
        JSON.stringify(bookingData)
    );

    return bookingData;
}

// ======================================
// 13. CHUYỂN SANG BƯỚC 2: CHỌN ĐỒ ĂN
// ======================================
continueButton.addEventListener("click", () => {
    if (!selectedDate.value || !selectedTime) {
        alert("Vui lòng chọn ngày và khung giờ!");
        return;
    }

    // Lưu dữ liệu Bước 1
    saveBookingData();

    // Chuyển sang trang đồ ăn riêng
    window.location.href = "booking-food.html";
});

// ======================================
// 14. KHỞI TẠO TRANG
// ======================================
updateRoomCards();
renderTimeSlots();
loadMovie();
