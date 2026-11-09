/* ==========================================================================
   CHILLFLIX - BƯỚC 4: VÉ ĐIỆN TỬ & MÃ PIN (CHUẨN MOCKUP 6)
   ========================================================================== */

import { API } from '../apiClient.js';

let bookingData = null;

function formatMoney(amount) {
    return new Intl.NumberFormat("vi-VN").format(Math.max(0, Math.round(Number(amount) || 0))) + "đ";
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val ?? "--";
}

document.addEventListener("DOMContentLoaded", async () => {
    initHeaderControls();

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
        try {
            const res = await API.getTicket(code);
            bookingData = res.data;
        } catch (err) {
            console.warn("Dùng dữ liệu sessionStorage:", err);
            const saved = sessionStorage.getItem("chillflixBooking");
            if (saved) bookingData = JSON.parse(saved);
        }
    } else {
        const saved = sessionStorage.getItem("chillflixBooking");
        if (saved) bookingData = JSON.parse(saved);
    }

    renderDigitalTicket();
    setupDemoBankWebhookButton();
});

function renderDigitalTicket() {
    if (!bookingData) {
        const layout = document.querySelector(".success-main-layout");
        if (layout) {
            layout.innerHTML = `
                <div class="unified-ticket-card" style="text-align: center; padding: 48px 24px;">
                    <h2 style="color: var(--danger); margin-bottom: 12px;">Chưa tìm thấy đơn đặt phòng!</h2>
                    <p style="color: var(--text-muted); margin-bottom: 24px;">Vui lòng thực hiện đặt phòng để nhận vé.</p>
                    <a href="booking.html" class="btn btn--primary" style="display: inline-flex; height: 44px; padding: 0 24px;">Về trang đặt phòng</a>
                </div>
            `;
        }
        return;
    }

    const isCancelled = bookingData.status === "cancelled";
    const isPaid = bookingData.paymentStatus === "paid";
    const orderCode = bookingData.bookingCode || bookingData.ticketCode || "CP-DEMO";

    // 1. XỬ LÝ KHI VÉ BỊ HỦY
    if (isCancelled) {
        const badge = document.getElementById("heroStatusBadge");
        if (badge) {
            badge.textContent = "✕";
            badge.classList.add("cancelled");
        }
        setText("heroStatusTitle", "Đơn Đặt Phòng Này Đã Bị Hủy");
        setText("heroStatusSub", "Suất chiếu đã được hủy. Tiền phòng và ẩm thực F&B đã được hoàn trả.");

        const stamp = document.getElementById("cancelledWatermarkStamp");
        if (stamp) stamp.style.display = "block";

        const card = document.getElementById("printableTicket");
        if (card) card.classList.add("is-cancelled");

        const arrivalStrip = document.getElementById("ticketArrivalStrip");
        if (arrivalStrip) arrivalStrip.style.display = "none";

        const cancelBox = document.querySelector(".cancel-booking-box");
        if (cancelBox) cancelBox.style.display = "none";

        const checkinCenter = document.querySelector(".ticket-checkin-center");
        if (checkinCenter) {
            checkinCenter.innerHTML = `
                <div class="cancelled-notice-box" style="background: rgba(229, 72, 77, 0.08); border: 1px dashed var(--danger); padding: 20px; border-radius: 8px;">
                    <h4 style="color: var(--danger); margin: 0 0 8px;">🔒 MÃ QR VÀ MÃ PIN ĐÃ BỊ VÔ HIỆU HÓA</h4>
                    <p style="color: var(--text-muted); font-size: 13px; margin: 0;">Đơn đặt phòng này không còn hiệu lực check-in.</p>
                </div>
            `;
        }
    }

    // 2. THÔNG TIN CƠ BẢN CỦA VÉ
    setText("ticketCodeDisplay", orderCode);
    setText("ticketRoomName", (bookingData.roomName || "PHÒNG CHIẾU RIÊNG").toUpperCase());

    const rName = (bookingData.roomName || "").toUpperCase();
    if (rName.includes("COUPLE")) setText("ticketCapacityText", "👥 1 - 2 Người lớn");
    else if (rName.includes("SAO HỎA")) setText("ticketCapacityText", "👥 3 - 6 Người lớn");
    else setText("ticketCapacityText", "👥 8 - 12 Người lớn (VIP)");

    setText("ticketMovieTitle", bookingData.movieTitle || "Phim chiếu rạp");
    setText("ticketDate", bookingData.date || "--");

    const startTime = bookingData.startTime || "18:30";
    const dur = Number(bookingData.duration) || 2.0;
    const [sH, sM] = startTime.split(":").map(Number);
    const endTotalMins = sH * 60 + sM + Math.round(dur * 60);
    const endTime = `${String(Math.floor(endTotalMins / 60) % 24).padStart(2, '0')}:${String(endTotalMins % 60).padStart(2, '0')}`;
    setText("ticketTime", `${startTime} ➔ ${endTime} (${dur.toFixed(1)}h)`);

    const cleanEndTotal = endTotalMins + 15;
    const cleanTime = `${String(Math.floor(cleanEndTotal / 60) % 24).padStart(2, '0')}:${String(cleanEndTotal % 60).padStart(2, '0')}`;
    setText("ticketBufferTime", `${endTime} ➔ ${cleanTime} (15p)`);

    setText("ticketCustomerName", bookingData.customer?.name || "Khách xem phim");

    // Poster
    const posterEl = document.getElementById("ticketMoviePoster");
    if (posterEl && bookingData.posterPath) {
        posterEl.src = `https://image.tmdb.org/t/p/w500${bookingData.posterPath}`;
    }

    // Trạng thái thanh toán & Mã PIN
    const statusTag = document.getElementById("ticketStatusTag");
    const pinEl = document.getElementById("ticketSmartPin");

    if (!isCancelled) {
        if (isPaid) {
            if (statusTag) {
                statusTag.textContent = "• ĐÃ XÁC NHẬN (ĐÃ THANH TOÁN)";
                statusTag.style.color = "var(--success)";
            }
            if (pinEl) {
                pinEl.textContent = bookingData.smartPin || "8892";
                pinEl.style.color = "var(--primary)";
                pinEl.style.fontSize = "26px";
            }
        } else {
            if (statusTag) {
                statusTag.textContent = "• CHỜ XÁC NHẬN CHUYỂN KHOẢN";
                statusTag.style.color = "var(--warning)";
            }
            if (pinEl) {
                pinEl.textContent = "🔒 ĐANG KHÓA (CHỜ DUYỆT TIỀN)";
                pinEl.style.color = "var(--warning)";
                pinEl.style.fontSize = "14px";
            }
        }
        generateCheckinQr(orderCode);
    }

    // Đồ ăn F&B & Tổng tiền
    renderTicketFoods();
    setText("ticketDurationLabel", `${dur.toFixed(1)} giờ`);
    setText("ticketRoomPrice", formatMoney(bookingData.roomTotal));
    setText("ticketGrandTotal", formatMoney(bookingData.finalTotal || bookingData.grandTotal));
    setText("ticketPointsEarned", `+${bookingData.earnedPoints || Math.floor((bookingData.finalTotal || 0) / 10000)} điểm`);
}

function generateCheckinQr(bookingCode) {
    const qrContainer = document.getElementById("ticketQrCanvas");
    if (!qrContainer) return;
    qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=124x124&data=CHILLFLIX:${bookingCode}" alt="Mã QR vé" style="width:100%; height:100%;" />`;
}

function renderTicketFoods() {
    const container = document.getElementById("ticketFoodList");
    if (!container) return;
    container.innerHTML = "";

    const foods = Array.isArray(bookingData?.foods) ? bookingData.foods : [];
    setText("ticketFoodCount", `${foods.reduce((sum, i) => sum + (i.quantity || 0), 0)} món`);

    if (foods.length === 0) {
        container.innerHTML = `<p class="t-food-row" style="color: var(--text-muted); border: none;">Không đặt trước đồ ăn.</p>`;
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

// NÚT TEST DEMO: GIẢ LẬP ĐÃ CHUYỂN KHOẢN THÀNH CÔNG (MỞ KHÓA MÃ PIN TỨC THÌ)
function setupDemoBankWebhookButton() {
    let btnTest = document.getElementById("btnSimulatePaid");
    if (!btnTest) {
        const group = document.querySelector(".ticket-actions-group");
        if (group) {
            btnTest = document.createElement("button");
            btnTest.id = "btnSimulatePaid";
            btnTest.className = "btn btn--outline";
            btnTest.style.borderColor = "var(--success)";
            btnTest.style.color = "var(--success)";
            btnTest.style.marginBottom = "8px";
            btnTest.innerHTML = "⚡ [Demo Test] Giả lập Ngân hàng báo ĐÃ NHẬN TIỀN (Mở PIN)";
            group.insertBefore(btnTest, group.firstChild);
        }
    }

    btnTest?.addEventListener("click", async () => {
        if (!bookingData) return;
        const code = bookingData.bookingCode || bookingData.ticketCode;
        try {
            await API.confirmPayment(code);
            
            // CỘNG NGAY ĐIỂM VÀO TÀI KHOẢN TRÊN MÁY KHÁCH
            try {
                const rawUser = localStorage.getItem("chillflix_user");
                if (rawUser) {
                    const u = JSON.parse(rawUser);
                    const ptsEarned = bookingData.earnedPoints || Math.floor((bookingData.finalTotal || 0) / 10000);
                    u.points = (Number(u.points) || 0) + ptsEarned;
                    localStorage.setItem("chillflix_user", JSON.stringify(u));
                }
            } catch(e) {}

            alert(`🎉 Ngân hàng VietQR xác nhận: Đã nhận đủ ${formatMoney(bookingData.finalTotal)}!\n🔓 Mã PIN mở phòng chiếu: ${bookingData.smartPin || '4985'}\n🎁 Bạn đã được cộng +${bookingData.earnedPoints || 36} điểm CinePoint!`);
            
            bookingData.paymentStatus = "paid";
            bookingData.status = "confirmed";
            renderDigitalTicket();
        } catch (e) {
            alert("Lỗi duyệt tiền: " + e.message);
        }
    });
}

// In vé & Copy mã
document.getElementById("btnPrintTicket")?.addEventListener("click", () => window.print());
document.getElementById("btnCopyCode")?.addEventListener("click", () => {
    const code = document.getElementById("ticketCodeDisplay")?.textContent || "";
    navigator.clipboard.writeText(code).then(() => alert("Đã sao chép mã đơn: " + code));
});

// HỦY VÉ GỌI API THẬT
document.getElementById("btnCancelBooking")?.addEventListener("click", async () => {
    if (!bookingData) return;
    const code = bookingData.bookingCode || bookingData.ticketCode;

    if (confirm(`❓ Xác nhận hủy đơn #${code} và nhận hoàn tiền 100%?`)) {
        try {
            await API.cancelBooking(code);
            alert("✓ Hủy đơn đặt phòng thành công trên hệ thống!");
            bookingData.status = "cancelled";
            renderDigitalTicket();
        } catch (err) {
            alert("⚠️ " + (err.message || "Lỗi khi hủy vé"));
        }
    }
});

function initHeaderControls() {
    document.getElementById("themeToggle")?.addEventListener("click", () => {
        const cur = document.documentElement.getAttribute("data-theme");
        document.documentElement.setAttribute("data-theme", cur === "light" ? "dark" : "light");
    });
}