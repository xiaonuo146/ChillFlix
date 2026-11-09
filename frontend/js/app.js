import { getTrendingMovies } from './api.js';
import { CONFIG } from './config.js';

// ==========================================================================
// 1. XỬ LÝ THEME SÁNG / TỐI & NGÔN NGỮ & USER MENU
// ==========================================================================
const themeBtn = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
console.log("👉 APP.JS ĐÃ BẮT ĐẦU CHẠY THÀNH CÔNG!");
if (themeBtn) {
    themeBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', nextTheme);
        if (themeIcon) themeIcon.textContent = nextTheme === 'light' ? '☀️' : '🌙';
        localStorage.setItem('chillflix-theme', nextTheme);
    });
}

const langBtn = document.getElementById('langToggle');
let currentLang = 'VI';
if (langBtn) {
    langBtn.addEventListener('click', () => {
        currentLang = currentLang === 'VI' ? 'EN' : 'VI';
        langBtn.querySelector('.lang-text').innerHTML =
            currentLang === 'VI' ? '<strong>VI</strong> / EN' : 'VI / <strong>EN</strong>';
    });
}

const userBtn = document.getElementById('userMenuBtn');
const userDropdown = document.getElementById('userDropdown');

if (userBtn && userDropdown) {
    userBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = userBtn.getAttribute('aria-expanded') === 'true';
        userBtn.setAttribute('aria-expanded', !isExpanded);
        userDropdown.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
        if (!userDropdown.contains(e.target) && !userBtn.contains(e.target)) {
            userDropdown.classList.remove('show');
            userBtn.setAttribute('aria-expanded', 'false');
        }
    });
}

// ==========================================================================
// 2. RENDER DANH SÁCH PHIM ĐANG HOT (CÓ LINK SANG MOVIE-DETAIL.HTML)
// ==========================================================================
async function loadHomeMovies() {
    const container = document.getElementById('movieGrid');
    if (!container) return;

    try {
        const movies = await getTrendingMovies();

        if (!movies || movies.length === 0) {
            container.innerHTML = `<p style="color: var(--text-muted);">Không có dữ liệu phim.</p>`;
            return;
        }

        container.innerHTML = movies.map(movie => {
            const posterUrl = movie.poster_path 
                ? `${CONFIG.TMDB_IMAGE_BASE}${movie.poster_path}` 
                : 'https://picsum.photos/300/450';
            const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '8.0';
            const year = (movie.release_date || '2026').slice(0, 4);

            return `
            <article class="movie-card-item" data-id="${movie.id}" style="background: var(--surface); border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--border); transition: transform 200ms ease, border-color 200ms ease; cursor: pointer;">
              <div style="position: relative; aspect-ratio: 2/3;">
                <img 
                  src="${posterUrl}" 
                  alt="${movie.title}" 
                  style="width: 100%; height: 100%; object-fit: cover;"
                  loading="lazy"
                />
                <div style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.75); padding: 2px 8px; border-radius: 6px; color: var(--primary); font-size: 12px; font-weight: 700;">
                  ★ ${rating}
                </div>
              </div>
              <div style="padding: var(--space-3);">
                <h3 style="font-family: var(--font-sans); font-size: 15px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text);">
                  ${movie.title}
                </h3>
                <p style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">
                  ${year} · 4K Dolby Atmos
                </p>
              </div>
            </article>
            `;
        }).join('');

        // Bấm vào bất kỳ poster phim nào -> Chuyển thẳng sang trang chi tiết phim kèm ID
        container.querySelectorAll('.movie-card-item').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.dataset.id;
                window.location.href = `movie-detail.html?id=${id}`;
            });
        });

    } catch (err) {
        console.error("Lỗi khi hiển thị phim:", err);
        container.innerHTML = `<p style="color: var(--danger);">Không tải được danh sách phim. Vui lòng thử lại sau.</p>`;
    }
}

// ==========================================================================
// 3. CINEMATIC LIVE SHOWCASE (SLIDESHOW HERO NỀN TMDB)
// ==========================================================================
let heroSlideIndex = 0;
let heroSlideTimer = null;
let topMovies = [];

async function initHeroLiveShowcase() {
    try {
        const movies = await getTrendingMovies();
        topMovies = movies.filter(m => m.backdrop_path).slice(0, 5);

        if (topMovies.length === 0) return;

        renderHeroDots();
        displayHeroSlide(0);
        startHeroAutoPlay();
    } catch (err) {
        console.warn("Không khởi chạy được Hero Slideshow:", err);
    }
}

function displayHeroSlide(index) {
    heroSlideIndex = index;
    const movie = topMovies[index];
    if (!movie) return;

    const backdropUrl = `${CONFIG.TMDB_BACKDROP_BASE}${movie.backdrop_path}`;
    const activeLayer = document.getElementById('heroBackdropActive');
    const nextLayer = document.getElementById('heroBackdropNext');
    const label = document.getElementById('heroMovieLabel');

    if (!activeLayer || !nextLayer) return;

    nextLayer.style.backgroundImage = `url('${backdropUrl}')`;
    nextLayer.classList.add('active');
    activeLayer.classList.remove('active');

    setTimeout(() => {
        activeLayer.style.backgroundImage = `url('${backdropUrl}')`;
        activeLayer.classList.add('active');
        nextLayer.classList.remove('active');
    }, 900);

    if (label) {
        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '8.5';
        label.innerHTML = `Đang hot: <strong>${movie.title}</strong> · ★ ${rating} TMDB`;
    }

    document.querySelectorAll('.hero-dot').forEach((dot, idx) => {
        dot.classList.toggle('active', idx === index);
    });
}

function renderHeroDots() {
    const dotsContainer = document.getElementById('heroSlideDots');
    if (!dotsContainer) return;

    dotsContainer.innerHTML = topMovies.map((_, idx) => `
        <div class="hero-dot ${idx === 0 ? 'active' : ''}" data-index="${idx}" title="Chuyển đến phim ${idx + 1}"></div>
    `).join('');

    dotsContainer.querySelectorAll('.hero-dot').forEach(dot => {
        dot.addEventListener('click', (e) => {
            const idx = parseInt(e.target.dataset.index, 10);
            displayHeroSlide(idx);
            restartHeroAutoPlay();
        });
    });
}

function startHeroAutoPlay() {
    clearInterval(heroSlideTimer);
    heroSlideTimer = setInterval(() => {
        const nextIdx = (heroSlideIndex + 1) % topMovies.length;
        displayHeroSlide(nextIdx);
    }, 6000);
}

function restartHeroAutoPlay() {
    clearInterval(heroSlideTimer);
    startHeroAutoPlay();
}

// ==========================================================================
// 4. THANH ĐẶT NHANH (QUICK BOOKING BAR - CHUYỂN TIẾP SANG BOOKING.HTML)
// ==========================================================================
const quickDateInput = document.getElementById('quickDate');
if (quickDateInput) {
    const today = new Date().toISOString().split('T')[0];
    quickDateInput.value = today;
    quickDateInput.min = today;
}

let guestCount = 2;
const guestDisplay = document.getElementById('guestCountDisplay');
const roomHint = document.getElementById('roomTypeHint');
const btnMinus = document.getElementById('btnMinusGuest');
const btnPlus = document.getElementById('btnPlusGuest');

function updateGuestUI() {
    if (guestDisplay) guestDisplay.textContent = `${guestCount} người`;
    if (roomHint) {
        if (guestCount <= 2) roomHint.textContent = 'Gợi ý: Phòng Couple (1-2 người)';
        else if (guestCount <= 4) roomHint.textContent = 'Gợi ý: Phòng Nhóm 4 (Sao Hỏa)';
        else roomHint.textContent = 'Gợi ý: Phòng VIP Party (Lên đến 10 người)';
    }
}

if (btnMinus) {
    btnMinus.addEventListener('click', () => {
        if (guestCount > 1) {
            guestCount--;
            updateGuestUI();
        }
    });
}

if (btnPlus) {
    btnPlus.addEventListener('click', () => {
        if (guestCount < 10) {
            guestCount++;
            updateGuestUI();
        }
    });
}

const btnQuickSearch = document.getElementById('btnQuickSearch');
if (btnQuickSearch) {
    btnQuickSearch.addEventListener('click', () => {
        const selectedDate = quickDateInput ? quickDateInput.value : '';
        const selectedTime = document.getElementById('quickTime') ? document.getElementById('quickTime').value : '18:30';

        let roomType = 'couple';
        if (guestCount > 4) roomType = 'vip';
        else if (guestCount > 2) roomType = 'group4';

        // Nối thẳng sang trang booking.html với dữ liệu đã chọn
        window.location.href = `booking.html?date=${encodeURIComponent(selectedDate)}&time=${encodeURIComponent(selectedTime)}&roomType=${roomType}&guests=${guestCount}`;
    });
}

// ==========================================================================
// 5. MENU TRƯỢT DI ĐỘNG (MOBILE DRAWER)
// ==========================================================================
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const drawerCloseBtn = document.getElementById('drawerCloseBtn');
const mobileDrawer = document.getElementById('mobileDrawer');
const drawerOverlay = document.getElementById('drawerOverlay');

function openDrawer() {
    if (mobileDrawer && drawerOverlay) {
        mobileDrawer.classList.add('open');
        drawerOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
}

function closeDrawer() {
    if (mobileDrawer && drawerOverlay) {
        mobileDrawer.classList.remove('open');
        drawerOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }
}

if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openDrawer);
if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

// ==========================================================================
// 6. KHỞI CHẠY TẤT CẢ KHI TẢI TRANG
// ==========================================================================
loadHomeMovies();
initHeroLiveShowcase();