import { getTrendingMovies } from './api.js';
import { CONFIG } from './config.js';

// --- Xử lý Đổi Theme Sáng / Tối ---
const themeBtn = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

themeBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', nextTheme);
    themeIcon.textContent = nextTheme === 'light' ? '☀️' : '🌙';
});

// --- Xử lý Đổi ngôn ngữ VI / EN ---
const langBtn = document.getElementById('langToggle');
let currentLang = 'VI';
langBtn.addEventListener('click', () => {
    currentLang = currentLang === 'VI' ? 'EN' : 'VI';
    langBtn.querySelector('.lang-text').innerHTML =
        currentLang === 'VI' ? '<strong>VI</strong> / EN' : 'VI / <strong>EN</strong>';
});

// --- Xử lý Ẩn / Hiện Dropdown Avatar ---
const userBtn = document.getElementById('userMenuBtn');
const userDropdown = document.getElementById('userDropdown');

userBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanded = userBtn.getAttribute('aria-expanded') === 'true';
    userBtn.setAttribute('aria-expanded', !isExpanded);
    userDropdown.classList.toggle('show');
});

// Click ra ngoài màn hình thì tự đóng menu avatar
document.addEventListener('click', (e) => {
    if (!userDropdown.contains(e.target) && !userBtn.contains(e.target)) {
        userDropdown.classList.remove('show');
        userBtn.setAttribute('aria-expanded', 'false');
    }
});

// Render danh sách phim
async function loadHomeMovies() {
    const container = document.getElementById('movieGrid');
    const movies = await getTrendingMovies();

    container.innerHTML = movies.map(movie => `
    <article style="background: var(--surface); border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--border); transition: transform 200ms ease;">
      <div style="position: relative; aspect-ratio: 2/3;">
        <img 
          src="${movie.poster_path ? (CONFIG.TMDB_IMAGE_BASE + movie.poster_path) : 'https://picsum.photos/300/450'}" 
          alt="${movie.title}" 
          style="width: 100%; height: 100%; object-fit: cover;"
          loading="lazy"
        />
        <div style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.75); padding: 2px 8px; border-radius: 6px; color: var(--primary); font-size: 12px; font-weight: 700;">
          ★ ${movie.vote_average ? movie.vote_average.toFixed(1) : '8.0'}
        </div>
      </div>
      <div style="padding: var(--space-3);">
        <h3 style="font-family: var(--font-sans); font-size: 15px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          ${movie.title}
        </h3>
        <p style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">
          ${(movie.release_date || '2026').slice(0, 4)}
        </p>
      </div>
    </article>
  `).join('');
}

loadHomeMovies();
// ==========================================================================
// CINEMATIC LIVE SHOWCASE (SLIDESHOW NỀN TỰ ĐỘNG TỪ TMDB)
// ==========================================================================
let heroSlideIndex = 0;
let heroSlideTimer = null;
let topMovies = [];

// Khởi chạy trình chiếu từ danh sách phim TMDB
async function initHeroLiveShowcase() {
    const movies = await getTrendingMovies();
    // Lọc 5 phim đầu tiên có ảnh backdrop ngang
    topMovies = movies.filter(m => m.backdrop_path).slice(0, 5);

    if (topMovies.length === 0) return;

    renderHeroDots();
    displayHeroSlide(0);

    // Tự động chuyển phim sau mỗi 6 giây
    startHeroAutoPlay();
}

function displayHeroSlide(index) {
    heroSlideIndex = index;
    const movie = topMovies[index];
    const backdropUrl = `${CONFIG.TMDB_BACKDROP_BASE}${movie.backdrop_path}`;

    const activeLayer = document.getElementById('heroBackdropActive');
    const nextLayer = document.getElementById('heroBackdropNext');
    const label = document.getElementById('heroMovieLabel');

    // Đổi ảnh với hiệu ứng Crossfade mềm mại
    nextLayer.style.backgroundImage = `url('${backdropUrl}')`;
    nextLayer.classList.add('active');
    activeLayer.classList.remove('active');

    // Hoán đổi layer để chuẩn bị cho lượt kế tiếp
    setTimeout(() => {
        activeLayer.style.backgroundImage = `url('${backdropUrl}')`;
        activeLayer.classList.add('active');
        nextLayer.classList.remove('active');
    }, 900);

    // Cập nhật tên và điểm số TMDB
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '8.5';
    label.innerHTML = `Đang hot: <strong>${movie.title}</strong> · ★ ${rating} TMDB`;

    // Cập nhật trạng thái active cho các Dots
    document.querySelectorAll('.hero-dot').forEach((dot, idx) => {
        dot.classList.toggle('active', idx === index);
    });
}

// Tạo danh sách nút chấm gạch ngang
function renderHeroDots() {
    const dotsContainer = document.getElementById('heroSlideDots');
    dotsContainer.innerHTML = topMovies.map((_, idx) => `
    <div class="hero-dot ${idx === 0 ? 'active' : ''}" data-index="${idx}" title="Chuyển đến phim ${idx + 1}"></div>
  `).join('');

    // Bấm vào dot nào chuyển ngay sang phim đó
    dotsContainer.querySelectorAll('.hero-dot').forEach(dot => {
        dot.addEventListener('click', (e) => {
            const idx = parseInt(e.target.dataset.index, 10);
            displayHeroSlide(idx);
            restartHeroAutoPlay();
        });
    });
}

function startHeroAutoPlay() {
    heroSlideTimer = setInterval(() => {
        const nextIdx = (heroSlideIndex + 1) % topMovies.length;
        displayHeroSlide(nextIdx);
    }, 6000); // 6 giây đổi một lần
}

function restartHeroAutoPlay() {
    clearInterval(heroSlideTimer);
    startHeroAutoPlay();
}

// Kích hoạt ngay khi tải trang
initHeroLiveShowcase();
// ==========================================================================
// LOGIC THANH ĐẶT NHANH (QUICK BOOKING BAR)
// ==========================================================================

// 1. Tự động gán ngày mặc định là hôm nay
const quickDateInput = document.getElementById('quickDate');
if (quickDateInput) {
    const today = new Date().toISOString().split('T')[0];
    quickDateInput.value = today;
    quickDateInput.min = today; // Không cho chọn ngày trong quá khứ
}

// 2. Logic Stepper tăng giảm số người (1 đến 10 người)
let guestCount = 2;
const minGuests = 1;
const maxGuests = 10;

const guestDisplay = document.getElementById('guestCountDisplay');
const roomHint = document.getElementById('roomTypeHint');
const btnMinus = document.getElementById('btnMinusGuest');
const btnPlus = document.getElementById('btnPlusGuest');

function updateGuestUI() {
    guestDisplay.textContent = `${guestCount} người`;

    // Gợi ý loại phòng thông minh theo số người
    if (guestCount <= 2) {
        roomHint.textContent = 'Gợi ý: Phòng Couple (1-2 người)';
    } else if (guestCount <= 4) {
        roomHint.textContent = 'Gợi ý: Phòng Nhóm 4 (Sao Hỏa)';
    } else {
        roomHint.textContent = 'Gợi ý: Phòng VIP Party (Lên đến 10 người)';
    }
}

btnMinus.addEventListener('click', () => {
    if (guestCount > minGuests) {
        guestCount--;
        updateGuestUI();
    }
});

btnPlus.addEventListener('click', () => {
    if (guestCount < maxGuests) {
        guestCount++;
        updateGuestUI();
    }
});

// 3. Xử lý khi bấm nút "Tìm phòng trống ngay"
const btnQuickSearch = document.getElementById('btnQuickSearch');
btnQuickSearch.addEventListener('click', () => {
    const selectedDate = quickDateInput.value;
    const selectedTime = document.getElementById('quickTime').value;

    // Lưu thông tin tạm để mang sang trang Booking
    const bookingIntent = {
        date: selectedDate,
        time: selectedTime,
        guests: guestCount
    };

    sessionStorage.setItem('chillflix_quick_booking', JSON.stringify(bookingIntent));

    alert(`Đang tìm phòng cho ${guestCount} người vào ${selectedDate} lúc ${selectedTime}...\n(Sẽ chuyển tiếp sang trang Đặt phòng)`);
});
// ==========================================================================
// XỬ LÝ MỞ / ĐÓNG MENU TRƯỢT DI ĐỘNG (MOBILE DRAWER)
// ==========================================================================
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const drawerCloseBtn = document.getElementById('drawerCloseBtn');
const mobileDrawer = document.getElementById('mobileDrawer');
const drawerOverlay = document.getElementById('drawerOverlay');

function openDrawer() {
    mobileDrawer.classList.add('open');
    drawerOverlay.classList.add('open');
    document.body.style.overflow = 'hidden'; // Khóa cuộn trang khi menu đang mở
}

function closeDrawer() {
    mobileDrawer.classList.remove('open');
    drawerOverlay.classList.remove('open');
    document.body.style.overflow = ''; // Mở lại cuộn trang
}

// Bấm nút 3 gạch -> Mở menu
if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', openDrawer);
}

// Bấm nút ✕ hoặc bấm ra ngoài màn đen -> Đóng menu
if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener('click', closeDrawer);
}
if (drawerOverlay) {
    drawerOverlay.addEventListener('click', closeDrawer);
}

// Bấm vào bất kỳ tab nào trong menu -> Tự động đóng menu lại
const drawerLinks = document.querySelectorAll('.drawer__link');
drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
});