/* ==========================================================================
   CHILLFLIX - AUTH COMPONENT (ĐĂNG NHẬP / ĐĂNG KÝ CHUẨN MOCKUP 7)
   Tự động chèn Modal vào mọi trang web
   ========================================================================== */

// 1. TÀI KHOẢN MẪU DEMO (KHỚP MOCKUP 8)
const DEMO_USER = {
    fullName: "Nguyễn Hoàng Nam",
    phone: "0988234567",
    email: "hoangnam.designer@cinenest.vn",
    role: "customer",
    rank: "Hạng Bạc",
    points: 1240,
    avatar: "👤"
};

// 2. TỰ ĐỘNG BƠM CẤU TRÚC MODAL VÀO CUỐI THẺ <body> CỦA TRANG
function injectAuthModalHTML() {
    if (document.getElementById("authModalOverlay")) return;

    const modalHTML = `
    <div id="authModalOverlay" class="auth-modal-overlay">
        <div class="auth-modal-card">
            
            <!-- CỘT TRÁI: BANNER CHÂM NGÔN (MOCKUP 7) -->
            <div class="auth-banner-col">
                <span class="auth-brand-tag">✦ KHÔNG GIAN RẠP CHIẾU RIÊNG TƯ</span>
                
                <div class="auth-quote-box">
                    <h2 class="auth-quote-title">“Mỗi buổi tối là một bộ phim.”</h2>
                    <p class="auth-quote-desc">
                        Trải nghiệm phòng chiếu đôi riêng tư 4K Laser, hệ thống âm thanh vòm Dolby Atmos chuẩn rạp và dịch vụ ẩm thực cafe cao cấp phục vụ tận ghế sofa.
                    </p>
                </div>

                <div class="auth-perks-row">
                    <span class="auth-perk-badge">100% Riêng Tư</span>
                    <span class="auth-perk-badge">Dolby Atmos</span>
                    <span class="auth-perk-badge">Menu F&B Nóng</span>
                </div>
            </div>

            <!-- CỘT PHẢI: FORM ĐĂNG NHẬP / ĐĂNG KÝ -->
            <div class="auth-form-col">
                <button type="button" id="btnCloseAuthModal" class="btn-close-modal" aria-label="Đóng">✕</button>
                
                <!-- NÚT DEMO DÀNH CHO GIẢNG VIÊN / CHẤM BÀI -->
                <button type="button" id="btnFillDemoAccount" class="btn-demo-fill">
                    🪄 Điền mẫu demo (Nguyễn Hoàng Nam)
                </button>

                <!-- TAB CHUYỂN ĐỔI -->
                <div class="auth-tabs-header">
                    <button type="button" class="auth-tab-btn active" data-tab="login">Đăng nhập</button>
                    <button type="button" class="auth-tab-btn" data-tab="register">Đăng ký</button>
                </div>

                <!-- FORM ĐIỀN THÔNG TIN -->
                <form id="authMainForm">
                    <div class="auth-field-group" id="groupFullName" style="display: none;">
                        <label for="authFullName">Họ và tên của bạn</label>
                        <div class="auth-input-box">
                            <span class="auth-input-icon">👤</span>
                            <input type="text" id="authFullName" class="auth-input" placeholder="Ví dụ: Nguyễn Hoàng Nam" />
                        </div>
                    </div>

                    <div class="auth-field-group">
                        <label for="authAccount">Email hoặc Số điện thoại</label>
                        <div class="auth-input-box">
                            <span class="auth-input-icon">✉️</span>
                            <input type="text" id="authAccount" class="auth-input" placeholder="vd: hoangnam.designer@cinenest.vn" required />
                        </div>
                    </div>

                    <div class="auth-field-group">
                        <div style="display: flex; justify-content: space-between; align-items: baseline;">
                            <label for="authPassword">Mật khẩu</label>
                            <a href="#" id="btnForgotPassword" style="font-size: 11.5px; color: var(--text-muted); text-decoration: none;">Quên mật khẩu?</a>
                        </div>
                        <div class="auth-input-box">
                            <span class="auth-input-icon">🔒</span>
                            <input type="password" id="authPassword" class="auth-input" placeholder="Nhập mật khẩu của bạn" required />
                        </div>
                    </div>

                    <div id="authErrorMessage" class="auth-error-msg"></div>

                    <div style="display: flex; align-items: center; gap: 8px; margin: 10px 0 16px;">
                        <input type="checkbox" id="authRemember" checked style="accent-color: var(--primary);" />
                        <label for="authRemember" style="font-size: 12px; color: var(--text-muted); cursor: pointer;">Ghi nhớ đăng nhập trên thiết bị này</label>
                    </div>

                    <button type="submit" id="btnSubmitAuth" class="btn btn--primary btn-auth-submit">
                        Đăng Nhập Ngay ➔
                    </button>
                </form>

                <div class="auth-divider-line"><span>HOẶC</span></div>

                <button type="button" id="btnGoogleSignIn" class="btn-google-login">
                    <span style="font-size: 16px;">🇬</span> Tiếp tục với Google
                </button>

                <div class="auth-secure-footnote">
                    🔒 Dữ liệu của bạn được mã hóa an toàn theo tiêu chuẩn SSL 256-bit
                </div>
            </div>

        </div>
    </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);
    bindAuthModalEvents();
}

// 3. XỬ LÝ CÁC SỰ KIỆN TRONG MODAL
let currentAuthMode = "login"; // "login" hoặc "register"

function bindAuthModalEvents() {
    const overlay = document.getElementById("authModalOverlay");
    const closeBtn = document.getElementById("btnCloseAuthModal");
    const tabs = document.querySelectorAll(".auth-tab-btn");
    const demoBtn = document.getElementById("btnFillDemoAccount");
    const form = document.getElementById("authMainForm");
    const groupName = document.getElementById("groupFullName");
    const submitBtn = document.getElementById("btnSubmitAuth");

    // Đóng modal
    closeBtn?.addEventListener("click", closeAuthModal);
    overlay?.addEventListener("click", (e) => {
        if (e.target === overlay) closeAuthModal();
    });

    // Chuyển tab Đăng nhập / Đăng ký
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            currentAuthMode = tab.dataset.tab;

            if (currentAuthMode === "register") {
                groupName.style.display = "flex";
                submitBtn.textContent = "Tạo Tài Khoản Mới ➔";
            } else {
                groupName.style.display = "none";
                submitBtn.textContent = "Đăng Nhập Ngay ➔";
            }
        });
    });

    // Nút bấm điền mẫu Demo (1 chạm)
    demoBtn?.addEventListener("click", () => {
        document.getElementById("authAccount").value = DEMO_USER.email;
        document.getElementById("authPassword").value = "123456";
        if (currentAuthMode === "register") {
            document.getElementById("authFullName").value = DEMO_USER.fullName;
        }
    });

    // Submit form Đăng nhập / Đăng ký
    form?.addEventListener("submit", (e) => {
        e.preventDefault();
        const account = document.getElementById("authAccount").value.trim();
        const fullName = document.getElementById("authFullName")?.value.trim() || DEMO_USER.fullName;

        // Lưu thông tin người dùng vào localStorage
        const loggedUser = {
            ...DEMO_USER,
            fullName: fullName,
            email: account.includes("@") ? account : DEMO_USER.email,
            phone: !account.includes("@") ? account : DEMO_USER.phone
        };

        localStorage.setItem("chillflix_user", JSON.stringify(loggedUser));
        localStorage.setItem("chillflix_token", "jwt_token_demo_sample_2026");

        closeAuthModal();
        updateHeaderUserUI();

        alert(`🎉 Chào mừng ${loggedUser.fullName} đã đăng nhập thành công vào ChillFlix!`);
    });

    // Nút Google
    document.getElementById("btnGoogleSignIn")?.addEventListener("click", () => {
        localStorage.setItem("chillflix_user", JSON.stringify(DEMO_USER));
        localStorage.setItem("chillflix_token", "jwt_token_google_demo");
        closeAuthModal();
        updateHeaderUserUI();
        alert(`🎉 Đăng nhập qua tài khoản Google thành công! Chào bạn ${DEMO_USER.fullName}.`);
    });
}

// 4. MỞ / ĐÓNG MODAL
export function openAuthModal(mode = "login") {
    injectAuthModalHTML();
    const overlay = document.getElementById("authModalOverlay");
    if (overlay) overlay.classList.add("open");

    // Chọn đúng tab
    const targetTab = document.querySelector(`.auth-tab-btn[data-tab="${mode}"]`);
    if (targetTab) targetTab.click();
}

export function closeAuthModal() {
    const overlay = document.getElementById("authModalOverlay");
    if (overlay) overlay.classList.remove("open");
}
// 5. ĐỒNG BỘ TRẠNG THÁI NGƯỜI DÙNG LÊN HEADER TRÊN TẤT CẢ CÁC TRANG
export function updateHeaderUserUI() {
    const raw = localStorage.getItem("chillflix_user");
    const nameEl = document.querySelector(".dropdown__name");
    const rankEl = document.querySelector(".dropdown__rank");
    const userBtn = document.getElementById("userMenuBtn");
    const logoutBtn = document.querySelector('a[href*="logout"]') || document.getElementById("btnLogout");
    const adminLink = document.getElementById("menuLinkAdmin") || document.querySelector('a[href*="admin/dashboard.html"]');

    if (raw) {
        // ĐÃ ĐĂNG NHẬP: Parse user trước rồi mới dùng
        const user = JSON.parse(raw);

        if (adminLink) {
            adminLink.style.display = (user.role === "admin") ? "block" : "none";
        }

        if (nameEl) nameEl.textContent = user.fullName || "Khách xem phim";
        if (rankEl) rankEl.textContent = `${user.rank || 'Thành viên Mới'} · ${new Intl.NumberFormat('vi-VN').format(user.points || 0)} CinePoint`;
        
        // Sự kiện Đăng xuất
        logoutBtn?.addEventListener("click", (e) => {
            e.preventDefault();
            if (confirm("Bạn có chắc chắn muốn đăng xuất tài khoản?")) {
                localStorage.removeItem("chillflix_user");
                localStorage.removeItem("chillflix_token");
                alert("Đã đăng xuất thành công.");
                window.location.reload();
            }
        });
    } else {
        // CHƯA ĐĂNG NHẬP
        if (adminLink) adminLink.style.display = "none";
        if (nameEl) nameEl.textContent = "Khách vãng lai";
        if (rankEl) rankEl.textContent = "Bấm để Đăng nhập / Đăng ký";

        userBtn?.addEventListener("click", (e) => {
            e.stopPropagation();
            openAuthModal("login");
        });
    }

    // KÍCH HOẠT THANH TÌM KIẾM TRÊN HEADER TOÀN HỆ THỐNG
    document.querySelectorAll(".search__input").forEach(input => {
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                const keyword = input.value.trim();
                if (keyword) {
                    window.location.href = `explore.html?q=${encodeURIComponent(keyword)}`;
                }
            }
        });
    });
}

// Tự động khởi chạy ngay khi tải file
document.addEventListener("DOMContentLoaded", () => {
    injectAuthModalHTML();
    updateHeaderUserUI();
});