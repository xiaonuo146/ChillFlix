/* ==========================================================================
   CHILLFLIX - TRANG HỒ SƠ & LỊCH SỬ ĐẶT VÉ (CHUẨN 100%)
   ========================================================================== */
import { API } from '../apiClient.js';
const SYSTEM_VOUCHERS = [
    {
        code: "PHIM20",
        percent: "20%",
        type: "GIẢM GIÁ",
        desc: "Giảm 20% tiền phòng cho thành viên mới.",
        exp: "31/12/2026",
        bgColor: "var(--primary)"
    },
    {
        code: "CHILL10",
        percent: "10%",
        type: "GIẢM GIÁ",
        desc: "Giảm 10% tổng đơn cho suất chiếu đêm từ 21:00 trở đi.",
        exp: "31/12/2026",
        bgColor: "var(--primary)"
    },
    {
        code: "FNBCOUPLE",
        percent: "🍿",
        type: "QUÀ TẶNG",
        desc: "Tặng 1 phần bắp caramel (trị giá 45k) khi đặt phòng Couple.",
        exp: "30/11/2026",
        bgColor: "var(--surface-hover)"
    }
];
function formatMoney(amount) {
    return new Intl.NumberFormat("vi-VN").format(Number(amount) || 0) + "đ";
}

let allHistoryBookings = [];
let currentHistoryFilter = "all";

document.addEventListener("DOMContentLoaded", async () => {
    setupTabSwitching();
    setupFormEvents();
    syncVouchersDisplay();

    // 1. Tải thông tin cá nhân & Điểm thưởng thật
    await loadUserProfile();
    // 2. Tải danh sách vé từ Database
    await initHistorySection();
});

async function loadUserProfile() {
    let localUser = JSON.parse(localStorage.getItem("chillflix_user")) || {};

    try {
        const meRes = await API.getMe();
        if (meRes.user) {
            localUser = {
                ...meRes.user,
                claimedVouchers: localUser.claimedVouchers || meRes.user.claimedVouchers || []
            };
            localStorage.setItem("chillflix_user", JSON.stringify(localUser));
        }
    } catch (e) {}
    const user = localUser;
    const pts = Number(user.points) || 0;
    let rankTitle = user.rank || "Thành viên Mới";
    let nextTarget = 500;
    let nextRankName = "Bạc (Silver)";

    if (pts >= 3000) { rankTitle = "Hạng Kim Cương"; nextTarget = 5000; nextRankName = "VIP Max"; }
    else if (pts >= 1500) { rankTitle = "Hạng Vàng"; nextTarget = 3000; nextRankName = "Kim Cương"; }
    else if (pts >= 500) { rankTitle = "Hạng Bạc"; nextTarget = 1500; nextRankName = "Vàng (Gold)"; }

    const percent = Math.min(100, ((pts / nextTarget) * 100)).toFixed(1);
    const remain = Math.max(0, nextTarget - pts);

    setText("userProfileName", user.fullName || "Khách xem phim");
    setText("userProfileRankTag", `🛡 ${rankTitle}`);
    setText("userProfileEmail", user.email || "--");
    setText("userProfilePhone", user.phone || "--");

    const pointsEl = document.getElementById("profileTotalPoints");
    if (pointsEl) pointsEl.innerHTML = `${new Intl.NumberFormat('vi-VN').format(pts)} <small>CinePoint</small>`;

    setText("tierPercentDisplay", `${rankTitle} (${percent}%)`);
    const bar = document.getElementById("tierProgressBar");
    if (bar) bar.style.width = `${percent}%`;

    const limitsRow = document.getElementById("tierLimitsRow");
    if (limitsRow) {
        limitsRow.innerHTML = `
            <span>Điểm hiện tại (${pts}đ)</span>
            <span style="color: var(--primary);">Còn ${remain}đ lên ${nextRankName}</span>
            <span>Mục tiêu (${nextTarget}đ)</span>
        `;
    }

    setText("voucherCountBadge", (user.claimedVouchers || []).length);

    setVal("profFullName", user.fullName);
    setVal("profPhone", user.phone);
    setVal("profEmail", user.email);
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}
function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val || "";
}

async function initHistorySection() {
    try {
        const res = await API.getMyBookings();
        allHistoryBookings = res.data || [];
    } catch (e) {
        allHistoryBookings = [];
    }

    const activeList = allHistoryBookings.filter(b => b.status !== "cancelled");
    const cancelledList = allHistoryBookings.filter(b => b.status === "cancelled");

    setText("filterCountAll", allHistoryBookings.length);
    setText("filterCountActive", activeList.length);
    setText("filterCountCancelled", cancelledList.length);
    setText("historyTabCount", allHistoryBookings.length);

    const totalHours = activeList.reduce((sum, b) => sum + (Number(b.duration) || 2), 0);
    const totalFnB = activeList.reduce((sum, b) => {
        const foods = Array.isArray(b.foods) ? b.foods : [];
        return sum + foods.reduce((s, f) => s + (Number(f.quantity) || 0), 0);
    }, 0);

    setText("statBookings", activeList.length);
    setText("statHours", `${totalHours.toFixed(1)}h`);
    setText("statFnB", totalFnB); // 👈 ĐÃ SỬA CHUẨN XÁC, HẾT BỊ ĐỨNG

    // Bắt sự kiện chip lọc
    document.querySelectorAll(".history-filter-chip").forEach(chip => {
        chip.addEventListener("click", () => {
            document.querySelectorAll(".history-filter-chip").forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
            currentHistoryFilter = chip.dataset.filter;
            renderFilteredHistory();
        });
    });

    renderFilteredHistory();
}

function renderFilteredHistory() {
    const container = document.getElementById("bookingHistoryList");
    if (!container) return;
    container.innerHTML = "";

    let displayList = [...allHistoryBookings];
    if (currentHistoryFilter === "active") displayList = displayList.filter(b => b.status !== "cancelled");
    if (currentHistoryFilter === "cancelled") displayList = displayList.filter(b => b.status === "cancelled");

    if (displayList.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; border: 1px dashed var(--border); border-radius: var(--radius-md);">
                <p style="color: var(--text-muted); font-size: 13.5px; margin: 0;">Chưa có đơn đặt phòng nào trong mục này.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = displayList.map(b => {
        const posterUrl = b.posterPath ? `https://image.tmdb.org/t/p/w185${b.posterPath}` : 'https://picsum.photos/100/150';
        const isPaid = b.paymentStatus === "paid";
        const isCancelled = b.status === "cancelled";
        const orderCode = b.bookingCode || b.ticketCode || "CP-DEMO";

        let statusBadge = isPaid 
            ? `<span style="color: var(--success); font-weight: 700; font-size: 11px;">● Đã xác nhận &amp; duyệt</span>`
            : `<span style="color: var(--warning); font-weight: 700; font-size: 11px;">● Chờ duyệt tiền</span>`;
        if (isCancelled) statusBadge = `<span style="color: var(--danger); font-weight: 700; font-size: 11px;">✕ ĐÃ HỦY VÉ</span>`;

        return `
        <article class="history-booking-card ${isCancelled ? 'is-cancelled' : ''}">
            <div class="history-card-left">
                <img src="${posterUrl}" alt="${b.movieTitle}" class="history-poster-thumb" />
                <div class="history-info">
                    <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                        <h4>${b.movieTitle || "Phim chiếu rạp"}</h4>
                        ${statusBadge}
                    </div>
                    <div class="history-meta">
                        <span>🛋 ${b.roomName || "Phòng riêng"}</span>
                        <span>•</span>
                        <span>📅 ${b.date} (${b.startTime})</span>
                    </div>
                    <span class="history-pin-badge">
                        Mã đơn: <strong>${orderCode}</strong> · ${isPaid ? `PIN: <strong>${b.smartPin}</strong>` : '🔒 PIN đang khóa'}
                    </span>
                </div>
            </div>

            <div class="history-card-right">
                <div class="history-price">${formatMoney(b.finalTotal || b.grandTotal)}</div>
                <button type="button" class="btn-view-ticket-again" data-code="${orderCode}">
                    Xem lại vé ➔
                </button>
            </div>
        </article>
        `;
    }).join('');

    container.querySelectorAll(".btn-view-ticket-again").forEach(btn => {
        btn.addEventListener("click", () => {
            window.location.href = `booking-success.html?code=${btn.dataset.code}`;
        });
    });
}


function setupTabSwitching() {
    const tabs = document.querySelectorAll(".profile-tab-item");
    const panes = document.querySelectorAll(".tab-pane");

    function activateTab(tabId) {
        tabs.forEach(t => t.classList.toggle("active", t.dataset.tab === tabId));
        panes.forEach(p => p.classList.toggle("active", p.id === tabId));
    }

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            activateTab(tab.dataset.tab);
        });
    });
    function checkHashRoute() {
        const hash = window.location.hash;
        if (hash === "#history") {
            activateTab("tab-history");
        } else if (hash === "#vouchers") {
            activateTab("tab-vouchers");
        }
    }

    checkHashRoute();
    window.addEventListener("hashchange", checkHashRoute);
}
function syncVouchersDisplay() {
    let user = JSON.parse(localStorage.getItem("chillflix_user")) || {};
    let claimed = user.claimedVouchers || [];

    // 1. ĐỒNG BỘ SỐ ĐẾM (TAB & HEADER)
    const badgeTab = document.getElementById("voucherCountBadge");
    const myCountBadge = document.getElementById("myVouchersCountBadge");
    const headerBadge = document.getElementById("menuLinkVouchers");

    if (badgeTab) badgeTab.textContent = claimed.length;
    if (myCountBadge) myCountBadge.textContent = `Đang có ${claimed.length} voucher`;
    if (headerBadge) headerBadge.textContent = `Ví Voucher của tôi (${claimed.length})`;

    const myVouchersContainer = document.getElementById("myClaimedVouchersList");
    const availableContainer = document.getElementById("availableVouchersList");

    if (!myVouchersContainer || !availableContainer) return;

    // 2. RENDER KHỐI 1: CÁC VOUCHER BẠN ĐÃ NHẬN (NẰM TRONG VÍ)
    const myVouchers = SYSTEM_VOUCHERS.filter(v => claimed.includes(v.code));
    if (myVouchers.length === 0) {
        myVouchersContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 32px 16px; border: 1px dashed var(--border); border-radius: var(--radius-md);">
                <p style="color: var(--text-muted); font-size: 13.5px; margin: 0;">
                    Chưa có voucher nào trong ví của bạn. Hãy nhận mã ưu đãi ở bên dưới để sử dụng!
                </p>
            </div>
        `;
    } else {
        myVouchersContainer.innerHTML = myVouchers.map(v => `
            <div class="voucher-card-item" style="border: 1px solid var(--success); background: rgba(63, 185, 80, 0.04);">
                <div class="v-left" style="background: var(--success); color: #fff;">
                    <span class="v-percent">${v.percent}</span>
                    <small>${v.type}</small>
                </div>
                <div class="v-right">
                    <div style="display: flex; justify-content: space-between; align-items: baseline;">
                        <strong>Mã: ${v.code}</strong>
                        <span style="font-size: 11px; color: var(--success); font-weight: 700;">✓ Sẵn sàng dùng</span>
                    </div>
                    <p>${v.desc}</p>
                    <div class="v-bottom">
                        <span>HSD: ${v.exp}</span>
                        <button type="button" class="btn-copy-voucher" data-code="${v.code}" style="color: var(--success); font-weight: 700;">
                            📋 Sao chép mã
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Bắt sự kiện sao chép mã
        myVouchersContainer.querySelectorAll(".btn-copy-voucher").forEach(btn => {
            btn.onclick = () => {
                const code = btn.dataset.code;
                navigator.clipboard.writeText(code);
                alert(`📋 Đã sao chép mã [${code}]! Bạn có thể dán vào ô Voucher khi thanh toán đặt phòng.`);
            };
        });
    }

    // 3. RENDER KHỐI 2: CÁC VOUCHER CHƯA NHẬN (NHẬN XONG SẼ BIẾN MẤT KHỎI ĐÂY)
    const availableVouchers = SYSTEM_VOUCHERS.filter(v => !claimed.includes(v.code));
    if (availableVouchers.length === 0) {
        availableContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 28px 16px; border: 1px dashed var(--border); border-radius: var(--radius-md);">
                <p style="color: var(--text-muted); font-size: 13.5px; margin: 0;">
                    ✨ Bạn đã thu thập hết toàn bộ voucher hiện có vào ví của mình! Hãy chờ đợt khuyến mãi tiếp theo từ Admin nhé.
                </p>
            </div>
        `;
    } else {
        availableContainer.innerHTML = availableVouchers.map(v => `
            <div class="voucher-card-item">
                <div class="v-left" style="background: ${v.bgColor};">
                    <span class="v-percent">${v.percent}</span>
                    <small>${v.type}</small>
                </div>
                <div class="v-right">
                    <strong>Mã: ${v.code}</strong>
                    <p>${v.desc}</p>
                    <div class="v-bottom">
                        <span>HSD: ${v.exp}</span>
                        <button type="button" class="btn-claim-single-voucher" data-code="${v.code}" style="background: none; border: none; color: var(--primary); font-weight: 700; cursor: pointer;">
                            + Nhận vào ví
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Bắt sự kiện bấm Nhận: Tự lưu vào ví và BIẾN MẤT khỏi kho
        availableContainer.querySelectorAll(".btn-claim-single-voucher").forEach(btn => {
            btn.onclick = () => {
                const code = btn.dataset.code;
                claimed.push(code);
                user.claimedVouchers = claimed;
                localStorage.setItem("chillflix_user", JSON.stringify(user));

                // Chạy lại hàm để mã biến mất khỏi kho và nhảy lên ví
                syncVouchersDisplay();
                alert(`🎉 Chúc mừng! Đã chuyển thành công voucher [${code}] vào Ví của bạn!`);
            };
        });
    }
}
function setupFormEvents() {
    document.getElementById("btnDeleteAccount")?.addEventListener("click", () => {
        if (confirm("Bạn có chắc muốn đăng xuất tài khoản?")) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = "login.html";
        }
    });
}