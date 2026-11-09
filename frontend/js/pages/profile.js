/* ==========================================================================
   CHILLFLIX - TRANG HỒ SƠ & LỊCH SỬ ĐẶT VÉ (CÓ BỘ LỌC VÉ & DỌN SẠCH CODE)
   ========================================================================== */

function formatMoney(amount) {
    return new Intl.NumberFormat("vi-VN").format(Number(amount) || 0) + "đ";
}

let allHistoryBookings = [];
let currentHistoryFilter = "all"; // "all", "active", "cancelled"

document.addEventListener("DOMContentLoaded", () => {
    // 1. Kiểm tra đăng nhập
    const userRaw = localStorage.getItem("chillflix_user");
    if (!userRaw) {
        alert("Vui lòng đăng nhập để xem thông tin hồ sơ!");
        window.location.href = "login.html";
        return;
    }

    loadUserProfile();
    setupTabSwitching();
    initHistorySection();
    setupVoucherClaimSystem();
    setupFormEvents();
});

// ==========================================
// 1. TẢI DỮ LIỆU TÀI KHOẢN & ĐỒNG BỘ TIẾN TRÌNH
// ==========================================
function loadUserProfile() {
    let user = {
        fullName: "Khách Xem Phim",
        phone: "0912345678",
        email: "khachhang@chillflix.vn",
        role: "customer",
        rank: "Thành viên Mới",
        points: 0,
        claimedVouchers: []
    };

    try {
        const raw = localStorage.getItem("chillflix_user");
        if (raw) user = { ...user, ...JSON.parse(raw) };
    } catch (e) {}

    const pts = Number(user.points) || 0;
    let rankTitle = "Thành viên Mới";
    let nextTarget = 500;
    let nextRankName = "Bạc (Silver)";

    if (pts >= 3000) {
        rankTitle = "Hạng Kim Cương";
        nextTarget = 5000;
        nextRankName = "VIP Max";
    } else if (pts >= 1500) {
        rankTitle = "Hạng Vàng";
        nextTarget = 3000;
        nextRankName = "Kim Cương";
    } else if (pts >= 500) {
        rankTitle = "Hạng Bạc";
        nextTarget = 1500;
        nextRankName = "Vàng (Gold)";
    }

    const percent = Math.min(100, ((pts / nextTarget) * 100)).toFixed(1);
    const remain = Math.max(0, nextTarget - pts);

    // Cập nhật Banner
    document.getElementById("userProfileName").textContent = user.fullName;
    document.getElementById("userProfileRankTag").textContent = `🛡 ${rankTitle}`;
    document.getElementById("userProfileEmail").textContent = user.email;
    document.getElementById("userProfilePhone").textContent = user.phone;
    document.getElementById("profileTotalPoints").innerHTML = `${new Intl.NumberFormat('vi-VN').format(pts)} <small>CinePoint</small>`;

    document.getElementById("tierPercentDisplay").textContent = `${rankTitle} (${percent}%)`;
    document.getElementById("tierProgressBar").style.width = `${percent}%`;
    document.getElementById("tierLimitsRow").innerHTML = `
        <span>Điểm hiện tại (${pts}đ)</span>
        <span style="color: var(--primary);">Còn ${remain}đ lên ${nextRankName}</span>
        <span>Mục tiêu (${nextTarget}đ)</span>
    `;

    // Cập nhật số voucher trong ví
    const claimedCount = (user.claimedVouchers || []).length;
    document.getElementById("voucherCountBadge").textContent = claimedCount;

    // Điền vào Form thông tin cá nhân
    const nameInput = document.getElementById("profFullName");
    const phoneInput = document.getElementById("profPhone");
    const emailInput = document.getElementById("profEmail");
    if (nameInput) nameInput.value = user.fullName;
    if (phoneInput) phoneInput.value = user.phone;
    if (emailInput) emailInput.value = user.email;
}

// ==========================================
// 2. CHUYỂN TAB NỘI DUNG
// ==========================================
function setupTabSwitching() {
    const tabs = document.querySelectorAll(".profile-tab-item");
    const panes = document.querySelectorAll(".tab-pane");

    window.activateTab = function(tabId) {
        tabs.forEach(t => t.classList.toggle("active", t.dataset.tab === tabId));
        panes.forEach(p => p.classList.toggle("active", p.id === tabId));
    };

    tabs.forEach(tab => {
        tab.addEventListener("click", () => window.activateTab(tab.dataset.tab));
    });

    function checkHashRoute() {
        const hash = window.location.hash;
        if (hash === "#history") window.activateTab("tab-history");
        else if (hash === "#vouchers") window.activateTab("tab-vouchers");
        else if (hash === "#tier") window.activateTab("tab-tier");
        else window.activateTab("tab-account");
    }

    checkHashRoute();
    window.addEventListener("hashchange", checkHashRoute);

    document.getElementById("menuLinkHistory")?.addEventListener("click", () => window.activateTab("tab-history"));
    document.getElementById("menuLinkVouchers")?.addEventListener("click", () => window.activateTab("tab-vouchers"));
}

// ==========================================
// 3. KHỞI TẠO BỘ LỌC & DANH SÁCH LỊCH SỬ VÉ
// ==========================================
function initHistorySection() {
    try {
        const raw = localStorage.getItem("chillflix_booking_history");
        allHistoryBookings = raw ? JSON.parse(raw) : [];
    } catch (e) {
        allHistoryBookings = [];
    }

    // Đếm số lượng theo trạng thái
    const activeList = allHistoryBookings.filter(b => b.status !== "cancelled");
    const cancelledList = allHistoryBookings.filter(b => b.status === "cancelled");

    document.getElementById("filterCountAll").textContent = allHistoryBookings.length;
    document.getElementById("filterCountActive").textContent = activeList.length;
    document.getElementById("filterCountCancelled").textContent = cancelledList.length;
    document.getElementById("historyTabCount").textContent = allHistoryBookings.length;

    // Cập nhật số liệu trên Banner chính
    const totalHours = activeList.reduce((sum, b) => sum + (Number(b.duration) || 2), 0);
    const totalFnB = activeList.reduce((sum, b) => {
        const foods = Array.isArray(b.foods) ? b.foods : [];
        return sum + foods.reduce((s, f) => s + (Number(f.quantity) || 0), 0);
    }, 0);

    document.getElementById("statBookings").textContent = activeList.length;
    document.getElementById("statHours").textContent = `${totalHours.toFixed(1)}h`;
    document.getElementById("statFnB").textContent = totalFnBCount;

    // Bắt sự kiện bấm vào các nút Chip Lọc
    const filterChips = document.querySelectorAll(".history-filter-chip");
    filterChips.forEach(chip => {
        chip.addEventListener("click", () => {
            filterChips.forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
            currentHistoryFilter = chip.dataset.filter;
            renderFilteredHistory();
        });
    });

    renderFilteredHistory();
}

// Render danh sách vé theo đúng bộ lọc đã chọn
function renderFilteredHistory() {
    const container = document.getElementById("bookingHistoryList");
    if (!container) return;

    let displayList = [...allHistoryBookings];
    if (currentHistoryFilter === "active") {
        displayList = displayList.filter(b => b.status !== "cancelled");
    } else if (currentHistoryFilter === "cancelled") {
        displayList = displayList.filter(b => b.status === "cancelled");
    }

    if (displayList.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; border: 1px dashed var(--border); border-radius: var(--radius-md);">
                <p style="color: var(--text-muted); font-size: 13.5px; margin: 0;">Không có đơn đặt phòng nào trong mục này.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = displayList.map(b => {
        const posterUrl = b.posterPath 
            ? `https://image.tmdb.org/t/p/w185${b.posterPath}` 
            : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=150';

        const isCancelled = b.status === "cancelled";
        const isPaid = b.paymentStatus === "paid";

        let statusBadge = "";
        let pinBadge = "";
        let actionBtn = "";

        if (isCancelled) {
            statusBadge = `<span style="color: var(--danger); font-weight: 700; font-size: 11px; background: rgba(229, 72, 77, 0.12); padding: 2px 8px; border-radius: 4px;">✕ ĐÃ HỦY (ĐÃ HOÀN TIỀN)</span>`;
            pinBadge = `<span style="color: var(--text-muted); font-size: 11.5px; text-decoration: line-through;">Mã PIN: ${b.smartPin} (Vô hiệu)</span>`;
            actionBtn = `<button type="button" class="btn-view-ticket-again" data-code="${b.ticketCode}">Xem chi tiết vé hủy ➔</button>`;
        } else {
            statusBadge = isPaid 
                ? `<span style="color: var(--success); font-weight: 700; font-size: 11px;">● Đã xác nhận &amp; duyệt</span>`
                : `<span style="color: var(--warning); font-weight: 700; font-size: 11px;">● Chờ duyệt tiền</span>`;
            
            pinBadge = `Mã đơn: <strong>${b.ticketCode}</strong> · ${isPaid ? `Mã PIN: <strong>${b.smartPin}</strong>` : '🔒 PIN đang khóa'}`;
            actionBtn = `<button type="button" class="btn-view-ticket-again" data-code="${b.ticketCode}">Xem lại vé &amp; Mã QR ➔</button>`;
        }

        return `
        <article class="history-booking-card ${isCancelled ? 'is-cancelled' : ''}">
            <div class="history-card-left">
                <img src="${posterUrl}" onerror="this.src='https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=150'" alt="${b.movieTitle}" class="history-poster-thumb" />
                <div class="history-info">
                    <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                        <h4 style="${isCancelled ? 'text-decoration: line-through; color: var(--text-muted);' : ''}">${b.movieTitle || "Phim chiếu rạp"}</h4>
                        ${statusBadge}
                    </div>
                    <div class="history-meta">
                        <span>🛋 ${b.roomName || "Phòng riêng"}</span>
                        <span>•</span>
                        <span>📅 ${b.date} (${b.startTime})</span>
                    </div>
                    <span class="history-pin-badge">
                        ${pinBadge}
                    </span>
                </div>
            </div>

            <div class="history-card-right">
                <div class="history-price" style="${isCancelled ? 'text-decoration: line-through; opacity: 0.5;' : ''}">
                    ${formatMoney(b.finalTotal || b.grandTotal || 240000)}
                </div>
                ${actionBtn}
            </div>
        </article>
        `;
    }).join('');

    // Bấm xem lại vé -> Tìm đúng vé theo ticketCode
    container.querySelectorAll(".btn-view-ticket-again").forEach(btn => {
        btn.addEventListener("click", () => {
            const code = btn.dataset.code;
            const target = allHistoryBookings.find(b => b.ticketCode === code);
            if (target) {
                sessionStorage.setItem("chillflixBooking", JSON.stringify(target));
                window.location.href = "booking-success.html";
            }
        });
    });
}

// ==========================================
// 4. HIỂN THỊ VÍ VOUCHER THỰC TẾ (CHỈ HIỆN MÃ ĐÃ NHẬN)
// ==========================================
const VOUCHER_MASTER_DATA = {
    PHIM20: {
        code: "PHIM20",
        discount: "20%",
        desc: "Giảm 20% tiền phòng cho thành viên.",
        expiry: "31/12/2026",
        badge: "GIẢM GIÁ"
    },
    CHILL10: {
        code: "CHILL10",
        discount: "10%",
        desc: "Giảm 10% tổng đơn cho suất chiếu đêm từ 21:00.",
        expiry: "31/12/2026",
        badge: "GIẢM GIÁ"
    },
    FNBCOUPLE: {
        code: "FNBCOUPLE",
        discount: "🍿",
        desc: "Tặng 1 bắp rang bơ caramel khi đặt phòng Couple.",
        expiry: "30/11/2026",
        badge: "QUÀ TẶNG"
    }
};

function setupVoucherClaimSystem() {
    const container = document.querySelector(".vouchers-grid");
    if (!container) return;

    let user = JSON.parse(localStorage.getItem("chillflix_user")) || {};
    let claimedList = user.claimedVouchers || [];

    // Cập nhật số lượng trên Tab
    document.getElementById("voucherCountBadge").textContent = claimedList.length;

    // TRƯỜNG HỢP: VÍ TRỐNG (CHƯA NHẬN MÃ NÀO)
    if (claimedList.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; border: 1px dashed var(--border); border-radius: var(--radius-md);">
                <div style="font-size: 36px; margin-bottom: 10px;">🏷</div>
                <h4 style="color: var(--text); margin-bottom: 6px;">Ví của bạn hiện đang trống</h4>
                <p style="color: var(--text-muted); font-size: 13.5px; margin-bottom: 16px;">
                    Bạn chưa thu thập mã giảm giá nào. Hãy săn mã ưu đãi tại <strong>Trang chủ</strong> hoặc <strong>Trang Đồ ăn</strong>!
                </p>
                <div style="display: flex; gap: 12px; justify-content: center;">
                    <a href="index.html" class="btn btn--primary" style="height: 38px; font-size: 13px; padding: 0 16px;">Săn mã tại Trang chủ ➔</a>
                    <a href="booking-food.html" class="btn btn--outline" style="height: 38px; font-size: 13px; padding: 0 16px;">Nhận mã Bắp Nước ➔</a>
                </div>
            </div>
        `;
        return;
    }

    // TRƯỜNG HỢP: ĐÃ CÓ MÃ TRONG VÍ -> HIỂN THỊ CÁC MÃ ĐÃ NHẬN
    container.innerHTML = claimedList.map(code => {
        const v = VOUCHER_MASTER_DATA[code] || {
            code: code,
            discount: "ƯU ĐÃI",
            desc: "Mã giảm giá rạp ChillFlix",
            expiry: "31/12/2026",
            badge: "VOUCHER"
        };

        return `
        <div class="voucher-card-item">
            <div class="v-left">
                <span class="v-percent">${v.discount}</span>
                <small>${v.badge}</small>
            </div>
            <div class="v-right">
                <strong>Mã: ${v.code}</strong>
                <p>${v.desc}</p>
                <div class="v-bottom">
                    <span>HSD: ${v.expiry}</span>
                    <button type="button" class="btn-copy-voucher" data-code="${v.code}">📋 Sao chép mã</button>
                </div>
            </div>
        </div>
        `;
    }).join('');

    // Nút sao chép mã
    container.querySelectorAll(".btn-copy-voucher").forEach(btn => {
        btn.addEventListener("click", () => {
            const code = btn.dataset.code;
            navigator.clipboard.writeText(code);
            btn.textContent = "✓ Đã copy";
            setTimeout(() => { btn.textContent = "📋 Sao chép mã"; }, 2000);
        });
    });
}

// ==========================================
// 5. CẬP NHẬT FORM VÀ ĐỔI MẬT KHẨU
// ==========================================
function setupFormEvents() {
    document.getElementById("formUpdateProfile")?.addEventListener("submit", (e) => {
        e.preventDefault();
        let currentUser = JSON.parse(localStorage.getItem("chillflix_user")) || {};

        const updatedUser = {
            ...currentUser,
            fullName: document.getElementById("profFullName").value.trim(),
            phone: document.getElementById("profPhone").value.trim(),
            email: document.getElementById("profEmail").value.trim()
        };

        localStorage.setItem("chillflix_user", JSON.stringify(updatedUser));
        loadUserProfile();
        alert("✅ Đã cập nhật thông tin cá nhân thành công!");
    });

    document.getElementById("formChangePassword")?.addEventListener("submit", (e) => {
        e.preventDefault();
        const newPass = document.getElementById("newPassword").value;
        const confirmPass = document.getElementById("confirmNewPassword").value;

        if (newPass.length < 8) {
            alert("Mật khẩu mới phải có ít nhất 8 ký tự!");
            return;
        }
        if (newPass !== confirmPass) {
            alert("Xác nhận mật khẩu mới không trùng khớp!");
            return;
        }

        alert("✅ Đã đổi mật khẩu thành công!");
        document.getElementById("formChangePassword").reset();
    });

    document.getElementById("btnDeleteAccount")?.addEventListener("click", () => {
        if (confirm("⚠️ Bạn có chắc chắn muốn xóa tài khoản này không? Toàn bộ điểm và lịch sử vé sẽ bị xóa vĩnh viễn!")) {
            localStorage.removeItem("chillflix_user");
            localStorage.removeItem("chillflix_token");
            localStorage.removeItem("chillflix_booking_history");
            sessionStorage.removeItem("chillflixBooking");
            alert("Đã xóa tài khoản.");
            window.location.href = "login.html";
        }
    });
}