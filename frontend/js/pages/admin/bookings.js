/* ==========================================================================
   CHILLFLIX ADMIN - BOOKINGS CONTROLLER (QUẢN LÝ ĐƠN HÀNG THỜI GIAN THỰC)
   ========================================================================== */
import { API } from '../../apiClient.js';

function formatMoney(amount) {
    return new Intl.NumberFormat("vi-VN").format(Math.max(0, Math.round(Number(amount) || 0))) + "đ";
}

let allOrders = [];
let currentFilter = "all";
let currentSearch = "";
let currentSelectedOrder = null;

document.addEventListener("DOMContentLoaded", () => {
    initLiveClock();
    loadAllBookingsData();
    setupFilterEvents();
    setupSearchEvents();
    setupDrawerActions();
    setupExportCsv();
});

// 1. TẢI TOÀN BỘ ĐƠN HÀNG TỪ MONGODB SERVER
async function loadAllBookingsData() {
    try {
        const res = await API.getAdminBookings();
        allOrders = res.data || [];
    } catch (e) {
        console.warn("Chưa tải được đơn:", e);
        allOrders = [];
    }

    const badge = document.getElementById("bookingsSidebarBadge");
    if (badge) badge.textContent = allOrders.length;

    // Đếm số lượng theo tab (Hỗ trợ cả trường mới lẫn cũ)
    const confirmedCount = allOrders.filter(b => b.status === "confirmed").length;
    const checkedInCount = allOrders.filter(b => b.status === "checked_in").length;
    const cancelledCount = allOrders.filter(b => b.status === "cancelled").length;

    setText("countAll", allOrders.length);
    setText("countConfirmed", confirmedCount);
    setText("countCheckedIn", checkedInCount);
    setText("countCancelled", cancelledCount);

    renderTable();
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

// 2. RENDER BẢNG DANH SÁCH ĐƠN HÀNG
function renderTable() {
    const tbody = document.getElementById("bookingsTableBody");
    const infoText = document.getElementById("paginationInfoText");
    if (!tbody) return;
    tbody.innerHTML = "";

    let list = [...allOrders];

    // Lọc theo Tab trạng thái
    if (currentFilter !== "all") {
        list = list.filter(b => b.status === currentFilter);
    }

    // Lọc theo tìm kiếm
    if (currentSearch) {
        list = list.filter(b => {
            const code = (b.bookingCode || b.ticketCode || "").toLowerCase();
            const name = (b.customer?.name || "").toLowerCase();
            const phone = (b.customer?.phone || "").toLowerCase();
            return code.includes(currentSearch) || name.includes(currentSearch) || phone.includes(currentSearch);
        });
    }

    // Lọc theo phòng chiếu (Hỗ trợ cả roomId và roomType)
    const roomFilter = document.getElementById("filterRoomSelect")?.value;
    if (roomFilter && roomFilter !== "all") {
        list = list.filter(b => (b.roomId === roomFilter || b.roomType === roomFilter));
    }

    if (infoText) {
        infoText.textContent = `Hiển thị ${list.length} trên tổng số ${allOrders.length} đơn đặt phòng`;
    }

    if (list.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 48px; color: var(--text-muted);">
                    Không có đơn đặt phòng nào phù hợp với bộ lọc.
                </td>
            </tr>
        `;
        return;
    }

    list.forEach(b => {
        const tr = document.createElement("tr");
        const orderCode = b.bookingCode || b.ticketCode || "CP-DEMO";
        const isPaid = b.paymentStatus === "paid";

        // Format huy hiệu trạng thái
        let badgeHTML = `<span class="badge badge--warning">⏳ Chờ duyệt tiền</span>`;
        if (b.status === "confirmed") badgeHTML = `<span class="badge badge--info">● Đã xác nhận</span>`;
        if (b.status === "checked_in") badgeHTML = `<span class="badge badge--success">✓ Đã vào phòng</span>`;
        if (b.status === "cancelled") badgeHTML = `<span class="badge badge--danger">✕ Đã hủy</span>`;

        const foodCount = (b.foods || []).reduce((sum, f) => sum + (f.quantity || 0), 0);
        const foodText = foodCount > 0 ? `🍿 ${foodCount} món` : "Không đặt";

        // Nút thao tác nhanh trên từng hàng
        let quickBtn = "";
        if (!isPaid && b.status !== "cancelled") {
            quickBtn = `<button type="button" class="btn btn--primary btn-row-approve" data-code="${orderCode}" style="height: 28px; padding: 0 8px; font-size: 11px; margin-right: 4px;">Duyệt tiền</button>`;
        }

        tr.innerHTML = `
            <td><span class="t-code-pill">${orderCode}</span></td>
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
                ${quickBtn}
                <button type="button" class="btn btn--outline btn-open-detail" style="height: 28px; padding: 0 8px; font-size: 11px;">
                    Chi tiết ➔
                </button>
            </td>
        `;

        // Bấm duyệt tiền trực tiếp
        tr.querySelector(".btn-row-approve")?.addEventListener("click", async (e) => {
            e.stopPropagation();
            if (confirm(`Xác nhận khách đã chuyển khoản thành công cho đơn #${orderCode}?`)) {
                await API.confirmPayment(orderCode);
                alert("✅ Đã duyệt thanh toán thành công!");
                loadAllBookingsData();
            }
        });

        // Bấm chi tiết mở Drawer
        tr.addEventListener("click", () => openOrderDrawer(b));

        tbody.appendChild(tr);
    });
}

// 3. MỞ DRAWER TIẾN TRÌNH
function openOrderDrawer(booking) {
    currentSelectedOrder = booking;
    const orderCode = booking.bookingCode || booking.ticketCode || "CP-DEMO";
    const isPaid = booking.paymentStatus === "paid";

    const drawer = document.getElementById("bookingDetailDrawer");
    const overlay = document.getElementById("bookingDrawerOverlay");

    setText("drwOrderCode", `#${orderCode}`);
    setText("drwDoorPin", isPaid ? (booking.smartPin || "8892") : "🔒 Khóa");
    setText("drwCustomerName", booking.customer?.name || "Khách xem phim");
    setText("drwCustomerPhone", `${booking.customer?.phone || "--"} · Email: ${booking.customer?.email || "--"}`);
    setText("drwMovieTitle", booking.movieTitle);
    setText("drwRoomName", booking.roomName);
    setText("drwShowtime", `${booking.date} lúc ${booking.startTime}`);
    setText("drwDuration", `${booking.duration} giờ`);

    setText("drwRoomPrice", formatMoney(booking.roomTotal));
    setText("drwFnbPrice", formatMoney(booking.foodTotal));
    setText("drwTotalPrice", formatMoney(booking.finalTotal || booking.grandTotal));

    const checkinBtn = document.getElementById("btnActionCheckinNow");
    if (checkinBtn) {
        if (booking.status === "cancelled") {
            checkinBtn.textContent = "✕ ĐƠN ĐÃ HỦY (KHÔNG THỂ CHECK-IN)";
            checkinBtn.disabled = true;
            checkinBtn.style.background = "rgba(229, 72, 77, 0.15)";
            checkinBtn.style.color = "var(--danger)";
            checkinBtn.style.border = "1px solid var(--danger)";
            checkinBtn.style.cursor = "not-allowed";
        } else if (booking.status === "checked_in") {
            checkinBtn.textContent = "✓ Đã nhận phòng (Đang xem)";
            checkinBtn.disabled = true;
            checkinBtn.style.background = "var(--surface-2)";
            checkinBtn.style.color = "var(--text-muted)";
            checkinBtn.style.border = "1px solid var(--border)";
            checkinBtn.style.cursor = "not-allowed";
        } else if (!isPaid) {
            checkinBtn.textContent = " Duyệt Tiền & Cho Vào Phòng";
            checkinBtn.disabled = false;
            checkinBtn.style.background = "var(--primary)";
            checkinBtn.style.color = "var(--on-primary)";
            checkinBtn.style.cursor = "pointer";
        } else {
            checkinBtn.textContent = "✓ Xác Nhận Cho Khách Vào Phòng";
            checkinBtn.disabled = false;
            checkinBtn.style.background = "var(--primary)";
            checkinBtn.style.color = "var(--on-primary)";
            checkinBtn.style.cursor = "pointer";
        }
    }

    drawer?.classList.add("open");
    overlay?.classList.add("open");
}

function setupDrawerActions() {
    const drawer = document.getElementById("bookingDetailDrawer");
    const overlay = document.getElementById("bookingDrawerOverlay");
    const closeBtn = document.getElementById("btnCloseOrderDrawer");
    const checkinBtn = document.getElementById("btnActionCheckinNow");
    const cancelBtn = document.getElementById("btnActionCancelOrder");

    const close = () => {
        drawer?.classList.remove("open");
        overlay?.classList.remove("open");
    };

    closeBtn?.addEventListener("click", close);
    overlay?.addEventListener("click", close);

    checkinBtn?.addEventListener("click", async () => {
        if (!currentSelectedOrder) return;
        if (currentSelectedOrder.status === "cancelled") {
            alert("Đơn đặt phòng này đã bị hủy! Bạn không thể thực hiện check-in nhận phòng.");
            return;
        }
        const code = currentSelectedOrder.bookingCode || currentSelectedOrder.ticketCode;

        try {
            // Nếu chưa thanh toán -> duyệt thanh toán trước
            if (currentSelectedOrder.paymentStatus !== "paid") {
                await API.confirmPayment(code);
            }
            await API.checkinBooking(code);
            alert(`ĐÃ CHECK-IN THÀNH CÔNG!\nPhòng [${currentSelectedOrder.roomName}] đã kích hoạt.`);
            close();
            loadAllBookingsData();
        } catch (err) {
            alert("Lỗi: " + err.message);
        }
    });

    cancelBtn?.addEventListener("click", async () => {
        if (!currentSelectedOrder) return;
        const code = currentSelectedOrder.bookingCode || currentSelectedOrder.ticketCode;

        if (confirm(`Bạn có chắc muốn hủy đơn #${code}?`)) {
            try {
                await API.cancelBooking(code);
                alert("✓ Đã hủy đơn đặt phòng.");
                close();
                loadAllBookingsData();
            } catch (err) {
                alert("Lỗi hủy đơn: " + err.message);
            }
        }
    });
}

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
}

function setupSearchEvents() {
    document.getElementById("tableFilterSearch")?.addEventListener("input", (e) => {
        currentSearch = e.target.value.trim().toLowerCase();
        renderTable();
    });
}

function setupExportCsv() {
    document.getElementById("btnExportCsv")?.addEventListener("click", () => {
        if (allOrders.length === 0) return alert("Chưa có đơn hàng để xuất!");
        let csv = "\uFEFFMã Đơn,Khách Hàng,SĐT,Phim,Phòng,Ngày,Giờ,Tổng Tiền,Trạng Thái\n";
        allOrders.forEach(b => {
            csv += `"${b.bookingCode || b.ticketCode}","${b.customer?.name}","${b.customer?.phone}","${b.movieTitle}","${b.roomName}","${b.date}","${b.startTime}",${b.finalTotal},"${b.status}"\n`;
        });
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `Don_Hang_ChillFlix_${Date.now()}.csv`;
        a.click();
    });
}

function initLiveClock() {
    const clockEl = document.getElementById("adminLiveClock");
    if (!clockEl) return;
    const update = () => {
        const now = new Date();
        clockEl.textContent = `🕒 ${now.toLocaleTimeString('vi-VN')} · ${now.toLocaleDateString('vi-VN')}`;
    };
    update();
    setInterval(update, 1000);
}