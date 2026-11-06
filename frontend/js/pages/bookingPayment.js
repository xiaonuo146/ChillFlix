/* ==========================================================================
   CHILLFLIX - BƯỚC 3: XÁC NHẬN & THANH TOÁN VIETQR (ĐÃ FIX CHUẨN)
   ========================================================================== */

// 1. ĐỌC DỮ LIỆU ĐẶT PHÒNG TỪ SESSIONSTORAGE
let bookingData = null;
try {
    const saved = sessionStorage.getItem("chillflixBooking");
    if (saved) bookingData = JSON.parse(saved);
} catch (error) {
    console.error("Lỗi đọc dữ liệu đặt phòng:", error);
}

// 2. CÁC HÀM TIỆN ÍCH DÙNG CHUNG
function formatMoney(amount) {
    return new Intl.NumberFormat("vi-VN").format(Number(amount) || 0) + "đ";
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

// 3. KHỞI TẠO TIỀN BẠC
const roomTotal = Number(bookingData?.roomTotal) || 0;
const foods = Array.isArray(bookingData?.foods) ? bookingData.foods : [];
const foodTotal = foods.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
const originalTotal = roomTotal + foodTotal;

let discount = 0;
let appliedVoucher = "";

// 4. HIỂN THỊ DỮ LIỆU TÓM TẮT ĐƠN HÀNG
function renderBooking() {
    if (!bookingData || !bookingData.date || !bookingData.startTime) {
        alert("Chưa có thông tin đặt phòng hợp lệ.\nVui lòng quay lại Bước 1 chọn phòng chiếu.");
        window.location.href = "booking.html";
        return;
    }

    // Hiển thị mã đơn tạm thời
    const tempCode = bookingData.ticketCode || "CF" + Date.now().toString().slice(-6);
    bookingData.ticketCode = tempCode;
    setText("summaryBookingCode", "#" + tempCode);

    // Thông tin phòng chiếu
    setText("paymentMovie", bookingData.movieTitle || "Phim chiếu rạp");
    setText("paymentDate", bookingData.date || "--");
    setText("paymentRoom", bookingData.roomName || "Phòng riêng");
    setText("paymentTime", `${bookingData.startTime} (${formatDuration(bookingData.duration || 2)})`);
    setText("paymentDuration", formatDuration(bookingData.duration || 2));

    // Tiền phòng & đồ ăn
    setText("paymentRoomTotal", formatMoney(roomTotal));
    setText("paymentFoodTotal", formatMoney(foodTotal));
    setText("paymentFoodCount", `${foods.reduce((sum, i) => sum + i.quantity, 0)} món`);

    // Danh sách đồ ăn F&B
    renderFoodList();

    // Cập nhật tổng tiền & điểm thưởng & Mã QR VietQR
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
    const finalTotal = Math.max(0, originalTotal - discount);

    setText("paymentDiscount", `-${formatMoney(discount)}`);
    setText("paymentGrandTotal", formatMoney(finalTotal));

    // Tích lũy điểm CinePoint: 10.000đ = 1 điểm CinePoint
    const earnedPoints = Math.floor(finalTotal / 10000);
    setText("rewardPoints", `+${earnedPoints} điểm`);

    return finalTotal;
}

// 5. CẬP NHẬT MÃ VIETQR NGÂN HÀNG THẬT VỚI ĐÚNG SỐ TIỀN
function updatePaymentQrDisplay() {
    const finalAmount = updateTotal();
    const qrImg = document.getElementById("dynamicPaymentQrImg");
    const amountEl = document.getElementById("qrPaymentAmount");
    const contentEl = document.getElementById("qrTransferContent");

    const orderCode = (bookingData?.ticketCode || "CF" + Date.now().toString().slice(-6)).replace(/[^a-zA-Z0-9]/g, "");

    if (amountEl) amountEl.textContent = formatMoney(finalAmount);
    if (contentEl) contentEl.textContent = orderCode;

    if (qrImg) {
        // Sinh link VietQR NAPAS thật của ngân hàng MB Bank
        const vietQrUrl = `https://img.vietqr.io/image/MB-0988234567-compact2.png?amount=${finalAmount}&addInfo=${encodeURIComponent(orderCode)}&accountName=CHILLFLIX%20CINEMA%20LOUNGE`;
        qrImg.src = vietQrUrl;

        // Cơ chế dự phòng nếu mất kết nối
        qrImg.onerror = () => {
            qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`VIETQR|MB|0988234567|${finalAmount}|${orderCode}`)}`;
        };
    }
}

// 6. BỘ ĐẾM NGƯỢC GIỮ PHÒNG 10 PHÚT (COUNTDOWN TIMER)
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
            alert("⏰ Hết thời gian giữ chỗ 10 phút! Khung giờ này đã được nhả cho khách khác.\nVui lòng chọn lại suất chiếu.");
            sessionStorage.removeItem("chillflixBooking");
            window.location.href = "booking.html";
        }
        timeLeft--;
    }, 1000);
}

// 7. XỬ LÝ MÃ GIẢM GIÁ VOUCHER (GIẢM 20% TIỀN PHÒNG)
function initVoucherEvents() {
    const voucherInput = document.getElementById("voucherCode");
    const applyBtn = document.getElementById("applyVoucher");
    const voucherMsg = document.getElementById("voucherMessage");
    const tagBox = document.getElementById("appliedVoucherTag");
    const removeBtn = document.getElementById("removeVoucherBtn");
    const discountRow = document.getElementById("discountSummaryRow");

    applyBtn?.addEventListener("click", () => {
        const code = (voucherInput.value || "").trim().toUpperCase();

        if (code === "PHIM20") {
            discount = Math.round(roomTotal * 0.2);
            appliedVoucher = "PHIM20";

            if (tagBox) {
                tagBox.style.display = "flex";
                setText("appliedCodeText", "PHIM20");
                setText("appliedDiscountAmount", formatMoney(discount));
            }
            if (discountRow) {
                discountRow.style.display = "flex";
                setText("discountCodeName", "PHIM20");
            }
            if (voucherMsg) {
                voucherMsg.textContent = "Áp dụng thành công mã PHIM20: Giảm 20% tiền phòng!";
                voucherMsg.style.color = "var(--success)";
            }
            voucherInput.disabled = true;
            applyBtn.disabled = true;

            // Cập nhật lại số tiền trên mã QR ngay lập tức
            updatePaymentQrDisplay();
        } else {
            discount = 0;
            appliedVoucher = "";
            if (voucherMsg) {
                voucherMsg.textContent = code ? "Mã giảm giá không hợp lệ hoặc đã hết lượt dùng." : "Vui lòng nhập mã giảm giá.";
                voucherMsg.style.color = "var(--danger)";
            }
        }
        updateTotal();
    });

    removeBtn?.addEventListener("click", () => {
        discount = 0;
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

// 8. SỰ KIỆN SAO CHÉP STK & NỘI DUNG CHUYỂN KHOẢN
function initCopyEvents() {
    document.querySelectorAll(".btn-copy-chip").forEach(btn => {
        btn.addEventListener("click", () => {
            const textToCopy = btn.dataset.copy || document.getElementById("qrTransferContent")?.textContent;
            if (textToCopy) {
                navigator.clipboard.writeText(textToCopy);
                const originalText = btn.textContent;
                btn.textContent = "✓ Đã copy";
                setTimeout(() => { btn.textContent = originalText; }, 2000);
            }
        });
    });
}

// 9. XÁC NHẬN VÀ LƯU DỮ LIỆU ĐỂ CHUYỂN SANG BƯỚC 4
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
            alert("Vui lòng đồng ý với Quy định & Chính sách hủy phòng trước khi thanh toán!");
            return;
        }

        const finalTotal = updateTotal();
        const smartPin = String(Math.floor(1000 + Math.random() * 9000));

        const finalBooking = {
            ...bookingData,
            customer: {
                name: name,
                phone: phone,
                email: email,
                roomNote: roomNote
            },
            smartPin: smartPin,
            paymentMethod: "vietqr",
            voucherCode: appliedVoucher,
            discount: discount,
            finalTotal: finalTotal,
            earnedPoints: Math.floor(finalTotal / 10000),
            createdAt: new Date().toISOString()
        };

        sessionStorage.setItem("chillflixBooking", JSON.stringify(finalBooking));
        window.location.href = "booking-success.html";
    });
}

// 10. SỰ KIỆN HEADER CHUNG
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

    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const drawerCloseBtn = document.getElementById("drawerCloseBtn");
    const mobileDrawer = document.getElementById("mobileDrawer");
    const drawerOverlay = document.getElementById("drawerOverlay");

    mobileMenuBtn?.addEventListener("click", () => {
        mobileDrawer?.classList.add("open");
        drawerOverlay?.classList.add("open");
    });
    const closeDrawer = () => {
        mobileDrawer?.classList.remove("open");
        drawerOverlay?.classList.remove("open");
    };
    drawerCloseBtn?.addEventListener("click", closeDrawer);
    drawerOverlay?.addEventListener("click", closeDrawer);
}

// KHỞI CHẠY TẤT CẢ
initHeaderControls();
renderBooking();
startHoldCountdown();
initVoucherEvents();
initCopyEvents();
initPaymentSubmit();