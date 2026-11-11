/* ==========================================================================
   CHILLFLIX ADMIN - ANALYTICS & BIỂU ĐỒ DOANH THU CHUẨN CHART.JS
   ========================================================================== */

function formatMoney(amount) {
    return new Intl.NumberFormat("vi-VN").format(Math.max(0, Math.round(Number(amount) || 0))) + "đ";
}

let timelineChartInstance = null;
let doughnutChartInstance = null;
let roomBarChartInstance = null;

document.addEventListener("DOMContentLoaded", () => {
    initClock();
    setupRangeFilter();
    setupExportCsv();
    loadAnalyticsData("7days");
});

// TẢI VÀ TÍNH TOÁN DỮ LIỆU BÁO CÁO
function loadAnalyticsData(rangeType = "7days") {
    // 1. Đọc đơn thực tế từ database/localStorage
    let realBookings = [];
    try {
        const saved = localStorage.getItem("chillflix_booking_history");
        if (saved) realBookings = JSON.parse(saved);
    } catch (e) {}

    const validOrders = realBookings.filter(b => b.status !== "cancelled");
    const realRevenue = validOrders.reduce((sum, b) => sum + (Number(b.finalTotal || b.grandTotal) || 0), 0);
    const realBookingsCount = validOrders.length;

    // Thiết lập số liệu mẫu nền tảng thực tế (Baseline) kết hợp số liệu khách đặt thật
    const baseRevenue = 128450000 + realRevenue;
    const baseOrders = 342 + realBookingsCount;
    const aov = Math.round(baseRevenue / baseOrders);

    // Điền 5 thẻ KPI
    setText("anlTotalRevenue", formatMoney(baseRevenue));
    setText("anlTotalBookings", `${baseOrders} <small>đơn</small>`);
    setText("anlAov", formatMoney(aov));

    // Vẽ 3 biểu đồ Chart.js
    renderTimelineChart(rangeType);
    renderSourceDoughnutChart();
    renderRoomPerformanceChart();

    // Render bảng Top 5 Phim & Món
    renderTopRankings();

    // Render Bảng kê chi tiết theo ngày
    renderAccountingTable();
}

// 1. BIỂU ĐỒ 1: XU HƯỚNG DOANH THU THEO NGÀY (CỘT + ĐƯỜNG KẾT HỢP)
function renderTimelineChart(rangeType) {
    const ctx = document.getElementById("revenueTimelineChart");
    if (!ctx) return;

    if (timelineChartInstance) {
        timelineChartInstance.destroy();
    }

    const labels = ["T2, 03/11", "T3, 04/11", "T4, 05/11", "T5, 06/11", "T6, 07/11", "T7, 08/11", "CN, 09/11"];
    const roomRevenueData = [3600000, 2800000, 3100000, 4200000, 5800000, 7900000, 8500000];
    const fnbRevenueData =   [1450000, 1100000, 1350000, 1900000, 2600000, 3800000, 4100000];

    timelineChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Tiền Giờ Phòng (VNĐ)',
                    data: roomRevenueData,
                    backgroundColor: '#F5B544',
                    borderRadius: 4,
                    stack: 'revenue'
                },
                {
                    label: 'Ẩm Thực F&B (VNĐ)',
                    data: fnbRevenueData,
                    backgroundColor: '#5AA9FF',
                    borderRadius: 4,
                    stack: 'revenue'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.dataset.label}: ${formatMoney(ctx.raw)}`
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#A79DB4', font: { size: 11 } }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.08)' },
                    ticks: {
                        color: '#A79DB4',
                        font: { size: 11 },
                        callback: (v) => (v / 1000000) + 'M'
                    }
                }
            }
        }
    });
}

// 2. BIỂU ĐỒ 2: CƠ CẤU NGUỒN THU DOUGHNUT (PHÒNG VS F&B)
function renderSourceDoughnutChart() {
    const ctx = document.getElementById("revenueSourceDoughnutChart");
    if (!ctx) return;

    if (doughnutChartInstance) {
        doughnutChartInstance.destroy();
    }

    doughnutChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Tiền Giờ Phòng (66.8%)', 'Ẩm Thực F&B (33.2%)'],
            datasets: [{
                data: [85800000, 42650000],
                backgroundColor: ['#F5B544', '#5AA9FF'],
                borderColor: '#181420',
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#F3EEF7', font: { size: 12 }, padding: 14 }
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => ` ${ctx.label}: ${formatMoney(ctx.raw)}`
                    }
                }
            },
            cutout: '68%'
        }
    });
}

// 3. BIỂU ĐỒ 3: HIỆU SUẤT THEO KHÔNG GIAN PHÒNG
function renderRoomPerformanceChart() {
    const ctx = document.getElementById("roomPerformanceBarChart");
    if (!ctx) return;

    if (roomBarChartInstance) {
        roomBarChartInstance.destroy();
    }

    roomBarChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Couple A & B (Tầng 2)', 'Nhóm 4 Sao Hỏa (Tầng 3)', 'Laser 4K VIP (Tầng 4)'],
            datasets: [{
                label: 'Doanh thu phòng (VNĐ)',
                data: [69620000, 36610000, 22220000],
                backgroundColor: ['#F5B544', '#F0A020', '#3FB950'],
                borderRadius: 6
            }]
        },
        options: {
            indexAxis: 'y', // Biểu đồ cột nằm ngang rất sang
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `Doanh thu: ${formatMoney(ctx.raw)}`
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: {
                        color: '#A79DB4',
                        callback: (v) => (v / 1000000) + 'M'
                    }
                },
                y: {
                    grid: { display: false },
                    ticks: { color: '#F3EEF7', font: { size: 12 } }
                }
            }
        }
    });
}

// 4. RENDER TOP 5 PHIM VÀ TOP 5 MÓN F&B
function renderTopRankings() {
    const topMoviesContainer = document.getElementById("topMoviesList");
    const topFnbContainer = document.getElementById("topFnbList");

    const TOP_MOVIES = [
        { rank: 1, title: "Dune: Hành Tinh Cát 2", slots: 98, occupancy: "92.4%", revenue: 35500000 },
        { rank: 2, title: "Oppenheimer (Bản 4K)", slots: 64, occupancy: "84.1%", revenue: 24000000 },
        { rank: 3, title: "Spider-Man: Du Hành Vũ Trụ", slots: 52, occupancy: "78.5%", revenue: 19500000 },
        { rank: 4, title: "La La Land (Vintage Cinema)", slots: 41, occupancy: "75.0%", revenue: 15400000 },
        { rank: 5, title: "Godzilla x Kong: Đế Chế Mới", slots: 35, occupancy: "71.2%", revenue: 13900000 }
    ];

    const TOP_FNB = [
        { rank: 1, name: "Combo Couple VIP (Bắp + 2 Nước)", sold: 215, revenue: 20425000, margin: "72%" },
        { rank: 2, name: "Cà Phê Muối ChillFlix Signature", sold: 184, revenue: 8280000, margin: "81%" },
        { rank: 3, name: "Bắp Rang Phô Mai Caramel Mix", sold: 162, revenue: 7810000, margin: "68%" },
        { rank: 4, name: "Trà Đào Cam Sả Ủ Lạnh", sold: 118, revenue: 4976000, margin: "79%" },
        { rank: 5, name: "Nachos Giòn & Sốt Phô Mai Ấm", sold: 88, revenue: 4840000, margin: "65%" }
    ];

    if (topMoviesContainer) {
        topMoviesContainer.innerHTML = TOP_MOVIES.map(m => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: var(--surface-2); border-radius: var(--radius-sm); border: 1px solid var(--border);">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-weight: 800; color: ${m.rank === 1 ? 'var(--primary)' : 'var(--text-muted)'}; font-size: 14px;">#${m.rank}</span>
                    <div>
                        <strong style="font-size: 13.5px; color: var(--text); display: block;">${m.title}</strong>
                        <small style="color: var(--text-muted); font-size: 11.5px;">${m.slots} suất chiếu · Lấp đầy ${m.occupancy}</small>
                    </div>
                </div>
                <strong style="color: var(--primary); font-size: 13.5px;">${formatMoney(m.revenue)}</strong>
            </div>
        `).join('');
    }

    if (topFnbContainer) {
        topFnbContainer.innerHTML = TOP_FNB.map(f => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: var(--surface-2); border-radius: var(--radius-sm); border: 1px solid var(--border);">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-weight: 800; color: ${f.rank === 1 ? 'var(--primary)' : 'var(--text-muted)'}; font-size: 14px;">#${f.rank}</span>
                    <div>
                        <strong style="font-size: 13.5px; color: var(--text); display: block;">${f.name}</strong>
                        <small style="color: var(--text-muted); font-size: 11.5px;">Đã bán ${f.sold} phần · Margin ${f.margin}</small>
                    </div>
                </div>
                <strong style="color: var(--info); font-size: 13.5px;">${formatMoney(f.revenue)}</strong>
            </div>
        `).join('');
    }
}

// 5. RENDER BẢNG KÊ CHI TIẾT DOANH THU THEO NGÀY
function renderAccountingTable() {
    const tbody = document.getElementById("dailyAccountingTableBody");
    if (!tbody) return;

    const ACCOUNTING_ROWS = [
        { date: "09/11/2026 (Hôm nay)", orders: 21, room: 4600000, fnb: 2250000, voucher: 310000, net: 6540000 },
        { date: "08/11/2026 (Chủ Nhật)", orders: 18, room: 4400000, fnb: 2180000, voucher: 220000, net: 6360000 },
        { date: "07/11/2026 (Thứ Bảy)", orders: 19, room: 4350000, fnb: 2050000, voucher: 260000, net: 6140000 },
        { date: "06/11/2026 (Thứ Sáu)", orders: 16, room: 3950000, fnb: 1880000, voucher: 180000, net: 5650000 },
        { date: "05/11/2026 (Thứ Năm)", orders: 12, room: 2900000, fnb: 1420000, voucher: 100000, net: 4220000 },
        { date: "04/11/2026 (Thứ Tư)", orders: 10, room: 2550000, fnb: 1210000, voucher: 120000, net: 3640000 },
        { date: "03/11/2026 (Thứ Ba)", orders: 9, room: 2200000, fnb: 980000, voucher: 80000, net: 3100000 }
    ];

    tbody.innerHTML = ACCOUNTING_ROWS.map(r => `
        <tr>
            <td><strong>📅 ${r.date}</strong></td>
            <td><span class="badge badge--info">${r.orders} đơn hoàn tất</span></td>
            <td>${formatMoney(r.room)}</td>
            <td>${formatMoney(r.fnb)}</td>
            <td><span style="color: var(--danger); font-size: 12px;">-${formatMoney(r.voucher)}</span></td>
            <td><strong style="color: var(--primary); font-size: 14.5px;">${formatMoney(r.net)}</strong></td>
        </tr>
    `).join('');
}

// BỘ LỌC THỜI GIAN
function setupRangeFilter() {
    const chips = document.querySelectorAll("#analyticsRangeChips .tab-filter-chip");
    chips.forEach(chip => {
        chip.addEventListener("click", () => {
            chips.forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
            loadAnalyticsData(chip.dataset.range);
        });
    });
}

// XUẤT CSV
function setupExportCsv() {
    document.getElementById("btnExportAnalyticsCsv")?.addEventListener("click", () => {
        let csv = "\uFEFFNgày,Số Đơn Hoàn Tất,Doanh Thu Phòng,Doanh Thu F&B,Giảm Giá Voucher,Thực Thu\n";
        csv += "09/11/2026,21,4600000,2250000,310000,6540000\n";
        csv += "08/11/2026,18,4400000,2180000,220000,6360000\n";
        csv += "07/11/2026,19,4350000,2050000,260000,6140000\n";
        csv += "06/11/2026,16,3950000,1880000,180000,5650000\n";

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `Bao_Cao_Doanh_Thu_ChillFlix_${Date.now()}.csv`;
        a.click();
    });
}

function initClock() {
    const clockEl = document.getElementById("adminLiveClock");
    if (!clockEl) return;
    const update = () => {
        const now = new Date();
        clockEl.textContent = `🕒 ${now.toLocaleTimeString('vi-VN')} · ${now.toLocaleDateString('vi-VN')}`;
    };
    update();
    setInterval(update, 1000);
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = val;
}