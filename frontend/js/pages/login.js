/* ==========================================================================
   CHILLFLIX - LOGIC ĐĂNG NHẬP, ĐĂNG KÝ & PHÂN QUYỀN (ADMIN / CUSTOMER)
   ========================================================================== */

// 1. ĐỊNH NGHĨA 2 TÀI KHOẢN MẪU TEST
const DEMO_ACCOUNTS = {
    // Tài khoản Khách hàng mới (0 Điểm, 0 Voucher)
    customer: {
        id: "usr_cust_01",
        fullName: "Trần Văn An",
        email: "khachhang@chillflix.vn",
        phone: "0912345678",
        password: "123",
        role: "customer",
        rank: "Thành viên Mới",
        points: 0,              // <--- ĐÚNG YÊU CẦU: 0 ĐIỂM BAN ĐẦU
        claimedVouchers: []     // <--- ĐÚNG YÊU CẦU: 0 VOUCHER TRONG VÍ
    },

    // Tài khoản Quản trị viên (Admin)
    admin: {
        id: "usr_admin_01",
        fullName: "Trần Minh Đạt (Quản Lý Rạp)",
        email: "admin@chillflix.vn",
        phone: "0988234567",
        password: "admin",
        role: "admin",          // <--- QUYỀN ADMIN
        rank: "Quản Trị Viên",
        points: 9999,
        claimedVouchers: ["PHIM20", "CHILL10", "FNBCOUPLE"]
    }
};

let currentTab = "login";
let currentRoleToLogin = "customer";

document.addEventListener("DOMContentLoaded", () => {
    // Nếu đã đăng nhập trước đó -> Tự chuyển về trang chủ
    const token = localStorage.getItem("chillflix_token");
    if (token) {
        // window.location.href = "index.html";
    }

    setupTabs();
    setupDemoButtons();
    setupPasswordToggle();
    setupFormSubmit();
});

// Chuyển tab Đăng nhập / Đăng ký
function setupTabs() {
    const tabs = document.querySelectorAll(".auth-tab-btn");
    const groupName = document.getElementById("groupRegisterName");
    const submitBtn = document.getElementById("btnSubmitAuth");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            currentTab = tab.dataset.tab;

            if (currentTab === "register") {
                groupName.style.display = "flex";
                submitBtn.textContent = "Tạo Tài Khoản Mới ➔";
            } else {
                groupName.style.display = "none";
                submitBtn.textContent = "Đăng Nhập Ngay ➔";
            }
        });
    });
}

// 2 Nút 1 chạm điền mẫu tự động
function setupDemoButtons() {
    const btnCust = document.getElementById("btnFillNewCustomer");
    const btnAdmin = document.getElementById("btnFillAdmin");
    const accountInp = document.getElementById("inpAccount");
    const passInp = document.getElementById("inpPassword");
    const roleIndicator = document.getElementById("roleIndicator");

    btnCust?.addEventListener("click", () => {
        accountInp.value = DEMO_ACCOUNTS.customer.email;
        passInp.value = DEMO_ACCOUNTS.customer.password;
        currentRoleToLogin = "customer";
        roleIndicator.textContent = "👤 Khách Hàng (0đ · 0 voucher)";
        roleIndicator.style.color = "var(--primary)";
    });

    btnAdmin?.addEventListener("click", () => {
        accountInp.value = DEMO_ACCOUNTS.admin.email;
        passInp.value = DEMO_ACCOUNTS.admin.password;
        currentRoleToLogin = "admin";
        roleIndicator.textContent = "⚙️ Quản Trị Viên (Admin)";
        roleIndicator.style.color = "var(--danger)";
    });
}

function setupPasswordToggle() {
    const btnEye = document.getElementById("btnTogglePassEye");
    const passInp = document.getElementById("inpPassword");
    btnEye?.addEventListener("click", () => {
        const isPass = passInp.type === "password";
        passInp.type = isPass ? "text" : "password";
        btnEye.textContent = isPass ? "🙈" : "👁";
    });
}

// Xử lý đăng nhập / đăng ký
function setupFormSubmit() {
    const form = document.getElementById("loginMainForm");
    const alertBox = document.getElementById("authAlertMessage");

    form?.addEventListener("submit", (e) => {
        e.preventDefault();

        const account = document.getElementById("inpAccount").value.trim();
        const pass = document.getElementById("inpPassword").value;
        const regName = document.getElementById("inpFullName")?.value.trim();

        let loggedUser = null;

        if (currentTab === "login") {
            // Kiểm tra đăng nhập
            if (account === DEMO_ACCOUNTS.admin.email && pass === DEMO_ACCOUNTS.admin.password) {
                loggedUser = DEMO_ACCOUNTS.admin;
            } else if (account === DEMO_ACCOUNTS.customer.email && pass === DEMO_ACCOUNTS.customer.password) {
                loggedUser = DEMO_ACCOUNTS.customer;
            } else {
                // Đăng nhập tự do tài khoản bất kỳ (mặc định role customer, 0 điểm)
                loggedUser = {
                    id: "usr_" + Date.now(),
                    fullName: account.split("@")[0] || "Khách Xem Phim",
                    email: account.includes("@") ? account : `${account}@chillflix.vn`,
                    phone: !account.includes("@") ? account : "0988123456",
                    role: "customer",
                    rank: "Thành viên Mới",
                    points: 0,
                    claimedVouchers: []
                };
            }
        } else {
            // Đăng ký mới -> Khởi tạo 0 điểm, 0 voucher
            loggedUser = {
                id: "usr_" + Date.now(),
                fullName: regName || "Khách Hàng Mới",
                email: account.includes("@") ? account : `${account}@chillflix.vn`,
                phone: !account.includes("@") ? account : "0988123456",
                role: "customer",
                rank: "Thành viên Mới",
                points: 0,
                claimedVouchers: []
            };
        }

        // Lưu vào LocalStorage
        localStorage.setItem("chillflix_user", JSON.stringify(loggedUser));
        localStorage.setItem("chillflix_token", "jwt_token_" + loggedUser.role + "_" + Date.now());

        // Nếu là Admin -> Chuyển sang trang Quản Trị
        if (loggedUser.role === "admin") {
            alert(`👑 Đăng nhập thành công với quyền QUẢN TRỊ VIÊN!\nXin chào ${loggedUser.fullName}. Chuyển tiếp vào Dashboard rạp.`);
            window.location.href = "admin/dashboard.html";
        } else {
            // Nếu là Khách hàng -> Chuyển về trang cá nhân
            alert(`🎉 Chào mừng ${loggedUser.fullName}!\nBạn đã đăng nhập thành công. Điểm tích lũy: ${loggedUser.points}đ.`);
            window.location.href = "profile.html";
        }
    });

    // Nút Google
    document.getElementById("btnSocialGoogle")?.addEventListener("click", () => {
        const googleUser = {
            id: "usr_google_01",
            fullName: "Nguyễn Hoàng Nam (Google)",
            email: "nam.nguyen@gmail.com",
            phone: "0988234567",
            role: "customer",
            rank: "Thành viên Mới",
            points: 0,
            claimedVouchers: []
        };
        localStorage.setItem("chillflix_user", JSON.stringify(googleUser));
        localStorage.setItem("chillflix_token", "jwt_google_sample");
        alert("🎉 Đăng nhập qua tài khoản Google thành công!");
        window.location.href = "profile.html";
    });
}