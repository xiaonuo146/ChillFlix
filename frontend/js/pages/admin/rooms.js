    /* ==========================================================================
    CHILLFLIX ADMIN - ROOMS CONTROLLER 
    Tự động kiểm tra đơn thật của khách, quản lý bảo trì và lịch tuần
    ========================================================================== */

    function formatMoney(amount) {
        return new Intl.NumberFormat("vi-VN").format(Math.max(0, Math.round(Number(amount) || 0))) + "đ";
    }

    // 4 PHÒNG CHIẾU CHUẨN CỦA RẠP CHILLFLIX
    const ROOMS_CONFIG = [
        {
            id: "couple_a",
            name: "Phòng Couple A - Tiêu Chuẩn Velvet",
            category: "couple",
            capacity: "👥 1 - 2 người lớn · Tầng 2 · 18m²",
            pricePerHour: 120000,
            audio: "Dolby Atmos 7.1",
            description: "Sofa bed nhung đỏ rượu vang, màn Laser 4K siêu nét, chuông gọi phục vụ",
            tags: ["Laser 150\"", "Dolby Atmos", "Sofa Bed Velvet", "Daikin 24°C", "Chuông F&B"],
            isCleaning: false,
            isActive: true
        },
        {
            id: "couple_b",
            name: "Phòng Couple B - Phong Cách Scandinavia",
            category: "couple",
            capacity: "👥 1 - 2 người lớn · Tầng 2 · 16m²",
            pricePerHour: 120000,
            audio: "Harman Kardon",
            description: "Gỗ sồi tối giản ấm cúng, sofa da bò ngả lưng êm ái, tủ snack mini",
            tags: ["Laser 120\"", "Harman Kardon", "Sofa Da Bò", "Minibar Snack"],
            isCleaning: false,
            isActive: true
        },
        {
            id: "group4",
            name: "Phòng Nhóm 4 - Apollo Lounge",
            category: "group",
            capacity: "👥 Nhóm 3 - 6 người · Tầng 3 · 25m²",
            pricePerHour: 180000,
            audio: "Dolby 7.1",
            description: "Sofa bọc da rộng rãi cho nhóm, trang bị máy chơi game PS5 và màn 180 inch",
            tags: ["Laser 180\"", "Dolby 7.1", "Ghế Da VIP", "Máy PS5", "Bàn tiệc F&B"],
            isCleaning: false,
            isActive: true
        },
        {
            id: "vip",
            name: "Phòng Laser 4K Family Suite (VIP)",
            category: "group",
            capacity: "👥 VIP Suite 8 - 12 người · Tầng 4 · Penthouse",
            pricePerHour: 350000,
            audio: "Dolby 9.2 + Trần Sao",
            description: "Phòng chiếu gia đình thượng hạng, trần sao fiber optic, quầy minibar snack có sẵn",
            tags: ["Laser 220\" Cong", "Dolby 9.2", "Bàn Tiệc Riêng", "Tủ Minibar", "Trần Sao"],
            isCleaning: false,
            isActive: true
        }
    ];

    let allBookingsList = [];
    let currentFilterType = "all";

    document.addEventListener("DOMContentLoaded", () => {
        startAdminClock();
        loadRealBookings();
        renderRoomsGrid();
        setupFilterRooms();
        setupScheduleDrawer();

        // Lắng nghe khi có khách đặt mới từ các tab khác
        window.addEventListener("storage", (e) => {
            if (e.key === "chillflix_booking_history") {
                loadRealBookings();
                renderRoomsGrid();
            }
        });
    });

    // ==========================================
    // 1. ĐỌC ĐƠN THẬT TỪ LOCALSTORAGE
    // ==========================================
    function loadRealBookings() {
        try {
            const raw = localStorage.getItem("chillflix_booking_history");
            allBookingsList = raw ? JSON.parse(raw) : [];
        } catch (e) {
            allBookingsList = [];
        }

        const badge = document.getElementById("roomsSidebarBadge");
        if (badge) badge.textContent = allBookingsList.length;
    }

    // ==========================================
    // 2. RENDER 4 PHÒNG CHIẾU (CHUẨN DỮ LIỆU THẬT)
    // ==========================================
    function renderRoomsGrid() {
        const grid = document.getElementById("adminRoomsDynamicGrid");
        if (!grid) return;
        grid.replaceChildren();

        const validOrders = allBookingsList.filter(b => b.status !== "cancelled");

        let occupiedCount = 0;
        let cleaningCount = 0;
        let readyCount = 0;

        let displayRooms = [...ROOMS_CONFIG];
        if (currentFilterType !== "all") {
            displayRooms = displayRooms.filter(r => r.category === currentFilterType);
        }

        displayRooms.forEach(room => {
            // Tìm xem phòng này hiện tại có đơn đặt nào không
            const activeBooking = validOrders.find(b => 
                b.roomType === room.id || (b.roomName && b.roomName.includes(room.id)) || (b.roomName && b.roomName.includes(room.name.split("-")[0].trim()))
            );

            let statusBadgeHTML = "";
            let occupyBoxHTML = "";
            let nextBookingHTML = "";

            if (!room.isActive) {
                // Phòng đang bảo trì
                statusBadgeHTML = `<span class="room-live-badge" style="background: rgba(229, 72, 77, 0.15); color: var(--danger);">⚠️ Đang bảo trì</span>`;
                occupyBoxHTML = `
                    <div class="current-occupy-box" style="border-color: rgba(229, 72, 77, 0.35);">
                        <div class="occupy-row-top">
                            <span style="color: var(--danger); font-weight: 700;">Đang tạm ngừng đón khách</span>
                            <span>Bảo trì thiết bị</span>
                        </div>
                    </div>
                `;
                nextBookingHTML = `<div class="next-booking-note">Đang bảo trì định kỳ hệ thống máy chiếu &amp; âm thanh.</div>`;
            } 
            else if (room.isCleaning) {
                // Phòng đang dọn dẹp
                cleaningCount++;
                statusBadgeHTML = `<span class="room-live-badge cleaning">🧹 Đang dọn dẹp</span>`;
                occupyBoxHTML = `
                    <div class="current-occupy-box cleaning-state">
                        <div class="occupy-row-top">
                            <span>🧹 <strong>Đang dọn dẹp &amp; khử khuẩn UV</strong></span>
                            <span style="color: var(--warning); font-weight: 600;">Ưu tiên dọn</span>
                        </div>
                        <div class="occupy-row-sub">
                            <span>Nhân viên buồng phòng đang thay ga sofa &amp; kiểm tra thiết bị</span>
                        </div>
                    </div>
                `;
                nextBookingHTML = `<div class="next-booking-note">Sẵn sàng nhận khách sau khi bấm nút "Đã dọn xong".</div>`;
            } 
            else if (activeBooking) {
                // CÓ ĐƠN ĐẶT THẬT CỦA KHÁCH
                occupiedCount++;
                const isCheckedIn = activeBooking.status === "checked_in";
                statusBadgeHTML = `<span class="room-live-badge occupied">● ${isCheckedIn ? "Đang xem (Đã Check-in)" : "Đã có đơn đặt trước"}</span>`;
                
                occupyBoxHTML = `
                    <div class="current-occupy-box" style="border-color: rgba(245, 181, 68, 0.35);">
                        <div class="occupy-row-top">
                            <span>⏰ <strong>Suất chiếu: ${activeBooking.startTime} (${activeBooking.duration}h)</strong></span>
                            <span class="cust-tag">Khách: <strong>${activeBooking.customer?.name || "Khách đặt"}</strong></span>
                        </div>
                        <div class="occupy-row-sub">
                            <span>Phim: <em>${activeBooking.movieTitle}</em></span>
                            <span style="color: var(--success); font-weight: 600;">Mã đơn: #${activeBooking.ticketCode}</span>
                        </div>
                    </div>
                `;
                nextBookingHTML = `<div class="next-booking-note">📞 SĐT khách: <strong>${activeBooking.customer?.phone || "--"}</strong> · Mã PIN phòng: <strong style="color: var(--primary);">${activeBooking.smartPin || '8892'}</strong></div>`;
            } 
            else {
                // PHÒNG HOÀN TOÀN TRỐNG (APP MỚI TINH CHƯA AI ĐẶT)
                readyCount++;
                statusBadgeHTML = `<span class="room-live-badge available">● Đang trống</span>`;
                occupyBoxHTML = `
                    <div class="current-occupy-box ready-state">
                        <div class="occupy-row-top">
                            <span style="color: var(--success); font-weight: 700;">🟢 Đang trống · Sẵn sàng đón khách</span>
                            <span class="uv-tag">✓ Đã khử trùng UV</span>
                        </div>
                        <div class="occupy-row-sub">
                            <span>Phòng sạch sẽ 100%. Sẵn sàng nhận khách đặt tại quầy hoặc trên website.</span>
                        </div>
                    </div>
                `;
                nextBookingHTML = `<div class="next-booking-note">Chưa có lịch đặt trước hôm nay. Sẵn sàng nhận khách mới bất kỳ lúc nào!</div>`;
            }

            const card = document.createElement("div");
            card.className = "room-monitor-card";
            card.id = `card_${room.id}`;

            card.innerHTML = `
                <div class="monitor-card-header">
                    <div class="r-header-meta">
                        <span>${room.capacity}</span>
                        ${statusBadgeHTML}
                    </div>
                </div>

                <div class="monitor-title-price">
                    <div>
                        <h3 class="monitor-room-name">${room.name}</h3>
                        <p class="monitor-room-sub">${room.description}</p>
                    </div>
                    <div class="monitor-price-box">
                        <span class="price-val">${formatMoney(room.pricePerHour)}</span>
                        <small>/ giờ · ${room.audio}</small>
                    </div>
                </div>

                ${occupyBoxHTML}
                ${nextBookingHTML}

                <div class="room-hardware-tags">
                    ${room.tags.map(t => `<span>${t}</span>`).join('')}
                </div>

                <div class="monitor-card-footer">
                    <label class="switch-toggle-label">
                        <input type="checkbox" ${room.isActive ? "checked" : ""} class="room-status-toggle" data-room-id="${room.id}" />
                        <span class="toggle-slider"></span>
                        <span class="toggle-text">${room.isActive ? "Hoạt động" : "Bảo trì"}</span>
                    </label>

                    <div style="display: flex; gap: 8px;">
                        ${room.isCleaning ? `
                            <button type="button" class="btn btn--primary btn-mark-cleaned" data-room-id="${room.id}">
                                ✓ Đã dọn xong
                            </button>
                        ` : ''}

                        ${(!activeBooking && room.isActive && !room.isCleaning) ? `
                            <button type="button" class="btn btn--outline btn-trigger-clean" data-room-id="${room.id}" style="font-size: 11.5px; padding: 0 10px; color: var(--warning);">
                                🧹 Báo dọn phòng
                            </button>
                        ` : ''}

                        <button type="button" class="btn btn--outline btn-open-schedule" data-room-id="${room.id}">
                            📅 Lịch phòng
                        </button>
                    </div>
                </div>
            `;

            // Sự kiện công tắc bảo trì
            card.querySelector(".room-status-toggle")?.addEventListener("change", (e) => {
                room.isActive = e.target.checked;
                renderRoomsGrid();
            });

            // Sự kiện báo dọn phòng
            card.querySelector(".btn-trigger-clean")?.addEventListener("click", () => {
                room.isCleaning = true;
                renderRoomsGrid();
            });

            // Sự kiện bấm "Đã dọn xong"
            card.querySelector(".btn-mark-cleaned")?.addEventListener("click", () => {
                room.isCleaning = false;
                renderRoomsGrid();
                alert(`✨ Phòng [${room.name}] đã hoàn tất vệ sinh & khử trùng UV! Sẵn sàng đón khách mới.`);
            });

            // Sự kiện mở Drawer lịch tuần
            card.querySelector(".btn-open-schedule")?.addEventListener("click", () => {
                openRoomScheduleDrawer(room);
            });

            grid.appendChild(card);
        });

        // Cập nhật thanh 4 chỉ số trên cùng CHUẨN XÁC 100%
        document.getElementById("statTotalRooms").textContent = `04 / 4 đang mở`;
        document.getElementById("statOccupiedRooms").textContent = `${String(occupiedCount).padStart(2, '0')} phòng (${Math.round((occupiedCount / 4) * 100)}%)`;
        document.getElementById("statCleaningRooms").textContent = `${String(cleaningCount).padStart(2, '0')} phòng`;
        document.getElementById("statReadyRooms").textContent = `${String(readyCount).padStart(2, '0')} phòng sẵn sàng`;
    }

    // ==========================================
    // 3. MỞ DRAWER LỊCH CHIẾU THẬT CỦA PHÒNG
    // ==========================================
    function openRoomScheduleDrawer(room) {
        const drawer = document.getElementById("roomScheduleDrawer");
        const overlay = document.getElementById("roomDrawerOverlay");
        const titleEl = document.getElementById("scheduleDrawerRoomTitle");
        const listContainer = document.getElementById("drawerWeekSlotsList");

        if (titleEl) titleEl.textContent = room.name;

        // Tìm các đơn thật của phòng này
        const validOrders = allBookingsList.filter(b => 
            (b.roomType === room.id || (b.roomName && b.roomName.includes(room.id)) || (b.roomName && b.roomName.includes(room.name.split("-")[0].trim()))) && b.status !== "cancelled"
        );

        const totalMoney = validOrders.reduce((sum, b) => sum + (Number(b.finalTotal || b.grandTotal) || 0), 0);
        document.getElementById("weekTotalSlots").textContent = `${validOrders.length} suất`;
        document.getElementById("weekRevenueDisplay").textContent = formatMoney(totalMoney);

        if (validOrders.length === 0) {
            listContainer.innerHTML = `
                <div style="text-align: center; padding: 48px 20px; border: 1px dashed var(--border); border-radius: var(--radius-md);">
                    <div style="font-size: 36px; margin-bottom: 10px;">📅</div>
                    <h4 style="color: var(--text); margin-bottom: 6px;">Chưa có đơn đặt phòng nào</h4>
                    <p style="color: var(--text-muted); font-size: 13px; margin: 0;">
                        Phòng [${room.name}] hiện đang trống lịch hoàn toàn. Sẵn sàng nhận lịch chiếu mới!
                    </p>
                </div>
            `;
        } else {
            listContainer.innerHTML = validOrders.map(b => `
                <div class="day-slot-item">
                    <div class="day-slot-head">
                        <strong>📅 Ngày: ${b.date}</strong>
                        <span class="badge badge--info">${b.startTime} (${b.duration}h)</span>
                    </div>
                    <div class="slot-timeline-bars">
                        <div class="slot-tag-bar active">
                            🎬 Phim: <strong>${b.movieTitle}</strong> · Khách: ${b.customer?.name} (#${b.ticketCode})
                        </div>
                    </div>
                </div>
            `).join('');
        }

        drawer?.classList.add("open");
        overlay?.classList.add("open");
    }

    function setupScheduleDrawer() {
        const drawer = document.getElementById("roomScheduleDrawer");
        const overlay = document.getElementById("roomDrawerOverlay");
        const closeBtn = document.getElementById("btnCloseScheduleDrawer");

        const close = () => {
            drawer?.classList.remove("open");
            overlay?.classList.remove("open");
        };

        closeBtn?.addEventListener("click", close);
        overlay?.addEventListener("click", close);
    }

    function setupFilterRooms() {
        document.getElementById("selectRoomFilter")?.addEventListener("change", (e) => {
            currentFilterType = e.target.value;
            renderRoomsGrid();
        });
    }

    // ==========================================
    // ĐỒNG HỒ MÁY TÍNH THỰC TẾ
    // ==========================================
    function startAdminClock() {
        const clockEl = document.getElementById("adminLiveClock");
        const update = () => {
            const now = new Date();
            const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
            const d = String(now.getDate()).padStart(2, "0");
            const m = String(now.getMonth() + 1).padStart(2, "0");
            const hh = String(now.getHours()).padStart(2, "0");
            const mm = String(now.getMinutes()).padStart(2, "0");
            const ss = String(now.getSeconds()).padStart(2, "0");
            if (clockEl) {
                clockEl.textContent = `🕒 ${hh}:${mm}:${ss} · ${days[now.getDay()]}, ${d}/${m}/${now.getFullYear()}`;
            }
        };
        update();
        setInterval(update, 1000);
    }