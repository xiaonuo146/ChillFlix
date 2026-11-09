/* ==========================================================================
   CHILLFLIX - BƯỚC 4: VÉ ĐIỆN TỬ & MÃ PIN (CHUẨN MOCKUP 6)
   ========================================================================== */

let bookingData = null;
try {
    const saved = sessionStorage.getItem("chillflixBooking");
    if (saved) bookingData = JSON.parse(saved);
} catch (err) {
    console.error("Lỗi đọc dữ liệu vé:", err);
}

function formatMoney(amount) {
    return new Intl.NumberFormat("vi-VN").format(Number(amount) || 0) + "đ";
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val ?? "--";
}

function renderDigitalTicket() {
    if (!bookingData) {
        document.querySelector(".success-main-layout").innerHTML = `
            <div class="unified-ticket-card" style="text-align: center; padding: 48px 24px;">
                <h2 style="color: var(--danger); margin-bottom: 12px;">Chưa tìm thấy đơn đặt phòng!</h2>
                <p style="color: var(--text-muted); margin-bottom: 24px;">Vui lòng thực hiện các bước đặt phòng từ đầu để nhận vé điện tử.</p>
                <a href="booking.html" class="btn btn--primary" style="display: inline-flex; height: 44px; padding: 0 24px;">Về trang đặt phòng</a>
            </div>
        `;
        return;
    }

    const isCancelled = bookingData.status === "cancelled";

    // 1. NẾU VÉ ĐÃ BỊ HỦY -> ĐỔI TOÀN BỘ GIAO DIỆN SANG MÀU ĐỎ CẢNH BÁO
    if (isCancelled) {
        document.getElementById("heroStatusBadge").textContent = "✕";
        document.getElementById("heroStatusBadge").classList.add("cancelled");
        document.getElementById("heroStatusTitle").textContent = "Đơn Đặt Phòng Này Đã Bị Hủy";
        document.getElementById("heroStatusSub").textContent = "Suất chiếu đã được hủy theo yêu cầu. Toàn bộ tiền phòng và F&B đã được hoàn trả.";
        
        const statusTag = document.getElementById("ticketStatusTag");
        if (statusTag) {
            statusTag.textContent = "✕ ĐÃ HỦY & HOÀN TIỀN 100%";
            statusTag.style.color = "var(--danger)";
        }

        // Hiện con dấu đỏ "ĐÃ HỦY VÉ"
        const stamp = document.getElementById("cancelledWatermarkStamp");
        if (stamp) stamp.style.display = "block";

        // Thêm class làm mờ vé
        document.getElementById("printableTicket")?.classList.add("is-cancelled");

        // Ẩn thanh đếm ngược đón khách
        const arrivalStrip = document.getElementById("ticketArrivalStrip");
        if (arrivalStrip) arrivalStrip.style.display = "none";

        // Ẩn nút "✕ Hủy đơn đặt phòng này" (vì đã hủy rồi)
        const cancelBtnBox = document.querySelector(".cancel-booking-box");
        if (cancelBtnBox) cancelBtnBox.style.display = "none";

        // KHÓA VÀ THAY THẾ KHU VỰC QR BẰNG THÔNG BÁO HOÀN TIỀN
        const checkinCenter = document.querySelector(".ticket-checkin-center");
        if (checkinCenter) {
            checkinCenter.innerHTML = `
                <div class="cancelled-notice-box">
                    <h4>🔒 MÃ QR VÀ MÃ PIN ĐÃ BỊ VÔ HIỆU HÓA</h4>
                    <p>Vé này không còn giá trị check-in vào phòng chiếu.<br>Số tiền <strong>${formatMoney(bookingData.finalTotal || bookingData.grandTotal)}</strong> đã được rạp hoàn trả thành công.</p>
                </div>
            `;
        }
    }

    // 2. HIỂN THỊ CÁC THÔNG TIN VÉ CƠ BẢN
    const ticketCode = bookingData.ticketCode || "CP-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    setText("ticketCodeDisplay", ticketCode);

    const rName = (bookingData.roomName || "PHÒNG CHIẾU RIÊNG TƯ").toUpperCase();
    setText("ticketRoomName", rName);

    if (rName.includes("COUPLE")) {
        setText("ticketCapacityText", "👥 1 - 2 Người lớn");
    } else if (rName.includes("SAO HỎA")) {
        setText("ticketCapacityText", "👥 3 - 6 Người lớn");
    } else {
        setText("ticketCapacityText", "👥 8 - 12 Người lớn (VIP)");
    }

    setText("ticketMovieTitle", bookingData.movieTitle || "Phim chiếu rạp");
    setText("ticketDate", bookingData.date || "--");

    // Poster phim
    const posterEl = document.getElementById("ticketMoviePoster");
    if (posterEl) {
        if (bookingData.posterPath) {
            posterEl.src = `https://image.tmdb.org/t/p/w500${bookingData.posterPath}`;
        } else if (bookingData.movieId) {
            import("../api.js").then(({ getMovieDetails }) => {
                getMovieDetails(bookingData.movieId).then(m => {
                    if (m && m.poster_path) posterEl.src = `https://image.tmdb.org/t/p/w500${m.poster_path}`;
                });
            });
        }
    }

    const startTime = bookingData.startTime || "18:30";
    const dur = Number(bookingData.duration) || 2.0;
    const [sH, sM] = startTime.split(":").map(Number);
    const endTotalMins = sH * 60 + sM + Math.round(dur * 60);
    const eH = String(Math.floor(endTotalMins / 60) % 24).padStart(2, '0');
    const eM = String(endTotalMins % 60).padStart(2, '0');
    const endTime = `${eH}:${eM}`;

    setText("ticketTime", `${startTime} ➔ ${endTime} (${dur.toFixed(1)}h)`);

    const cleanEndTotal = endTotalMins + 15;
    const cH = String(Math.floor(cleanEndTotal / 60) % 24).padStart(2, '0');
    const cM = String(cleanEndTotal % 60).padStart(2, '0');
    setText("ticketBufferTime", `${endTime} ➔ ${cH}:${cM} (15p)`);

    const customer = bookingData.customer || {};
    setText("ticketCustomerName", customer.name || "Khách xem phim");

    // Nếu chưa hủy thì mới tính thời gian đón khách và sinh mã QR
    if (!isCancelled) {
        setText("ticketSmartPin", bookingData.smartPin || "9854");
        calculateArrivalCountdown(bookingData.date, startTime);
        generateCheckinQr(ticketCode);
    }

    // Danh sách đồ ăn F&B & tiền
    renderTicketFoods();

    setText("ticketDurationLabel", `${dur.toFixed(1)} giờ`);
    setText("ticketRoomPrice", formatMoney(bookingData.roomTotal || 0));

    if (Number(bookingData.discount) > 0) {
        document.getElementById("ticketDiscountRow").style.display = "flex";
        setText("ticketVoucherCode", bookingData.voucherCode || "PHIM20");
        setText("ticketDiscountVal", `-${formatMoney(bookingData.discount)}`);
    }

    setText("ticketGrandTotal", formatMoney(bookingData.finalTotal || bookingData.grandTotal || 0));
    setText("ticketPointsEarned", `+${bookingData.earnedPoints || Math.floor((bookingData.finalTotal || 0) / 10000)} điểm`);
}

function calculateArrivalCountdown(dateStr, timeStr) {
    const countdownEl = document.getElementById("ticketArrivalCountdown");
    if (!countdownEl || !dateStr || !timeStr) return;

    try {
        const showTime = new Date(`${dateStr}T${timeStr}:00`);
        const now = new Date();
        const diffMs = showTime - now;

        if (diffMs <= 0) {
            countdownEl.textContent = "Suất chiếu đang diễn ra hoặc đã sẵn sàng đón khách!";
        } else {
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            if (diffHours > 24) {
                const days = Math.floor(diffHours / 24);
                countdownEl.textContent = `Còn ${days} ngày nữa đến suất chiếu`;
            } else if (diffHours > 0) {
                countdownEl.textContent = `Còn ${diffHours} giờ ${diffMins} phút nữa`;
            } else {
                countdownEl.textContent = `Còn ${diffMins} phút nữa (Sẵn sàng mở phòng)`;
            }
        }
    } catch (e) {
        countdownEl.textContent = "Sẵn sàng đón khách đúng giờ chiếu";
    }
}

function generateCheckinQr(bookingCode) {
    const qrContainer = document.getElementById("ticketQrCanvas");
    if (!qrContainer) return;
    qrContainer.replaceChildren();

    try {
        if (typeof QRCode !== "undefined") {
            new QRCode(qrContainer, {
                text: `CHILLFLIX-CHECKIN:${bookingCode}`,
                width: 124,
                height: 124,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.M
            });
        } else {
            const qrImg = document.createElement("img");
            qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=124x124&data=${encodeURIComponent('CHILLFLIX:' + bookingCode)}`;
            qrImg.alt = "Mã QR vé";
            qrContainer.appendChild(qrImg);
        }
    } catch (e) {
        console.warn("Không vẽ được QR:", e);
    }
}

function renderTicketFoods() {
    const container = document.getElementById("ticketFoodList");
    if (!container) return;
    container.replaceChildren();

    const foods = Array.isArray(bookingData?.foods) ? bookingData.foods : [];
    setText("ticketFoodCount", `${foods.reduce((sum, i) => sum + i.quantity, 0)} món`);

    if (foods.length === 0) {
        container.innerHTML = `<p class="t-food-row" style="color: var(--text-muted); border: none;">Không đặt trước đồ ăn (Có thể gọi thêm tại phòng).</p>`;
        return;
    }

    foods.forEach(item => {
        const row = document.createElement("div");
        row.className = "t-food-row";
        row.innerHTML = `
            <span>🍿 ${item.name} × ${item.quantity}</span>
            <strong>${formatMoney(Number(item.price) * Number(item.quantity))}</strong>
        `;
        container.appendChild(row);
    });
}

// IN VÉ VÀ SAO CHÉP MÃ
document.getElementById("btnPrintTicket")?.addEventListener("click", () => {
    window.print();
});

document.getElementById("btnCopyCode")?.addEventListener("click", () => {
    const code = document.getElementById("ticketCodeDisplay")?.textContent || "";
    navigator.clipboard.writeText(code).then(() => {
        const btn = document.getElementById("btnCopyCode");
        btn.textContent = "✓ Đã copy";
        setTimeout(() => { btn.textContent = "📋"; }, 2000);
    });
});

// ==========================================
// XỬ LÝ HỦY VÉ (CHUYỂN TRẠNG THÁI CANCELLED, KHÔNG XÓA ĐƠN)
// ==========================================
document.getElementById("btnCancelBooking")?.addEventListener("click", () => {
    if (!bookingData) return;

    const showDateTimeStr = `${bookingData.date}T${bookingData.startTime}:00`;
    const showTime = new Date(showDateTimeStr).getTime();
    const now = new Date().getTime();
    const diffHours = (showTime - now) / (1000 * 60 * 60);

    // Kiểm tra quy định trước 2 tiếng
    if (diffHours < 2) {
        alert("⚠️ RẤT TIẾC, KHÔNG THỂ HỦY VÉ!\n\nTheo quy định của ChillFlix, suất chiếu chỉ được hủy trước giờ bắt đầu tối thiểu 2 tiếng. Hiện tại đã quá sát giờ chiếu nên phòng và thiết bị đã được chuẩn bị sẵn sàng.");
        return;
    }

    const refundAmount = formatMoney(bookingData.finalTotal || bookingData.grandTotal);
    const confirmCancel = confirm(`❓ XÁC NHẬN HỦY VÉ #${bookingData.ticketCode}?\n\nSuất chiếu còn hơn 2 tiếng nữa mới diễn ra. Bạn đủ điều kiện HOÀN TIỀN 100% (${refundAmount}).\n\nBạn có chắc chắn muốn hủy đơn này không?`);

    if (confirmCancel) {
        // CẬP NHẬT TRẠNG THÁI SANG "cancelled" TRONG LỊCH SỬ LOCALSTORAGE
        try {
            const rawHist = localStorage.getItem("chillflix_booking_history");
            if (rawHist) {
                let list = JSON.parse(rawHist);
                const idx = list.findIndex(b => b.ticketCode === bookingData.ticketCode);
                if (idx !== -1) {
                    list[idx].status = "cancelled"; // Đánh dấu đã hủy
                    list[idx].refundedAmount = bookingData.finalTotal || bookingData.grandTotal;
                    list[idx].cancelledAt = new Date().toISOString();
                    localStorage.setItem("chillflix_booking_history", JSON.stringify(list));
                }
            }
        } catch (e) {
            console.error(e);
        }

        // Cập nhật cả đơn tạm hiện tại
        bookingData.status = "cancelled";
        sessionStorage.setItem("chillflixBooking", JSON.stringify(bookingData));

        alert(` HỦY ĐẶT PHÒNG THÀNH CÔNG!\n\nHệ thống đã nhả phòng chiếu cho khách khác và hoàn trả ${refundAmount} về tài khoản của bạn.`);
        
        // Chuyển thẳng về trang Hồ sơ cá nhân tab Lịch sử để khách thấy vé đã đổi trạng thái
        window.location.href = "profile.html#history";
    }
});

// SỰ KIỆN HEADER CHUNG
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
// Kiểm tra trạng thái thanh toán để Mở khóa hoặc Khóa mã QR & PIN
function checkPaymentVerificationUI() {
    const lockBox = document.getElementById("paymentPendingLockBox");
    const unlockBox = document.getElementById("paymentVerifiedUnlockBox");
    const statusPill = document.querySelector(".ticket-status-pill");

    if (bookingData.paymentStatus === "paid") {
        // ĐÃ THANH TOÁN -> MỞ KHÓA QR & MÃ PIN
        if (lockBox) lockBox.style.display = "none";
        if (unlockBox) unlockBox.style.display = "flex";
        if (statusPill) {
            statusPill.innerHTML = `<span class="status-pulse-dot"></span><strong>ĐÃ THANH TOÁN & XÁC NHẬN</strong>`;
            statusPill.style.color = "var(--success)";
            statusPill.style.borderColor = "rgba(63, 185, 80, 0.35)";
        }
    } else {
        // CHỜ XÁC NHẬN TIỀN -> KHÓA QR & MÃ PIN
        if (lockBox) lockBox.style.display = "block";
        if (unlockBox) unlockBox.style.display = "none";
        if (statusPill) {
            statusPill.innerHTML = `<span class="status-pulse-dot" style="background: var(--warning); box-shadow: 0 0 8px var(--warning);"></span><strong>CHỜ XÁC NHẬN CHUYỂN KHOẢN</strong>`;
            statusPill.style.color = "var(--warning)";
            statusPill.style.borderColor = "rgba(240, 160, 32, 0.4)";
        }
    }
}

// Gọi hàm này bên trong renderDigitalTicket()
// ...
checkPaymentVerificationUI();

// Nút Demo giả lập Ngân hàng báo đã nhận tiền (hoặc Admin vừa duyệt)
document.getElementById("btnSimulateBankWebhook")?.addEventListener("click", () => {
    bookingData.paymentStatus = "paid";
    sessionStorage.setItem("chillflixBooking", JSON.stringify(bookingData));

    // Cập nhật luôn trong lịch sử localStorage
    try {
        const rawHist = localStorage.getItem("chillflix_booking_history");
        if (rawHist) {
            const list = JSON.parse(rawHist);
            const idx = list.findIndex(b => b.ticketCode === bookingData.ticketCode);
            if (idx !== -1) {
                list[idx].paymentStatus = "paid";
                localStorage.setItem("chillflix_booking_history", JSON.stringify(list));
            }
        }

        // CỘNG ĐIỂM THƯỞNG CINEPOINT VÀO TÀI KHOẢN KHÁCH HÀNG
        const rawUser = localStorage.getItem("chillflix_user");
        const user = rawUser ? JSON.parse(rawUser) : {
            fullName: "Nguyễn Hoàng Nam",
            phone: "0988234567",
            email: "hoangnam.designer@cinenest.vn",
            rank: "Hạng Bạc",
            points: 1240
        };
        const earned = bookingData.earnedPoints || Math.floor((bookingData.finalTotal || 0) / 10000);
        user.points = (Number(user.points) || 0) + earned;
        
        // Tự động xét thăng hạng nếu đủ điểm!
        if (user.points >= 3000) user.rank = "Hạng Kim Cương";
        else if (user.points >= 1500) user.rank = "Hạng Vàng";
        else if (user.points >= 500) user.rank = "Hạng Bạc";

        localStorage.setItem("chillflix_user", JSON.stringify(user));
    } catch (e) {}

    checkPaymentVerificationUI();
    alert(`💸 Hệ thống ngân hàng đã xác nhận nhận đủ ${formatMoney(bookingData.finalTotal)}!\n🔓 Mã QR Check-in và Mã PIN mở phòng đã được mở khóa!`);
});

// Nút kiểm tra lại trạng thái từ Admin
document.getElementById("btnCheckPaymentStatus")?.addEventListener("click", () => {
    const rawHist = localStorage.getItem("chillflix_booking_history");
    if (rawHist) {
        const list = JSON.parse(rawHist);
        const found = list.find(b => b.ticketCode === bookingData.ticketCode);
        if (found && found.paymentStatus === "paid") {
            bookingData.paymentStatus = "paid";
            sessionStorage.setItem("chillflixBooking", JSON.stringify(bookingData));
            checkPaymentVerificationUI();
            return;
        }
    }
    alert("⏳ Giao dịch đang được kế toán kiểm tra. Vui lòng đợi trong giây lát hoặc bấm nút Demo bên cạnh để test nhanh!");
});
initHeaderControls();
renderDigitalTicket();