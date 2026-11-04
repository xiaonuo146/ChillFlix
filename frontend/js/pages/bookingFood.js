
/*
========================================
CHILLFLIX - BƯỚC 2: ĐỒ ĂN & NƯỚC UỐNG
========================================
*/

// ======================================
// 1. DANH SÁCH MÓN ĂN MẪU
// ======================================

const menuItems = [
    {
        id: 1,
        name: "Combo Couple",
        category: "combo",
        description: "1 bắp rang lớn và 2 nước ngọt",
        price: 99000,
        icon: "🍿"
    },
    {
        id: 2,
        name: "Combo Bạn Bè",
        category: "combo",
        description: "2 bắp rang lớn và 4 nước ngọt",
        price: 179000,
        icon: "🎬"
    },
    {
        id: 3,
        name: "Bắp rang bơ",
        category: "food",
        description: "Bắp rang thơm ngon, giòn rụm",
        price: 45000,
        icon: "🍿"
    },
    {
        id: 4,
        name: "Khoai tây chiên",
        category: "food",
        description: "Khoai tây chiên giòn",
        price: 39000,
        icon: "🍟"
    },
    {
        id: 5,
        name: "Coca-Cola",
        category: "drink",
        description: "Nước ngọt Coca-Cola",
        price: 25000,
        icon: "🥤"
    },
    {
        id: 6,
        name: "Trà đào",
        category: "drink",
        description: "Trà đào mát lạnh",
        price: 35000,
        icon: "🍑"
    }
];

// ======================================
// 2. LẤY CÁC PHẦN TỬ HTML
// ======================================

const foodGrid = document.getElementById("foodGrid");
const foodSearch = document.getElementById("foodSearch");
const filterButtons = document.querySelectorAll(".food-filter");

const foodMovie = document.getElementById("foodMovie");
const foodDate = document.getElementById("foodDate");
const foodRoom = document.getElementById("foodRoom");
const foodTime = document.getElementById("foodTime");
const foodDuration = document.getElementById("foodDuration");

const foodRoomPrice = document.getElementById("foodRoomPrice");
const foodCartItems = document.getElementById("foodCartItems");
const foodTotal = document.getElementById("foodTotal");
const foodGrandTotal = document.getElementById("foodGrandTotal");

const backToRoom = document.getElementById("backToRoom");
const continueToPayment =
    document.getElementById("continueToPayment");

// ======================================
// 3. ĐỌC THÔNG TIN ĐẶT PHÒNG TỪ BƯỚC 1
// ======================================

let bookingData = null;

try {
    const savedBooking =
        sessionStorage.getItem("chillflixBooking");

    if (savedBooking) {
        bookingData = JSON.parse(savedBooking);
    }
} catch (error) {
    console.error("Lỗi đọc thông tin đặt phòng:", error);
}

// ======================================
// 4. DỮ LIỆU PHÒNG
// ======================================

const roomPrices = {
    couple: 120000,
    group4: 180000,
    vip: 350000
};

const roomNames = {
    couple: "Couple A / B",
    group4: "Nhóm 4 Sao Hỏa",
    vip: "Nhóm 10 Hành Tinh"
};

// Tính tiền phòng
function calculateRoomPrice() {
    if (!bookingData) {
        return 0;
    }

    const savedPrice = Number(bookingData.roomTotal);

    if (Number.isFinite(savedPrice) && savedPrice > 0) {
        return savedPrice;
    }

    const pricePerHour =
        roomPrices[bookingData.roomType] || 0;

    const hours = Number(bookingData.duration) || 0;

    return pricePerHour * hours;
}

const roomPrice = calculateRoomPrice();

// ======================================
// 5. GIỎ HÀNG
// ======================================

// Key là ID món, value là số lượng
const cart = {};

let currentCategory = "all";

// Khôi phục giỏ hàng đã lưu trước đó
if (bookingData && Array.isArray(bookingData.foods)) {
    bookingData.foods.forEach(item => {
        const id = Number(item.id);
        const quantity = Number(item.quantity);

        const exists = menuItems.some(
            menuItem => menuItem.id === id
        );

        if (
            exists &&
            Number.isInteger(quantity) &&
            quantity > 0
        ) {
            cart[id] = quantity;
        }
    });
}

// ======================================
// 6. HÀM ĐỊNH DẠNG
// ======================================

function formatMoney(amount) {
    return new Intl.NumberFormat("vi-VN")
        .format(amount) + "đ";
}

function formatDuration(hours) {
    const value = Number(hours);

    if (!Number.isFinite(value) || value <= 0) {
        return "--";
    }

    const wholeHours = Math.floor(value);

    const minutes = Math.round(
        (value - wholeHours) * 60
    );

    if (minutes === 0) {
        return wholeHours + " giờ";
    }

    return wholeHours + " giờ " + minutes + " phút";
}

// ======================================
// 7. HIỂN THỊ THÔNG TIN ĐẶT PHÒNG
// ======================================

function renderBookingInfo() {
    if (!bookingData) {
        if (foodMovie) {
            foodMovie.textContent = "Chưa chọn phim";
        }

        if (foodDate) {
            foodDate.textContent = "--";
        }

        if (foodRoom) {
            foodRoom.textContent = "--";
        }

        if (foodTime) {
            foodTime.textContent = "--";
        }

        if (foodDuration) {
            foodDuration.textContent = "--";
        }

        foodRoomPrice.textContent = "0đ";

        continueToPayment.disabled = true;

        return;
    }

    if (foodMovie) {
        foodMovie.textContent =
            bookingData.movieTitle || "Chưa xác định";
    }

    if (foodDate) {
        foodDate.textContent =
            bookingData.date || "--";
    }

    if (foodRoom) {
        foodRoom.textContent =
            roomNames[bookingData.roomType] ||
            bookingData.roomType ||
            "--";
    }

    if (foodTime) {
        foodTime.textContent =
            bookingData.startTime || "--";
    }

    if (foodDuration) {
        foodDuration.textContent =
            formatDuration(bookingData.duration);
    }

    foodRoomPrice.textContent =
        formatMoney(roomPrice);

    // Kiểm tra dữ liệu trước khi cho thanh toán
    continueToPayment.disabled = !(
        bookingData.movieId &&
        bookingData.date &&
        bookingData.roomType &&
        bookingData.startTime &&
        Number(bookingData.duration) > 0 &&
        roomPrice > 0
    );
}

// ======================================
// 8. HIỂN THỊ DANH SÁCH MÓN ĂN
// ======================================

function renderMenu() {
    if (!foodGrid) {
        console.error("Không tìm thấy #foodGrid");
        return;
    }

    const keyword =
        foodSearch.value.trim().toLowerCase();

    const filteredItems = menuItems.filter(item => {
        const matchCategory =
            currentCategory === "all" ||
            item.category === currentCategory;

        const matchSearch =
            item.name.toLowerCase().includes(keyword) ||
            item.description.toLowerCase().includes(keyword);

        return matchCategory && matchSearch;
    });

    foodGrid.replaceChildren();

    if (filteredItems.length === 0) {
        const message = document.createElement("p");

        message.className = "booking-hint";
        message.textContent =
            "Không tìm thấy món phù hợp.";

        foodGrid.appendChild(message);
        return;
    }

    filteredItems.forEach(item => {
        const card = document.createElement("article");

        card.className = "food-card";

        card.innerHTML = `
            <div class="food-card-image">
                ${item.icon}
            </div>

            <h3>${item.name}</h3>

            <p>${item.description}</p>

            <div class="food-card-bottom">
                <strong>${formatMoney(item.price)}</strong>

                <button
                    type="button"
                    class="food-add-button">
                    + Thêm
                </button>
            </div>
        `;

        const addButton =
            card.querySelector(".food-add-button");

        addButton.addEventListener("click", () => {
            addToCart(item.id);
        });

        foodGrid.appendChild(card);
    });
}

// ======================================
// 9. THÊM MÓN VÀO GIỎ
// ======================================

function addToCart(itemId) {
    cart[itemId] = (cart[itemId] || 0) + 1;

    renderCart();
    saveCart();
}

// ======================================
// 10. THAY ĐỔI SỐ LƯỢNG
// ======================================

function changeQuantity(itemId, amount) {
    if (!cart[itemId]) {
        return;
    }

    cart[itemId] += amount;

    if (cart[itemId] <= 0) {
        delete cart[itemId];
    }

    renderCart();
    saveCart();
}

// ======================================
// 11. LẤY DANH SÁCH MÓN ĐÃ CHỌN
// ======================================

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

// ======================================
// 12. TÍNH TIỀN ĐỒ ĂN
// ======================================

function calculateFoodTotal() {
    return getSelectedFoods().reduce(
        (total, item) => {
            return total + item.price * item.quantity;
        },
        0
    );
}

// ======================================
// 13. LƯU GIỎ HÀNG VÀ ĐƠN ĐẶT PHÒNG
// ======================================

function saveCart() {
    if (!bookingData) {
        return;
    }

    bookingData.foods = getSelectedFoods();

    bookingData.foodTotal = calculateFoodTotal();

    bookingData.roomTotal = roomPrice;

    bookingData.grandTotal =
        roomPrice + bookingData.foodTotal;

    sessionStorage.setItem(
        "chillflixBooking",
        JSON.stringify(bookingData)
    );
}

// ======================================
// 14. HIỂN THỊ GIỎ HÀNG
// ======================================

function renderCart() {
    foodCartItems.replaceChildren();

    const selectedFoods = getSelectedFoods();

    if (selectedFoods.length === 0) {
        const message = document.createElement("p");

        message.className = "booking-hint";
        message.textContent = "Bạn chưa chọn món nào.";

        foodCartItems.appendChild(message);
    }

    selectedFoods.forEach(item => {
        const row = document.createElement("div");

        row.className = "food-cart-item";

        row.innerHTML = `
            <div class="food-cart-item-info">
                <strong>
                    ${item.name} x${item.quantity}
                </strong>

                <small>
                    ${formatMoney(item.price * item.quantity)}
                </small>
            </div>

            <div class="food-quantity">
                <button
                    type="button"
                    class="decrease"
                    aria-label="Giảm số lượng">
                    −
                </button>

                <span>${item.quantity}</span>

                <button
                    type="button"
                    class="increase"
                    aria-label="Tăng số lượng">
                    +
                </button>
            </div>
        `;

        row.querySelector(".decrease")
            .addEventListener("click", () => {
                changeQuantity(item.id, -1);
            });

        row.querySelector(".increase")
            .addEventListener("click", () => {
                changeQuantity(item.id, 1);
            });

        foodCartItems.appendChild(row);
    });

    const totalFoodPrice = calculateFoodTotal();

    foodRoomPrice.textContent =
        formatMoney(roomPrice);

    foodTotal.textContent =
        formatMoney(totalFoodPrice);

    foodGrandTotal.textContent =
        formatMoney(roomPrice + totalFoodPrice);
}

// ======================================
// 15. LỌC MÓN THEO DANH MỤC
// ======================================

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        currentCategory = button.dataset.category;

        filterButtons.forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        renderMenu();
    });
});

// ======================================
// 16. TÌM KIẾM MÓN ĂN
// ======================================

foodSearch.addEventListener("input", () => {
    renderMenu();
});

// ======================================
// 17. QUAY LẠI BƯỚC 1
// ======================================

backToRoom.addEventListener("click", () => {
    // Lưu giỏ hàng trước khi quay lại
    saveCart();

    window.location.href = "booking.html";
});

// ======================================
// 18. CHUYỂN SANG BƯỚC 3: THANH TOÁN
// ======================================

continueToPayment.addEventListener("click", () => {

    // Kiểm tra đã chọn phòng chưa
    if (!bookingData) {
        alert(
            "Chưa có thông tin đặt phòng.\n" +
            "Vui lòng quay lại Bước 1 để chọn phòng."
        );
        return;
    }

    // Kiểm tra dữ liệu đặt phòng
    if (
        !bookingData.movieId ||
        !bookingData.date ||
        !bookingData.roomType ||
        !bookingData.startTime ||
        Number(bookingData.duration) <= 0 ||
        roomPrice <= 0
    ) {
        alert(
            "Thông tin đặt phòng chưa đầy đủ.\n" +
            "Vui lòng quay lại Bước 1 để kiểm tra."
        );
        return;
    }

    // Lưu thông tin món ăn và tổng tiền
    saveCart();

    // Chuyển sang trang thanh toán
    window.location.href = "booking-payment.html";
});

// ======================================
// 19. KHỞI TẠO TRANG
// ======================================

function initBookingFood() {
    console.log("ChillFlix: bookingFood.js đã chạy");

    renderBookingInfo();

    renderMenu();

    renderCart();

    if (bookingData) {
        saveCart();
    } else {
        console.warn(
            "Chưa có thông tin đặt phòng từ Bước 1."
        );
    }
}

initBookingFood();
