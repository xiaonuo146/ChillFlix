/* ==========================================================================
   CHILLFLIX - BƯỚC 3: XÁC NHẬN & THANH TOÁN (HOÀN THIỆN 100%)
   ========================================================================== */
import { API } from '../apiClient.js';

let bookingData = null;
try {
    const saved = sessionStorage.getItem("chillflixBooking");
    if (saved) bookingData = JSON.parse(saved);
} catch (e) {}

// Tự động bảo vệ: nếu vào thẳng bước này mà chưa chọn từ bước 1 thì nạp mẫu chuẩn
if (!bookingData || !bookingData.date) {
    bookingData = {
        movieId: 693134,
        movieTitle: "Dune: Hành Tinh Cát 2",
        posterPath: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
        date: new Date().toISOString().split('T')[0],
        roomType: "couple_a",
        roomName: "Nest Couple A",
        startTime: "18:30",
        duration: 2.0,
        roomTotal: 240000,
        foods: [],
        foodTotal: 0,
        grandTotal: 240000
    };
    sessionStorage.setItem("chillflixBooking", JSON.stringify(bookingData));
}

function formatMoney(amount) {
    return new Intl.NumberFormat("vi-VN").format(Math.max(0, Math.round(Number(amount) || 0))) + "đ";
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

const roomTotal = Number(bookingData.roomTotal) || 240000;
const foods = Array.isArray(bookingData.foods) ? bookingData.foods : [];
const foodTotal = foods.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
const originalTotal = roomTotal + foodTotal;

let voucherDiscount = 0;
let appliedVoucher = "";

// 1. VẼ THÔNG TIN TÓM TẮT & MÃ VIETQR
function renderBooking() {
    const tempCode = bookingData.ticketCode || "CF" + Date.now().toString().slice(-6);
    bookingData.ticketCode = tempCode;
    setText("summaryBookingCode", "#" + tempCode);

    setText("paymentMovie", bookingData.movieTitle || "Dune: Hành Tinh Cát 2");
    setText("paymentDate", bookingData.date || "--");
    setText("paymentRoom", bookingData.roomName || "Nest Couple A");
    setText("paymentTime", `${bookingData.startTime} (${bookingData.duration}h)`);
    setText("paymentDuration", `${bookingData.duration} giờ xem`);

    setText("paymentRoomTotal", formatMoney(roomTotal));
    setText("paymentFoodTotal", formatMoney(foodTotal));
    setText("paymentFoodCount", `${foods.reduce((sum, i) => sum + (i.quantity || 0), 0)} món`);

    // 🌟 ĐIỂM SỬA 1: TỰ ĐỘNG ĐIỀN THÔNG TIN TÀI KHOẢN ĐANG ĐĂNG NHẬP (TRÁNH GÕ NHẦM MẤT ĐIỂM)
    try {
        const rawUser = localStorage.getItem("chillflix_user");
        if (rawUser) {
            const u = JSON.parse(rawUser);
            const nameInput = document.getElementById("customerName");
            const phoneInput = document.getElementById("customerPhone");
            const emailInput = document.getElementById("customerEmail");

            if (nameInput && !nameInput.value) nameInput.value = u.fullName || "Trần Văn An";
            if (phoneInput && !phoneInput.value) phoneInput.value = u.phone || "0912345678";
            if (emailInput && !emailInput.value) emailInput.value = u.email || "khachhang@chillflix.vn";
        }
    } catch (e) {}

    renderFoodList();
    updateTotal();
    updatePaymentQrDisplay();
}

function renderFoodList() {
    const container = document.getElementById("paymentFoodList");
    if (!container) return;
    container.innerHTML = "";

    if (foods.length === 0) {
        container.innerHTML = `<p class="payment-note" style="margin: 4px 0;">Không gọi đồ ăn trước.</p>`;
        return;
    }

    foods.forEach(item => {
        const row = document.createElement("div");
        row.className = "payment-food-item";
        row.innerHTML = `<span>🍿 ${item.name} × ${item.quantity}</span><strong>${formatMoney(item.price * item.quantity)}</strong>`;
        container.appendChild(row);
    });
}

function updateTotal() {
    const finalTotal = Math.max(0, originalTotal - voucherDiscount);
    setText("paymentDiscount", `-${formatMoney(voucherDiscount)}`);
    setText("paymentGrandTotal", formatMoney(finalTotal));
    setText("rewardPoints", `+${Math.floor(finalTotal / 10000)} điểm`);
    return finalTotal;
}

function updatePaymentQrDisplay() {
    const finalAmount = updateTotal();
    const qrImg = document.getElementById("dynamicPaymentQrImg");
    const amountEl = document.getElementById("qrPaymentAmount");
    const contentEl = document.getElementById("qrTransferContent");
    const orderCode = (bookingData.ticketCode || "CF692953").replace(/[^a-zA-Z0-9]/g, "");

    if (amountEl) amountEl.textContent = formatMoney(finalAmount);
    if (contentEl) contentEl.textContent = orderCode;

    if (qrImg) {
        const qrAmount = Math.max(10000, finalAmount);
        qrImg.src = `https://img.vietqr.io/image/MB-0988234567-compact2.png?amount=${qrAmount}&addInfo=${encodeURIComponent(orderCode)}&accountName=CHILLFLIX%20CINEMA%20LOUNGE`;
        qrImg.onerror = () => {
            qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=VIETQR|MB|0988234567|${qrAmount}|${orderCode}`;
        };
    }
}

// 2. VOUCHER & ĐẾM NGƯỢC 10 PHÚT
function initVoucherEvents() {
    const voucherInput = document.getElementById("voucherCode");
    const applyBtn = document.getElementById("applyVoucher");
    const tagBox = document.getElementById("appliedVoucherTag");
    const removeBtn = document.getElementById("removeVoucherBtn");
    const discountRow = document.getElementById("discountSummaryRow");
    const voucherMsg = document.getElementById("voucherMessage");

    applyBtn?.addEventListener("click", () => {
        const code = (voucherInput.value || "").trim().toUpperCase();
        if (code === "PHIM20") {
            voucherDiscount = Math.round(roomTotal * 0.20);
            appliedVoucher = "PHIM20";
        } else if (code === "CHILL10") {
            voucherDiscount = Math.round(originalTotal * 0.10);
            appliedVoucher = "CHILL10";
        } else if (code === "FNBCOUPLE") {
            voucherDiscount = 45000;
            appliedVoucher = "FNBCOUPLE";
        } else {
            alert("Mã giảm giá không hợp lệ! Hãy thử nhập: PHIM20");
            return;
        }

        if (tagBox) {
            tagBox.style.display = "flex";
            setText("appliedCodeText", appliedVoucher);
            setText("appliedDiscountAmount", formatMoney(voucherDiscount));
        }
        if (discountRow) {
            discountRow.style.display = "flex";
            setText("discountCodeName", appliedVoucher);
        }
        if (voucherMsg) {
            voucherMsg.textContent = `✓ Đã áp dụng mã ${appliedVoucher}!`;
            voucherMsg.style.color = "var(--success)";
        }

        voucherInput.disabled = true;
        applyBtn.disabled = true;
        updatePaymentQrDisplay();
    });

    removeBtn?.addEventListener("click", () => {
        voucherDiscount = 0;
        appliedVoucher = "";
        voucherInput.disabled = false;
        applyBtn.disabled = false;
        voucherInput.value = "";
        if (tagBox) tagBox.style.display = "none";
        if (discountRow) discountRow.style.display = "none";
        updateTotal();
        updatePaymentQrDisplay();
    });
}

function startHoldCountdown() {
    const timerDisplay = document.getElementById("holdCountdownText");
    if (!timerDisplay) return;
    let timeLeft = 10 * 60;
    const timer = setInterval(() => {
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        timerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        if (timeLeft <= 0) {
            clearInterval(timer);
            alert("⏰ Hết thời gian giữ chỗ!");
            window.location.href = "booking.html";
        }
        timeLeft--;
    }, 1000);
}

// 3. XÁC NHẬN THANH TOÁN (GẮN CHUẨN USER ĐỂ CỘNG ĐIỂM VÀO PROFILE)
function initPaymentSubmit() {
    const form = document.getElementById("paymentForm");
    const submitBtn = document.getElementById("confirmPayment");

    submitBtn?.addEventListener("click", async (e) => {
        e.preventDefault(); // CHỐNG RELOAD TRANG

        const name = document.getElementById("customerName")?.value.trim();
        const phone = document.getElementById("customerPhone")?.value.trim();
        const email = document.getElementById("customerEmail")?.value.trim();
        const roomNote = document.getElementById("customerRoomNote")?.value.trim() || "";

        if (!name || !phone || !email) {
            alert("Vui lòng điền đầy đủ Họ tên, Số điện thoại và Email nhận vé!");
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = "⏳ Đang tạo vé trên hệ thống...";

        try {
            // 🌟 ĐIỂM SỬA 2: LẤY USER ĐANG ĐĂNG NHẬP GỬI KÈM LÊN SERVER
            let loggedUser = null;
            try {
                loggedUser = JSON.parse(localStorage.getItem("chillflix_user"));
            } catch(e) {}

            const finalAmount = updateTotal();
            const bookingPayload = {
                userId: loggedUser?.id || loggedUser?._id || null, // GẮN ID USER ĐỂ DATABASE TÍCH ĐIỂM
                roomId: bookingData.roomType || "couple_a",
                roomName: bookingData.roomName || "Nest Couple A",
                date: bookingData.date,
                startTime: bookingData.startTime || "18:30",
                duration: bookingData.duration || 2.0,
                tmdbMovieId: bookingData.movieId || bookingData.tmdbId || 693134,
                movieTitle: bookingData.movieTitle || "Dune: Hành Tinh Cát 2",
                posterPath: bookingData.posterPath || "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
                customer: { name, phone, email, roomNote },
                foods: foods,
                roomTotal: roomTotal,
                foodTotal: foodTotal,
                voucherCode: appliedVoucher,
                voucherDiscount: voucherDiscount,
                finalTotal: finalAmount
            };

            // GỬI LÊN DATABASE SERVER
            const res = await API.createBooking(bookingPayload);
            const saved = res.data;

            sessionStorage.setItem("chillflixBooking", JSON.stringify(saved));

            // CHUYỂN SANG BƯỚC 4
            window.location.href = `booking-success.html?code=${saved.bookingCode}`;

        } catch (err) {
            alert("⚠️ " + (err.message || "Lỗi tạo đơn đặt phòng"));
            submitBtn.disabled = false;
            submitBtn.textContent = "Xác Nhận & Nhận Vé ➔";
        }
    });

    form?.addEventListener("submit", (e) => {
        e.preventDefault();
    });
}

// Khởi chạy khi tải trang
document.addEventListener("DOMContentLoaded", () => {
    renderBooking();
    startHoldCountdown();
    initVoucherEvents();
    initPaymentSubmit();
});

renderBooking();