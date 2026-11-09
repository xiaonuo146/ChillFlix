import { getTrendingMovies } from './api.js';
import { CONFIG } from './config.js';

let topMovies = [];
let heroSlideIndex = 0;
let heroSlideTimer = null;

document.addEventListener("DOMContentLoaded", async () => {
    initQuickBookingBar();
    await loadHomeMovies();
    await initHeroShowcase();
});

// 1. TẢI PHIM LÊN TRANG CHỦ
async function loadHomeMovies() {
    const container = document.getElementById('movieGrid');
    if (!container) return;

    try {
        const movies = await getTrendingMovies();
        if (!movies || movies.length === 0) {
            container.innerHTML = `<p style="color: var(--text-muted); padding: 20px;">Đang cập nhật phim...</p>`;
            return;
        }

        container.innerHTML = movies.slice(0, 12).map(movie => {
            const posterUrl = movie.poster_path 
                ? `${CONFIG.TMDB_IMAGE_BASE}${movie.poster_path}` 
                : 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=300';
            const rating = movie.vote_average ? Number(movie.vote_average).toFixed(1) : '8.0';
            const year = (movie.release_date || '2024').slice(0, 4);

            return `
            <article class="movie-card-item" data-id="${movie.id}" style="background: var(--surface); border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--border); transition: transform 200ms ease; cursor: pointer;">
              <div style="position: relative; aspect-ratio: 2/3;">
                <img src="${posterUrl}" onerror="this.src='https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=300'" alt="${movie.title}" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy" />
                <div style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.75); padding: 2px 8px; border-radius: 6px; color: var(--primary); font-size: 12px; font-weight: 700;">
                  ★ ${rating}
                </div>
              </div>
              <div style="padding: var(--space-3);">
                <h3 style="font-family: var(--font-sans); font-size: 14.5px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text); margin: 0 0 4px;">
                  ${movie.title}
                </h3>
                <p style="font-size: 12.5px; color: var(--text-muted); margin: 0;">
                  ${year} · 4K Dolby Atmos
                </p>
              </div>
            </article>
            `;
        }).join('');

        container.querySelectorAll('.movie-card-item').forEach(card => {
            card.addEventListener('click', () => {
                window.location.href = `movie-detail.html?id=${card.dataset.id}`;
            });
        });

    } catch (err) {
        console.error("Lỗi home movies:", err);
    }
}

// 2. SLIDESHOW HERO VÀ ĐỔI NHÃN HOT
async function initHeroShowcase() {
    try {
        const movies = await getTrendingMovies();
        topMovies = (movies || []).filter(m => m.backdrop_path).slice(0, 5);
        if (topMovies.length === 0) return;

        renderHeroDots();
        displayHeroSlide(0);

        clearInterval(heroSlideTimer);
        heroSlideTimer = setInterval(() => {
            heroSlideIndex = (heroSlideIndex + 1) % topMovies.length;
            displayHeroSlide(heroSlideIndex);
        }, 6000);
    } catch (e) {}
}

function displayHeroSlide(index) {
    const movie = topMovies[index];
    if (!movie) return;

    const activeLayer = document.getElementById('heroBackdropActive');
    const label = document.getElementById('heroMovieLabel');

    if (activeLayer && movie.backdrop_path) {
        activeLayer.style.backgroundImage = `url('${CONFIG.TMDB_BACKDROP_BASE}${movie.backdrop_path}')`;
    }

    if (label) {
        label.innerHTML = `Đang hot: <strong>${movie.title}</strong> · ★ ${movie.vote_average || '8.5'} TMDB`;
        label.style.color = "var(--text)";
    }

    document.querySelectorAll('.hero-dot').forEach((d, i) => d.classList.toggle('active', i === index));
}

function renderHeroDots() {
    const dotsContainer = document.getElementById('heroSlideDots');
    if (!dotsContainer) return;
    dotsContainer.innerHTML = topMovies.map((_, i) => `<div class="hero-dot ${i === 0 ? 'active' : ''}" data-idx="${i}"></div>`).join('');
    dotsContainer.querySelectorAll('.hero-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            displayHeroSlide(Number(dot.dataset.idx));
        });
    });
}

// 3. THANH ĐẶT NHANH (QUICK BOOKING BAR)
function initQuickBookingBar() {
    const quickDateInput = document.getElementById('quickDate');
    const today = new Date().toISOString().split('T')[0];
    if (quickDateInput) {
        quickDateInput.value = today;
        quickDateInput.min = today;
    }

    let guestCount = 2;
    const guestDisplay = document.getElementById('guestCountDisplay');
    const btnMinus = document.getElementById('btnMinusGuest');
    const btnPlus = document.getElementById('btnPlusGuest');

    btnMinus?.addEventListener('click', () => {
        if (guestCount > 1) { guestCount--; if (guestDisplay) guestDisplay.textContent = `${guestCount} người`; }
    });
    btnPlus?.addEventListener('click', () => {
        if (guestCount < 12) { guestCount++; if (guestDisplay) guestDisplay.textContent = `${guestCount} người`; }
    });

document.getElementById('btnQuickSearch')?.addEventListener('click', () => {
        const date = quickDateInput ? quickDateInput.value : today;
        const time = document.getElementById('quickTime')?.value || '18:30';
        let rType = 'couple_a';
        if (guestCount > 4) rType = 'vip';
        else if (guestCount > 2) rType = 'group4';

        window.location.href = `explore.html?date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}&roomType=${rType}&guests=${guestCount}`;
    });

    document.querySelectorAll(".btn-claim-voucher-global").forEach(btn => {
        btn.addEventListener("click", () => {
            const code = btn.dataset.code || "PHIM20";
            navigator.clipboard.writeText(code);
            btn.textContent = `✓ Đã lưu mã ${code}!`;
            alert(`🎉 Đã thu thập mã [${code}] vào ví thành công!`);
        });
    });
}