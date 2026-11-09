import { API } from '../apiClient.js';

let currentTab = "login";

document.addEventListener("DOMContentLoaded", () => {
    setupTabs();
    setupDemoButtons();
    setupPasswordToggle();
    setupFormSubmit();
});

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
                if (groupName) groupName.style.display = "flex";
                if (submitBtn) submitBtn.textContent = "Tạo Tài Khoản Mới ➔";
            } else {
                if (groupName) groupName.style.display = "none";
                if (submitBtn) submitBtn.textContent = "Đăng Nhập Ngay ➔";
            }
        });
    });
}
function setupDemoButtons() {
    const btnCust = document.getElementById("btnFillNewCustomer");
    const btnAdmin = document.getElementById("btnFillAdmin");
    const accountInp = document.getElementById("inpAccount");
    const passInp = document.getElementById("inpPassword");
    const roleIndicator = document.getElementById("roleIndicator");

    // Nút 1: Khách hàng mới (0 điểm, 0 voucher)
    btnCust?.addEventListener("click", () => {
        accountInp.value = "khachhang@chillflix.vn";
        passInp.value = "123";
        if (roleIndicator) {
            roleIndicator.textContent = "👤 Khách Mới (0đ · 0 voucher)";
            roleIndicator.style.color = "var(--primary)";
        }
    });

    // Nút 2: Quản trị viên Admin
    btnAdmin?.addEventListener("click", () => {
        accountInp.value = "admin@chillflix.vn";
        passInp.value = "admin";
        if (roleIndicator) {
            roleIndicator.textContent = "⚙️ Quản Trị Viên (Admin)";
            roleIndicator.style.color = "var(--danger)";
        }
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

function setupFormSubmit() {
    const form = document.getElementById("loginMainForm");
    const alertBox = document.getElementById("authAlertMessage");

    form?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const account = document.getElementById("inpAccount").value.trim();
        const password = document.getElementById("inpPassword").value;
        const regName = document.getElementById("inpFullName")?.value.trim();

        if (alertBox) alertBox.style.display = "none";

        try {
            let res;
            if (currentTab === "login") {
                // Đăng nhập thật qua API Backend
                res = await API.login(account, password);
            } else {
                // Đăng ký tài khoản mới lên Atlas
                res = await API.register({
                    fullName: regName || "Khách Hàng Mới",
                    email: account.includes("@") ? account : `${account}@chillflix.vn`,
                    phone: !account.includes("@") ? account : "09" + Math.floor(10000000 + Math.random() * 90000000),
                    password: password
                });
            }

            // Lưu JWT token thật và thông tin User
            localStorage.setItem("chillflix_token", res.token);
            localStorage.setItem("chillflix_user", JSON.stringify(res.user));

            if (res.user.role === "admin") {
                alert(`👑 Đăng nhập thành công với quyền QUẢN TRỊ VIÊN!\nXin chào ${res.user.fullName}.`);
                window.location.href = "admin/dashboard.html";
            } else {
                alert(`🎉 Đăng nhập thành công! Chào mừng ${res.user.fullName}.`);
                window.location.href = "profile.html";
            }

        } catch (err) {
            if (alertBox) {
                alertBox.textContent = err.message || "Tài khoản hoặc mật khẩu không đúng!";
                alertBox.className = "auth-alert-box error";
                alertBox.style.display = "block";
            } else {
                alert(err.message || "Đăng nhập thất bại!");
            }
        }
    });
}