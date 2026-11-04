
import {
    getMovieDetails,
    getMovieCredits,
    getSimilarMovies,
    getMovieTrailer
} from "../../../js/api.js";

// ==========================================
// DỮ LIỆU DIỄN VIÊN MẪU
// Dùng khi nhóm chưa có TMDB API key
// ==========================================
const MOCK_CAST = {
    693134: [
        {
            name: "Timothée Chalamet",
            character: "Paul Atreides",
            profile_path: "/BE2sdjpgsa2rNTFa66f7upkaOP.jpg"
        },
        {
            name: "Zendaya",
            character: "Chani",
            profile_path: "/3WdOloHpjtjL96uVOhFRRCcYSwq.jpg"
        },
        {
            name: "Rebecca Ferguson",
            character: "Lady Jessica",
            profile_path: "/6NRlV9oUipeakZ6qWZ2Ew8C43j6h.jpg"
        },
        {
            name: "Javier Bardem",
            character: "Stilgar",
            profile_path: "/oifhfVhUcuDjE61V5bS5dfShQrm.jpg"
        }
    ],
    872585: [
        {
            name: "Cillian Murphy",
            character: "J. Robert Oppenheimer",
            profile_path: null
        },
        {
            name: "Emily Blunt",
            character: "Kitty Oppenheimer",
            profile_path: null
        },
        {
            name: "Robert Downey Jr.",
            character: "Lewis Strauss",
            profile_path: null
        },
        {
            name: "Florence Pugh",
            character: "Jean Tatlock",
            profile_path: null
        }
    ],
    1022789: [
        {
            name: "Amy Poehler",
            character: "Joy (lồng tiếng)",
            profile_path: null
        },
        {
            name: "Maya Hawke",
            character: "Anxiety (lồng tiếng)",
            profile_path: null
        }
    ]
};

// Chuyển đường dẫn ảnh TMDB thành URL đầy đủ
function getTMDBImage(path, size = "w500") {
    if (!path) return "";
    return `https://image.tmdb.org/t/p/${size}${path}`;
}

// ==========================================
// HIỂN THỊ DIỄN VIÊN
// ==========================================
function renderCast(container, cast) {
    container.replaceChildren();

    if (!cast.length) {
        container.textContent = "Diễn viên đang cập nhật.";
        return;
    }

    cast.forEach(actor => {
        const card = document.createElement("div");
        card.className = "cast-card";

        const image = document.createElement("img");
        image.className = "cast-card__image";
        image.alt = actor.name || "Diễn viên";
        image.loading = "lazy";

        if (actor.profile_path) {
            image.src = getTMDBImage(
                actor.profile_path,
                "w185"
            );
        } else {
            image.style.display = "none";
        }

        image.onerror = () => {
            image.style.display = "none";
        };

        const info = document.createElement("div");
        info.className = "cast-card__info";

        const name = document.createElement("h3");
        name.textContent = actor.name || "Đang cập nhật";

        const role = document.createElement("p");
        role.textContent =
            actor.character || actor.role || "Diễn viên";

        info.append(name, role);
        card.append(image, info);
        container.appendChild(card);
    });
}

// ==========================================
// HIỂN THỊ PHIM TƯƠNG TỰ
// ==========================================
function renderSimilarMovies(container, movies) {
    container.replaceChildren();

    if (!movies.length) {
        container.textContent = "Chưa có phim gợi ý.";
        return;
    }

    movies.forEach(movie => {
        const card = document.createElement("a");
        card.className = "similar-card";
        card.href =
            "movie-detail.html?id=" +
            encodeURIComponent(movie.id);

        const poster = document.createElement("img");
        poster.className = "similar-card__poster";
        poster.alt = "Poster " + movie.title;
        poster.loading = "lazy";

        if (movie.poster_path) {
            poster.src = getTMDBImage(
                movie.poster_path,
                "w342"
            );
        } else {
            poster.style.display = "none";
        }

        poster.onerror = () => {
            poster.style.display = "none";
        };

        const info = document.createElement("div");
        info.className = "similar-card__info";

        const title = document.createElement("h3");
        title.textContent = movie.title || "Chưa có tên";

        info.appendChild(title);

        if (movie.vote_average != null) {
            const rating = document.createElement("p");
            rating.className = "similar-card__rating";
            rating.textContent =
                "★ " +
                Number(movie.vote_average).toFixed(1) +
                "/10";

            info.appendChild(rating);
        }

        card.append(poster, info);
        container.appendChild(card);
    });
}

// ==========================================
// CHẠY TRANG CHI TIẾT PHIM
// ==========================================
document.addEventListener("DOMContentLoaded", async () => {

    // 1. Lấy các phần tử HTML
    const movieTitle = document.getElementById("movieTitle");
    const bookingMovieTitle =
        document.getElementById("bookingMovieTitle");

    const movieRating = document.getElementById("movieRating");
    const movieYear = document.getElementById("movieYear");
    const movieRuntime = document.getElementById("movieRuntime");
    const movieOverview = document.getElementById("movieOverview");
    const moviePoster = document.getElementById("moviePoster");

    const watchTrailer = document.getElementById("watchTrailer");
    const bookingDate = document.getElementById("bookingDate");
    const roomType = document.getElementById("roomType");
    const findRoom = document.getElementById("findRoom");

    const movieCast = document.getElementById("movieCast");
    const similarMovies = document.getElementById("similarMovies");
    const movieHero = document.querySelector(".movie-hero");

    // 2. Lấy ID phim từ URL
    const params = new URLSearchParams(window.location.search);
    const movieId = params.get("id") || "693134";

    // 3. Thiết lập ngày chiếu mặc định
    const today = new Date();

    const todayString = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");

    bookingDate.min = todayString;
    bookingDate.value = todayString;

    findRoom.disabled = true;

    try {
        // 4. Lấy dữ liệu phim
        const movie = await getMovieDetails(movieId);

        // 5. Hiển thị thông tin
        movieTitle.textContent =
            movie.title || "Chưa có tên phim";

        bookingMovieTitle.textContent =
            movie.title || "Chưa có tên phim";

        movieRating.textContent =
            "★ " +
            Number(movie.vote_average || 0).toFixed(1) +
            "/10";

        movieYear.textContent = movie.release_date
            ? movie.release_date.substring(0, 4)
            : "Chưa rõ năm";

        movieRuntime.textContent = movie.runtime
            ? movie.runtime + " phút"
            : "Đang cập nhật";

        movieOverview.textContent =
            movie.overview ||
            "Chưa có nội dung giới thiệu phim.";

        // 6. Hiển thị poster
        if (movie.poster_path) {
            moviePoster.src = getTMDBImage(
                movie.poster_path,
                "w500"
            );
        } else {
            moviePoster.removeAttribute("src");
        }

        moviePoster.alt = "Poster phim " + movie.title;

        // 7. Hiển thị backdrop
        if (movieHero && movie.backdrop_path) {
            const backdropUrl = getTMDBImage(
                movie.backdrop_path,
                "original"
            );

            movieHero.style.backgroundImage = `
                linear-gradient(
                    90deg,
                    rgba(16, 13, 22, 0.92) 0%,
                    rgba(16, 13, 22, 0.78) 45%,
                    rgba(16, 13, 22, 0.50) 100%
                ),
                linear-gradient(
                    0deg,
                    rgba(16, 13, 22, 1) 0%,
                    rgba(16, 13, 22, 0) 45%
                ),
                url("${backdropUrl}")
            `;
        }

     
        // 8. Xử lý nút xem trailer
        watchTrailer.disabled = true;
        watchTrailer.textContent = "Đang tìm trailer...";

        // Lấy trailer mà không làm chậm chức năng đặt phòng
        getMovieTrailer(movie.id)
            .then(trailerUrl => {
                if (trailerUrl) {
                    watchTrailer.disabled = false;
                    watchTrailer.textContent = "▶ Xem trailer";

                    watchTrailer.addEventListener("click", () => {
                        window.open(
                            trailerUrl,
                            "_blank",
                            "noopener,noreferrer"
                        );
                    });
                } else {
                    watchTrailer.textContent = "Trailer đang cập nhật";
                }
            })
            .catch(error => {
                console.error("Lỗi trailer:", error);
                watchTrailer.textContent = "Trailer đang cập nhật";
            });


        // 9. Chuyển sang trang đặt phòng
        findRoom.disabled = false;

        findRoom.addEventListener("click", () => {
            if (!bookingDate.value) {
                alert("Vui lòng chọn ngày chiếu!");
                return;
            }

            const bookingParams = new URLSearchParams({
                movieId: String(movie.id),
                date: bookingDate.value,
                roomType: roomType.value
            });

            window.location.href =
                "booking.html?" + bookingParams.toString();
        });

        // 10. Lấy danh sách diễn viên
        let cast = await getMovieCredits(movie.id);

        // Nếu API chưa có dữ liệu, dùng dữ liệu mẫu
        if (!cast.length) {
            cast = MOCK_CAST[movie.id] || [];
        }

        renderCast(movieCast, cast);

        // 11. Lấy phim tương tự
        const recommendations =
            await getSimilarMovies(movie.id);

        const filteredMovies = recommendations.filter(
            item => Number(item.id) !== Number(movie.id)
        );

        renderSimilarMovies(
            similarMovies,
            filteredMovies
        );

    } catch (error) {
        console.error("Lỗi tải trang chi tiết phim:", error);

        movieTitle.textContent = "Không tải được phim";
        bookingMovieTitle.textContent = "Chưa xác định";
        movieOverview.textContent = error.message;

        movieCast.textContent = "";
        similarMovies.textContent = "";

        watchTrailer.disabled = true;
        findRoom.disabled = true;
    }
});
