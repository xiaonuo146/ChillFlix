import { CONFIG } from './config.js';

// Dữ liệu mẫu chuẩn tiếng Việt theo mockup CineNest
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

// Lấy danh sách phim đang hot
export async function getTrendingMovies() {
    if (!CONFIG.TMDB_API_KEY || CONFIG.TMDB_API_KEY === 'YOUR_TMDB_API_KEY_HERE') {
        console.info("⚡ Đang sử dụng Mock Data do chưa cấu hình TMDB_API_KEY.");
        return new Promise(resolve => setTimeout(() => resolve(MOCK_TRENDING_MOVIES), 300));
    }

    try {
        // Gọi trực tiếp TMDB API với ngôn ngữ tiếng Việt
        const res = await fetch(
            `${CONFIG.TMDB_BASE_URL}/trending/movie/week?api_key=${CONFIG.TMDB_API_KEY}&language=${CONFIG.DEFAULT_LANG}`
        );
        if (!res.ok) throw new Error(`Lỗi TMDB: ${res.status}`);
        const data = await res.json();
        return data.results;
    } catch (err) {
        console.error("Lỗi kết nối TMDB, tự động đổi sang Mock data:", err);
        return MOCK_TRENDING_MOVIES;
    }
}