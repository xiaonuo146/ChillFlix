import { getMovieDetails } from "../api.js";
import { CONFIG } from "../config.js";

// ==========================================
// CẤU HÌNH 4 PHÒNG CHIẾU CHUẨN MOCKUP 1
// ==========================================
const ROOM_MAP = {
    couple_a: { name: "Nest Couple A", price: 120000, maxGuests: 2 },
    couple_b: { name: "Nest Couple B", price: 120000, maxGuests: 2 },
    group4:   { name: "Nhóm 4 Sao Hỏa", price: 180000, maxGuests: 6 },
    vip:      { name: "Nhóm 10 Hành Tinh", price: 350000, maxGuests: 12 }
};

let currentMovie = null;
let chosenDate = "";
let chosenRoomId = "couple_a";
let baseMovieDuration = 2.0; // Thời lượng chuẩn của phim
let extraDuration = 0;       // Thời gian khách chọn thêm (+0h, +0.5h, +1.0h)
let chosenDuration = 2.0;    // Tổng thời lượng = baseMovieDuration + extraDuration
let chosenTimeSlot = "15:00"; 
let guestCount = 2;

document.addEventListener("DOMContentLoaded", async () => {
    initHeaderControls();

    // 1. Đọc tham số URL từ trang trước
    const params = new URLSearchParams(window.location.search);
    const movieId = params.get("movieId") || params.get("id") || "693134";
    const dateParam = params.get("date");
    const roomParam = params.get("roomType");
    const timeParam = params.get("time");

    if (roomParam) {
        if (roomParam === "couple") chosenRoomId = "couple_a";
        else if (ROOM_MAP[roomParam]) chosenRoomId = roomParam;
    }
    if (timeParam) chosenTimeSlot = timeParam;

    // 2. Khởi tạo ngày chiếu động
    initDateTrack(dateParam);

    // 3. Tải thông tin phim TMDB & Tự động tính thời lượng chuẩn
    await fetchMovieBanner(movieId);

    // 4. Khởi tạo các sự kiện
    initGuestStepper();
    initRoomCards();
    initDurationControls(); // ĐÃ FIX: Bắt đúng class .duration-pill-btn
    renderTimeSlots();
    updateLiveSummary();

    // 5. Nút bấm chuyển bước
    document.getElementById("btnProceedToFnb")?.addEventListener("click", () => saveAndNavigate("booking-food.html"));
    document.getElementById("btnSkipToPayment")?.addEventListener("click", (e) => {
        e.preventDefault();
        saveAndNavigate("booking-payment.html");
    });
});

// ==========================================
// TẢI PHIM & TỰ ĐỘNG ĐỒNG BỘ THỜI LƯỢNG CHUẨN XÁC
// ==========================================
async function fetchMovieBanner(movieId) {
    try {
        currentMovie = await getMovieDetails(movieId);

        document.getElementById("chosenMovieTitle").textContent = currentMovie.title || "Phim chiếu rạp";
        document.getElementById("sideMovieTitle").textContent = currentMovie.title || "Phim chiếu rạp";
        document.getElementById("chosenMovieRating").textContent = `★ ${currentMovie.vote_average ? currentMovie.vote_average.toFixed(1) : '8.8'} / 10`;
        document.getElementById("chosenMovieYear").textContent = (currentMovie.release_date || '2026').slice(0, 4);

        const runtime = Number(currentMovie.runtime) || 110;
        const hours = (runtime / 60).toFixed(1);
        document.getElementById("chosenMovieRuntime").textContent = `${runtime} phút`;
        document.getElementById("chosenMovieHours").textContent = `~${hours} giờ`;
        document.getElementById("sideMovieSub").textContent = `⏱ ${runtime} phút · Phụ đề Tiếng Việt`;

        if (currentMovie.poster_path) {
            document.getElementById("chosenMoviePoster").src = `${CONFIG.TMDB_IMAGE_BASE}${currentMovie.poster_path}`;
        }

        // TÍNH TOÁN THỜI LƯỢNG CHUẨN THEO ĐỘ DÀI PHIM
        calculateDurationByMovie(runtime);

    } catch (err) {
        console.warn("Dùng dữ liệu fallback:", err);
        calculateDurationByMovie(110);
    }
}

// ==========================================
// TÍNH THỜI LƯỢNG TỰ ĐỘNG KHỚP 100% VỚI PHIM
// ==========================================
function calculateDurationByMovie(runtimeMinutes) {
    const mins = Number(runtimeMinutes) || 110;
    
    // Quy tắc rạp: Làm tròn lên mốc 30 phút gần nhất (tối thiểu 2.0 giờ)
    // Ví dụ: 208 phút -> làm tròn thành 3.5 giờ!
    const roundedHours = Math.ceil(mins / 30) * 0.5;
    baseMovieDuration = Math.max(2.0, roundedHours);
    
    // Tổng thời lượng = Suất chuẩn của phim + Thời gian khách chọn thêm
    chosenDuration = baseMovieDuration + extraDuration;

    // 1. Cập nhật dòng giải thích
    const explainEl = document.getElementById("autoDurationExplain");
    if (explainEl) {
        explainEl.textContent = `Phim dài ${mins} phút ➔ Quán xếp suất chiếu chuẩn ${baseMovieDuration.toFixed(1)} giờ (Đủ xem trọn vẹn).`;
    }

    // 2. Cập nhật huy hiệu góc phải (ĐÃ FIX: Bắt đúng ID durationValueBadge)
    const badgeEl = document.getElementById("durationValueBadge");
    if (badgeEl) {
        badgeEl.textContent = `${chosenDuration.toFixed(1)} giờ`;
    }

    // 3. Cập nhật text trong nút Vừa vặn phim đầu tiên
    const pillSubText = document.getElementById("baseDurationPillText");
    if (pillSubText) {
        pillSubText.textContent = `(${baseMovieDuration.toFixed(1)} giờ)`;
    }

    updateBufferTimes();
    updateLiveSummary();
}

// ==========================================
// ĐIỀU KHIỂN CÁC NÚT DÀN NGANG THỜI LƯỢNG (ĐÃ FIX SELECTOR)
// ==========================================
function initDurationControls() {
    // ĐÃ FIX: Tìm đúng class .duration-pill-btn trong #extraDurationContainer
    const pills = document.querySelectorAll("#extraDurationContainer .duration-pill-btn");
    const badgeEl = document.getElementById("durationValueBadge");

    pills.forEach(pill => {
        pill.addEventListener("click", () => {
            // Đổi active màu vàng cho nút được bấm
            pills.forEach(p => p.classList.remove("active"));
            pill.classList.add("active");

            // Lấy số giờ thêm: 0, 0.5 hoặc 1.0
            extraDuration = parseFloat(pill.dataset.extra) || 0;
            chosenDuration = baseMovieDuration + extraDuration;

            // Cập nhật huy hiệu góc phải nhảy số ngay lập tức
            if (badgeEl) {
                badgeEl.textContent = `${chosenDuration.toFixed(1)} giờ`;
            }

            // Tính toán lại giờ kết thúc và cập nhật tiền
            updateBufferTimes();
            updateLiveSummary();
        });
    });

    // Khi khách đổi giờ nhận phòng trên dropdown
    const timeSelect = document.getElementById("bookingTimeSelect");
    timeSelect?.addEventListener("change", (e) => {
        chosenTimeSlot = e.target.value;
        updateBufferTimes();
        updateLiveSummary();
    });
}

// ==========================================
// ĐỔ DỮ LIỆU VÀO DROPDOWN GIỜ
// ==========================================
function renderTimeSlots() {
    const timeSelect = document.getElementById("bookingTimeSelect");
    if (!timeSelect) return;
    timeSelect.innerHTML = "";

    const todayISO = getISODate(new Date());
    const isToday = chosenDate === todayISO;
    const now = new Date();
    const curHour = now.getHours();
    const curMin = now.getMinutes();

    let defaultSet = false;

    for (let h = 9; h <= 22; h++) {
        for (let m = 0; m < 60; m += 30) {
            const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            const isPast = isToday && (h < curHour || (h === curHour && m <= curMin));

            if (isPast) continue;

            const opt = document.createElement("option");
            opt.value = timeStr;
            const session = h >= 18 ? 'Tối (Giờ Hot)' : (h >= 12 ? 'Chiều' : 'Sáng');
            opt.textContent = `${timeStr} · ${session}`;

            if (!defaultSet) {
                if (!chosenTimeSlot || chosenTimeSlot === timeStr) {
                    opt.selected = true;
                    chosenTimeSlot = timeStr;
                    defaultSet = true;
                }
            } else if (chosenTimeSlot === timeStr) {
                opt.selected = true;
            }

            timeSelect.appendChild(opt);
        }
    }

    if (timeSelect.children.length === 0) {
        const opt = document.createElement("option");
        opt.value = "";
        opt.textContent = "Hôm nay đã hết khung giờ (Vui lòng chọn ngày mai)";
        timeSelect.appendChild(opt);
        chosenTimeSlot = null;
    }

    updateBufferTimes();
    updateLiveSummary();
}

// ==========================================
// CẬP NHẬT THANH ĐỆM 15 PHÚT DỌN PHÒNG
// ==========================================
function updateBufferTimes() {
    if (!chosenTimeSlot) return;

    const [startH, startM] = chosenTimeSlot.split(":").map(Number);
    const durationMins = Math.round(chosenDuration * 60);

    const startTotal = startH * 60 + startM;
    const endTotal = startTotal + durationMins;
    const bufferCleanTotal = endTotal + 15; // + 15 phút đệm dọn phòng

    const formatHourMin = (totalMins) => {
        const h = Math.floor(totalMins / 60) % 24;
        const m = totalMins % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    const endStr = formatHourMin(endTotal);
    const cleanStr = formatHourMin(bufferCleanTotal);

    const slotRangeEl = document.getElementById("bufferSlotRange");
    const cleanUntilEl = document.getElementById("bufferCleanUntil");

    if (slotRangeEl) slotRangeEl.textContent = `${chosenTimeSlot} ➔ ${endStr}`;
    if (cleanUntilEl) cleanUntilEl.textContent = cleanStr;
}

// ==========================================
// CẬP NHẬT BẢNG TÓM TẮT THỜI GIAN THỰC
// ==========================================
function updateLiveSummary() {
    const room = ROOM_MAP[chosenRoomId] || ROOM_MAP.couple_a;
    const subtotal = room.price * chosenDuration;

    document.getElementById("sideRoomName").textContent = room.name;
    document.getElementById("sideDate").textContent = chosenDate || "--";

    // Tính toán giờ kết thúc chính xác
    if (chosenTimeSlot) {
        const [startH, startM] = chosenTimeSlot.split(":").map(Number);
        const durationMins = Math.round(chosenDuration * 60);
        const endTotalMins = startH * 60 + startM + durationMins;
        
        const endH = String(Math.floor(endTotalMins / 60) % 24).padStart(2, '0');
        const endM = String(endTotalMins % 60).padStart(2, '0');
        const endTimeStr = `${endH}:${endM}`;

        document.getElementById("sideTimeSlot").textContent = `${chosenTimeSlot} ➔ ${endTimeStr} (${chosenDuration.toFixed(1)}h)`;
    } else {
        document.getElementById("sideTimeSlot").textContent = "Chưa chọn giờ";
    }

    document.getElementById("sidePriceRate").textContent = `${new Intl.NumberFormat('vi-VN').format(room.price)}đ / giờ`;
    document.getElementById("sideDurationMult").textContent = `× ${chosenDuration.toFixed(1)} giờ`;
    document.getElementById("sideRoomSubtotal").textContent = `${new Intl.NumberFormat('vi-VN').format(subtotal)}đ`;
    document.getElementById("sideGrandTotal").textContent = `${new Intl.NumberFormat('vi-VN').format(subtotal)}đ`;

    const btnSubmit = document.getElementById("btnProceedToFnb");
    if (btnSubmit) btnSubmit.disabled = !chosenTimeSlot || !chosenDate;
}

// ==========================================
// KHỞI TẠO THANH THẺ NGÀY CUỘN NGANG ĐỘNG
// ==========================================
function initDateTrack(initialDate) {
    const track = document.getElementById("dynamicDateTrack");
    const nativePicker = document.getElementById("hiddenDateNative");
    const expandBtn = document.getElementById("btnOpenCalendarModal");

    const today = new Date();
    const todayISO = getISODate(today);
    chosenDate = (initialDate && initialDate >= todayISO) ? initialDate : todayISO;

    const weekdays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    let html = "";

    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(today.getDate() + i);
        const iso = getISODate(d);
        const dayNum = String(d.getDate()).padStart(2, '0');
        const monthNum = String(d.getMonth() + 1).padStart(2, '0');
        const wDay = weekdays[d.getDay()];

        let prefix = wDay;
        if (i === 0) prefix = "HÔM NAY";
        else if (i === 1) prefix = "NGÀY MAI";
        else if (d.getDay() === 5 || d.getDay() === 6) prefix = "CUỐI TUẦN";

        const isActive = iso === chosenDate ? "active" : "";

        html += `
            <div class="date-tab-card ${isActive}" data-iso="${iso}">
                <span class="day-prefix">${prefix}</span>
                <span class="day-number">${dayNum}</span>
                <span class="day-weekday">${wDay} · Th${monthNum}</span>
            </div>
        `;
    }
    track.innerHTML = html;

    track.querySelectorAll(".date-tab-card").forEach(card => {
        card.addEventListener("click", () => {
            track.querySelectorAll(".date-tab-card").forEach(c => c.classList.remove("active"));
            card.classList.add("active");
            chosenDate = card.dataset.iso;
            renderTimeSlots();
            updateLiveSummary();
        });
    });

    if (expandBtn && nativePicker) {
        nativePicker.min = todayISO;
        expandBtn.addEventListener("click", () => {
            nativePicker.showPicker ? nativePicker.showPicker() : nativePicker.click();
        });
        nativePicker.addEventListener("change", (e) => {
            chosenDate = e.target.value;
            track.querySelectorAll(".date-tab-card").forEach(c => c.classList.remove("active"));
            renderTimeSlots();
            updateLiveSummary();
        });
    }
}

// ==========================================
// BỘ CHỌN KHÁCH & LỌC PHÒNG
// ==========================================
function initGuestStepper() {
    const valDisplay = document.getElementById("guestCountVal");
    const hintEl = document.getElementById("guestFitHint");

    const updateHints = () => {
        valDisplay.textContent = guestCount;
        if (guestCount <= 2) {
            hintEl.textContent = "Phù hợp nhất: Phòng Couple (1-2 người)";
        } else if (guestCount <= 6) {
            hintEl.textContent = "Phù hợp nhất: Phòng Nhóm 4 Sao Hỏa (3-6 người)";
        } else {
            hintEl.textContent = "Phù hợp nhất: VIP Lounge (8-12 người)";
        }
    };

    document.getElementById("btnMinusGuests")?.addEventListener("click", () => {
        if (guestCount > 1) { guestCount--; updateHints(); }
    });
    document.getElementById("btnPlusGuests")?.addEventListener("click", () => {
        if (guestCount < 12) { guestCount++; updateHints(); }
    });

    const chips = document.querySelectorAll("#roomCategoryChips .category-chip");
    chips.forEach(chip => {
        chip.addEventListener("click", () => {
            chips.forEach(c => c.classList.remove("active"));
            chip.classList.add("active");

            const filter = chip.dataset.filter;
            document.querySelectorAll("#roomsListGrid .rich-room-card").forEach(roomCard => {
                const cat = roomCard.dataset.category;
                if (filter === "all" || cat === filter) {
                    roomCard.style.display = "flex";
                } else {
                    roomCard.style.display = "none";
                }
            });
        });
    });
}

// ==========================================
// CHỌN PHÒNG CHIẾU CÓ ẢNH
// ==========================================
function initRoomCards() {
    const cards = document.querySelectorAll("#roomsListGrid .rich-room-card");
    cards.forEach(card => {
        if (card.dataset.roomId === chosenRoomId) card.classList.add("active");
        else card.classList.remove("active");

        card.addEventListener("click", () => {
            cards.forEach(c => c.classList.remove("active"));
            card.classList.add("active");
            chosenRoomId = card.dataset.roomId;
            updateLiveSummary();
        });
    });
}

// ==========================================
// LƯU SESSIONSTORAGE VÀ CHUYỂN BƯỚC
// ==========================================
function saveAndNavigate(targetUrl) {
    if (!chosenTimeSlot || !chosenDate) {
        alert("Vui lòng chọn khung giờ chiếu trước khi tiếp tục!");
        return;
    }

    const room = ROOM_MAP[chosenRoomId] || ROOM_MAP.couple_a;
    const roomAmount = room.price * chosenDuration;

    const payload = {
        movieId: currentMovie ? currentMovie.id : 693134,
        movieTitle: currentMovie ? currentMovie.title : "Phim chiếu rạp",
        date: chosenDate,
        roomType: chosenRoomId,
        roomName: room.name,
        startTime: chosenTimeSlot,
        duration: chosenDuration,
        roomTotal: roomAmount,
        foods: [],
        foodTotal: 0,
        grandTotal: roomAmount
    };

    sessionStorage.setItem("chillflixBooking", JSON.stringify(payload));
    window.location.href = targetUrl;
}

function getISODate(d) {
    return [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, '0'),
        String(d.getDate()).padStart(2, '0')
    ].join('-');
}

function initHeaderControls() {
    const themeBtn = document.getElementById("themeToggle");
    const themeIcon = document.getElementById("themeIcon");
    themeBtn?.addEventListener("click", () => {
        const cur = document.documentElement.getAttribute("data-theme");
        const next = cur === "light" ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", next);
        if (themeIcon) themeIcon.textContent = next === "light" ? "☀️" : "🌙";
        localStorage.setItem("chillflix-theme", next);
    });

    const userBtn = document.getElementById("userMenuBtn");
    const userDropdown = document.getElementById("userDropdown");
    userBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle("show");
    });
    document.addEventListener("click", () => userDropdown?.classList.remove("show"));
}