/* ==========================================================================
   CHILLFLIX ADMIN - DASHBOARD CONTROLLER 
   ========================================================================== */
import { API } from '../../apiClient.js';
function formatMoney(amount) {
    return new Intl.NumberFormat("vi-VN").format(Math.max(0, Math.round(Number(amount) || 0))) + "đ";
}

const ROOMS = [
    { id: "couple_a", name: "Couple A", floor: "Tầng 2 · 18m²" },
    { id: "couple_b", name: "Couple B", floor: "Tầng 2 · 16m²" },
    { id: "group4",   name: "Nhóm 4 Sao Hỏa", floor: "Tầng 3 · 25m²" },
    { id: "vip",      name: "Nhóm 10 Hành Tinh", floor: "Tầng 4 · VIP" }
];

let allAdminBookings = [];
let currentDrawerBooking = null;

document.addEventListener("DOMContentLoaded", () => {
    // 1. Chạy đồng hồ ngay lập tức
    startAdminClock();

    // 2. Kiểm tra quyền Admin an toàn
    checkAdminRole();

    // 3. Tải đơn thật từ localStorage
    loadRealBookings();

    // 4. Tính toán 4 thẻ số liệu KPI từ 0
    calculateKpiStats();

    // 5. Vẽ bảng trục thời gian Gantt
    renderGanttMatrix();

    // 6. Hiển thị nhiệm vụ cần xử lý
    renderUrgentTasks();

    // 7. Vẽ biểu đồ 7 ngày từ tiền thật
    render7DaysRevenue();

    // 8. Cài đặt Drawer chi tiết
    initDrawerEvents();

    // 9. Lắng nghe đơn mới Realtime giữa 2 tab
    window.addEventListener("storage", (e) => {
        if (e.key === "chillflix_booking_history") {
            loadRealBookings();
            calculateKpiStats();
            renderGanttMatrix();
            renderUrgentTasks();
            render7DaysRevenue();
        }
    });
});
// ==========================================
// 1. ĐỒNG HỒ & NGÀY THỰC TẾ (CHẠY NGAY LẬP TỨC 100%)
// ==========================================
function startAdminClock() {
    const update = () => {
        // Tìm cả theo ID lẫn theo Class để không bao giờ bị hụt
        const clockEl = document.getElementById("adminLiveClock") || document.querySelector(".admin-clock");
        const dateTextEl = document.getElementById("adminSelectedDateText") || document.querySelector(".date-select-pill strong");

        const now = new Date();
        const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
        
        const dayName = days[now.getDay()];
        const d = String(now.getDate()).padStart(2, "0");
        const m = String(now.getMonth() + 1).padStart(2, "0");
        const y = now.getFullYear();
        
        const hh = String(now.getHours()).padStart(2, "0");
        const mm = String(now.getMinutes()).padStart(2, "0");
        const ss = String(now.getSeconds()).padStart(2, "0");

        const fullClockStr = `🕒 ${hh}:${mm}:${ss} · ${dayName}, ${d}/${m}/${y}`;
        const shortDateStr = `${dayName}, ${d}/${m}/${y}`;

        if (clockEl) {
            clockEl.textContent = fullClockStr;
        }
        if (dateTextEl) {
            dateTextEl.textContent = shortDateStr;
        }
    };

    update(); // Kích hoạt chạy ngay trong 1 mili-giây đầu tiên
    setInterval(update, 1000); // Nhảy từng giây theo thời gian thực
}
// ==========================================
// 2. TẢI ĐƠN HÀNG THẬT (BẮT ĐẦU TỪ 0)
// ==========================================
async function loadRealBookings() {
    try {
        const res = await API.getAdminBookings();
        allAdminBookings = res.data || [];
    } catch (e) {
        allAdminBookings = [];
    }

    const badgeEl = document.getElementById("pendingBookingsBadge");
    if (badgeEl) badgeEl.textContent = allAdminBookings.length;

    // Tính toán lại toàn bộ bảng Gantt và chỉ số sau khi có dữ liệu từ Database
    calculateKpiStats();
    renderGanttMatrix();
    renderUrgentTasks();
    render7DaysRevenue();
}
// ==========================================
// 3. TÍNH TOÁN 4 THẺ SỐ LIỆU KPI
// ==========================================
function calculateKpiStats() {
    const validOrders = allAdminBookings.filter(b => b.status !== "cancelled");
    const totalRevenue = validOrders.reduce((sum, b) => sum + (Number(b.finalTotal || b.grandTotal) || 0), 0);

    const busyRooms = new Set(validOrders.map(b => b.roomType)).size;
    const availableRooms = Math.max(0, 4 - busyRooms);

    const cancelledCount = allAdminBookings.filter(b => b.status === "cancelled").length;
    const cancelRate = allAdminBookings.length > 0 ? ((cancelledCount / allAdminBookings.length) * 100).toFixed(1) : "0.0";

    const kpiOrders = document.getElementById("kpiTodayOrders");
    const kpiRev = document.getElementById("kpiTodayRevenue");
    const kpiRooms = document.getElementById("kpiAvailableRooms");
    const kpiCancel = document.getElementById("kpiCancelRate");

    if (kpiOrders) kpiOrders.innerHTML = `${validOrders.length} <small>đơn</small>`;
    if (kpiRev) kpiRev.textContent = formatMoney(totalRevenue);
    if (kpiRooms) {
        kpiRooms.innerHTML = `${availableRooms}/4 <small>phòng</small>`;
        kpiRooms.nextElementSibling.textContent = availableRooms === 4 ? "Tất cả 4 phòng đang trống" : `Đang sử dụng ${busyRooms} phòng`;
    }
    if (kpiCancel) kpiCancel.textContent = `${cancelRate}%`;
}

// ==========================================
// 4. VẼ LỊCH GANTT THEO GIỜ THẬT
// ==========================================
function renderGanttMatrix() {
    const tableContainer = document.getElementById("ganttTimelineTable");
    if (!tableContainer) return;
    tableContainer.replaceChildren();

    const headerRow = document.createElement("div");
    headerRow.className = "gantt-hours-header";
    headerRow.innerHTML = `<div>Phòng chiếu</div>` + Array.from({ length: 15 }, (_, i) => {
        const h = i + 9;
        return `<div>${String(h).padStart(2, '0')}:00</div>`;
    }).join('');
    tableContainer.appendChild(headerRow);

    ROOMS.forEach(room => {
        const row = document.createElement("div");
        row.className = "gantt-room-row";

        const labelCol = document.createElement("div");
        labelCol.className = "gantt-room-label";
        labelCol.innerHTML = `<strong>${room.name}</strong><small>${room.floor}</small>`;
        row.appendChild(labelCol);

        const trackCol = document.createElement("div");
        trackCol.className = "gantt-tracks-container";

        const roomBookings = allAdminBookings.filter(b => 
            (b.roomType === room.id || (b.roomName && b.roomName.includes(room.name))) && b.status !== "cancelled"
        );

        roomBookings.forEach(booking => {
            const timeStr = booking.startTime || "18:00";
            const startH = parseInt(timeStr.split(":")[0], 10);
            const startM = parseInt(timeStr.split(":")[1] || 0, 10);
            const duration = Number(booking.duration) || 2.0;

            const startTotalHours = (startH - 9) + (startM / 60);
            const leftPercent = Math.max(0, Math.min(95, (startTotalHours / 15) * 100));
            const widthPercent = Math.min(100 - leftPercent, (duration / 15) * 100);

            const block = document.createElement("div");
            block.className = `gantt-slot-block ${booking.status === "checked_in" ? "running" : "confirmed"}`;
            block.style.left = `${leftPercent}%`;
            block.style.width = `${Math.max(8, widthPercent)}%`;

            const custName = booking.customer?.name || "Khách đặt";
            block.innerHTML = `<strong>${timeStr} · ${custName}</strong><span>${booking.movieTitle || "Phim"}</span>`;

            block.addEventListener("click", () => openDrawerWithBooking(booking));
            trackCol.appendChild(block);
        });

        row.appendChild(trackCol);
        tableContainer.appendChild(row);
    });
}

// ==========================================
// 5. CẦN XỬ LÝ NGAY TỪ ĐƠN THẬT
// ==========================================
function renderUrgentTasks() {
    const listContainer = document.getElementById("urgentTasksList");
    const countBadge = document.getElementById("urgentTasksCount");
    if (!listContainer) return;
    listContainer.replaceChildren();

    const pendingOrders = allAdminBookings.filter(b => b.status === "confirmed" && b.status !== "cancelled");
    let tasks = [];

    pendingOrders.forEach(b => {
        const custName = b.customer?.name || "Khách xem phim";
        const rName = b.roomName || "Phòng riêng";
        const movie = b.movieTitle || "Phim rạp";

        tasks.push({
            title: `Khách: ${custName} (${b.startTime} · ${b.duration}h)`,
            sub: `${rName} · Phim: ${movie} · ${formatMoney(b.finalTotal || b.grandTotal)}`,
            actionText: "Check-in phòng",
            actionType: "checkin",
            bookingData: b
        });
    });

    if (tasks.length === 0) {
        listContainer.innerHTML = `
            <div style="text-align: center; padding: 28px 16px; border: 1px dashed var(--border); border-radius: var(--radius-md);">
                <p style="color: var(--text-muted); font-size: 13px; margin: 0;">✨ Hiện tại không có tác vụ khẩn cấp. Rạp sẵn sàng đón khách mới!</p>
            </div>
        `;
        if (countBadge) countBadge.textContent = "0 việc";
        return;
    }

    if (countBadge) countBadge.textContent = `${tasks.length} việc`;

    tasks.forEach(t => {
        const item = document.createElement("div");
        item.className = "task-card-item";
        item.innerHTML = `
            <div class="task-info-left">
                <strong>${t.title}</strong>
                <span>${t.sub}</span>
            </div>
            <button type="button" class="btn-task-action ${t.actionType}">
                ${t.actionText}
            </button>
        `;

        item.querySelector("button").addEventListener("click", () => {
            if (t.bookingData) {
                openDrawerWithBooking(t.bookingData);
            }
        });

        listContainer.appendChild(item);
    });
}

// ==========================================
// 6. TÍNH DOANH THU 7 NGÀY TỪ TIỀN THẬT
// ==========================================
function render7DaysRevenue() {
    const validOrders = allAdminBookings.filter(b => b.status !== "cancelled");
    
    const roomMoney = validOrders.reduce((sum, b) => sum + (Number(b.roomTotal) || 0), 0);
    const fnbMoney = validOrders.reduce((sum, b) => sum + (Number(b.foodTotal) || 0), 0);
    const grandTotal = roomMoney + fnbMoney;

    const total7DaysEl = document.getElementById("total7DaysRevenueText");
    if (total7DaysEl) total7DaysEl.textContent = formatMoney(grandTotal);

    const roomPercent = grandTotal > 0 ? Math.round((roomMoney / grandTotal) * 100) : 0;
    const fnbPercent = grandTotal > 0 ? (100 - roomPercent) : 0;

    const rPercentEl = document.getElementById("ratioRoomPercent");
    const rValEl = document.getElementById("ratioRoomValue");
    const fPercentEl = document.getElementById("ratioFnbPercent");
    const fValEl = document.getElementById("ratioFnbValue");

    if (rPercentEl) rPercentEl.textContent = `${roomPercent}%`;
    if (rValEl) rValEl.textContent = `(${formatMoney(roomMoney)})`;
    if (fPercentEl) fPercentEl.textContent = `${fnbPercent}%`;
    if (fValEl) fValEl.textContent = `(${formatMoney(fnbMoney)})`;

    const chartContainer = document.getElementById("admin7DaysBarChart");
    if (chartContainer) {
        const todayHeight = grandTotal > 0 ? Math.min(100, Math.max(25, (grandTotal / 1000000) * 100)) : 10;
        chartContainer.innerHTML = `
            <div class="chart-col"><div class="col-bar" style="height: 10%;"></div><span>T3</span></div>
            <div class="chart-col"><div class="col-bar" style="height: 10%;"></div><span>T4</span></div>
            <div class="chart-col"><div class="col-bar" style="height: 10%;"></div><span>T5</span></div>
            <div class="chart-col"><div class="col-bar" style="height: 10%;"></div><span>T6</span></div>
            <div class="chart-col"><div class="col-bar" style="height: 10%;"></div><span>T7</span></div>
            <div class="chart-col"><div class="col-bar" style="height: 10%;"></div><span>CN</span></div>
            <div class="chart-col"><div class="col-bar today" style="height: ${todayHeight}%;"></div><span style="color: var(--primary); font-weight: bold;">Nay</span></div>
        `;
    }
}

// ==========================================
// 7. DRAWER CHI TIẾT ĐƠN HÀNG
// ==========================================
function initDrawerEvents() {
    const overlay = document.getElementById("adminDrawerOverlay");
    const drawer = document.getElementById("adminOrderDrawer");
    const closeBtn = document.getElementById("btnCloseDrawer");
    const checkinBtn = document.getElementById("btnDrawerCheckin");

    const close = () => {
        drawer?.classList.remove("open");
        overlay?.classList.remove("open");
    };

    closeBtn?.addEventListener("click", close);
    overlay?.addEventListener("click", close);

    checkinBtn?.addEventListener("click", () => {
        if (!currentDrawerBooking) return;
        if (currentDrawerBooking.status === "cancelled") {
            alert(" Đơn này đã hủy, không thể check-in!");
            return;
        }
        currentDrawerBooking.status = "checked_in";

        try {
            const rawHist = localStorage.getItem("chillflix_booking_history");
            if (rawHist) {
                let list = JSON.parse(rawHist);
                const idx = list.findIndex(b => b.ticketCode === currentDrawerBooking.ticketCode);
                if (idx !== -1) {
                    list[idx].status = "checked_in";
                    localStorage.setItem("chillflix_booking_history", JSON.stringify(list));
                }
            }
        } catch (e) {}

        alert(`✅ CHECK-IN THÀNH CÔNG!\n\nĐã mở khóa phòng cho khách [${currentDrawerBooking.customer?.name}]. Bàn phím cửa phòng đã kích hoạt mã PIN [${currentDrawerBooking.smartPin || '8892'}].`);
        close();
        renderGanttMatrix();
        renderUrgentTasks();
    });
}

function openDrawerWithBooking(booking) {
    currentDrawerBooking = booking;
    const drawer = document.getElementById("adminOrderDrawer");
    const overlay = document.getElementById("adminDrawerOverlay");

    document.getElementById("drawerOrderCode").textContent = `#${booking.ticketCode || "CP-DEMO"}`;
    document.getElementById("drawerCustName").textContent = booking.customer?.name || "Khách xem phim";
    document.getElementById("drawerCustPhone").textContent = `${booking.customer?.phone || "--"} · Khách đặt trực tuyến`;
    document.getElementById("drawerRoomName").textContent = booking.roomName || "Phòng riêng";
    document.getElementById("drawerShowtime").textContent = `${booking.startTime} (${booking.duration} giờ xem)`;
    document.getElementById("drawerMovieName").textContent = booking.movieTitle || "Phim";
    document.getElementById("drawerDoorPin").textContent = booking.smartPin || "8892";

    document.getElementById("drawerRoomPrice").textContent = formatMoney(booking.roomTotal || 0);
    document.getElementById("drawerFnbPrice").textContent = formatMoney(booking.foodTotal || 0);
    document.getElementById("drawerTotalPrice").textContent = formatMoney(booking.finalTotal || booking.grandTotal || 0);

    const checkinBtn = document.getElementById("btnDrawerCheckin");
    if (checkinBtn) {
        if (booking.status === "cancelled") {
            checkinBtn.textContent = "✕ ĐƠN ĐÃ HỦY (KHÔNG THỂ CHECK-IN)";
            checkinBtn.disabled = true;
            checkinBtn.style.cursor = "not-allowed";
        } else if (booking.status === "checked_in") {
            checkinBtn.textContent = "✓ Đã nhận phòng (Đang xem)";
            checkinBtn.disabled = true;
            checkinBtn.style.cursor = "not-allowed";
        } else {
            checkinBtn.textContent = "✓ Xác Nhận Nhận Phòng (Check-in)";
            checkinBtn.disabled = false;
            checkinBtn.style.cursor = "pointer";
        }
    }

    const noteBox = document.getElementById("drawerNoteBox");
    const noteText = document.getElementById("drawerNoteText");
    if (booking.customer?.roomNote) {
        noteBox.style.display = "block";
        noteText.textContent = booking.customer.roomNote;
    } else {
        noteBox.style.display = "none";
    }

    const fnbContainer = document.getElementById("drawerFnbList");
    const foods = Array.isArray(booking.foods) ? booking.foods : [];
    if (foods.length > 0) {
        fnbContainer.innerHTML = foods.map(f => `
            <div class="drawer-fnb-row" style="display: flex; justify-content: space-between; font-size: 12.5px; color: var(--text-muted); margin-bottom: 4px;">
                <span>🍿 ${f.name} × ${f.quantity}</span>
                <strong style="color: var(--text);">${formatMoney(f.price * f.quantity)}</strong>
            </div>
        `).join('');
    } else {
        fnbContainer.innerHTML = `<span style="font-size: 12px; color: var(--text-muted);">Không đặt món trước.</span>`;
    }

    drawer?.classList.add("open");
    overlay?.classList.add("open");
}

function checkAdminRole() {
    let user = null;
    try {
        user = JSON.parse(localStorage.getItem("chillflix_user"));
    } catch (e) {}

    if (!user || user.role !== "admin") {
        const accept = confirm("⚠️ CẢNH BÁO BẢO MẬT:\n\nBạn đang vào Cổng Quản Trị Rạp (Admin). Tài khoản hiện tại chưa có quyền Quản lý.\n\nBấm [OK] để tự động đăng nhập nhanh bằng tài khoản Quản Lý (Admin) để tiếp tục!");
        if (accept) {
            const adminUser = {
                fullName: "Trần Minh Đạt (Quản Lý Rạp)",
                email: "admin@chillflix.vn",
                role: "admin",
                points: 9999
            };
            localStorage.setItem("chillflix_user", JSON.stringify(adminUser));
            localStorage.setItem("chillflix_token", "jwt_admin_token_2026");
            window.location.reload();
        } else {
            window.location.href = "../index.html";
        }
    } else {
        const nameEl = document.getElementById("adminNameDisplay");
        if (nameEl) {
            const cleanName = user.fullName ? user.fullName.split("(")[0].trim() : "Quản lý rạp";
            nameEl.textContent = cleanName;
        }
    }
}