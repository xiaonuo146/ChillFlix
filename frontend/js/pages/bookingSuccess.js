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

    // 1. Mã vé duy nhất
    const ticketCode = bookingData.ticketCode || "CP-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    setText("ticketCodeDisplay", ticketCode);

    // 2. Tên phòng & Sức chứa
    const rName = (bookingData.roomName || "PHÒNG CHIẾU RIÊNG TƯ").toUpperCase();
    setText("ticketRoomName", rName);

    if (rName.includes("COUPLE")) {
        setText("ticketCapacityText", "👥 1 - 2 Người lớn");
    } else if (rName.includes("SAO HỎA")) {
        setText("ticketCapacityText", "👥 3 - 6 Người lớn");
    } else {
        setText("ticketCapacityText", "👥 8 - 12 Người lớn (VIP)");
    }

    // 3. Phim & Bìa poster
    setText("ticketMovieTitle", bookingData.movieTitle || "Phim chiếu rạp");
    setText("ticketDate", bookingData.date || "--");

    const posterEl = document.getElementById("ticketMoviePoster");
    if (posterEl) {
        if (bookingData.posterPath) {
            posterEl.src = `https://image.tmdb.org/t/p/w500${bookingData.posterPath}`;
        } else if (bookingData.movieId) {
            // Tự động tải bìa phim nếu đơn chưa lưu
            import("../api.js").then(({ getMovieDetails }) => {
                getMovieDetails(bookingData.movieId).then(m => {
                    if (m && m.poster_path) {
                        posterEl.src = `https://image.tmdb.org/t/p/w500${m.poster_path}`;
                    }
                });
            });
        }
    }

    // 4. Giờ chiếu & Đệm dọn phòng
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

    // 5. Khách hàng & Mã PIN mở phòng thông minh
    const customer = bookingData.customer || {};
    setText("ticketCustomerName", customer.name || "Khách xem phim");
    setText("ticketSmartPin", bookingData.smartPin || "9854");

    // 6. Tính thời gian đón khách
    calculateArrivalCountdown(bookingData.date, startTime);

    // 7. Tạo mã QR Check-in thật
    generateCheckinQr(ticketCode);

    // 8. Danh sách F&B & Tổng tiền
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

// XỬ LÝ HỦY VÉ TRƯỚC 2 TIẾNG
document.getElementById("btnCancelBooking")?.addEventListener("click", () => {
    if (!bookingData) return;

    const showDateTimeStr = `${bookingData.date}T${bookingData.startTime}:00`;
    const showTime = new Date(showDateTimeStr).getTime();
    const now = new Date().getTime();
    const diffHours = (showTime - now) / (1000 * 60 * 60);

    if (diffHours < 2) {
        alert("⚠️ RẤT TIẾC, KHÔNG THỂ HỦY VÉ!\n\nTheo quy định của rạp ChillFlix, suất chiếu chỉ được hủy trước giờ bắt đầu tối thiểu 2 tiếng. Hiện tại đã quá sát giờ chiếu nên phòng và đồ ăn đã được chuẩn bị sẵn sàng.");
        return;
    }

    const confirmCancel = confirm(`❓ XÁC NHẬN HỦY VÉ #${bookingData.ticketCode}?\n\nSuất chiếu còn hơn 2 tiếng nữa mới diễn ra. Bạn đủ điều kiện HOÀN TIỀN 100% (${formatMoney(bookingData.finalTotal || bookingData.grandTotal)}).\n\nBạn có chắc chắn muốn hủy không?`);

    if (confirmCancel) {
        sessionStorage.removeItem("chillflixBooking");
        alert("✅ HỦY ĐẶT PHÒNG THÀNH CÔNG!\n\nHệ thống đã nhả phòng chiếu cho khách khác và tiến hành hoàn tiền 100%. Cảm ơn bạn!");
        window.location.href = "index.html";
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

initHeaderControls();
renderDigitalTicket();