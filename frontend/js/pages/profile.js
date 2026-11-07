/* ==========================================================================
   CHILLFLIX - TRANG HỒ SƠ & LỊCH SỬ ĐẶT PHÒNG (CHUẨN MOCKUP 8)
   ========================================================================== */

function formatMoney(amount) {
    return new Intl.NumberFormat("vi-VN").format(Number(amount) || 0) + "đ";
}

document.addEventListener("DOMContentLoaded", () => {
    initHeaderControls();
    loadUserProfile();
    setupTabSwitching();
    loadBookingHistory();
    setupVoucherCopy();
    setupFormEvents();
});
// ==========================================
// 1. TẢI DỮ LIỆU TÀI KHOẢN (ĐỒNG BỘ CẢ MENU GÓC PHẢI VÀ THẺ GIỮA)
// ==========================================
function loadUserProfile() {
    const defaultUser = {
        fullName: "Nguyễn Hoàng Nam",
        phone: "0988234567",
        email: "hoangnam.designer@cinenest.vn",
        rank: "Hạng Bạc",
        points: 1240
    };

    let user = defaultUser;
    try {
        const saved = localStorage.getItem("chillflix_user");
        if (saved) user = { ...defaultUser, ...JSON.parse(saved) };
    } catch (e) {}

    const pts = Number(user.points) || 0;
    let rankTitle = "Thành viên Mới";
    let nextTarget = 500;
    let nextRankName = "Silver";

    if (pts >= 3000) {
        rankTitle = "Hạng Kim Cương";
        nextTarget = 5000;
        nextRankName = "VIP Max";
    } else if (pts >= 1500) {
        rankTitle = "Hạng Vàng";
        nextTarget = 3000;
        nextRankName = "Diamond";
    } else if (pts >= 500) {
        rankTitle = "Hạng Bạc";
        nextTarget = 1500;
        nextRankName = "Gold Elite";
    }

    const percent = Math.min(100, ((pts / nextTarget) * 100)).toFixed(1);
    const remain = Math.max(0, nextTarget - pts);
    // PHÂN QUYỀN MENU: ẨN "QUẢN TRỊ RẠP" NẾU LÀ TÀI KHOẢN KHÁCH HÀNG
    const adminMenuLink = document.getElementById("menuLinkAdmin");
    if (adminMenuLink) {
        if (user.role === "admin") {
            adminMenuLink.style.display = "block"; // Chỉ hiện nếu là Admin
        } else {
            adminMenuLink.style.display = "none";  // Khách hàng thông thường thì ẩn hoàn toàn!
        }
    }
    // 1. CẬP NHẬT THẺ BANNER GIỮA MÀN HÌNH
    document.getElementById("userProfileName").textContent = user.fullName;
    document.getElementById("userProfileRankTag").textContent = `🛡 ${rankTitle}`;
    document.getElementById("userProfileEmail").textContent = user.email;
    document.getElementById("userProfilePhone").textContent = user.phone;
    document.getElementById("profileTotalPoints").innerHTML = `${new Intl.NumberFormat('vi-VN').format(pts)} <small>CinePoint</small>`;

    document.querySelector(".tier-percent-tag").textContent = `${rankTitle} (${percent}%)`;
    document.querySelector(".progress-bar-fill").style.width = `${percent}%`;
    document.querySelector(".tier-limits-row").innerHTML = `
        <span>Hiện tại (${pts}đ)</span>
        <span style="color: var(--primary);">Còn ${remain}đ lên ${nextRankName}</span>
        <span>Mục tiêu (${nextTarget}đ)</span>
    `;

    // 2. [ĐÃ FIX QUAN TRỌNG]: ĐỒNG BỘ CẢ MENU DROPDOWN GÓC TRÊN BÊN PHẢI
    const headerName = document.querySelector(".dropdown__name");
    const headerRank = document.querySelector(".dropdown__rank");
    if (headerName) headerName.textContent = user.fullName;
    if (headerRank) headerRank.textContent = `${rankTitle} · ${new Intl.NumberFormat('vi-VN').format(pts)} CinePoint`;

    // 3. ĐIỀN VÀO FORM THÔNG TIN CÁ NHÂN
    const nameInput = document.getElementById("profFullName");
    const phoneInput = document.getElementById("profPhone");
    const emailInput = document.getElementById("profEmail");
    if (nameInput) nameInput.value = user.fullName;
    if (phoneInput) phoneInput.value = user.phone;
    if (emailInput) emailInput.value = user.email;
}

// ==========================================
// 2. CHUYỂN ĐỔI TAB (TỰ NHẢY KHI CLICK MENU HEADER)
// ==========================================
function setupTabSwitching() {
    const tabs = document.querySelectorAll(".profile-tab-item");
    const panes = document.querySelectorAll(".tab-pane");

    // Hàm kích hoạt đúng tab
    window.activateTab = function(tabId) {
        tabs.forEach(t => t.classList.toggle("active", t.dataset.tab === tabId));
        panes.forEach(p => p.classList.toggle("active", p.id === tabId));
    };

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            window.activateTab(tab.dataset.tab);
        });
    });

    // Hàm đọc hash (#history, #vouchers) từ URL để nhảy tab
    function checkHashRoute() {
        const hash = window.location.hash;
        if (hash === "#history") {
            window.activateTab("tab-history");
        } else if (hash === "#vouchers") {
            window.activateTab("tab-vouchers");
        } else if (hash === "#tier") {
            window.activateTab("tab-tier");
        } else {
            window.activateTab("tab-account");
        }
    }

    // 1. Kiểm tra khi vừa tải trang
    checkHashRoute();

    // 2. [ĐÃ FIX QUAN TRỌNG]: Lắng nghe khi bấm trên menu Header (khi hash thay đổi)
    window.addEventListener("hashchange", checkHashRoute);

    // 3. Bắt sự kiện click trực tiếp trên các thẻ Menu Header
    document.getElementById("menuLinkHistory")?.addEventListener("click", () => {
        window.activateTab("tab-history");
    });
    document.getElementById("menuLinkVouchers")?.addEventListener("click", () => {
        window.activateTab("tab-vouchers");
    });
}

// ==========================================
// HIỂN THỊ LỊCH SỬ ĐẶT VÉ (CẢ VÉ THÀNH CÔNG & VÉ ĐÃ HỦY)
// ==========================================
function loadBookingHistory() {
    const container = document.getElementById("bookingHistoryList");
    if (!container) return;

    let historyList = [];
    try {
        const raw = localStorage.getItem("chillflix_booking_history");
        if (raw) historyList = JSON.parse(raw);
    } catch (e) {}

    // Dữ liệu mẫu nếu chưa có đơn nào
    if (historyList.length === 0) {
        historyList = [
            {
                ticketCode: "CP-5AUALF",
                movieId: 693134,
                movieTitle: "Dune: Hành Tinh Cát 2",
                roomName: "Nhóm 4 Sao Hỏa",
                date: "2026-11-06",
                startTime: "19:00",
                duration: 2.0,
                smartPin: "9854",
                paymentStatus: "paid",
                status: "confirmed",
                finalTotal: 409000,
                posterPath: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg"
            }
        ];
    }

    // Đếm số suất xem hợp lệ (chỉ đếm đơn chưa hủy)
    const validBookings = historyList.filter(b => b.status !== "cancelled");
    document.getElementById("statBookings").textContent = validBookings.length;

    container.innerHTML = historyList.map((b, index) => {
        const posterUrl = b.posterPath 
            ? `https://image.tmdb.org/t/p/w185${b.posterPath}` 
            : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=150&auto=format&fit=crop&q=80';

        // Xử lý giao diện nếu là Vé đã hủy
        const isCancelled = b.status === "cancelled";
        const isPaid = b.paymentStatus === "paid";

        let statusBadge = "";
        let pinBadge = "";
        let actionBtn = "";

        if (isCancelled) {
            statusBadge = `<span style="color: var(--danger); font-weight: 700; font-size: 11.5px; background: rgba(229, 72, 77, 0.12); padding: 2px 8px; border-radius: 4px;">✕ ĐÃ HỦY (ĐÃ HOÀN TIỀN)</span>`;
            pinBadge = `<span style="color: var(--text-muted); font-size: 11.5px; text-decoration: line-through;">Mã PIN: ${b.smartPin} (Vô hiệu)</span>`;
            actionBtn = `<span style="font-size: 12px; color: var(--text-muted); font-style: italic;">Đã hoàn ${formatMoney(b.finalTotal || b.grandTotal)}</span>`;
        } else {
            statusBadge = isPaid 
                ? `<span style="color: var(--success); font-weight: 700; font-size: 11.5px;">● Đã thanh toán &amp; duyệt</span>`
                : `<span style="color: var(--warning); font-weight: 700; font-size: 11.5px;">● Chờ duyệt tiền</span>`;
            
            pinBadge = `Mã đơn: <strong>${b.ticketCode}</strong> · ${isPaid ? `Mã PIN: <strong>${b.smartPin}</strong>` : '🔒 PIN đang khóa'}`;
            actionBtn = `<button type="button" class="btn-view-ticket-again" data-index="${index}">Xem lại vé &amp; Mã QR ➔</button>`;
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
                ${isCancelled 
                    ? `<button type="button" class="btn-view-ticket-again" data-index="${index}">Xem chi tiết vé hủy ➔</button>`
                    : `<button type="button" class="btn-view-ticket-again" data-index="${index}">Xem lại vé &amp; Mã QR ➔</button>`
                }
            </div>
        </article>
        `;
    }).join('');

    // Bấm xem lại vé của đơn chưa hủy
    container.querySelectorAll(".btn-view-ticket-again").forEach(btn => {
        btn.addEventListener("click", () => {
            const idx = Number(btn.dataset.index);
            const selectedTicket = historyList[idx];
            if (selectedTicket) {
                sessionStorage.setItem("chillflixBooking", JSON.stringify(selectedTicket));
                window.location.href = "booking-success.html";
            }
        });
    });
}
// 4. SAO CHÉP MÃ VOUCHER
function setupVoucherCopy() {
    document.querySelectorAll(".btn-copy-voucher").forEach(btn => {
        btn.addEventListener("click", () => {
            const code = btn.dataset.code;
            navigator.clipboard.writeText(code).then(() => {
                btn.textContent = "✓ Đã copy";
                setTimeout(() => { btn.textContent = "📋 Sao chép"; }, 2000);
            });
        });
    });
}

// ==========================================
// 5. LƯU THAY ĐỔI FORM (GIỮ NGUYÊN ĐIỂM, KHÔNG BỊ TỤT VỀ 1240)
// ==========================================
function setupFormEvents() {
    document.getElementById("formUpdateProfile")?.addEventListener("submit", (e) => {
        e.preventDefault();
        
        // Đọc user hiện tại để giữ lại số điểm tích lũy thật (1317 điểm)
        let currentUser = {};
        try {
            currentUser = JSON.parse(localStorage.getItem("chillflix_user")) || {};
        } catch (err) {}

        const updatedUser = {
            ...currentUser,
            fullName: document.getElementById("profFullName").value.trim(),
            phone: document.getElementById("profPhone").value.trim(),
            email: document.getElementById("profEmail").value.trim()
            // Không gán cứng points: 1240 nữa! Điểm thật sẽ được giữ nguyên 100%!
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
        if (confirm("⚠️ CẢNH BÁO: Bạn có chắc chắn muốn xóa tài khoản này không? Toàn bộ điểm tích lũy và lịch sử vé sẽ bị hủy vĩnh viễn!")) {
            localStorage.removeItem("chillflix_user");
            localStorage.removeItem("chillflix_token");
            sessionStorage.removeItem("chillflixBooking");
            localStorage.removeItem("chillflix_booking_history");
            alert("Đã xóa tài khoản.");
            window.location.href = "index.html";
        }
    });
}
// 6. SỰ KIỆN HEADER CHUNG
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

    document.getElementById("btnLogout")?.addEventListener("click", (e) => {
        e.preventDefault();
        if (confirm("Bạn có chắc chắn muốn đăng xuất tài khoản?")) {
            localStorage.removeItem("chillflix_user");
            localStorage.removeItem("chillflix_token");
            window.location.href = "index.html";
        }
    });
}