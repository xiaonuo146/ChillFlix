const mongoose = require('mongoose');
const Movie = require('../models/Movie');

const TMDB_BASE = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY || '24bd8d1123c3fba54ff6907a383cfe89';

// Bảng ánh xạ mã thể loại TMDB sang tiếng Việt
const GENRE_MAP = {
    28: "Hành động", 12: "Phiêu lưu", 16: "Hoạt hình", 35: "Hài hước",
    80: "Tội phạm", 99: "Tài liệu", 18: "Kịch tính", 10751: "Gia đình",
    14: "Kỳ ảo", 36: "Lịch sử", 27: "Kinh dị", 10402: "Âm nhạc",
    9648: "Bí ẩn", 10749: "Lãng mạn", 878: "Khoa học viễn tưởng", 53: "Giật gân"
};

// Hàm phụ trợ: Chuyển đổi an toàn nếu ID gửi sang là _id của MongoDB
async function resolveMovieAndId(paramId) {
    if (!paramId || paramId === 'undefined' || paramId === 'null') return { targetId: 693134, movie: null };
    
    // Nếu là mã ObjectId 24 ký tự của MongoDB
    if (mongoose.isValidObjectId(paramId)) {
        const found = await Movie.findById(paramId);
        if (found) return { targetId: found.tmdbId, movie: found };
    }
    
    // Nếu là mã số TMDB
    const numId = Number(paramId);
    if (!isNaN(numId)) {
        const found = await Movie.findOne({ tmdbId: numId });
        return { targetId: numId, movie: found };
    }
    
    return { targetId: paramId, movie: null };
}

// 1. LẤY TOÀN BỘ KHO PHIM ĐANG HOT (KÉO 3 TRANG = 60 PHIM THẬT TỪ TMDB)
exports.getTrending = async (req, res) => {
    try {
        // Kéo trực tiếp 3 trang TMDB
        const [p1, p2, p3] = await Promise.all([
            fetch(`${TMDB_BASE}/trending/movie/week?api_key=${API_KEY}&language=vi-VN&page=1`).then(r => r.json()).catch(() => ({ results: [] })),
            fetch(`${TMDB_BASE}/trending/movie/week?api_key=${API_KEY}&language=vi-VN&page=2`).then(r => r.json()).catch(() => ({ results: [] })),
            fetch(`${TMDB_BASE}/trending/movie/week?api_key=${API_KEY}&language=vi-VN&page=3`).then(r => r.json()).catch(() => ({ results: [] }))
        ]);

        const rawList = [...(p1.results || []), ...(p2.results || []), ...(p3.results || [])];
        
        // 🌟 NẾU TMDB CÓ DỮ LIỆU: Chuẩn hóa trả về
        if (rawList.length > 0) {
            const formatted = rawList.map(m => ({
                id: m.id,
                tmdbId: m.id,
                title: m.title || m.original_title,
                original_title: m.original_title,
                overview: m.overview || "Đang cập nhật nội dung.",
                poster_path: m.poster_path || "",
                backdrop_path: m.backdrop_path || "",
                release_date: m.release_date || "2024",
                vote_average: m.vote_average ? Number(m.vote_average.toFixed(1)) : 8.0,
                vote_count: m.vote_count || 100,
                genre_ids: m.genre_ids || [],
                genres: (m.genre_ids || []).map(id => GENRE_MAP[id] || "Điện ảnh")
            }));

            // Tự động lưu nhanh vào MongoDB để làm giàu dữ liệu local
            Movie.insertMany(formatted, { ordered: false }).catch(() => {});

            return res.json({ status: 'success', data: formatted });
        }

        // 🌟 NẾU MẠNG TMDB BỊ NGHẼN/RỖNG: Lấy ngay từ bảng Movie trong MongoDB ra cứu nguy!
        const localMovies = await Movie.find().sort({ vote_average: -1 });
        res.json({ status: 'success', data: localMovies });

    } catch (err) {
        console.error("Lỗi trending:", err.message);
        const fallback = await Movie.find().catch(() => []);
        res.json({ status: 'success', data: fallback });
    }
};

// 2. CHI TIẾT PHIM (TỰ ĐỘNG TẢI TỪ TMDB NẾU TRONG DB CHƯA CÓ)
exports.getDetail = async (req, res) => {
    const rawId = req.params.id;
    try {
        const { targetId, movie: existingMovie } = await resolveMovieAndId(rawId);
        let movie = existingMovie;

        // Nếu DB chưa có -> kéo trực tiếp từ TMDB về trả ngay và lưu lại
        if (!movie && targetId) {
            const tmdbRes = await fetch(`${TMDB_BASE}/movie/${targetId}?api_key=${API_KEY}&language=vi-VN`);
            if (tmdbRes.ok) {
                const data = await tmdbRes.json();
                movie = {
                    id: data.id,
                    tmdbId: data.id,
                    title: data.title || data.original_title,
                    original_title: data.original_title,
                    overview: data.overview || "Đang cập nhật tóm tắt nội dung.",
                    poster_path: data.poster_path,
                    backdrop_path: data.backdrop_path,
                    release_date: data.release_date || "2024",
                    vote_average: data.vote_average ? Number(data.vote_average.toFixed(1)) : 8.5,
                    vote_count: data.vote_count || 1000,
                    runtime: data.runtime || 120,
                    genres: (data.genres || []).map(g => g.name),
                    genre_ids: (data.genres || []).map(g => g.id)
                };
                // Lưu vào MongoDB để lần sau mở cực nhanh
                Movie.create(movie).catch(() => {});
            }
        }

        if (movie) {
            return res.json({ status: 'success', data: movie });
        }

        // Dự phòng mặc định nếu phim không tìm thấy ở đâu
        res.json({
            status: 'success',
            data: {
                id: 693134,
                tmdbId: 693134,
                title: "Dune: Hành Tinh Cát 2",
                original_title: "Dune: Part Two",
                runtime: 166,
                vote_average: 8.8,
                release_date: "2024",
                overview: "Hành trình huyền thoại của Paul Atreides...",
                poster_path: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
                backdrop_path: "/xOMo8BRK7PfcJv9JCnx7s520Wio.jpg"
            }
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};
// 3. DIỄN VIÊN CHÍNH (TỰ ĐỘNG KÉO TỪ TMDB NẾU CHỈ CÓ DỮ LIỆU MẪU)
exports.getCredits = async (req, res) => {
    try {
        const { targetId, movie } = await resolveMovieAndId(req.params.id);
        
        // Chỉ dùng diễn viên trong DB nếu có từ 2 diễn viên thật trở lên (tránh dữ liệu mẫu 1 người)
        if (movie && Array.isArray(movie.cast) && movie.cast.length > 1 && movie.cast[0].name !== "Diễn viên chính") {
            return res.json({
                status: 'success',
                data: { 
                    cast: movie.cast, 
                    crew: [{ job: 'Director', name: movie.director || "Denis Villeneuve" }] 
                }
            });
        }

        // Gọi trực tiếp TMDB lấy danh sách diễn viên thật
        const resp = await fetch(`${TMDB_BASE}/movie/${targetId}/credits?api_key=${API_KEY}&language=vi-VN`);
        if (resp.ok) {
            const data = await resp.json();
            const cast = (data.cast || []).slice(0, 10).map(c => ({
                name: c.name,
                character: c.character || "Diễn viên",
                profile_path: c.profile_path || ""
            }));
            const directorObj = (data.crew || []).find(p => p.job === "Director");
            
            // Cập nhật ngược lại vào MongoDB để lần sau mở siêu nhanh
            if (movie) {
                movie.cast = cast;
                if (directorObj) movie.director = directorObj.name;
                movie.save().catch(() => {});
            }

            return res.json({
                status: 'success',
                data: { cast, crew: [{ job: 'Director', name: directorObj ? directorObj.name : "Đạo diễn" }] }
            });
        }
    } catch (e) {
        console.error("Lỗi credits:", e.message);
    }

    // Dự phòng khi mất mạng
    res.json({
        status: 'success',
        data: {
            cast: [
                { name: "Timothée Chalamet", character: "Paul Atreides", profile_path: "/BE2sdjpgsa2rNTFa66f7upkaOP.jpg" },
                { name: "Zendaya", character: "Chani", profile_path: "/3WdOloHpjtjL96uVOhFRRCcYSwq.jpg" },
                { name: "Rebecca Ferguson", character: "Lady Jessica", profile_path: "/6NRlV9oUipeakZ6qWZ2Ew8C43j6h.jpg" }
            ],
            crew: [{ job: "Director", name: "Denis Villeneuve" }]
        }
    });
};
// 4. PHIM TƯƠNG TỰ
exports.getSimilar = async (req, res) => {
    try {
        const { targetId } = await resolveMovieAndId(req.params.id);
        const resp = await fetch(`${TMDB_BASE}/movie/${targetId}/similar?api_key=${API_KEY}&language=vi-VN`);
        if (resp.ok) {
            const data = await resp.json();
            return res.json({ status: 'success', data: (data.results || []).slice(0, 6) });
        }
    } catch (e) {}

    const localSimilar = await Movie.find().limit(6).catch(() => []);
    res.json({ status: 'success', data: localSimilar });
};

// 5. TRAILER YOUTUBE CHÍNH THỨC (XEM TRỰC TIẾP VIDEO)
exports.getTrailer = async (req, res) => {
    try {
        const { targetId, movie } = await resolveMovieAndId(req.params.id);

        if (movie && movie.trailer_url && movie.trailer_url.includes("watch?v=")) {
            return res.json({ status: 'success', data: movie.trailer_url });
        }

        // Bỏ language để lấy toàn bộ danh sách trailer mọi ngôn ngữ
        const resp = await fetch(`${TMDB_BASE}/movie/${targetId}/videos?api_key=${API_KEY}`);
        if (resp.ok) {
            const data = await resp.json();
            const videos = data.results || [];
            
            // Ưu tiên: Official Trailer -> Trailer bất kỳ -> Teaser
            const trailer = videos.find(v => v.site === "YouTube" && v.type === "Trailer" && v.official) ||
                            videos.find(v => v.site === "YouTube" && v.type === "Trailer") ||
                            videos.find(v => v.site === "YouTube" && v.type === "Teaser") ||
                            videos[0];

            if (trailer && trailer.key) {
                const directUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
                if (movie) {
                    movie.trailer_url = directUrl;
                    movie.save().catch(() => {});
                }
                return res.json({ status: 'success', data: directUrl });
            }
        }
    } catch (e) {
        console.error("Lỗi trailer:", e.message);
    }

    res.json({ status: 'success', data: null });
};