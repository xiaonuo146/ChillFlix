/* ==========================================================================
   CHILLFLIX - BƯỚC 1: CHỌN PHIM & PHÒNG CHIẾU (CHUẨN HOẠT ĐỘNG 100%)
   ========================================================================== */

import { getMovieDetails } from "../api.js";
import { CONFIG } from "../config.js";

// Bảng giá phòng niêm yết
const ROOM_MAP = {
    couple_a: { name: "Nest Couple A", price: 120000, category: "couple", max: 2 },
    couple_b: { name: "Nest Couple B", price: 120000, category: "couple", max: 2 },
    group4:   { name: "Nhóm 4 Sao Hỏa", price: 180000, category: "group4", max: 6 },
    vip:      { name: "Nhóm 10 Hành Tinh", price: 350000, category: "vip", max: 12 }
};

// Đọc tham số URL
const savedBooking = JSON.parse(sessionStorage.getItem("chillflixBooking") || "{}");
const urlParams = new URLSearchParams(window.location.search);
const paramMovieId = urlParams.get("movieId") || urlParams.get("id") || savedBooking.movieId || savedBooking.tmdbMovieId || "693134";
const paramDate = urlParams.get("date");
const paramTime = urlParams.get("time") || "18:30";
const paramRoom = urlParams.get("roomType") || "couple_a";

let currentMovie = null;
let selectedDate = paramDate || new Date().toISOString().split('T')[0];
let selectedRoomId = ROOM_MAP[paramRoom] ? paramRoom : "couple_a";
let selectedTime = paramTime;
let baseDuration = 2.0; // Giờ chuẩn theo phim
let extraDuration = 0;   // Giờ chọn thêm (0, 0.5, 1.0)
let guestCount = 2;

document.addEventListener("DOMContentLoaded", async () => {
    try {
        // 1. Tải thông tin phim thật
        await loadMovieData(paramMovieId);

        // 2. Sinh danh sách ngày cuộn ngang
        renderDateTrack();

        // 3. Đổ danh sách giờ vào Dropdown
        renderTimeSelect();

        // 4. Kích hoạt chọn phòng & số người
        setupRoomSelection();
        setupGuestStepper();
        setupDurationPills();

        // 5. Cập nhật bảng tính tiền & Tóm tắt bên phải
        updateSummary();

        // 6. Gắn sự kiện nút Tiếp tục
        setupProceedButton();

    } catch (err) {
        console.error("Lỗi khởi tạo booking.js:", err);
    }
});

// 1. TẢI VÀ HIỂN THỊ PHIM
async function loadMovieData(movieId) {
    try {
        currentMovie = await getMovieDetails(movieId);
    } catch (e) {
        currentMovie = {
            id: 693134,
            title: "Dune: Hành Tinh Cát 2",
            poster_path: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
            runtime: 166,
            vote_average: 8.8
        };
    }

    if (!currentMovie) return;

    // Tính thời lượng
    const runtimeMins = Number(currentMovie.runtime) || 120;
    baseDuration = Math.max(2.0, Math.ceil((runtimeMins + 15) / 30) * 0.5);

    // Điền lên giao diện
    setText("chosenMovieTitle", currentMovie.title);
    setText("sideMovieTitle", currentMovie.title);
    setText("chosenMovieRuntime", `${runtimeMins} phút`);
    setText("chosenMovieHours", `~${(runtimeMins / 60).toFixed(1)} giờ`);
    setText("chosenMovieRating", `★ ${Number(currentMovie.vote_average || 8.5).toFixed(1)} / 10`);
    setText("sideMovieSub", `⏱ ${runtimeMins} phút · Chuẩn 4K Dolby Atmos`);

    const posterUrl = currentMovie.poster_path 
        ? `${CONFIG.TMDB_IMAGE_BASE}${currentMovie.poster_path}`
        : 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=300';
    
    const posterImg = document.getElementById("chosenMoviePoster");
    if (posterImg) posterImg.src = posterUrl;
}

// 2. SINH THANH NGÀY CUỘN NGANG (7 NGÀY TỚI)
function renderDateTrack() {
    const track = document.getElementById("dynamicDateTrack");
    if (!track) return;
    track.innerHTML = "";

    const daysOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(today.getDate() + i);

        const isoDate = d.toISOString().split('T')[0];
        const dayNum = d.getDate();
        const monthNum = d.getMonth() + 1;
        const dayName = i === 0 ? "HÔM NAY" : daysOfWeek[d.getDay()];

        const card = document.createElement("div");
        card.className = `date-tab-card ${isoDate === selectedDate ? 'active' : ''}`;
        card.dataset.date = isoDate;
        card.innerHTML = `
            <span class="day-prefix">${dayName}</span>
            <span class="day-number">${dayNum}</span>
            <span class="day-weekday">Tháng ${monthNum}</span>
        `;

        card.addEventListener("click", () => {
            track.querySelectorAll(".date-tab-card").forEach(c => c.classList.remove("active"));
            card.classList.add("active");
            selectedDate = isoDate;
            updateSummary();
        });

        track.appendChild(card);
    }
}

// 3. ĐỔ DANH SÁCH GIỜ TỪ 09:00 ĐẾN 22:30
function renderTimeSelect() {
    const select = document.getElementById("bookingTimeSelect");
    if (!select) return;
    select.innerHTML = "";

    const timeSlots = [
        "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
        "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
        "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
        "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"
    ];

    timeSlots.forEach(t => {
        const opt = document.createElement("option");
        opt.value = t;
        opt.textContent = `${t} ${t === "18:30" ? "🔥 (Giờ Hot Buổi Tối)" : ""}`;
        if (t === selectedTime) opt.selected = true;
        select.appendChild(opt);
    });

    select.addEventListener("change", (e) => {
        selectedTime = e.target.value;
        updateSummary();
    });
}

// 4. CHỌN PHÒNG & THỜI LƯỢNG
function setupRoomSelection() {
    const roomCards = document.querySelectorAll(".rich-room-card");
    roomCards.forEach(card => {
        const rId = card.dataset.roomId;
        if (rId === selectedRoomId) card.classList.add("active");
        else card.classList.remove("active");

        card.addEventListener("click", () => {
            roomCards.forEach(c => c.classList.remove("active"));
            card.classList.add("active");
            selectedRoomId = rId;
            updateSummary();
        });
    });

    // Lọc loại phòng
    document.querySelectorAll(".category-chip").forEach(chip => {
        chip.addEventListener("click", () => {
            document.querySelectorAll(".category-chip").forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
            const filter = chip.dataset.filter;
            roomCards.forEach(card => {
                if (filter === "all" || card.dataset.category === filter) {
                    card.style.display = "flex";
                } else {
                    card.style.display = "none";
                }
            });
        });
    });
}

function setupDurationPills() {
    const pills = document.querySelectorAll(".duration-pill-btn");
    pills.forEach(pill => {
        pill.addEventListener("click", () => {
            pills.forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            extraDuration = Number(pill.dataset.extra) || 0;
            updateSummary();
        });
    });
}

function setupGuestStepper() {
    const display = document.getElementById("guestCountVal");
    document.getElementById("btnMinusGuests")?.addEventListener("click", () => {
        if (guestCount > 1) {
            guestCount--;
            if (display) display.textContent = guestCount;
        }
    });
    document.getElementById("btnPlusGuests")?.addEventListener("click", () => {
        if (guestCount < 12) {
            guestCount++;
            if (display) display.textContent = guestCount;
        }
    });
}

// 5. TÍNH TIỀN & CẬP NHẬT TÓM TẮT
function updateSummary() {
    const roomInfo = ROOM_MAP[selectedRoomId] || ROOM_MAP.couple_a;
    const totalDuration = baseDuration + extraDuration;
    const roomTotal = Math.round(roomInfo.price * totalDuration);

    // Tính mốc giờ xem & giờ dọn
    const [sH, sM] = selectedTime.split(":").map(Number);
    const endMinutes = sH * 60 + sM + Math.round(totalDuration * 60);
    const endH = Math.floor(endMinutes / 60) % 24;
    const endM = endMinutes % 60;
    const endTimeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    const cleanMinutes = endMinutes + 15;
    const cleanH = Math.floor(cleanMinutes / 60) % 24;
    const cleanM = cleanMinutes % 60;
    const cleanTimeStr = `${String(cleanH).padStart(2, '0')}:${String(cleanM).padStart(2, '0')}`;

    // Cập nhật giao diện
    setText("durationValueBadge", `${totalDuration.toFixed(1)} giờ`);
    setText("baseDurationPillText", `(${baseDuration.toFixed(1)} giờ)`);
    setText("bufferSlotRange", `${selectedTime} ➔ ${endTimeStr}`);
    setText("bufferCleanUntil", cleanTimeStr);

    setText("sideRoomName", roomInfo.name);
    setText("sideDate", selectedDate);
    setText("sideTimeSlot", `${selectedTime} ➔ ${endTimeStr}`);
    setText("sidePriceRate", `${new Intl.NumberFormat('vi-VN').format(roomInfo.price)}đ / giờ`);
    setText("sideDurationMult", `× ${totalDuration.toFixed(1)} giờ`);
    setText("sideRoomSubtotal", `${new Intl.NumberFormat('vi-VN').format(roomTotal)}đ`);
    setText("sideGrandTotal", `${new Intl.NumberFormat('vi-VN').format(roomTotal)}đ`);

    // Lưu tạm vào sessionStorage để Bước 2 & 3 sử dụng
    const bookingPayload = {
        movieId: currentMovie?.id || 693134,
        movieTitle: currentMovie?.title || "Dune: Hành Tinh Cát 2",
        posterPath: currentMovie?.poster_path || "",
        roomType: selectedRoomId,
        roomName: roomInfo.name,
        date: selectedDate,
        startTime: selectedTime,
        duration: totalDuration,
        roomTotal: roomTotal,
        grandTotal: roomTotal,
        foods: [],
        foodTotal: 0
    };
    sessionStorage.setItem("chillflixBooking", JSON.stringify(bookingPayload));
}

// 6. NÚT TIẾP TỤC CHỌN ĐỒ ĂN
function setupProceedButton() {
    const btn = document.getElementById("btnProceedToFnb");
    btn?.addEventListener("click", () => {
        window.location.href = "booking-food.html";
    });
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val ?? "--";
}