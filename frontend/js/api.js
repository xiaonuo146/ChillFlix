import { CONFIG } from "./config.js";

// ======================================
// 1. DỮ LIỆU PHIM MẪU CHUẨN (MOCK DATA)
// ======================================
const MOCK_TRENDING_MOVIES = [
    {
        id: 693134,
        title: "Dune: Hành Tinh Cát 2",
        original_title: "Dune: Part Two",
        release_date: "2024-03-01",
        vote_average: 8.8,
        runtime: 166,
        genres: ["Sci-Fi", "Hành động", "Phiêu lưu"],
        overview: "Hành trình huyền thoại của Paul Atreides khi anh hội ngộ cùng Chani và tộc người Fremen trên sa mạc cằn cỗi Arrakis...",
        poster_path: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
        backdrop_path: "/xOMo8BRK7PfcJv9JCnx7s520Wio.jpg"
    },
    {
        id: 872585,
        title: "Oppenheimer",
        original_title: "Oppenheimer",
        release_date: "2023-07-21",
        vote_average: 8.6,
        runtime: 180,
        genres: ["Lịch sử", "Kịch tính"],
        overview: "Câu chuyện về nhà vật lý lý thuyết người Mỹ J. Robert Oppenheimer, người đóng vai trò then chốt trong Dự án Manhattan...",
        poster_path: "/ptpr0kGAckfQkJeJIt8st5d4vdq.jpg",
        backdrop_path: "/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg"
    },
    {
        id: 1022789,
        title: "Inside Out 2",
        original_title: "Inside Out 2",
        release_date: "2024-06-14",
        vote_average: 8.0,
        runtime: 96,
        genres: ["Hoạt hình", "Gia đình", "Hài"],
        overview: "Bộ phim đưa khán giả trở lại với tâm trí của cô bé tuổi teen Riley vừa bước vào tuổi dậy thì cùng những cảm xúc mới toanh...",
        poster_path: "/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg",
        backdrop_path: "/stKGOmPAgTo5hJ7789xEjxPvIOv.jpg"
    }
];

// Kiểm tra TMDB API Key có khả dụng không
function hasTMDBKey() {
    return Boolean(
        CONFIG.TMDB_API_KEY &&
        CONFIG.TMDB_API_KEY !== "YOUR_TMDB_API_KEY_HERE" &&
        !CONFIG.TMDB_API_KEY.includes("...")
    );
}

function validateMovieId(movieId) {
    const id = Number(movieId);
    if (!Number.isInteger(id) || id <= 0) {
        throw new Error("ID phim không hợp lệ");
    }
    return id;
}

// Gọi TMDB API
async function fetchTMDB(endpoint, language = CONFIG.DEFAULT_LANG || "vi-VN") {
    const separator = endpoint.includes("?") ? "&" : "?";
    const url = `${CONFIG.TMDB_BASE_URL}${endpoint}${separator}api_key=${encodeURIComponent(CONFIG.TMDB_API_KEY)}&language=${encodeURIComponent(language)}`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Lỗi TMDB: ${response.status}`);
    }
    return await response.json();
}

// ======================================
// 2. LẤY DANH SÁCH PHIM ĐANG HOT
// ======================================
export async function getTrendingMovies() {
    if (!hasTMDBKey()) {
        console.info("⚡ Đang dùng Mock Data (Chưa có key TMDB).");
        return MOCK_TRENDING_MOVIES;
    }

    try {
        const data = await fetchTMDB("/trending/movie/week");
        return (data.results && data.results.length > 0) ? data.results : MOCK_TRENDING_MOVIES;
    } catch (error) {
        console.warn("⚠️ Không kết nối được TMDB, tự động dùng dữ liệu dự phòng:", error.message);
        return MOCK_TRENDING_MOVIES;
    }
}

// ======================================
// 3. LẤY CHI TIẾT PHIM
// ======================================
export async function getMovieDetails(movieId) {
    const id = validateMovieId(movieId);
    const mockMovie = MOCK_TRENDING_MOVIES.find(m => m.id === id);

    if (!hasTMDBKey()) {
        return mockMovie || MOCK_TRENDING_MOVIES[0];
    }

    try {
        return await fetchTMDB(`/movie/${id}`);
    } catch (error) {
        return mockMovie || MOCK_TRENDING_MOVIES[0];
    }
}

// ======================================
// 4. LẤY DIỄN VIÊN
// ======================================
export async function getMovieCredits(movieId) {
    const id = validateMovieId(movieId);
    if (!hasTMDBKey()) return [];

    try {
        const data = await fetchTMDB(`/movie/${id}/credits`);
        return {
            cast: (data.cast || []).slice(0, 8),
            crew: data.crew || []   
        };
    } catch (error) {
        return [];
    }
}

// ======================================
// 5. LẤY PHIM TƯƠNG TỰ
// ======================================
export async function getSimilarMovies(movieId) {
    const id = validateMovieId(movieId);
    if (!hasTMDBKey()) {
        return MOCK_TRENDING_MOVIES.filter(m => m.id !== id);
    }

    try {
        const data = await fetchTMDB(`/movie/${id}/similar`);
        return (data.results || []).slice(0, 8);
    } catch (error) {
        return MOCK_TRENDING_MOVIES.filter(m => m.id !== id);
    }
}

// ======================================
// 6. LẤY TRAILER (ĐÃ FIX LỖI CÚ PHÁP)
// ======================================
export async function getMovieTrailer(movieId) {
    const id = validateMovieId(movieId);
    if (!hasTMDBKey()) return null;

    try {
        const data = await fetchTMDB(`/movie/${id}/videos`, "en-US");
        const videos = data.results || [];

        const trailer = videos.find(v => v.site === "YouTube" && v.type === "Trailer" && v.official) ||
                        videos.find(v => v.site === "YouTube" && v.type === "Trailer");

        if (!trailer || !trailer.key) return null;

        // Chuỗi YouTube hoàn chỉnh, không còn lỗi cú pháp
        return `https://www.youtube.com/watch?v=${encodeURIComponent(trailer.key)}`;
    } catch (error) {
        return null;
    }
}