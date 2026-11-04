
import { CONFIG } from "./config.js";

// ======================================
// 1. DỮ LIỆU PHIM MẪU
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

// ======================================
// 2. HÀM DÙNG CHUNG
// ======================================

// Kiểm tra có TMDB API Key hay chưa
function hasTMDBKey() {
    return Boolean(
        CONFIG.TMDB_API_KEY &&
        CONFIG.TMDB_API_KEY !== "YOUR_TMDB_API_KEY_HERE"
    );
}

// Kiểm tra ID phim
function validateMovieId(movieId) {
    const id = Number(movieId);

    if (!Number.isInteger(id) || id <= 0) {
        throw new Error("ID phim không hợp lệ");
    }

    return id;
}

// Gọi API TMDB
async function fetchTMDB(endpoint, language = CONFIG.DEFAULT_LANG || "vi-VN") {
    const separator = endpoint.includes("?") ? "&" : "?";

    const url =
        `${CONFIG.TMDB_BASE_URL}${endpoint}` +
        `${separator}api_key=${encodeURIComponent(CONFIG.TMDB_API_KEY)}` +
        `&language=${encodeURIComponent(language)}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Lỗi TMDB: ${response.status}`);
    }

    return await response.json();
}

// ======================================
// 3. LẤY DANH SÁCH PHIM ĐANG HOT
// ======================================
export async function getTrendingMovies() {
    if (!hasTMDBKey()) {
        console.info("Đang sử dụng dữ liệu phim mẫu.");
        return MOCK_TRENDING_MOVIES;
    }

    try {
        const data = await fetchTMDB("/trending/movie/week");
        return data.results || [];
    } catch (error) {
        console.error("Lỗi lấy phim đang hot:", error);
        return MOCK_TRENDING_MOVIES;
    }
}

// ======================================
// 4. LẤY CHI TIẾT PHIM
// ======================================
export async function getMovieDetails(movieId) {
    const id = validateMovieId(movieId);

    const mockMovie = MOCK_TRENDING_MOVIES.find(
        movie => movie.id === id
    );

    if (!hasTMDBKey()) {
        if (!mockMovie) {
            throw new Error("Phim chưa có trong dữ liệu mẫu.");
        }

        return mockMovie;
    }

    try {
        return await fetchTMDB(`/movie/${id}`);
    } catch (error) {
        console.error("Lỗi lấy chi tiết phim:", error);

        if (mockMovie) {
            return mockMovie;
        }

        throw error;
    }
}

// ======================================
// 5. LẤY DANH SÁCH DIỄN VIÊN
// ======================================
export async function getMovieCredits(movieId) {
    const id = validateMovieId(movieId);

    if (!hasTMDBKey()) {
        return [];
    }

    try {
        const data = await fetchTMDB(`/movie/${id}/credits`);
        return (data.cast || []).slice(0, 8);
    } catch (error) {
        console.error("Lỗi lấy diễn viên:", error);
        return [];
    }
}

// ======================================
// 6. LẤY PHIM TƯƠNG TỰ
// ======================================
export async function getSimilarMovies(movieId) {
    const id = validateMovieId(movieId);

    const getMockSimilarMovies = () => {
        return MOCK_TRENDING_MOVIES.filter(
            movie => movie.id !== id
        );
    };

    if (!hasTMDBKey()) {
        return getMockSimilarMovies();
    }

    try {
        const data = await fetchTMDB(`/movie/${id}/similar`);
        return (data.results || []).slice(0, 8);
    } catch (error) {
        console.error("Lỗi lấy phim tương tự:", error);
        return getMockSimilarMovies();
    }
}

// ======================================
// 7. LẤY TRAILER PHIM
// ======================================
export async function getMovieTrailer(movieId) {
    const id = validateMovieId(movieId);

    // Không có TMDB key thì chưa thể lấy trailer
    if (!hasTMDBKey()) {
        return null;
    }

    try {
        // Lấy video tiếng Anh để tăng khả năng tìm được trailer
        const data = await fetchTMDB(
            `/movie/${id}/videos`,
            "en-US"
        );

        const videos = data.results || [];

        // Ưu tiên trailer chính thức trên YouTube
        const trailer =
            videos.find(
                video =>
                    video.site === "YouTube" &&
                    video.type === "Trailer" &&
                    video.official === true
            ) ||
            videos.find(
                video =>
                    video.site === "YouTube" &&
                    video.type === "Trailer"
            );

        if (!trailer || !trailer.key) {
            return null;
        }

        return (
            "https://www.youtube.com/watch?v=" +
            encodeURIComponent(trailer.key)
        );

    } catch (error) {
        console.error("Không lấy được trailer:", error);
        return null;
    }
}
