/* ==========================================================================
   CHILLFLIX - BƯỚC 3: THANH TOÁN (ĐẦY ĐỦ 3 VOUCHER + GIẢM GIÁ HẠNG VIP)
   ========================================================================== */

let bookingData = null;
try {
    const saved = sessionStorage.getItem("chillflixBooking");
    if (saved) bookingData = JSON.parse(saved);
} catch (error) {
    console.error("Lỗi đọc dữ liệu đặt phòng:", error);
}

function formatMoney(amount) {
    return new Intl.NumberFormat("vi-VN").format(Math.max(0, Math.round(Number(amount) || 0))) + "đ";
}

function formatDuration(hours) {
    const totalMinutes = Math.round(Number(hours) * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return m === 0 ? `${h}.0 giờ` : `${h} giờ ${m} phút`;
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

// 1. TÍNH TIỀN GỐC
const roomTotal = Number(bookingData?.roomTotal) || 0;
const foods = Array.isArray(bookingData?.foods) ? bookingData.foods : [];
const foodTotal = foods.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
const originalTotal = roomTotal + foodTotal;

let voucherDiscount = 0;
let appliedVoucher = "";
let tierDiscount = 0;
let userTierName = "";

// 2. TÍNH ƯU ĐÃI TỰ ĐỘNG THEO HẠNG THÀNH VIÊN (SILVER / GOLD / DIAMOND)
function calculateTierDiscount() {
    let userPoints = 1240; // Mặc định demo Hạng Bạc
    try {
        const rawUser = localStorage.getItem("chillflix_user");
        if (rawUser) {
            const u = JSON.parse(rawUser);
            userPoints = Number(u.points) ?? 1240;
        }
    } catch (e) {}

    if (userPoints >= 3000) {
        userTierName = "Hạng Kim Cương (-20% Phòng)";
        tierDiscount = Math.round(roomTotal * 0.20);
    } else if (userPoints >= 1500) {
        userTierName = "Hạng Vàng (-10% Phòng)";
        tierDiscount = Math.round(roomTotal * 0.10);
    } else if (userPoints >= 500) {
        userTierName = "Hạng Bạc (-5% F&B)";
        tierDiscount = Math.round(foodTotal * 0.05);
    } else {
        userTierName = "";
        tierDiscount = 0;
    }

    const tierRow = document.getElementById("tierDiscountRow");
    if (tierRow) {
        if (tierDiscount > 0) {
            tierRow.style.display = "flex";
            setText("tierNameLabel", userTierName);
            setText("tierDiscountAmount", `-${formatMoney(tierDiscount)}`);
        } else {
            tierRow.style.display = "none";
        }
    }
}

// 3. HIỂN THỊ DỮ LIỆU ĐƠN HÀNG
function renderBooking() {
    if (!bookingData || !bookingData.date || !bookingData.startTime) {
        alert("Chưa có thông tin đặt phòng hợp lệ.\nVui lòng quay lại Bước 1 chọn phòng chiếu.");
        window.location.href = "booking.html";
        return;
    }

    const tempCode = bookingData.ticketCode || "CF" + Date.now().toString().slice(-6);
    bookingData.ticketCode = tempCode;
    setText("summaryBookingCode", "#" + tempCode);

    setText("paymentMovie", bookingData.movieTitle || "Phim chiếu rạp");
    setText("paymentDate", bookingData.date || "--");
    setText("paymentRoom", bookingData.roomName || "Phòng riêng");
    setText("paymentTime", `${bookingData.startTime} (${formatDuration(bookingData.duration || 2)})`);
    setText("paymentDuration", formatDuration(bookingData.duration || 2));

    setText("paymentRoomTotal", formatMoney(roomTotal));
    setText("paymentFoodTotal", formatMoney(foodTotal));
    setText("paymentFoodCount", `${foods.reduce((sum, i) => sum + i.quantity, 0)} món`);

    renderFoodList();
    calculateTierDiscount();
    updateTotal();
    updatePaymentQrDisplay();
}

function renderFoodList() {
    const foodContainer = document.getElementById("paymentFoodList");
    if (!foodContainer) return;
    foodContainer.replaceChildren();

    if (foods.length === 0) {
        foodContainer.innerHTML = `<p class="payment-note" style="margin: 4px 0;">Không gọi đồ ăn (Có thể gọi thêm tại quầy rạp).</p>`;
        return;
    }

    foods.forEach(item => {
        const row = document.createElement("div");
        row.className = "payment-food-item";
        row.innerHTML = `
            <span>${item.name} × ${item.quantity}</span>
            <strong>${formatMoney(Number(item.price) * Number(item.quantity))}</strong>
        `;
        foodContainer.appendChild(row);
    });
}

function updateTotal() {
    const finalTotal = Math.max(0, originalTotal - tierDiscount - voucherDiscount);

    setText("paymentDiscount", `-${formatMoney(voucherDiscount)}`);
    setText("paymentGrandTotal", formatMoney(finalTotal));

    const earnedPoints = Math.floor(finalTotal / 10000);
    setText("rewardPoints", `+${earnedPoints} điểm`);

    return finalTotal;
}

// 4. CẬP NHẬT MÃ VIETQR NGÂN HÀNG THẬT
function updatePaymentQrDisplay() {
    const finalAmount = updateTotal();
    const qrImg = document.getElementById("dynamicPaymentQrImg");
    const amountEl = document.getElementById("qrPaymentAmount");
    const contentEl = document.getElementById("qrTransferContent");

    const orderCode = (bookingData?.ticketCode || "CF" + Date.now().toString().slice(-6)).replace(/[^a-zA-Z0-9]/g, "");

    if (amountEl) amountEl.textContent = formatMoney(finalAmount);
    if (contentEl) contentEl.textContent = orderCode;

    if (qrImg) {
        const vietQrUrl = `https://img.vietqr.io/image/MB-0988234567-compact2.png?amount=${finalAmount}&addInfo=${encodeURIComponent(orderCode)}&accountName=CHILLFLIX%20CINEMA%20LOUNGE`;
        qrImg.src = vietQrUrl;
        qrImg.onerror = () => {
            qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`VIETQR|MB|0988234567|${finalAmount}|${orderCode}`)}`;
        };
    }
}

// 5. XỬ LÝ CẢ 3 MÃ VOUCHER (PHIM20, CHILL10, FNBCOUPLE) CÓ KIỂM TRA ĐIỀU KIỆN THẬT
function initVoucherEvents() {
    const voucherInput = document.getElementById("voucherCode");
    const applyBtn = document.getElementById("applyVoucher");
    const voucherMsg = document.getElementById("voucherMessage");
    const tagBox = document.getElementById("appliedVoucherTag");
    const removeBtn = document.getElementById("removeVoucherBtn");
    const discountRow = document.getElementById("discountSummaryRow");

    applyBtn?.addEventListener("click", () => {
        const code = (voucherInput.value || "").trim().toUpperCase();
        let successMsg = "";
        let errorMsg = "";

        if (code === "PHIM20") {
            // Mã 1: Giảm 20% tiền phòng
            voucherDiscount = Math.round(roomTotal * 0.20);
            appliedVoucher = "PHIM20";
            successMsg = "Áp dụng thành công PHIM20: Giảm 20% tiền phòng!";
        } 
        else if (code === "CHILL10") {
            // Mã 2: Kiểm tra giờ chiếu sau 21:00
            const startHour = parseInt((bookingData.startTime || "18:00").split(":")[0], 10);
            if (startHour >= 21) {
                voucherDiscount = Math.round(originalTotal * 0.10);
                appliedVoucher = "CHILL10";
                successMsg = "Áp dụng thành công CHILL10: Giảm 10% tổng đơn suất đêm!";
            } else {
                errorMsg = "❌ Mã CHILL10 chỉ áp dụng cho suất chiếu đêm từ 21:00 trở đi!";
            }
        } 
        else if (code === "FNBCOUPLE") {
            // Mã 3: Kiểm tra phòng Couple
            const isCouple = (bookingData.roomType || "").includes("couple");
            if (isCouple) {
                voucherDiscount = 45000;
                appliedVoucher = "FNBCOUPLE";
                successMsg = "Áp dụng thành công FNBCOUPLE: Giảm ngay 45.000đ (Tặng bắp caramel)!";
            } else {
                errorMsg = "❌ Mã FNBCOUPLE chỉ áp dụng khi đặt Phòng Couple!";
            }
        } 
        else {
            errorMsg = code ? "❌ Mã giảm giá không tồn tại hoặc đã hết hạn." : "Vui lòng nhập mã giảm giá.";
        }

        if (appliedVoucher && !errorMsg) {
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
                voucherMsg.textContent = successMsg;
                voucherMsg.style.color = "var(--success)";
            }
            voucherInput.disabled = true;
            applyBtn.disabled = true;
            updatePaymentQrDisplay();
        } else {
            voucherDiscount = 0;
            appliedVoucher = "";
            if (voucherMsg) {
                voucherMsg.textContent = errorMsg;
                voucherMsg.style.color = "var(--danger)";
            }
        }
        updateTotal();
    });

    removeBtn?.addEventListener("click", () => {
        voucherDiscount = 0;
        appliedVoucher = "";
        voucherInput.disabled = false;
        applyBtn.disabled = false;
        voucherInput.value = "";
        if (tagBox) tagBox.style.display = "none";
        if (discountRow) discountRow.style.display = "none";
        if (voucherMsg) {
            voucherMsg.textContent = "Đã hủy áp dụng mã giảm giá.";
            voucherMsg.style.color = "var(--text-muted)";
        }
        updateTotal();
        updatePaymentQrDisplay();
    });
}

// 6. ĐẾM NGƯỢC 10 PHÚT
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
            alert("⏰ Hết thời gian giữ chỗ 10 phút! Vui lòng đặt lại.");
            window.location.href = "booking.html";
        }
        timeLeft--;
    }, 1000);
}

// 7. SAO CHÉP STK & NỘI DUNG
function initCopyEvents() {
    document.querySelectorAll(".btn-copy-chip").forEach(btn => {
        btn.addEventListener("click", () => {
            const textToCopy = btn.dataset.copy || document.getElementById("qrTransferContent")?.textContent;
            if (textToCopy) {
                navigator.clipboard.writeText(textToCopy);
                const orig = btn.textContent;
                btn.textContent = "✓ Đã copy";
                setTimeout(() => { btn.textContent = orig; }, 2000);
            }
        });
    });
}

// 8. XÁC NHẬN THANH TOÁN -> LƯU VÀO MẢNG LỊCH SỬ LOCALSTORAGE (KHÔNG BỊ GHI ĐÈ)
function initPaymentSubmit() {
    const form = document.getElementById("paymentForm");

    form?.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("customerName")?.value.trim();
        const phone = document.getElementById("customerPhone")?.value.trim();
        const email = document.getElementById("customerEmail")?.value.trim();
        const roomNote = document.getElementById("customerRoomNote")?.value.trim() || "";

        const agreeCheck = document.getElementById("termsAgreeCheckbox");
        if (agreeCheck && !agreeCheck.checked) {
            alert("Vui lòng đồng ý với Quy định & Chính sách hủy phòng!");
            return;
        }

        const finalTotal = updateTotal();
        const smartPin = String(Math.floor(1000 + Math.random() * 9000));

        // Trạng thái ban đầu: "pending" (Chờ kiểm tra đã nhận tiền chuyển khoản chưa)
        const finalBooking = {
            ...bookingData,
            customer: { name, phone, email, roomNote },
            smartPin: smartPin,
            paymentMethod: "vietqr",
            paymentStatus: "pending", // <--- CHƯA DUYỆT TIỀN
            voucherCode: appliedVoucher,
            voucherDiscount: voucherDiscount,
            tierDiscount: tierDiscount,
            finalTotal: finalTotal,
            earnedPoints: Math.floor(finalTotal / 10000),
            createdAt: new Date().toISOString()
        };

        // 1. Lưu đơn hiện tại để hiển thị ở Bước 4
        sessionStorage.setItem("chillflixBooking", JSON.stringify(finalBooking));

        // 2. Lưu nối tiếp vào MẢNG Lịch Sử trong localStorage (Đặt 3 đơn hiện đủ 3 đơn, 10 đơn hiện đủ 10 đơn!)
        try {
            const historyRaw = localStorage.getItem("chillflix_booking_history");
            const historyList = historyRaw ? JSON.parse(historyRaw) : [];
            historyList.unshift(finalBooking); // Thêm đơn mới lên đầu
            localStorage.setItem("chillflix_booking_history", JSON.stringify(historyList));
        } catch (err) {
            console.error("Lỗi lưu lịch sử:", err);
        }

        window.location.href = "booking-success.html";
    });
}

function initHeaderControls() {
    const savedTheme = localStorage.getItem("chillflix-theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
    const themeIcon = document.getElementById("themeIcon");
    if (themeIcon) themeIcon.textContent = savedTheme === "light" ? "☀️" : "🌙";

    document.getElementById("themeToggle")?.addEventListener("click", () => {
        const cur = document.documentElement.getAttribute("data-theme");
        const next = cur === "light" ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", next);
        if (themeIcon) themeIcon.textContent = next === "light" ? "☀️" : "🌙";
        localStorage.setItem("chillflix-theme", next);
    });

    const userBtn = document.getElementById("userMenuBtn");
    const userDropdown = document.getElementById("userDropdown");
    userBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        userDropdown?.classList.toggle("show");
    });
    document.addEventListener("click", () => userDropdown?.classList.remove("show"));
}

initHeaderControls();
renderBooking();
startHoldCountdown();
initVoucherEvents();
initCopyEvents();
initPaymentSubmit();