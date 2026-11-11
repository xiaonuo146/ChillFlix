import { CONFIG } from "./config.js";

// ======================================
// 1. DỮ LIỆU PHIM MẪU CHUẨN DỰ PHÒNG (MOCK DATA KHI MẤT MẠNG)
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

// Cho phép cả số lẫn chuỗi ID hợp lệ
function validateMovieId(movieId) {
    if (!movieId || movieId === "undefined" || movieId === "null") {
        return 693134; // Mặc định Dune 2
    }
    return Number(movieId) || movieId;
} 
// Gọi thông qua Backend Proxy (Giấu API Key hoàn toàn)
async function fetchFromBackend(endpoint) {
    const baseUrl = CONFIG.API_BASE_URL || 'http://localhost:5000';
    const response = await fetch(`${baseUrl}/api/movies${endpoint}`);
    if (!response.ok) {
        throw new Error(`Lỗi máy chủ: ${response.status}`);
    }
    const result = await response.json();
    return result.data;
}

// ======================================
// 2. LẤY DANH SÁCH 60 PHIM ĐANG HOT 
// ======================================
export async function getTrendingMovies() {
    try {
        const movies = await fetchFromBackend("/trending");
        return (Array.isArray(movies) && movies.length > 0) ? movies : MOCK_TRENDING_MOVIES;
    } catch (error) {
        console.warn("Không kết nối được Backend proxy, dùng mock data:", error.message);
        return MOCK_TRENDING_MOVIES;
    }
}

// ======================================
// 3. LẤY CHI TIẾT PHIM 
// ======================================
export async function getMovieDetails(movieId) {
    const id = validateMovieId(movieId);
    const mockMovie = MOCK_TRENDING_MOVIES.find(m => m.id === id);

    try {
        const movie = await fetchFromBackend(`/${id}`);
        return movie || mockMovie || MOCK_TRENDING_MOVIES[0];
    } catch (error) {
        return mockMovie || MOCK_TRENDING_MOVIES[0];
    }
}

// ======================================
// 4. LẤY DIỄN VIÊN 
// ======================================
export async function getMovieCredits(movieId) {
    const id = validateMovieId(movieId);
    try {
        const credits = await fetchFromBackend(`/${id}/credits`);
        return credits || { cast: [], crew: [] };
    } catch (error) {
        return { cast: [], crew: [] };
    }
}

// ======================================
// 5. LẤY PHIM TƯƠNG TỰ
// ======================================
export async function getSimilarMovies(movieId) {
    const id = validateMovieId(movieId);
    try {
        const similar = await fetchFromBackend(`/${id}/similar`);
        return (Array.isArray(similar) && similar.length > 0) 
            ? similar 
            : MOCK_TRENDING_MOVIES.filter(m => m.id !== id);
    } catch (error) {
        return MOCK_TRENDING_MOVIES.filter(m => m.id !== id);
    }
}

// ======================================
// 6. LẤY TRAILER YOUTUBE 
// ======================================
export async function getMovieTrailer(movieId) {
    const id = validateMovieId(movieId);
    try {
        const trailerUrl = await fetchFromBackend(`/${id}/trailer`);
        return trailerUrl || null;
    } catch (error) {
        return null;
    }
}