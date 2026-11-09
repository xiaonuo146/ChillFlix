require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Room = require('../models/Room');
const MenuItem = require('../models/MenuItem');
const PromoCode = require('../models/PromoCode');
const Booking = require('../models/Booking');
const Movie = require('../models/Movie');

// KHO PHIM RẠP BOM TẤN CHUẨN TMDB SẴN CÓ
const CURATED_MOVIES = [
    {
        tmdbId: 693134,
        title: "Dune: Hành Tinh Cát - Phần Hai",
        original_title: "Dune: Part Two",
        overview: "Hành trình huyền thoại của Paul Atreides khi anh hội ngộ cùng Chani và tộc người Fremen trên sa mạc cằn cỗi Arrakis...",
        poster_path: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
        backdrop_path: "/xOMo8BRK7PfcJv9JCnx7s520Wio.jpg",
        release_date: "2024-03-01",
        vote_average: 8.8,
        vote_count: 12420,
        runtime: 166,
        genres: ["Khoa học viễn tưởng", "Hành động", "Phiêu lưu"],
        trailer_url: "https://www.youtube.com/watch?v=Way9Dexny3w",
        director: "Denis Villeneuve",
        cast: [
            { name: "Timothée Chalamet", character: "Paul Atreides", profile_path: "/BE2sdjpgsa2rNTFa66f7upkaOP.jpg" },
            { name: "Zendaya", character: "Chani", profile_path: "/3WdOloHpjtjL96uVOhFRRCcYSwq.jpg" },
            { name: "Rebecca Ferguson", character: "Lady Jessica", profile_path: "/6NRlV9oUipeakZ6qWZ2Ew8C43j6h.jpg" },
            { name: "Austin Butler", character: "Feyd-Rautha", profile_path: "/20bWpXg7rM6N80v4K5Gj1J0n0Wq.jpg" }
        ]
    },
    {
        tmdbId: 872585,
        title: "Oppenheimer",
        original_title: "Oppenheimer",
        overview: "Câu chuyện về nhà vật lý lý thuyết người Mỹ J. Robert Oppenheimer, người đóng vai trò then chốt trong Dự án Manhattan...",
        poster_path: "/ptpr0kGAckfQkJeJIt8st5d4vdq.jpg",
        backdrop_path: "/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
        release_date: "2023-07-21",
        vote_average: 8.6,
        vote_count: 9800,
        runtime: 180,
        genres: ["Lịch sử", "Kịch tính"],
        trailer_url: "https://www.youtube.com/watch?v=uYPbbksJxIg",
        director: "Christopher Nolan",
        cast: [
            { name: "Cillian Murphy", character: "J. Robert Oppenheimer", profile_path: "/360kbfExAYnvN7V5i50A1fO45o5.jpg" },
            { name: "Emily Blunt", character: "Katherine Oppenheimer", profile_path: "/5Gsmkg0jT1eA9uE6RzZqZqO0Wq.jpg" },
            { name: "Robert Downey Jr.", character: "Lewis Strauss", profile_path: "/5qHNjhtjMD4YWH3vi0lZqG1A1yP.jpg" }
        ]
    },
    {
        tmdbId: 1022789,
        title: "Những Mảnh Ghép Cảm Xúc 2",
        original_title: "Inside Out 2",
        overview: "Riley bước vào tuổi dậy thì với những cảm xúc mới toanh xuất hiện tại trung tâm đầu não...",
        poster_path: "/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg",
        backdrop_path: "/stKGOmPAgTo5hJ7789xEjxPvIOv.jpg",
        release_date: "2024-06-14",
        vote_average: 8.0,
        vote_count: 4500,
        runtime: 96,
        genres: ["Hoạt hình", "Gia đình", "Hài"],
        trailer_url: "https://www.youtube.com/watch?v=LEjhY15eCx0",
        director: "Kelsey Mann",
        cast: [
            { name: "Amy Poehler", character: "Joy (Vui Vẻ)", profile_path: "/r13Fv3P2b8M9W1Y2Z3A4B5C6D7.jpg" },
            { name: "Maya Hawke", character: "Anxiety (Lo Âu)", profile_path: "/k7l8m9n0o1p2q3r4s5t6u7v8.jpg" }
        ]
    },
    {
        tmdbId: 569094,
        title: "Spider-Man: Du Hành Vũ Trụ Nhện",
        original_title: "Spider-Man: Across the Spider-Verse",
        overview: "Miles Morales tái xuất trong cuộc phiêu lưu xuyên đa vũ trụ cùng Gwen Stacy...",
        poster_path: "/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
        backdrop_path: "/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg",
        release_date: "2023-06-02",
        vote_average: 8.4,
        vote_count: 6200,
        runtime: 140,
        genres: ["Hoạt hình", "Hành động", "Khoa học viễn tưởng"],
        trailer_url: "https://www.youtube.com/watch?v=cqGjhVJWtEg",
        director: "Joaquim Dos Santos",
        cast: [
            { name: "Shameik Moore", character: "Miles Morales", profile_path: "/2v1W1Y2Z3A4B5C6D7E8F9G0H1.jpg" },
            { name: "Hailee Steinfeld", character: "Gwen Stacy", profile_path: "/7x7yQ3V1qJ5Gk2l5y2W0v8M3.jpg" }
        ]
    },
    {
        tmdbId: 1011985,
        title: "Kung Fu Panda 4",
        original_title: "Kung Fu Panda 4",
        overview: "Gấu Po được chọn trở thành Thủ lĩnh Tinh thần của Thung lũng Bình Yên và phải tìm kiếm một Chiến binh Rồng mới...",
        poster_path: "/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg",
        backdrop_path: "/1XDDXPXGiI8id7MrUxK26ke7Wus.jpg",
        release_date: "2024-03-08",
        vote_average: 7.1,
        vote_count: 2800,
        runtime: 94,
        genres: ["Hoạt hình", "Hành động", "Gia đình"],
        trailer_url: "https://www.youtube.com/watch?v=_inKs4eeHiI",
        director: "Mike Mitchell",
        cast: [{ name: "Jack Black", character: "Po (Voice)", profile_path: "/rtCxbf0Nmip6laa4Z0s9p9Wq0.jpg" }]
    },
    {
        tmdbId: 823464,
        title: "Godzilla x Kong: Đế Chế Mới",
        original_title: "Godzilla x Kong: The New Empire",
        overview: "Godzilla và Kong phải bắt tay nhau để chống lại một mối đe dọa khổng lồ ẩn sâu trong Trái Đất Rỗng...",
        poster_path: "/bQ2ywkchCe02epGFLWYAYgV87y8.jpg",
        backdrop_path: "/qrGtVF3YZvSVZwkr5e4kWXyuIXV.jpg",
        release_date: "2024-03-29",
        vote_average: 7.2,
        vote_count: 3400,
        runtime: 115,
        genres: ["Hành động", "Khoa học viễn tưởng", "Phiêu lưu"],
        trailer_url: "https://www.youtube.com/watch?v=lV1OOlGwExg",
        director: "Adam Wingard",
        cast: [{ name: "Rebecca Hall", character: "Dr. Ilene Andrews", profile_path: "/2v1W1Y2Z3A4B5C6D7E8F9G0H1.jpg" }]
    }
];

const seedData = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔄 Đang đồng bộ CSDL...');

    // Làm sạch bảng phim, phòng, menu, voucher, user
    await Promise.all([
        User.deleteMany({}),
        Room.deleteMany({}),
        MenuItem.deleteMany({}),
        PromoCode.deleteMany({}),
        Booking.deleteMany({}),
        Movie.deleteMany({}) // Xóa phim cũ để nạp mới
    ]);

    // 1. Nạp danh sách phim vào MongoDB
    let moviesToInsert = CURATED_MOVIES;
    const apiKey = process.env.TMDB_API_KEY;

    // Nếu có mạng và có key TMDB -> Kéo thêm phim thật về bổ sung
    if (apiKey) {
        try {
            console.log('🌐 Đang kết nối TMDB API kéo thêm phim mới...');
            const res = await fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}&language=vi-VN`);
            if (res.ok) {
                const data = await res.json();
                const fetchedMovies = (data.results || []).map(m => ({
                    tmdbId: m.id,
                    title: m.title || m.original_title,
                    original_title: m.original_title,
                    overview: m.overview || "Đang cập nhật tóm tắt nội dung.",
                    poster_path: m.poster_path,
                    backdrop_path: m.backdrop_path,
                    release_date: m.release_date || "2024",
                    vote_average: m.vote_average || 8.0,
                    vote_count: m.vote_count || 100,
                    runtime: 120,
                    genres: ["Chiếu rạp", "Hành động"],
                    trailer_url: `https://www.youtube.com/results?search_query=trailer+movie+${m.id}`,
                    director: "Đạo diễn Quốc Tế",
                    cast: [{ name: "Diễn viên chính", character: "Nhân vật chính", profile_path: "" }]
                }));

                // Gộp phim đã chuẩn bị và phim vừa kéo về (lọc trùng lặp)
                const map = new Map();
                [...CURATED_MOVIES, ...fetchedMovies].forEach(item => map.set(item.tmdbId, item));
                moviesToInsert = Array.from(map.values());
            }
        } catch (e) {
            console.warn('⚠️ Mạng TMDB chậm, sử dụng kho phim có sẵn trong hệ thống.');
        }
    }

    await Movie.insertMany(moviesToInsert);
    console.log(`🎬 Đã nạp thành công ${moviesToInsert.length} bộ phim vào MongoDB!`);

    // 2. Nạp 4 phòng chiếu
    await Room.insertMany([
        { roomId: 'couple_a', name: 'Phòng Couple A - Tiêu Chuẩn Velvet', category: 'couple', capacityMax: 2, pricePerHour: 120000, cleanStatus: 'ready', isActive: true },
        { roomId: 'couple_b', name: 'Phòng Couple B - Phong Cách Scandinavia', category: 'couple', capacityMax: 2, pricePerHour: 120000, cleanStatus: 'ready', isActive: true },
        { roomId: 'group4', name: 'Phòng Nhóm 4 - Apollo Lounge', category: 'group', capacityMax: 6, pricePerHour: 180000, cleanStatus: 'ready', isActive: true },
        { roomId: 'vip', name: 'Phòng Laser 4K Family Suite (VIP)', category: 'vip', capacityMax: 12, pricePerHour: 350000, cleanStatus: 'ready', isActive: true }
    ]);

    // 3. Nạp Voucher
    await PromoCode.insertMany([
        { code: 'PHIM20', discountType: 'percent', discountValue: 20, appliesTo: 'room' },
        { code: 'CHILL10', discountType: 'percent', discountValue: 10, appliesTo: 'total', validFromHour: 21 },
        { code: 'FNBCOUPLE', discountType: 'fixed', discountValue: 45000, appliesTo: 'fnb', requiredRoomCategory: 'couple' }
    ]);

    // 4. Nạp User Khách & Admin (Bắt đầu từ số 0)
    await User.create({
        fullName: 'Trần Văn An',
        email: 'khachhang@chillflix.vn',
        phone: '0912345678',
        passwordHash: '123',
        role: 'customer',
        rank: 'Thành viên Mới',
        points: 0,
        claimedVouchers: []
    });

    await User.create({
        fullName: 'Trần Minh Đạt (Quản Lý Rạp)',
        email: 'admin@chillflix.vn',
        phone: '0988234567',
        passwordHash: 'admin',
        role: 'admin',
        rank: 'Quản Trị Viên',
        points: 0
    });

    console.log('✅ ĐỒNG BỘ DỮ LIỆU THÀNH CÔNG! SẴN SÀNG CHẠY APP.');
    process.exit(0);
};

seedData().catch(e => { console.error(e); process.exit(1); });