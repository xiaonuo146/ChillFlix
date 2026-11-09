import {
    getMovieDetails,
    getMovieCredits,
    getSimilarMovies,
    getMovieTrailer
} from "../api.js";
import { CONFIG } from "../config.js";

// ==========================================
// 1. DỮ LIỆU DIỄN VIÊN DỰ PHÒNG (KHI MẤT MẠNG)
// ==========================================
const MOCK_CAST = [
    { name: "Timothée Chalamet", character: "Paul Atreides", profile_path: "/BE2sdjpgsa2rNTFa66f7upkaOP.jpg" },
    { name: "Zendaya", character: "Chani", profile_path: "/3WdOloHpjtjL96uVOhFRRCcYSwq.jpg" },
    { name: "Rebecca Ferguson", character: "Lady Jessica", profile_path: "/6NRlV9oUipeakZ6qWZ2Ew8C43j6h.jpg" },
    { name: "Javier Bardem", character: "Stilgar", profile_path: "/oifhfVhUcuDjE61V5bS5dfShQrm.jpg" },
    { name: "Austin Butler", character: "Feyd-Rautha", profile_path: "/20bWpXg7rM6N80v4K5Gj1J0n0Wq.jpg" },
    { name: "Florence Pugh", character: "Công chúa Irulan", profile_path: "/7x7yQ3V1qJ5Gk2l5y2W0v8M3.jpg" },
    { name: "Josh Brolin", character: "Gurney Halleck", profile_path: "/nJdVf8V0oVq5M2k3l1P8v9N2.jpg" },
    { name: "Stellan Skarsgård", character: "Baron Harkonnen", profile_path: "/k7l8m9n0o1p2q3r4s5t6u7v8.jpg" }
];

// ==========================================
// 2. KHỞI CHẠY TRANG CHI TIẾT PHIM
// ==========================================
document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const movieId = params.get("id") || params.get("movieId") || "693134";

    // Khởi tạo Dark/Light mode và menu
    initHeaderEvents();

    try {
        // A. Tải thông tin chi tiết phim
        const movie = await getMovieDetails(movieId);
        renderMovieDetails(movie);

        // B. Tải Diễn viên & Đội ngũ sản xuất (Gọi 1 lần duy nhất)
        const credits = await getMovieCredits(movieId);
        const castList = (credits.cast && credits.cast.length > 0) ? credits.cast : MOCK_CAST;
        const crewList = credits.crew || [];

        renderCast(castList);
        renderCrewSpecs(crewList);

        // C. Tải phim tương tự đề xuất
        const similar = await getSimilarMovies(movieId);
        renderSimilar(similar);

        // D. Khởi tạo nút Trailer & Khối đặt phòng tinh gọn
        setupTrailer(movie.id);
        setupMiniBookingWidget(movie);

    } catch (error) {
        console.error("Lỗi khi tải chi tiết phim:", error);
    }
});

// ==========================================
// 3. RENDER THÔNG TIN PHIM & QUỐC GIA/ĐỘ TUỔI
// ==========================================
function renderMovieDetails(movie) {
    document.title = `${movie.title || "Chi Tiết Phim"} | ChillFlix`;

    document.getElementById("movieTitle").textContent = movie.title || "Chưa có tên";
    document.getElementById("movieOriginalTitle").textContent = movie.original_title ? `${movie.original_title} (${(movie.release_date || '2024').slice(0, 4)})` : "";
    document.getElementById("movieYear").textContent = (movie.release_date || "2024").slice(0, 4);
    
    const runtime = movie.runtime || 120;
    const hours = Math.floor(runtime / 60);
    const mins = runtime % 60;
    const runtimeText = `${runtime} phút (${hours}h ${mins}m)`;
    document.getElementById("movieRuntime").textContent = runtimeText;

    document.getElementById("movieRating").textContent = movie.vote_average ? movie.vote_average.toFixed(1) : "8.5";
    if (movie.vote_count) {
        document.getElementById("movieVoteCount").textContent = `/ 10 · ${new Intl.NumberFormat('vi-VN').format(movie.vote_count)} đánh giá TMDB`;
    }

    document.getElementById("movieOverview").textContent = movie.overview || "Đang cập nhật nội dung tóm tắt.";

    // Poster & Backdrop
    const posterUrl = movie.poster_path ? `${CONFIG.TMDB_IMAGE_BASE}${movie.poster_path}` : 'https://picsum.photos/300/450';
    document.getElementById("moviePoster").src = posterUrl;

    if (movie.backdrop_path) {
        document.getElementById("detailBackdrop").style.backgroundImage = `url('${CONFIG.TMDB_BACKDROP_BASE}${movie.backdrop_path}')`;
    }

    // Danh sách thể loại
    const genresContainer = document.getElementById("movieGenres");
    if (movie.genres && movie.genres.length > 0) {
        genresContainer.innerHTML = movie.genres.map(g => `<span class="genre-chip">${g.name || g}</span>`).join('');
    }

    // Bảng thông số kỹ thuật thật từ TMDB
    document.getElementById("specReleaseDate").textContent = movie.release_date || "Đang cập nhật";
    document.getElementById("specRuntime").textContent = runtimeText;

    // Quốc gia sản xuất thật
    if (movie.production_countries && movie.production_countries.length > 0) {
        document.getElementById("specCountries").textContent = movie.production_countries.map(c => c.name).join(', ');
    } else {
        document.getElementById("specCountries").textContent = "Hoa Kỳ, Quốc tế";
    }

    // Ngôn ngữ gốc thật
    if (movie.spoken_languages && movie.spoken_languages.length > 0) {
        document.getElementById("specLanguage").textContent = movie.spoken_languages.map(l => l.name || l.english_name).join(', ') + " · Phụ đề Tiếng Việt";
    }

    // Đánh giá độ tuổi tự động
    let ageRating = "T16 - Khán giả từ 16 tuổi trở lên";
    const genreNames = (movie.genres || []).map(g => (g.name || "").toLowerCase());
    if (movie.adult || genreNames.some(g => g.includes("kinh dị") || g.includes("horror"))) {
        ageRating = "T18 - Phim cấm khán giả dưới 18 tuổi";
    } else if (genreNames.some(g => g.includes("hoạt hình") || g.includes("gia đình"))) {
        ageRating = "P - Phim phổ biến rộng rãi mọi lứa tuổi";
    }
    document.getElementById("specAgeLimit").textContent = ageRating;
    document.getElementById("movieAgeLimit").textContent = ageRating.split(" ")[0];

    // Cột Đặc Quyền: Đổi văn phong theo đúng tên phim đang xem
    document.getElementById("miniBookingMovieName").textContent = movie.title || "Phim đã chọn";
    document.getElementById("perksMovieTitle").textContent = `Trải nghiệm xem ${movie.title} tại ChillFlix`;
    document.getElementById("perksMovieDesc").textContent = `Thưởng thức trọn vẹn từng khung hình sắc nét và âm thanh sống động của siêu phẩm "${movie.title}" trong không gian rạp riêng tư cách âm tuyệt đối, sofa da chỉnh điện ngả 180° cùng hệ thống điều hòa kháng khuẩn mát lạnh.`;
    document.getElementById("perksSoundDesc").textContent = `Tái hiện sống động từng chi tiết âm thanh chân thực nhất của bộ phim ${movie.title}`;
}

// ==========================================
// 4. RENDER ĐẠO DIỄN & BIÊN KỊCH THẬT TỪ CREW
// ==========================================
function renderCrewSpecs(crewList) {
    const director = crewList.find(p => p.job === "Director");
    if (director) {
        document.getElementById("specDirector").textContent = director.name;
        document.getElementById("movieDirector").textContent = `Đạo diễn: ${director.name}`;
    } else {
        document.getElementById("specDirector").textContent = "Đang cập nhật";
    }

    const writers = crewList.filter(p => p.job === "Screenplay" || p.job === "Writer");
    if (writers.length > 0) {
        document.getElementById("specWriter").textContent = writers.slice(0, 2).map(w => w.name).join(", ");
    } else {
        document.getElementById("specWriter").textContent = director ? director.name : "Đang cập nhật";
    }
}

// ==========================================
// 5. RENDER DIỄN VIÊN CHÍNH
// ==========================================
function renderCast(castList) {
    const container = document.getElementById("movieCast");
    const displayList = castList.slice(0, 8);

    container.innerHTML = displayList.map(actor => {
        const photo = actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : 'https://picsum.photos/100/100';
        return `
        <div class="cast-item">
            <img src="${photo}" alt="${actor.name}" class="cast-avatar" loading="lazy" />
            <div class="cast-name" title="${actor.name}">${actor.name}</div>
            <div class="cast-role" title="${actor.character || 'Diễn viên'}">${actor.character || 'Diễn viên'}</div>
        </div>
        `;
    }).join('');
}

// ==========================================
// 6. RENDER PHIM TƯƠNG TỰ (6 PHIM)
// ==========================================
function renderSimilar(movieList) {
    const container = document.getElementById("similarMovies");
    const displayList = (movieList || []).slice(0, 6);

    if (displayList.length === 0) {
        container.innerHTML = `<p style="color: var(--text-muted);">Đang cập nhật danh sách phim gợi ý.</p>`;
        return;
    }

    container.innerHTML = displayList.map(movie => {
        const posterUrl = movie.poster_path ? `${CONFIG.TMDB_IMAGE_BASE}${movie.poster_path}` : 'https://picsum.photos/200/300';
        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '8.0';
        const year = (movie.release_date || '2024').slice(0, 4);

        return `
        <div class="similar-card" data-id="${movie.id}">
            <img src="${posterUrl}" alt="${movie.title}" class="similar-poster" loading="lazy" />
            <div class="similar-body">
                <div class="similar-title" title="${movie.title}">${movie.title}</div>
                <div class="similar-meta">★ ${rating} · ${year}</div>
                <div class="similar-btn">Đặt phòng</div>
            </div>
        </div>
        `;
    }).join('');

    container.querySelectorAll('.similar-card').forEach(card => {
        card.addEventListener('click', () => {
            window.location.href = `movie-detail.html?id=${card.dataset.id}`;
        });
    });
}

// ==========================================
// 7. XỬ LÝ NÚT XEM TRAILER
// ==========================================
function setupTrailer(movieId) {
    const btn = document.getElementById("watchTrailer");
    btn.addEventListener("click", async () => {
        btn.textContent = "Đang tìm trailer...";
        const trailerUrl = await getMovieTrailer(movieId);
        btn.innerHTML = `<span>▶</span> Xem Trailer Chính Thức`;

        if (trailerUrl) {
            window.open(trailerUrl, "_blank", "noopener,noreferrer");
        } else {
            alert("Rất tiếc, trailer chính thức của phim này đang được cập nhật!");
        }
    });
}

// ==========================================
// 8. KHỐI ĐẶT PHÒNG NHANH TINH GỌN (CHỌN LỊCH & GIỜ TỰ DO)
// ==========================================
function setupMiniBookingWidget(movie) {
    const dateInput = document.getElementById("detailBookingDate");
    const timeSelect = document.getElementById("detailBookingTime");
    const roomSelect = document.getElementById("detailBookingRoom");
    const btnSearch = document.getElementById("btnMiniSearch");
    const btnBookThis = document.getElementById("btnBookThisMovie");

    // 1. Cài đặt ngày chiếu mặc định là hôm nay
    const today = new Date();
    const todayISO = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, '0'),
        String(today.getDate()).padStart(2, '0')
    ].join('-');

    if (dateInput) {
        dateInput.value = todayISO;
        dateInput.min = todayISO; // Không cho chọn ngày trong quá khứ
    }

    // 2. Tự động sinh danh sách giờ nhận phòng (09:00 - 22:30)
    function populateTimes() {
        if (!timeSelect) return;
        timeSelect.innerHTML = "";

        const selectedDate = dateInput ? dateInput.value : todayISO;
        const isToday = selectedDate === todayISO;
        const currentHour = today.getHours();
        const currentMin = today.getMinutes();

        for (let h = 9; h <= 22; h++) {
            for (let m = 0; m < 60; m += 30) {
                const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                
                // Nếu chọn ngày hôm nay, chỉ hiện các giờ trong tương lai
                if (isToday && (h < currentHour || (h === currentHour && m <= currentMin))) {
                    continue; 
                }

                const opt = document.createElement("option");
                opt.value = timeStr;
                opt.textContent = `${timeStr} (${h >= 18 ? 'Buổi tối' : (h >= 12 ? 'Buổi chiều' : 'Buổi sáng')})`;
                timeSelect.appendChild(opt);
            }
        }

        if (timeSelect.children.length === 0) {
            const opt = document.createElement("option");
            opt.value = "";
            opt.textContent = "Hôm nay đã hết khung giờ (Vui lòng chọn ngày mai)";
            timeSelect.appendChild(opt);
            if (btnSearch) btnSearch.disabled = true;
        } else {
            if (btnSearch) btnSearch.disabled = false;
        }
    }

    populateTimes();

    // Khi khách bấm chọn ngày khác trên lịch -> Cập nhật lại danh sách giờ
    if (dateInput) {
        dateInput.addEventListener("change", populateTimes);
    }

    // 3. Chuyển sang booking.html với đúng ngày giờ đã chọn
    const handleBookingRedirect = () => {
        const chosenDate = dateInput ? dateInput.value : todayISO;
        const chosenTime = timeSelect ? timeSelect.value : "19:00";
        const chosenRoom = roomSelect ? roomSelect.value : "couple";
        const durationHours = Math.ceil((movie.runtime || 120) / 60);

        if (!chosenTime) {
            alert("Vui lòng chọn khung giờ nhận phòng hợp lệ!");
            return;
        }

        const queryParams = new URLSearchParams({
            movieId: String(movie.id),
            date: chosenDate,
            time: chosenTime,
            roomType: chosenRoom,
            duration: String(durationHours)
        });

        window.location.href = `booking.html?${queryParams.toString()}`;
    };

    if (btnSearch) btnSearch.addEventListener("click", handleBookingRedirect);
    if (btnBookThis) btnBookThis.addEventListener("click", handleBookingRedirect);
}

// ==========================================
// 9. SỰ KIỆN GIAO DIỆN CHUNG HEADER
// ==========================================
function initHeaderEvents() {
    const themeBtn = document.getElementById("themeToggle");
    const themeIcon = document.getElementById("themeIcon");
    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            const current = document.documentElement.getAttribute("data-theme");
            const next = current === "light" ? "dark" : "light";
            document.documentElement.setAttribute("data-theme", next);
            if (themeIcon) themeIcon.textContent = next === "light" ? "☀️" : "🌙";
            localStorage.setItem("chillflix-theme", next);
        });
    }

    const userBtn = document.getElementById("userMenuBtn");
    const userDropdown = document.getElementById("userDropdown");
    if (userBtn && userDropdown) {
        userBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle("show");
        });
        document.addEventListener("click", () => userDropdown.classList.remove("show"));
    }

    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const drawerCloseBtn = document.getElementById("drawerCloseBtn");
    const mobileDrawer = document.getElementById("mobileDrawer");
    const drawerOverlay = document.getElementById("drawerOverlay");

    if (mobileMenuBtn && mobileDrawer) {
        mobileMenuBtn.addEventListener("click", () => {
            mobileDrawer.classList.add("open");
            drawerOverlay.classList.add("open");
        });
        const close = () => {
            mobileDrawer.classList.remove("open");
            drawerOverlay.classList.remove("open");
        };
        if (drawerCloseBtn) drawerCloseBtn.addEventListener("click", close);
        if (drawerOverlay) drawerOverlay.addEventListener("click", close);
    }
}