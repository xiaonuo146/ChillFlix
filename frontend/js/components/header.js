/* ==========================================================================
   CHILLFLIX - HEADER CONTROLLER CHỐNG XUNG ĐỘT 100% (DÙNG CHO MỌI TRANG)
   Tự động dọn sạch code cũ, đồng bộ Dark/Light, Avatar Dropdown và Phân quyền
   ========================================================================== */

// Chạy an toàn bất kể trang web load nhanh hay chậm
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runHeaderInit);
} else {
    runHeaderInit();
}

// ==========================================
// 1. TỰ ĐỘNG RESET VÀ ĐIỀU KHIỂN SÁNG / TỐI
// ==========================================
function setupMasterTheme() {
    const rawBtn = document.getElementById("themeToggle");
    const themeIcon = document.getElementById("themeIcon");
    if (!rawBtn) return;

    // TẨY SẠCH 100% CODE CŨ BẰNG KỸ THUẬT CLONE (TRÁNH XUNG ĐỘT TRIỆT TIÊU)
    const themeBtn = rawBtn.cloneNode(true);
    rawBtn.parentNode.replaceChild(themeBtn, rawBtn);

    // Nạp theme đã lưu
    const savedTheme = localStorage.getItem("chillflix-theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
    const iconEl = themeBtn.querySelector("#themeIcon") || document.getElementById("themeIcon");
    if (iconEl) iconEl.textContent = savedTheme === "light" ? "☀️" : "🌙";

    // Bắt sự kiện bấm đổi màu duy nhất
    themeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const current = document.documentElement.getAttribute("data-theme") || "dark";
        const next = current === "light" ? "dark" : "light";

        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("chillflix-theme", next);

        const currentIcon = document.getElementById("themeIcon");
        if (currentIcon) currentIcon.textContent = next === "light" ? "☀️" : "🌙";
    });
}

// ==========================================
// 2. TỰ ĐỘNG RESET VÀ MỞ MENU AVATAR TRÊN MỌI TRANG
// ==========================================
function setupMasterUser() {
    const rawUserBtn = document.getElementById("userMenuBtn");
    const userDropdown = document.getElementById("userDropdown");
    if (!rawUserBtn || !userDropdown) return;

    // TẨY SẠCH CODE BỊ LIỆT CŨ CỦA NÚT AVATAR
    const userBtn = rawUserBtn.cloneNode(true);
    rawUserBtn.parentNode.replaceChild(userBtn, rawUserBtn);

    const nameEl = userDropdown.querySelector(".dropdown__name");
    const rankEl = userDropdown.querySelector(".dropdown__rank");
    const adminLink = userDropdown.querySelector("#menuLinkAdmin") || userDropdown.querySelector('a[href*="admin"]');
    const voucherMenu = userDropdown.querySelector("#menuLinkVouchers") || userDropdown.querySelector('a[href*="vouchers"]');
    const logoutBtn = userDropdown.querySelector("#btnLogout") || userDropdown.querySelector(".dropdown__item--danger");

    // ĐỌC NGƯỜI ĐANG ĐĂNG NHẬP
    let user = null;
    try {
        const raw = localStorage.getItem("chillflix_user");
        if (raw) user = JSON.parse(raw);
    } catch (e) {}

    if (user) {
        // === ĐÃ ĐĂNG NHẬP ===
        const pts = Number(user.points) || 0;
        const vCount = (user.claimedVouchers || []).length;

        // Điền Tên và Điểm thật lên Header của BẤT KỲ TRANG NÀO
        if (nameEl) nameEl.textContent = user.fullName || "Khách xem phim";
        if (rankEl) rankEl.textContent = `${user.rank || 'Thành viên Mới'} · ${new Intl.NumberFormat('vi-VN').format(pts)} CinePoint`;
        if (voucherMenu) voucherMenu.textContent = `Ví Voucher của tôi (${vCount})`;

        // PHÂN QUYỀN ADMIN: Khách thì ẩn, Admin thì hiện
        if (adminLink) {
            adminLink.style.display = (user.role === "admin") ? "block" : "none";
        }

        // BẤM VÀO AVATAR -> THẢ MENU XUỐNG
        userBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            userDropdown.classList.toggle("show");
        });

        // Click ra ngoài bất kỳ chỗ nào thì đóng menu
        window.addEventListener("click", (e) => {
            if (!userBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove("show");
            }
        });

        // ĐĂNG XUẤT
        if (logoutBtn) {
            logoutBtn.addEventListener("click", (e) => {
                e.preventDefault();
                if (confirm("Bạn có chắc chắn muốn đăng xuất tài khoản?")) {
                    localStorage.removeItem("chillflix_user");
                    localStorage.removeItem("chillflix_token");
                    window.location.href = "login.html";
                }
            });
        }

    } else {
        // === CHƯA ĐĂNG NHẬP ===
        if (nameEl) nameEl.textContent = "Khách vãng lai";
        if (rankEl) rankEl.textContent = "Bấm để Đăng nhập / Đăng ký";
        if (adminLink) adminLink.style.display = "none";

        // Click avatar tự chuyển sang trang login
        userBtn.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = "login.html";
        });
    }
}

// ==========================================
// 3. TÌM KIẾM NHẤN PHÍM ENTER TRÊN HEADER
// ==========================================
function setupMasterSearch() {
    document.querySelectorAll(".search__input").forEach(inp => {
        inp.onkeydown = (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                const q = inp.value.trim();
                if (q) window.location.href = `explore.html?q=${encodeURIComponent(q)}`;
            }
        };
    });
}

// ==========================================
// 4. MENU DI ĐỘNG (MOBILE DRAWER)
// ==========================================
function setupMasterDrawer() {
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const drawerCloseBtn = document.getElementById("drawerCloseBtn");
    const mobileDrawer = document.getElementById("mobileDrawer");
    const drawerOverlay = document.getElementById("drawerOverlay");

    if (mobileMenuBtn && mobileDrawer) {
        mobileMenuBtn.onclick = () => {
            mobileDrawer.classList.add("open");
            if (drawerOverlay) drawerOverlay.classList.add("open");
        };
        const close = () => {
            mobileDrawer.classList.remove("open");
            if (drawerOverlay) drawerOverlay.classList.remove("open");
        };
        if (drawerCloseBtn) drawerCloseBtn.onclick = close;
        if (drawerOverlay) drawerOverlay.onclick = close;
    }
}
// ==========================================
// 5. CƠ CHẾ THU THẬP VOUCHER TOÀN HỆ THỐNG
// ==========================================
function setupGlobalVoucherClaim() {
    let raw = localStorage.getItem("chillflix_user");
    let user = raw ? JSON.parse(raw) : null;
    let claimed = user?.claimedVouchers || [];

    document.querySelectorAll(".btn-claim-voucher-global").forEach(btn => {
        const code = btn.dataset.code;

        // Nếu đã nhận rồi -> hiện trạng thái đã có
        if (claimed.includes(code)) {
            btn.textContent = `✓ Đã có trong ví (${code})`;
            btn.classList.add("claimed");
        }

        btn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();

            // 1. Kiểm tra đăng nhập
            raw = localStorage.getItem("chillflix_user");
            if (!raw) {
                alert("Vui lòng đăng nhập tài khoản để thu thập voucher này vào ví của bạn!");
                window.location.href = "login.html";
                return;
            }

            user = JSON.parse(raw);
            claimed = user.claimedVouchers || [];

            // 2. Thu voucher về ví
            if (!claimed.includes(code)) {
                claimed.push(code);
                user.claimedVouchers = claimed;
                localStorage.setItem("chillflix_user", JSON.stringify(user));

                btn.textContent = `✓ Đã có trong ví (${code})`;
                btn.classList.add("claimed");

                // Cập nhật số đếm trên Menu Header ngay lập tức
                const vMenu = document.getElementById("menuLinkVouchers");
                if (vMenu) vMenu.textContent = `Ví Voucher của tôi (${claimed.length})`;

                navigator.clipboard.writeText(code);
                alert(`🎉 Chúc mừng! Bạn đã thu thập thành công mã [${code}] vào ví tài khoản!\nMã này đã sẵn sàng để áp dụng giảm giá khi đặt phòng.`);
            } else {
                navigator.clipboard.writeText(code);
                alert(`📋 Mã [${code}] đã có sẵn trong ví của bạn rồi! (Đã sao chép mã).`);
            }
        };
    });
}

// Gọi hàm này bên trong runHeaderInit()
function runHeaderInit() {
    setupMasterTheme();
    setupMasterUser();
    setupMasterSearch();
    setupMasterDrawer();
    setupGlobalVoucherClaim(); 
}