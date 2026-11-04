
document.addEventListener("DOMContentLoaded", () => {
    // Dữ liệu mẫu để kiểm tra giao diện
    const movie = {
        id: 693134,
        title: "Dune: Hành Tinh Cát - Phần Hai",
        rating: 8.8,
        year: 2024,
        runtime: 166,
        overview:
            "Paul Atreides tiếp tục hành trình trên hành tinh Arrakis, " +
            "đồng hành cùng người Fremen để đối mặt với những thử thách mới.",
        poster:
            "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
        trailer:
            "https://www.youtube.com/watch?v=Way9Dexny3w"
    };

    // Hiển thị thông tin phim
    document.getElementById("movieTitle").textContent = movie.title;
    document.getElementById("bookingMovieTitle").textContent = movie.title;
    document.getElementById("movieRating").textContent =
        "★ " + movie.rating + "/10";
    document.getElementById("movieYear").textContent =
        movie.year;
    document.getElementById("movieRuntime").textContent =
        movie.runtime + " phút";
    document.getElementById("movieOverview").textContent =
        movie.overview;

    const poster = document.getElementById("moviePoster");
    poster.src = movie.poster;
    poster.alt = movie.title;

    // Nút xem trailer
    document.getElementById("watchTrailer").addEventListener("click", () => {
        window.open(movie.trailer, "_blank", "noopener,noreferrer");
    });

    // Không cho chọn ngày trong quá khứ
    const dateInput = document.getElementById("bookingDate");
    const now = new Date();
    const localDate = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0")
    ].join("-");

    dateInput.min = localDate;
    dateInput.value = localDate;

    // Chuyển sang trang đặt phòng
    document.getElementById("findRoom").addEventListener("click", () => {
        const params = new URLSearchParams({
            movieId: String(movie.id),
            date: dateInput.value,
            roomType: document.getElementById("roomType").value
        });

        window.location.href = "booking.html?" + params.toString();
    });
 
    // ===== DANH SÁCH DIỄN VIÊN =====
    const cast = [
        { name: "Timothée Chalamet", role: "Paul Atreides" },
        { name: "Zendaya", role: "Chani" },
        { name: "Rebecca Ferguson", role: "Lady Jessica" },
        { name: "Javier Bardem", role: "Stilgar" }
    ];

    const castContainer = document.getElementById("movieCast");

    cast.forEach(actor => {
        const card = document.createElement("div");
        card.className = "cast-card";

        const name = document.createElement("h3");
        name.textContent = actor.name;

        const role = document.createElement("p");
        role.textContent = actor.role;

        card.append(name, role);
        castContainer.appendChild(card);
    });

    // ===== DANH SÁCH PHIM TƯƠNG TỰ (DỮ LIỆU MẪU) =====
    const similarMovies = [
        { id: 438631, title: "Dune: Part One" },
        { id: 157336, title: "Interstellar" },
        { id: 27205, title: "Inception" },
        { id: 335984, title: "Blade Runner 2049" }
    ];

    const similarContainer = document.getElementById("similarMovies");

    similarMovies.forEach(item => {
        const card = document.createElement("a");
        card.className = "similar-card";
        card.href = "movie-detail.html?id=" + encodeURIComponent(item.id);
        card.textContent = item.title;
        similarContainer.appendChild(card);
    });
   
});
