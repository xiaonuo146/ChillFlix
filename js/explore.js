import { getTrendingMovies } from './api.js';
import { CONFIG } from './config.js';

let allMovies = [];
let filteredMovies = [];
let searchTimeout = null;

// Khởi chạy trang khám phá phim
async function initExplorePage() {
  initGlobalHeaderEvents();
  allMovies = await getTrendingMovies();
  filteredMovies = [...allMovies];
  renderMovies(filteredMovies);

  setupSearchEvent();
  setupFilterEvents();
}

// 1. Render danh sách phim
function renderMovies(movies) {
  const container = document.getElementById('exploreMovieGrid');
  const emptyState = document.getElementById('emptyState');
  const countText = document.getElementById('movieCountText');

  if (movies.length === 0) {
    container.innerHTML = '';
    emptyState.style.display = 'block';
    countText.textContent = 'Đang hiển thị 0 phim';
    return;
  }

  emptyState.style.display = 'none';
  countText.textContent = `Đang hiển thị ${movies.length} phim`;

  container.innerHTML = movies.map(movie => {
    const posterUrl = movie.poster_path 
      ? `${CONFIG.TMDB_IMAGE_BASE}${movie.poster_path}` 
      : 'https://picsum.photos/300/450';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '8.0';
    const releaseYear = (movie.release_date || '2026').slice(0, 4);

    return `
      <article class="movie-card" data-movie-id="${movie.id}" title="${movie.title}">
        <div class="movie-card__media">
          <img src="${posterUrl}" alt="${movie.title}" class="movie-card__img" loading="lazy" />
          <div class="movie-card__rating">★ ${rating}</div>
          <div class="movie-card__overlay">
            <button type="button" class="btn btn--primary movie-card__btn">Đặt phòng</button>
          </div>
        </div>
        <div class="movie-card__body">
          <h3 class="movie-card__title">${movie.title}</h3>
          <div class="movie-card__meta">
            <span>${releaseYear}</span>
            <span>4K HDR</span>
          </div>
        </div>
      </article>
    `;
  }).join('');

  // Bấm vào thẻ -> Lưu phim và sẵn sàng sang đặt phòng
  container.querySelectorAll('.movie-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.movieId;
      sessionStorage.setItem('chillflix_selected_movie_id', id);
      alert(`Đã chọn phim ID: ${id}. Sẽ chuyển tiếp sang trang Đặt Phòng!`);
    });
  });
}

// 2. Tìm kiếm với cơ chế Debounce 400ms (Tránh gọi API liên tục)
function setupSearchEvent() {
  const searchInput = document.getElementById('exploreSearchInput');
  const clearBtn = document.getElementById('clearSearchBtn');

  searchInput.addEventListener('input', (e) => {
    const keyword = e.target.value.trim().toLowerCase();
    clearBtn.style.display = keyword ? 'block' : 'none';

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      if (!keyword) {
        filteredMovies = [...allMovies];
      } else {
        filteredMovies = allMovies.filter(m => 
          (m.title && m.title.toLowerCase().includes(keyword)) ||
          (m.original_title && m.original_title.toLowerCase().includes(keyword))
        );
      }
      renderMovies(filteredMovies);
    }, 400); // Đợi dừng gõ 400ms mới lọc
  });

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.style.display = 'none';
    filteredMovies = [...allMovies];
    renderMovies(filteredMovies);
  });

  document.getElementById('resetFilterBtn')?.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.style.display = 'none';
    filteredMovies = [...allMovies];
    renderMovies(filteredMovies);
  });
}

// 3. Xử lý Chip lọc nhanh & Dropdown
function setupFilterEvents() {
  const chips = document.querySelectorAll('.filter-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const filterType = chip.dataset.filter;
      if (filterType === 'top_rated') {
        filteredMovies = [...allMovies].sort((a, b) => b.vote_average - a.vote_average);
      } else if (filterType === 'now_playing') {
        filteredMovies = [...allMovies].sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
      } else {
        filteredMovies = [...allMovies];
      }
      renderMovies(filteredMovies);
    });
  });
}

// 4. Kích hoạt Dark Mode & Menu di động dùng chung
function initGlobalHeaderEvents() {
  // Theme Toggle
  const themeBtn = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  themeBtn?.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const nextTheme = isLight ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', nextTheme);
    if (themeIcon) themeIcon.textContent = nextTheme === 'light' ? '☀️' : '🌙';
  });

  // Mobile Drawer
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const drawerCloseBtn = document.getElementById('drawerCloseBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerOverlay = document.getElementById('drawerOverlay');

  mobileMenuBtn?.addEventListener('click', () => {
    mobileDrawer.classList.add('open');
    drawerOverlay.classList.add('open');
  });

  const closeDrawer = () => {
    mobileDrawer.classList.remove('open');
    drawerOverlay.classList.remove('open');
  };
  drawerCloseBtn?.addEventListener('click', closeDrawer);
  drawerOverlay?.addEventListener('click', closeDrawer);
}

initExplorePage();