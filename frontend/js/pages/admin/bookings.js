/* ==========================================================================
   CHILLFLIX ADMIN - BOOKINGS CONTROLLER (QUẢN LÝ ĐƠN HÀNG THỜI GIAN THỰC)
   Lọc trạng thái, tìm kiếm, mở Drawer tiến trình Check-in, xuất file CSV
   ========================================================================== */

function formatMoney(amount) {
    return new Intl.NumberFormat("vi-VN").format(Math.max(0, Math.round(Number(amount) || 0))) + "đ";
}

let allOrders = [];
let currentFilter = "all"; // all, confirmed, checked_in, cancelled
let currentSearch = "";
let currentSelectedOrder = null;

document.addEventListener("DOMContentLoaded", () => {
    initLiveClock();
    loadAllBookingsData();
    setupFilterEvents();
    setupSearchEvents();
    setupDrawerActions();
    setupExportCsv();

    // Lắng nghe đơn mới realtime
    window.addEventListener("storage", (e) => {
        if (e.key === "chillflix_booking_history") {
            loadAllBookingsData();
        }
    });
});

// ==========================================
// 1. TẢI TOÀN BỘ ĐƠN HÀNG TỪ LOCALSTORAGE
// ==========================================
function loadAllBookingsData() {
    try {
        const raw = localStorage.getItem("chillflix_booking_history");
        allOrders = raw ? JSON.parse(raw) : [];
    } catch (e) {
        allOrders = [];
    }

    // Cập nhật số đếm badge
    document.getElementById("bookingsSidebarBadge").textContent = allOrders.length;

    // Đếm số lượng theo tab
    const confirmedCount = allOrders.filter(b => b.status === "confirmed").length;
    const checkedInCount = allOrders.filter(b => b.status === "checked_in").length;
    const cancelledCount = allOrders.filter(b => b.status === "cancelled").length;

    document.getElementById("countAll").textContent = allOrders.length;
    document.getElementById("countConfirmed").textContent = confirmedCount;
    document.getElementById("countCheckedIn").textContent = checkedInCount;
    document.getElementById("countCancelled").textContent = cancelledCount;

    renderTable();
}

// ==========================================
// 2. RENDER BẢNG DANH SÁCH ĐƠN HÀNG
// ==========================================
function renderTable() {
    const tbody = document.getElementById("bookingsTableBody");
    const infoText = document.getElementById("paginationInfoText");
    if (!tbody) return;
    tbody.replaceChildren();

    // Lọc theo Tab trạng thái
    let list = [...allOrders];
    if (currentFilter !== "all") {
        list = list.filter(b => b.status === currentFilter);
    }

    // Lọc theo từ khóa tìm kiếm (Mã đơn, Tên, SĐT)
    if (currentSearch) {
        list = list.filter(b => {
            const code = (b.ticketCode || "").toLowerCase();
            const name = (b.customer?.name || "").toLowerCase();
            const phone = (b.customer?.phone || "").toLowerCase();
            return code.includes(currentSearch) || name.includes(currentSearch) || phone.includes(currentSearch);
        });
    }

    // Lọc theo phòng chiếu
    const roomFilter = document.getElementById("filterRoomSelect")?.value;
    if (roomFilter && roomFilter !== "all") {
        list = list.filter(b => b.roomType === roomFilter);
    }

    if (infoText) {
        infoText.textContent = `Hiển thị ${list.length} trên tổng số ${allOrders.length} đơn đặt phòng`;
    }

    if (list.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 48px; color: var(--text-muted);">
                    Không tìm thấy đơn đặt phòng nào phù hợp với bộ lọc.
                </td>
            </tr>
        `;
        return;
    }

    list.forEach(b => {
        const tr = document.createElement("tr");

        // Format trạng thái
        let badgeHTML = `<span class="badge badge--warning">Chờ duyệt</span>`;
        if (b.status === "confirmed") {
            badgeHTML = `<span class="badge badge--info">● Đã xác nhận</span>`;
        } else if (b.status === "checked_in") {
            badgeHTML = `<span class="badge badge--success">✓ Đã nhận phòng</span>`;
        } else if (b.status === "cancelled") {
            badgeHTML = `<span class="badge badge--danger">✕ Đã hủy</span>`;
        }

        const foodCount = (b.foods || []).reduce((sum, f) => sum + (f.quantity || 0), 0);
        const foodText = foodCount > 0 ? `🍿 ${foodCount} món đã chuẩn bị` : "Không đặt trước";

        tr.innerHTML = `
            <td><span class="t-code-pill">${b.ticketCode || "CP-DEMO"}</span></td>
            <td>
                <div class="t-cust-box">
                    <strong>${b.customer?.name || "Khách vãng lai"}</strong>
                    <small>📞 ${b.customer?.phone || "--"}</small>
                </div>
            </td>
            <td>
                <div class="t-movie-box">
                    <strong>${b.movieTitle || "Phim chiếu rạp"}</strong>
                    <small>🛋 ${b.roomName || "Phòng riêng"}</small>
                </div>
            </td>
            <td>
                <div>📅 ${b.date || "--"}</div>
                <small style="color: var(--primary); font-weight: 600;">⏰ ${b.startTime} (${b.duration}h)</small>
            </td>
            <td><span style="font-size: 12px; color: var(--text-muted);">${foodText}</span></td>
            <td><strong style="color: var(--primary); font-size: 14px;">${formatMoney(b.finalTotal || b.grandTotal)}</strong></td>
            <td>${badgeHTML}</td>
            <td>
                <button type="button" class="btn btn--outline btn-open-detail" style="height: 32px; padding: 0 10px; font-size: 12px;">
                    Chi tiết ➔
                </button>
            </td>
        `;

        // Bấm vào hàng bất kỳ để mở Drawer chi tiết tiến trình
        tr.addEventListener("click", () => openOrderDrawer(b));

        tbody.appendChild(tr);
    });
}

// ==========================================
// 3. MỞ DRAWER TIẾN TRÌNH CHECK-IN (MOCKUP 10)
// ==========================================
function openOrderDrawer(booking) {
    currentSelectedOrder = booking;

    const drawer = document.getElementById("bookingDetailDrawer");
    const overlay = document.getElementById("bookingDrawerOverlay");

    document.getElementById("drwOrderCode").textContent = `#${booking.ticketCode}`;
    document.getElementById("drwDoorPin").textContent = booking.smartPin || "8892";
    document.getElementById("drwCustomerName").textContent = booking.customer?.name || "Khách xem phim";
    document.getElementById("drwCustomerPhone").textContent = `${booking.customer?.phone || "--"} · Email: ${booking.customer?.email || "--"}`;
    document.getElementById("drwMovieTitle").textContent = booking.movieTitle;
    document.getElementById("drwRoomName").textContent = booking.roomName;
    document.getElementById("drwShowtime").textContent = `${booking.date} lúc ${booking.startTime}`;
    document.getElementById("drwDuration").textContent = `${booking.duration} giờ`;

    document.getElementById("drwRoomPrice").textContent = formatMoney(booking.roomTotal);
    document.getElementById("drwFnbPrice").textContent = formatMoney(booking.foodTotal);
    document.getElementById("drwTotalPrice").textContent = formatMoney(booking.finalTotal || booking.grandTotal);

    // Tiến trình checkin
    const checkinStep = document.getElementById("flowCheckinStep");
    const checkinDot = document.getElementById("flowCheckinDot");
    const checkinStatus = document.getElementById("flowCheckinStatus");
    const btnCheckin = document.getElementById("btnActionCheckinNow");

    if (booking.status === "checked_in") {
        checkinStep.classList.add("done");
        checkinDot.textContent = "✓";
        checkinStatus.textContent = "Đã vào phòng chiếu";
        btnCheckin.textContent = "✓ Đã nhận phòng (Check-in)";
        btnCheckin.disabled = true;
    } else {
        checkinStep.classList.remove("done");
        checkinDot.textContent = "4";
        checkinStatus.textContent = "Đang chờ khách tới nhận phòng";
        btnCheckin.textContent = "✓ Xác Nhận Nhận Phòng (Check-in Ngay)";
        btnCheckin.disabled = false;
    }

    // Ghi chú phòng riêng
    const noteBox = document.getElementById("drwNoteBox");
    const noteText = document.getElementById("drwNoteText");
    if (booking.customer?.roomNote) {
        noteBox.style.display = "block";
        noteText.textContent = booking.customer.roomNote;
    } else {
        noteBox.style.display = "none";
    }

    // Danh sách đồ ăn F&B
    const fnbContainer = document.getElementById("drwFnbList");
    const foods = Array.isArray(booking.foods) ? booking.foods : [];
    if (foods.length > 0) {
        fnbContainer.innerHTML = foods.map(f => `
            <div style="display: flex; justify-content: space-between; font-size: 12.5px; color: var(--text-muted); margin-bottom: 4px;">
                <span>🍿 ${f.name} × ${f.quantity}</span>
                <strong style="color: var(--text);">${formatMoney(f.price * f.quantity)}</strong>
            </div>
        `).join('');
    } else {
        fnbContainer.innerHTML = `<span style="font-size: 12px; color: var(--text-muted);">Không đặt món trước.</span>`;
    }

    drawer.classList.add("open");
    overlay.classList.add("open");
}

// ==========================================
// 4. THAO TÁC TRONG DRAWER (CHECK-IN & HỦY ĐƠN)
// ==========================================
function setupDrawerActions() {
    const drawer = document.getElementById("bookingDetailDrawer");
    const overlay = document.getElementById("bookingDrawerOverlay");
    const closeBtn = document.getElementById("btnCloseOrderDrawer");
    const checkinBtn = document.getElementById("btnActionCheckinNow");
    const printBtn = document.getElementById("btnActionPrintBill");
    const cancelBtn = document.getElementById("btnActionCancelOrder");

    const close = () => {
        drawer.classList.remove("open");
        overlay.classList.remove("open");
    };

    closeBtn?.addEventListener("click", close);
    overlay?.addEventListener("click", close);

    // Check-in trực tiếp
    checkinBtn?.addEventListener("click", () => {
        if (!currentSelectedOrder) return;
        currentSelectedOrder.status = "checked_in";

        // Cập nhật lại trong localStorage
        updateOrderInLocalStorage(currentSelectedOrder);
        alert(`✅ ĐÃ CHECK-IN THÀNH CÔNG!\n\nKhách hàng [${currentSelectedOrder.customer?.name}] đã nhận phòng [${currentSelectedOrder.roomName}]. Mã PIN mở cửa: ${currentSelectedOrder.smartPin}.`);
        close();
        loadAllBookingsData();
    });

    // In hóa đơn
    printBtn?.addEventListener("click", () => window.print());

    // Hủy đơn
    cancelBtn?.addEventListener("click", () => {
        if (!currentSelectedOrder) return;
        if (confirm(`Bạn có chắc chắn muốn hủy đơn #${currentSelectedOrder.ticketCode} và hoàn tiền cho khách?`)) {
            currentSelectedOrder.status = "cancelled";
            updateOrderInLocalStorage(currentSelectedOrder);
            alert("✓ Đã hủy đơn đặt phòng và nhả lịch.");
            close();
            loadAllBookingsData();
        }
    });
}

function updateOrderInLocalStorage(order) {
    try {
        const raw = localStorage.getItem("chillflix_booking_history");
        if (raw) {
            let list = JSON.parse(raw);
            const idx = list.findIndex(b => b.ticketCode === order.ticketCode);
            if (idx !== -1) {
                list[idx] = order;
                localStorage.setItem("chillflix_booking_history", JSON.stringify(list));
            }
        }
    } catch (e) {}
}

// ==========================================
// 5. BỘ LỌC TAB & TÌM KIẾM
// ==========================================
function setupFilterEvents() {
    const tabs = document.querySelectorAll(".tab-filter-chip");
    tabs.forEach(chip => {
        chip.addEventListener("click", () => {
            tabs.forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
            currentFilter = chip.dataset.status;
            renderTable();
        });
    });

    document.getElementById("filterRoomSelect")?.addEventListener("change", renderTable);

    document.getElementById("btnResetFilters")?.addEventListener("click", () => {
        currentFilter = "all";
        currentSearch = "";
        document.querySelectorAll(".tab-filter-chip").forEach(c => c.classList.remove("active"));
        document.querySelector('.tab-filter-chip[data-status="all"]')?.classList.add("active");
        
        const searchInput = document.getElementById("tableFilterSearch");
        if (searchInput) searchInput.value = "";

        const roomSelect = document.getElementById("filterRoomSelect");
        if (roomSelect) roomSelect.value = "all";

        renderTable();
    });
}

function setupSearchEvents() {
    const searchInp = document.getElementById("tableFilterSearch");
    searchInp?.addEventListener("input", (e) => {
        currentSearch = e.target.value.trim().toLowerCase();
        renderTable();
    });
}

// ==========================================
// 6. XUẤT FILE CSV THẬT 100%
// ==========================================
function setupExportCsv() {
    document.getElementById("btnExportCsv")?.addEventListener("click", () => {
        if (allOrders.length === 0) {
            alert("Chưa có dữ liệu đơn hàng để xuất CSV!");
            return;
        }

        // Tạo nội dung CSV chuẩn UTF-8
        let csvContent = "\uFEFFMã Đơn,Khách Hàng,Số Điện Thoại,Phim,Phòng Chiếu,Ngày,Giờ,Thời Lượng,Tổng Tiền,Trạng Thái\n";
        
        allOrders.forEach(b => {
            const row = [
                b.ticketCode || "",
                `"${b.customer?.name || ""}"`,
                b.customer?.phone || "",
                `"${b.movieTitle || ""}"`,
                `"${b.roomName || ""}"`,
                b.date || "",
                b.startTime || "",
                `${b.duration || 2} giờ`,
                b.finalTotal || b.grandTotal || 0,
                b.status || ""
            ].join(",");
            csvContent += row + "\n";
        });

        // Kích hoạt tải file về máy
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Bao_Cao_Don_Hang_ChillFlix_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

// ĐỒNG HỒ THỜI GIAN THỰC
function initLiveClock() {
    const clockEl = document.getElementById("adminLiveClock");
    if (!clockEl) return;
    const update = () => {
        const now = new Date();
        const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
        const d = String(now.getDate()).padStart(2, "0");
        const m = String(now.getMonth() + 1).padStart(2, "0");
        const hh = String(now.getHours()).padStart(2, "0");
        const mm = String(now.getMinutes()).padStart(2, "0");
        const ss = String(now.getSeconds()).padStart(2, "0");
        clockEl.textContent = `🕒 ${hh}:${mm}:${ss} · ${days[now.getDay()]}, ${d}/${m}/${now.getFullYear()}`;
    };
    update();
    setInterval(update, 1000);
}