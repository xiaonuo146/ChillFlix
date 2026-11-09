import { getTrendingMovies } from "../api.js";
import { CONFIG } from "../config.js";

let allMovies = [];
let filteredMovies = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 16; 
let searchTimeout = null;

document.addEventListener("DOMContentLoaded", async () => {
    try {
        allMovies = await getTrendingMovies();
        filteredMovies = [...allMovies];
        setupSearchAndFilters();
        applyFilters();
    } catch (err) {
        console.error("Lỗi khám phá phim:", err);
    }
});

function renderMovies(movies) {
    const container = document.getElementById('exploreMovieGrid');
    const countText = document.getElementById('movieCountText');
    const emptyState = document.getElementById('emptyState');

    if (!container) return;

    if (!movies || movies.length === 0) {
        container.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        if (countText) countText.textContent = 'Đang hiển thị 0 phim';
        renderPagination(0);
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    // 🌟 TÍNH TOÁN CẮT LÁT THEO TRANG HIỆN TẠI
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedItems = movies.slice(startIndex, endIndex);

    if (countText) {
        countText.textContent = `Đang hiển thị trang ${currentPage} (${movies.length} phim chiếu rạp)`;
    }

    container.innerHTML = paginatedItems.map(movie => {
        const posterUrl = movie.poster_path 
            ? `${CONFIG.TMDB_IMAGE_BASE}${movie.poster_path}` 
            : 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=300';
        const rating = movie.vote_average ? Number(movie.vote_average).toFixed(1) : '8.0';
        const year = (movie.release_date || '2024').slice(0, 4);

        return `
          <article class="explore-movie-card" data-id="${movie.id}" style="cursor: pointer;">
            <div class="explore-card__media">
              <img src="${posterUrl}" onerror="this.src='https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=300'" alt="${movie.title}" class="explore-card__img" loading="lazy" />
              <div class="explore-card__rating">★ ${rating}</div>
              <div class="explore-card__overlay">
                <button type="button" class="btn btn--primary explore-card__btn">Chi tiết & Đặt vé</button>
              </div>
            </div>
            <div class="explore-card__body">
              <h3 class="explore-card__title">${movie.title}</h3>
              <div class="explore-card__meta">
                <span>${year}</span>
                <span>•</span>
                <span style="color: var(--primary);">4K Dolby Atmos</span>
              </div>
            </div>
          </article>
        `;
    }).join('');

    container.querySelectorAll('.explore-movie-card').forEach(card => {
        card.addEventListener('click', () => {
            window.location.href = `movie-detail.html?id=${card.dataset.id}`;
        });
    });

    renderPagination(movies.length);
}

// 🌟 HÀM VẼ CÁC NÚT PHÂN TRANG [← Trước] [1] [2] [3]... [Sau →]
function renderPagination(totalItems) {
    const paginationBox = document.getElementById("explorePagination");
    if (!paginationBox) return;

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (totalPages <= 1) {
        paginationBox.innerHTML = "";
        return;
    }

    let html = "";

    // Nút Trang trước
    if (currentPage > 1) {
        html += `<button type="button" class="page-btn nav-arrow" data-page="${currentPage - 1}">← Trước</button>`;
    }

    // Các nút số 1, 2, 3, 4, 5...
    for (let i = 1; i <= totalPages; i++) {
        html += `<button type="button" class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }

    // Nút Trang sau
    if (currentPage < totalPages) {
        html += `<button type="button" class="page-btn nav-arrow" data-page="${currentPage + 1}">Sau →</button>`;
    }

    paginationBox.innerHTML = html;

    paginationBox.querySelectorAll(".page-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            currentPage = Number(btn.dataset.page);
            renderMovies(filteredMovies);
            // Cuộn mượt lên đầu danh sách phim
            document.querySelector(".explore-header")?.scrollIntoView({ behavior: "smooth" });
        });
    });
}

function setupSearchAndFilters() {
    const searchInput = document.getElementById('exploreSearchInput');
    const clearBtn = document.getElementById('clearSearchBtn');
    const genreSelect = document.getElementById('genreSelect');

    searchInput?.addEventListener('input', (e) => {
        if (clearBtn) clearBtn.style.display = e.target.value ? 'block' : 'none';
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(applyFilters, 300);
    });

    clearBtn?.addEventListener('click', () => {
        searchInput.value = '';
        clearBtn.style.display = 'none';
        applyFilters();
    });

    genreSelect?.addEventListener('change', applyFilters);

    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            applyFilters();
        });
    });
}

function applyFilters() {
    currentPage = 1; // Reset về trang 1 khi lọc
    const keyword = (document.getElementById('exploreSearchInput')?.value || '').trim().toLowerCase();
    const genreVal = document.getElementById('genreSelect')?.value || 'all';
    const activeChip = document.querySelector('.filter-chip.active')?.dataset.filter || 'trending';

    let list = [...allMovies];

    if (keyword) {
        list = list.filter(m => (m.title || '').toLowerCase().includes(keyword));
    }

    if (genreVal !== 'all') {
        const genreId = Number(genreVal);
        list = list.filter(m => {
            if (Array.isArray(m.genre_ids) && m.genre_ids.includes(genreId)) return true;
            if (Array.isArray(m.genres)) {
                return m.genres.some(g => (typeof g === 'object' ? g.id === genreId : false));
            }
            return false;
        });
    }

    if (activeChip === 'top_rated') {
        list.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
    } else if (activeChip === 'now_playing') {
        list.sort((a, b) => new Date(b.release_date || 0) - new Date(a.release_date || 0));
    }

    filteredMovies = list;
    renderMovies(filteredMovies);
}