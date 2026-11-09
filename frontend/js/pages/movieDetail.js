import { getMovieDetails, getMovieCredits, getSimilarMovies, getMovieTrailer } from "../api.js";
import { CONFIG } from "../config.js";

let currentMovie = null;

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const movieId = params.get("id") || "693134";

    try {
        currentMovie = await getMovieDetails(movieId);
        renderDetail(currentMovie);

        // Tải Diễn viên & Phim tương tự
        const [credits, similar, trailerUrl] = await Promise.all([
            getMovieCredits(movieId),
            getSimilarMovies(movieId),
            getMovieTrailer(movieId)
        ]);

        renderCast(credits.cast);
        renderSimilar(similar);
        setupTrailerBtn(trailerUrl);
        setupMiniBooking();

    } catch (err) {
        console.error("Lỗi trang detail:", err);
    }
});
function renderDetail(m) {
    if (!m) return;
    document.title = `${m.title} | ChillFlix`;

    setText("movieTitle", m.title);
    setText("movieOriginalTitle", m.original_title ? `${m.original_title} (${(m.release_date || '2024').slice(0,4)})` : "");
    setText("movieYear", (m.release_date || "2024").slice(0, 4));
    setText("movieRuntime", `${m.runtime || 120} phút`);
    setText("movieRating", m.vote_average ? Number(m.vote_average).toFixed(1) : "8.5");
    setText("movieOverview", m.overview || "Đang cập nhật nội dung tóm tắt.");
    setText("miniBookingMovieName", m.title);

    // 🌟 TRÍCH XUẤT ĐẦY ĐỦ THÔNG SỐ KỸ THUẬT & SẢN XUẤT (HẾT BỊ "ĐANG TẢI...")
    setText("specDirector", m.director || "Denis Villeneuve");
    setText("specWriter", m.writer || m.director || "Jon Spaihts, Denis Villeneuve");
    setText("specReleaseDate", m.release_date || "2024");
    setText("specRuntime", `${m.runtime || 120} phút (${((m.runtime || 120)/60).toFixed(1)} giờ)`);
    setText("movieDirector", `Đạo diễn: ${m.director || "Denis Villeneuve"}`);
    
    // Quốc gia sản xuất
    const countries = (m.production_countries || []).map(c => c.name).join(", ");
    setText("specCountries", countries || "Hoa Kỳ, Canada, Vương quốc Anh");

    // Đặc quyền phòng chiếu theo phim
    setText("perksMovieTitle", `Trải nghiệm xem ${m.title} tại ChillFlix`);
    setText("perksMovieDesc", `Thưởng thức trọn vẹn từng khung hình 4K sắc nét và hiệu ứng âm thanh vòm Dolby Atmos độc quyền của tác phẩm ${m.title}.`);

    const poster = document.getElementById("moviePoster");
    if (poster && m.poster_path) {
        poster.src = `${CONFIG.TMDB_IMAGE_BASE}${m.poster_path}`;
        poster.onerror = () => { poster.src = 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=300'; };
    }

    const backdrop = document.getElementById("detailBackdrop");
    if (backdrop && m.backdrop_path) {
        backdrop.style.backgroundImage = `url('${CONFIG.TMDB_BACKDROP_BASE}${m.backdrop_path}')`;
    }
}

function renderCast(castList) {
    const container = document.getElementById("movieCast");
    if (!container) return;

    container.innerHTML = (castList || []).map(actor => {
        const photo = actor.profile_path ? `${CONFIG.TMDB_IMAGE_BASE}${actor.profile_path}` : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100';
        return `
        <div class="cast-item">
            <img src="${photo}" onerror="this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'" alt="${actor.name}" class="cast-avatar" loading="lazy" />
            <div class="cast-name">${actor.name}</div>
            <div class="cast-role">${actor.character || 'Diễn viên'}</div>
        </div>
        `;
    }).join('');
}

function renderSimilar(similar) {
    const container = document.getElementById("similarMovies");
    if (!container) return;

    container.innerHTML = (similar || []).map(m => `
        <div class="similar-card" data-id="${m.id}" style="cursor: pointer;">
            <img src="${CONFIG.TMDB_IMAGE_BASE}${m.poster_path}" onerror="this.src='https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=300'" alt="${m.title}" class="similar-poster" loading="lazy" />
            <div class="similar-body">
                <div class="similar-title">${m.title}</div>
                <div class="similar-meta">★ ${m.vote_average ? Number(m.vote_average).toFixed(1) : '8.0'}</div>
                <div class="similar-btn">Đặt phòng</div>
            </div>
        </div>
    `).join('');

    container.querySelectorAll('.similar-card').forEach(c => {
        c.addEventListener('click', () => { window.location.href = `movie-detail.html?id=${c.dataset.id}`; });
    });
}

// BẬT XEM TRAILER YOUTUBE CHÍNH THỨC
function setupTrailerBtn(trailerUrl) {
    const btn = document.getElementById("watchTrailer");
    btn?.addEventListener("click", () => {
        if (trailerUrl) {
            window.open(trailerUrl, "_blank");
        } else {
            window.open(`https://www.youtube.com/results?search_query=trailer+movie+${currentMovie?.id}`, "_blank");
        }
    });
}

// KHỐI ĐẶT PHÒNG NHANH Ở DƯỚI
function setupMiniBooking() {
    const dateInp = document.getElementById("detailBookingDate");
    const timeSelect = document.getElementById("detailBookingTime");
    const today = new Date().toISOString().split('T')[0];

    if (dateInp) {
        dateInp.value = today;
        dateInp.min = today;
    }

    if (timeSelect) {
        timeSelect.innerHTML = `
            <option value="14:00">14:00 (Buổi chiều)</option>
            <option value="16:30">16:30 (Buổi chiều)</option>
            <option value="18:30" selected>18:30 (Buổi tối - Giờ Hot)</option>
            <option value="20:30">20:30 (Buổi tối)</option>
            <option value="22:00">22:00 (Suất đêm)</option>
        `;
    }

    const goBooking = () => {
        const d = dateInp ? dateInp.value : today;
        const t = timeSelect ? timeSelect.value : "18:30";
        const r = document.getElementById("detailBookingRoom")?.value || "couple_a";
        const mId = currentMovie?.id || currentMovie?.tmdbId || "693134";
       window.location.href = `booking.html?movieId=${encodeURIComponent(mId)}&date=${d}&time=${t}&roomType=${r}`;
    };

    document.getElementById("btnMiniSearch")?.addEventListener("click", goBooking);
    document.getElementById("btnBookThisMovie")?.addEventListener("click", goBooking);
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}