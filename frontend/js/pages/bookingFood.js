/* ==========================================================================
   CHILLFLIX - BƯỚC 2: ĐỒ ĂN & THỨC UỐNG (ĐÃ TÍCH HỢP ẢNH THẬT SẴN CÓ)
   ========================================================================== */

// 1. DANH SÁCH THỰC ĐƠN CHUẨN MOCKUP 4 (KÈM ẢNH ĐỒ ĂN THẬT SẴN CÓ)
const menuItems = [
    // ===== COMBO ƯU ĐÃI =====
    {
        id: 1,
        name: "Combo Couple Cine",
        category: "combo",
        tag: "Bán chạy",
        description: "1 Bắp phô mai lớn + 2 Trà đào cam sả + Khăn ướt thơm",
        price: 99000,
        originalPrice: 125000,
        imageUrl: "https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 2,
        name: "Combo Bắp Nước Tiết Kiệm",
        category: "combo",
        tag: "Best Seller",
        description: "1 Bắp bơ lớn tự chọn vị + 1 Nước ngọt ướp lạnh",
        price: 75000,
        originalPrice: 95000,
        imageUrl: "https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 3,
        name: "Combo Party Nhóm 4",
        category: "combo",
        tag: "Nhóm 4 người",
        description: "2 Bắp mix lớn + 1 Nachos sốt phô mai + 4 Trà trái cây",
        price: 169000,
        originalPrice: 215000,
        imageUrl: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 4,
        name: "Combo Đêm Muộn Chill",
        category: "combo",
        tag: "Sau 21:00",
        description: "1 Khoai tây múi cau giòn nóng + 2 Trà hoa cúc mật ong ấm",
        price: 85000,
        originalPrice: 105000,
        imageUrl: "https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=600&q=80"
    },

    // ===== ĐỒ UỐNG PHA CHẾ =====
    {
        id: 5,
        name: "Trà Đào Cam Sả Ủ Lạnh",
        category: "drink",
        tag: "Bán chạy",
        description: "Vị trà thanh mát, đào ngâm giòn ngọt, thoảng hương sả tươi",
        price: 38000,
        imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 6,
        name: "Trà Sữa Bơ Nướng Cine",
        category: "drink",
        tag: "Hot Trend",
        description: "Trà Oolong nướng đậm vị quyện lớp kem bơ sánh mịn béo ngậy",
        price: 45000,
        imageUrl: "https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 7,
        name: "Cà Phê Muối Kem Béo",
        category: "drink",
        description: "Cà phê pha phin truyền thống phủ lớp kem muối mặn dịu",
        price: 35000,
        imageUrl: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 8,
        name: "Trà Hoa Cúc Mật Ong",
        category: "drink",
        tag: "Thư giãn",
        description: "Hoa cúc sấy lạnh kết hợp mật ong rừng giúp thư giãn tinh thần",
        price: 39000,
        imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 9,
        name: "Matcha Latte Kem Sữa",
        category: "drink",
        description: "Bột Matcha Nhật Bản đánh bông cùng sữa tươi thanh trùng",
        price: 42000,
        imageUrl: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 10,
        name: "Soda Việt Quất Bạc Hà",
        category: "drink",
        description: "Sảng khoái lăn tăn gas cùng mứt việt quất và lá bạc hà tươi",
        price: 38000,
        imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 11,
        name: "Coca-Cola / Sprite Tươi",
        category: "drink",
        description: "Lon 320ml ướp lạnh sâu kèm ly đá viên tinh khiết",
        price: 22000,
        imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80"
    },

    // ===== BẮP RANG & SNACK NÓNG =====
    {
        id: 12,
        name: "Bắp Phô Mai Caramel Mix",
        category: "food",
        tag: "Bán chạy",
        description: "Bắp nổ tươi tại chỗ, áo đều sốt caramel và bột phô mai béo thơm",
        price: 49000,
        imageUrl: "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 13,
        name: "Nachos Giòn & Sốt Phô Mai",
        category: "food",
        tag: "Mới",
        description: "Bánh ngô Mexico giòn tan chấm sốt phô mai ấm và salsa cà chua",
        price: 55000,
        imageUrl: "https://images.unsplash.com/photo-1582169296194-e4d644c48063?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 14,
        name: "Khoai Tây Múi Cau Thảo Mộc",
        category: "food",
        description: "Khoai tây nguyên vỏ chiên vàng giòn lắc lá hương thảo",
        price: 35000,
        imageUrl: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 15,
        name: "Gà Popcorn Chiên Giòn",
        category: "food",
        description: "Gà viên chiên nóng giòn rụm dùng kèm tương ớt mận",
        price: 59000,
        imageUrl: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 16,
        name: "Xúc Xích Đức Áp Chảo",
        category: "food",
        description: "Xúc xích xông khói khía mặt nướng thơm lừng kèm mù tạt mật ong",
        price: 39000,
        imageUrl: "https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&w=600&q=80"
    }
];

// 2. BẢNG TRA TÊN & ĐƠN GIÁ PHÒNG ĐỒNG BỘ TỪ BƯỚC 1
const ROOM_NAMES = {
    couple: "Nest Couple A",
    couple_a: "Nest Couple A",
    couple_b: "Nest Couple B",
    group4: "Nhóm 4 Sao Hỏa",
    vip: "Nhóm 10 Hành Tinh"
};

const ROOM_PRICES = {
    couple: 120000,
    couple_a: 120000,
    couple_b: 120000,
    group4: 180000,
    vip: 350000
};

// 3. ĐỌC DỮ LIỆU ĐẶT PHÒNG TỪ SESSIONSTORAGE
let bookingData = null;
try {
    const saved = sessionStorage.getItem("chillflixBooking");
    if (saved) bookingData = JSON.parse(saved);
} catch (err) {
    console.error("Lỗi đọc sessionStorage:", err);
}

const cart = {};
let currentCategory = "all";

// Khôi phục món đã chọn nếu khách quay lại trang này
if (bookingData && Array.isArray(bookingData.foods)) {
    bookingData.foods.forEach(item => {
        const id = Number(item.id);
        const qty = Number(item.quantity);
        if (menuItems.some(m => m.id === id) && qty > 0) {
            cart[id] = qty;
        }
    });
}

// 4. LẤY PHẦN TỬ DOM
const foodGrid = document.getElementById("foodGrid");
const foodSearch = document.getElementById("foodSearch");
const filterButtons = document.querySelectorAll(".food-filter");
const foodCategoryTitle = document.getElementById("foodCategoryTitle");
const foodResultCount = document.getElementById("foodResultCount");

const foodCartItems = document.getElementById("foodCartItems");
const foodCartCount = document.getElementById("foodCartCount");
const cartBadgeCount = document.getElementById("cartBadgeCount");
const fnbServiceNote = document.getElementById("fnbServiceNote");

const foodRoom = document.getElementById("foodRoom");
const foodRoomPrice = document.getElementById("foodRoomPrice");
const foodTotal = document.getElementById("foodTotal");
const foodSavings = document.getElementById("foodSavings");
const foodSavingRow = document.getElementById("foodSavingRow");
const foodGrandTotal = document.getElementById("foodGrandTotal");

const backToRoom = document.getElementById("backToRoom");
const continueToPayment = document.getElementById("continueToPayment");
const viewCombos = document.getElementById("viewCombos");

if (fnbServiceNote && bookingData?.fnbNote) {
    fnbServiceNote.value = bookingData.fnbNote;
}

// 5. HÀM TIỆN ÍCH ĐỊNH DẠNG
function formatMoney(amount) {
    return new Intl.NumberFormat("vi-VN").format(Number(amount) || 0) + "đ";
}

function getRoomPrice() {
    if (!bookingData) return 0;
    if (Number(bookingData.roomTotal) > 0) return Number(bookingData.roomTotal);
    const rate = ROOM_PRICES[bookingData.roomType] || 120000;
    return rate * (Number(bookingData.duration) || 2);
}

const roomPrice = getRoomPrice();

// 6. HIỂN THỊ DẢI TÓM TẮT PHÒNG ĐÃ CHỌN (CONTEXT STRIP)
function renderBookingContext() {
    const stripMovie = document.getElementById("stripMovie");
    const stripRoom = document.getElementById("stripRoom");
    const stripDate = document.getElementById("stripDate");
    const stripTime = document.getElementById("stripTime");
    const stripRoomPrice = document.getElementById("stripRoomPrice");

    if (!bookingData) {
        if (stripMovie) stripMovie.textContent = "Bạn đang xem Menu trước (Chưa chọn phòng)";
        if (stripRoom) stripRoom.textContent = "Chưa chọn";
        if (stripDate) stripDate.textContent = "--";
        if (stripTime) stripTime.textContent = "--";
        if (stripRoomPrice) stripRoomPrice.textContent = "0đ";
        if (foodRoom) foodRoom.textContent = "Chưa chọn phòng";
        if (continueToPayment) continueToPayment.textContent = "Chọn phòng chiếu trước ➔";
        return;
    }

    const rName = bookingData.roomName || ROOM_NAMES[bookingData.roomType] || "Phòng riêng";
    const dur = Number(bookingData.duration) || 2;

    if (stripMovie) stripMovie.textContent = bookingData.movieTitle || "Phim đã chọn";
    if (stripRoom) stripRoom.textContent = rName;
    if (stripDate) stripDate.textContent = bookingData.date || "--";
    if (stripTime) stripTime.textContent = `${bookingData.startTime || "--"} (${dur.toFixed(1)} giờ)`;
    if (stripRoomPrice) stripRoomPrice.textContent = formatMoney(roomPrice);
    if (foodRoom) foodRoom.textContent = rName;
}

// 7. HIỂN THỊ LƯỚI MÓN ĂN
function renderMenu() {
    const keyword = (foodSearch?.value || "").trim().toLocaleLowerCase("vi-VN");

    const filtered = menuItems.filter(item => {
        const matchCat = currentCategory === "all" || item.category === currentCategory;
        const matchKey =
            item.name.toLocaleLowerCase("vi-VN").includes(keyword) ||
            item.description.toLocaleLowerCase("vi-VN").includes(keyword);
        return matchCat && matchKey;
    });

    const titles = {
        all: "Tất cả thực đơn F&B",
        combo: "Combo Siêu Ưu Đãi",
        drink: "Đồ Uống Pha Chế Thủ Công",
        food: "Bắp Rang Nóng & Snack"
    };

    if (foodCategoryTitle) foodCategoryTitle.textContent = titles[currentCategory] || "Thực đơn";
    if (foodResultCount) foodResultCount.textContent = `Hiển thị ${filtered.length} món`;

    foodGrid.replaceChildren();

    if (filtered.length === 0) {
        foodGrid.innerHTML = `<p class="booking-hint">Không tìm thấy món ăn phù hợp với từ khóa "${foodSearch.value}".</p>`;
        return;
    }

    filtered.forEach(item => {
        const card = document.createElement("article");
        card.className = "food-card";

        // Huy hiệu giảm giá hoặc bán chạy
        let badgeHTML = "";
        if (item.originalPrice) {
            const saved = item.originalPrice - item.price;
            badgeHTML = `<span class="food-card-badge">Tiết kiệm ${formatMoney(saved)}</span>`;
        } else if (item.tag) {
            badgeHTML = `<span class="food-card-badge tag-hot">${item.tag}</span>`;
        }

        const oldPriceHTML = item.originalPrice
            ? `<span class="food-old-price">${formatMoney(item.originalPrice)}</span>`
            : "";

        card.innerHTML = `
            <div class="food-card-image">
                ${badgeHTML}
                <img src="${item.imageUrl}" alt="${item.name}" loading="lazy" />
            </div>
            <div class="food-card-content">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <div class="food-card-bottom">
                    <div class="food-price-box">
                        ${oldPriceHTML}
                        <strong class="food-price">${formatMoney(item.price)}</strong>
                    </div>
                    <button type="button" class="food-add-button" aria-label="Thêm ${item.name}">+</button>
                </div>
            </div>
        `;

        card.querySelector(".food-add-button").addEventListener("click", () => {
            cart[item.id] = (cart[item.id] || 0) + 1;
            renderCart();
            saveCartState();
        });

        foodGrid.appendChild(card);
    });
}

// 8. QUẢN LÝ GIỎ HÀNG & TÍNH TIỀN
function getSelectedFoods() {
    return menuItems
        .filter(item => (cart[item.id] || 0) > 0)
        .map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: cart[item.id]
        }));
}

function renderCart() {
    foodCartItems.replaceChildren();
    const selected = getSelectedFoods();
    const totalQty = selected.reduce((sum, i) => sum + i.quantity, 0);

    if (foodCartCount) foodCartCount.textContent = `${totalQty} món`;
    if (cartBadgeCount) cartBadgeCount.textContent = String(totalQty);

    if (selected.length === 0) {
        foodCartItems.innerHTML = `<p class="booking-hint">Bạn chưa chọn món nào (Có thể bấm tiếp tục nếu chỉ thuê phòng).</p>`;
    } else {
        selected.forEach(item => {
            const row = document.createElement("div");
            row.className = "food-cart-item";
            row.innerHTML = `
                <div class="food-cart-item-info">
                    <strong>${item.name}</strong>
                    <small>${formatMoney(item.price * item.quantity)}</small>
                </div>
                <div class="food-quantity">
                    <button type="button" class="btn-dec" aria-label="Giảm">−</button>
                    <span>${item.quantity}</span>
                    <button type="button" class="btn-inc" aria-label="Tăng">+</button>
                </div>
            `;

            row.querySelector(".btn-dec").addEventListener("click", () => {
                cart[item.id]--;
                if (cart[item.id] <= 0) delete cart[item.id];
                renderCart();
                saveCartState();
            });

            row.querySelector(".btn-inc").addEventListener("click", () => {
                cart[item.id]++;
                renderCart();
                saveCartState();
            });

            foodCartItems.appendChild(row);
        });
    }

    const totalFood = selected.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const totalSavings = menuItems.reduce((sum, m) => {
        if (!m.originalPrice) return sum;
        return sum + (m.originalPrice - m.price) * (cart[m.id] || 0);
    }, 0);

    if (foodRoomPrice) foodRoomPrice.textContent = formatMoney(roomPrice);
    if (foodTotal) foodTotal.textContent = formatMoney(totalFood);
    if (foodGrandTotal) foodGrandTotal.textContent = formatMoney(roomPrice + totalFood);

    if (foodSavingRow && foodSavings) {
        foodSavings.textContent = `-${formatMoney(totalSavings)}`;
        foodSavingRow.style.display = totalSavings > 0 ? "flex" : "none";
    }
}

function saveCartState() {
    const selected = getSelectedFoods();
    const totalFood = selected.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const noteText = fnbServiceNote ? fnbServiceNote.value.trim() : "";

    const updated = {
        ...(bookingData || {}),
        foods: selected,
        foodTotal: totalFood,
        fnbNote: noteText,
        roomTotal: roomPrice,
        grandTotal: roomPrice + totalFood
    };

    bookingData = updated;
    sessionStorage.setItem("chillflixBooking", JSON.stringify(updated));
}

// 9. SỰ KIỆN TƯƠNG TÁC
filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        currentCategory = btn.dataset.category;
        filterButtons.forEach(b => b.classList.toggle("active", b === btn));
        renderMenu();
    });
});

foodSearch?.addEventListener("input", renderMenu);
fnbServiceNote?.addEventListener("input", saveCartState);

viewCombos?.addEventListener("click", () => {
    if (foodSearch) foodSearch.value = "";
    currentCategory = "combo";
    filterButtons.forEach(b => b.classList.toggle("active", b.dataset.category === "combo"));
    renderMenu();
    document.querySelector(".food-toolbar")?.scrollIntoView({ behavior: "smooth" });
});

backToRoom?.addEventListener("click", () => {
    saveCartState();
    window.location.href = "booking.html";
});

continueToPayment?.addEventListener("click", () => {
    saveCartState();
    // Nếu khách vào thẳng từ menu Header mà chưa chọn phòng -> dẫn về Bước 1 chọn phòng
    if (!bookingData || !bookingData.date || !bookingData.startTime) {
        window.location.href = "booking.html";
        return;
    }
    window.location.href = "booking-payment.html";
});

// Sự kiện Header dùng chung (Sáng/Tối, Avatar, Drawer)
function initHeaderControls() {
    const savedTheme = localStorage.getItem("chillflix-theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
    const themeIcon = document.getElementById("themeIcon");
    if (themeIcon) themeIcon.textContent = savedTheme === "light" ? "☀️" : "🌙";

    document.getElementById("themeToggle")?.addEventListener("click", () => {
        const cur = document.documentElement.getAttribute("data-theme");
        const next = cur === "light" ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", next);
        if (themeIcon) themeIcon.textContent = next === "light" ? "☀️" : "🌙";
        localStorage.setItem("chillflix-theme", next);
    });

    const userBtn = document.getElementById("userMenuBtn");
    const userDropdown = document.getElementById("userDropdown");
    userBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        userDropdown?.classList.toggle("show");
    });
    document.addEventListener("click", () => userDropdown?.classList.remove("show"));

    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const drawerCloseBtn = document.getElementById("drawerCloseBtn");
    const mobileDrawer = document.getElementById("mobileDrawer");
    const drawerOverlay = document.getElementById("drawerOverlay");

    mobileMenuBtn?.addEventListener("click", () => {
        mobileDrawer?.classList.add("open");
        drawerOverlay?.classList.add("open");
    });
    const closeDrawer = () => {
        mobileDrawer?.classList.remove("open");
        drawerOverlay?.classList.remove("open");
    };
    drawerCloseBtn?.addEventListener("click", closeDrawer);
    drawerOverlay?.addEventListener("click", closeDrawer);
}

// KHỞI CHẠY
initHeaderControls();
renderBookingContext();
renderMenu();
renderCart();