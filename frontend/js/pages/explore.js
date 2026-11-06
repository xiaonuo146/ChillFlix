import { getTrendingMovies } from "../api.js";
import { CONFIG } from "../config.js";

let allMovies = [];
let filteredMovies = [];
let searchTimeout = null;

// Khởi chạy trang khám phá phim
async function initExplorePage() {
  initGlobalHeaderEvents();
  
  try {
    allMovies = await getTrendingMovies();
    filteredMovies = [...allMovies];
    renderMovies(filteredMovies);

    setupSearchEvent();
    setupFilterEvents();
  } catch (err) {
    console.error("Lỗi khi tải danh sách phim khám phá:", err);
  }
}

// 1. Render danh sách thẻ phim
function renderMovies(movies) {
  const container = document.getElementById('exploreMovieGrid');
  const emptyState = document.getElementById('emptyState');
  const countText = document.getElementById('movieCountText');

  if (!container) return;

  if (movies.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    if (countText) countText.textContent = 'Đang hiển thị 0 phim';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (countText) countText.textContent = `Đang hiển thị ${movies.length} phim chiếu rạp`;

  container.innerHTML = movies.map(movie => {
    const posterUrl = movie.poster_path 
      ? `${CONFIG.TMDB_IMAGE_BASE}${movie.poster_path}` 
      : 'https://picsum.photos/300/450';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '8.0';
    const releaseYear = (movie.release_date || '2026').slice(0, 4);

    return `
      <article class="explore-movie-card" data-movie-id="${movie.id}" title="${movie.title}">
        <div class="explore-card__media">
          <img src="${posterUrl}" alt="${movie.title}" class="explore-card__img" loading="lazy" />
          <div class="explore-card__rating">★ ${rating}</div>
          <div class="explore-card__overlay">
            <button type="button" class="btn btn--primary explore-card__btn">Chi tiết & Đặt vé</button>
          </div>
        </div>
        <div class="explore-card__body">
          <h3 class="explore-card__title">${movie.title}</h3>
          <div class="explore-card__meta">
            <span>${releaseYear}</span>
            <span>•</span>
            <span style="color: var(--primary);">4K Dolby Atmos</span>
          </div>
        </div>
      </article>
    `;
  }).join('');

  // ĐÃ FIX: Bấm vào thẻ phim -> Chuyển thẳng sang trang movie-detail.html kèm ID
  container.querySelectorAll('.explore-movie-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.movieId;
      window.location.href = `movie-detail.html?id=${id}`;
    });
  });
}

// 2. Tìm kiếm với cơ chế Debounce 400ms (Tránh lag)
function setupSearchEvent() {
  const searchInput = document.getElementById('exploreSearchInput');
  const clearBtn = document.getElementById('clearSearchBtn');

  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const keyword = e.target.value.trim().toLowerCase();
    if (clearBtn) clearBtn.style.display = keyword ? 'block' : 'none';

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      applyFilters();
    }, 400);
  });

  clearBtn?.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.style.display = 'none';
    applyFilters();
  });

  document.getElementById('resetFilterBtn')?.addEventListener('click', () => {
    searchInput.value = '';
    if (clearBtn) clearBtn.style.display = 'none';
    
    // Reset chip và select về mặc định
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    document.querySelector('.filter-chip[data-filter="trending"]')?.classList.add('active');
    
    const genreSelect = document.getElementById('genreSelect');
    if (genreSelect) genreSelect.value = 'all';

    applyFilters();
  });
}

// 3. Xử lý Chip lọc nhanh & Dropdown Thể loại
function setupFilterEvents() {
  const chips = document.querySelectorAll('.filter-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      applyFilters();
    });
  });

  // Bổ sung lắng nghe sự kiện thay đổi của Dropdown thể loại
  const genreSelect = document.getElementById('genreSelect');
  if (genreSelect) {
    genreSelect.addEventListener('change', () => {
      applyFilters();
    });
  }
}

// Bộ lọc kết hợp: Từ khóa + Chip + Thể loại
function applyFilters() {
  const searchInput = document.getElementById('exploreSearchInput');
  const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const activeChip = document.querySelector('.filter-chip.active');
  const filterType = activeChip ? activeChip.dataset.filter : 'trending';
  const genreSelect = document.getElementById('genreSelect');
  const selectedGenre = genreSelect ? genreSelect.value : 'all';

  let result = [...allMovies];

  // 1. Lọc theo từ khóa
  if (keyword) {
    result = result.filter(m => 
      (m.title && m.title.toLowerCase().includes(keyword)) ||
      (m.original_title && m.original_title.toLowerCase().includes(keyword))
    );
  }

  // 2. Lọc theo thể loại
  if (selectedGenre !== 'all') {
    const genreId = Number(selectedGenre);
    result = result.filter(m => {
      if (Array.isArray(m.genre_ids)) return m.genre_ids.includes(genreId);
      if (Array.isArray(m.genres)) return m.genres.some(g => (g.id === genreId || (g.name && g.name.includes(selectedGenre))));
      return true;
    });
  }

  // 3. Sắp xếp theo chip
  if (filterType === 'top_rated') {
    result.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
  } else if (filterType === 'now_playing') {
    result.sort((a, b) => new Date(b.release_date || 0) - new Date(a.release_date || 0));
  }

  filteredMovies = result;
  renderMovies(filteredMovies);
}

// 4. Đồng bộ sự kiện chung của Header (Sáng/Tối, Drawer, Avatar Dropdown)
function initGlobalHeaderEvents() {
  // Theme Toggle
  const themeBtn = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  themeBtn?.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const nextTheme = isLight ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', nextTheme);
    if (themeIcon) themeIcon.textContent = nextTheme === 'light' ? '☀️' : '🌙';
    localStorage.setItem('chillflix-theme', nextTheme);
  });

  // User Dropdown Avatar Menu
  const userBtn = document.getElementById('userMenuBtn');
  const userDropdown = document.getElementById('userDropdown');
  if (userBtn && userDropdown) {
    userBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('show');
    });
    document.addEventListener('click', () => userDropdown.classList.remove('show'));
  }

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