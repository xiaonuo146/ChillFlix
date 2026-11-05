
/* =========================================
   CHILLFLIX - FOOD & DRINK
   ========================================= */

// 1. DANH SACH MON AN VA COMBO
// Anh that duoc luu trong:
// frontend/assets/images/food/

const imageFolder = "assets/images/food/";

const menuItems = [
    // ===== COMBO UU DAI =====
    {
        id: 1,
        name: "Combo Couple",
        category: "combo",
        description: "1 bắp rang bơ + 2 Coca-Cola",
        price: 75000,
        originalPrice: 89000,
        image: "combo-couple.jpg"
    },
    {
        id: 2,
        name: "Combo Hẹn Hò",
        category: "combo",
        description: "1 bắp mix 2 vị + 2 trà đào cam sả",
        price: 109000,
        originalPrice: 131000,
        image: "combo-hen-ho.jpg"
    },
    {
        id: 3,
        name: "Combo Bạn Bè",
        category: "combo",
        description: "2 bắp rang bơ + 4 Coca-Cola",
        price: 149000,
        originalPrice: 178000,
        image: "combo-ban-be.jpg"
    },
    {
        id: 4,
        name: "Combo Party",
        category: "combo",
        description: "2 bắp mix + 1 nachos + 4 Coca-Cola",
        price: 199000,
        originalPrice: 253000,
        image: "combo-party.jpg"
    },
    {
        id: 5,
        name: "Combo Bắp Phô Mai",
        category: "combo",
        description: "1 bắp phô mai + 2 Coca-Cola",
        price: 79000,
        originalPrice: 93000,
        image: "combo-pho-mai.jpg"
    },
    {
        id: 6,
        name: "Combo Ăn Vặt",
        category: "combo",
        description: "1 nachos + 1 khoai tây chiên + 2 Coca-Cola",
        price: 109000,
        originalPrice: 134000,
        image: "combo-an-vat.jpg"
    },

    // ===== BAP RANG =====
    {
        id: 7,
        name: "Bắp rang bơ",
        category: "food",
        description: "Bắp rang bơ thơm giòn trong ly bắp rạp phim",
        price: 45000,
        image: "bap-rang-bo.jpg"
    },
    {
        id: 8,
        name: "Bắp caramel",
        category: "food",
        description: "Bắp rang phủ caramel ngọt dịu",
        price: 45000,
        image: "bap-caramel.jpg"
    },
    {
        id: 9,
        name: "Bắp phô mai",
        category: "food",
        description: "Bắp rang phủ bột phô mai béo thơm",
        price: 49000,
        image: "bap-pho-mai.jpg"
    },
    {
        id: 10,
        name: "Bắp mix 2 vị",
        category: "food",
        description: "Kết hợp bắp caramel và bắp phô mai",
        price: 55000,
        image: "bap-mix.jpg"
    },

    // ===== MON AN VAT =====
    {
        id: 11,
        name: "Nachos phô mai",
        category: "food",
        description: "Bánh nachos giòn dùng cùng sốt phô mai",
        price: 55000,
        image: "nachos.jpg"
    },
    {
        id: 12,
        name: "Khoai tây chiên",
        category: "food",
        description: "Khoai tây chiên vàng giòn",
        price: 35000,
        image: "khoai-tay-chien.jpg"
    },
    {
        id: 13,
        name: "Xúc xích chiên",
        category: "food",
        description: "Xúc xích chiên nóng, ăn kèm tương",
        price: 35000,
        image: "xuc-xich-chien.jpg"
    },
    {
        id: 14,
        name: "Gà chiên giòn",
        category: "food",
        description: "Gà chiên giòn rụm, đậm vị",
        price: 59000,
        image: "ga-chien.jpg"
    },

    // ===== NUOC UONG =====
    {
        id: 15,
        name: "Trà đào cam sả",
        category: "drink",
        description: "Trà đào kết hợp cam tươi và sả",
        price: 38000,
        image: "tra-dao-cam-sa.jpg"
    },
    {
        id: 16,
        name: "Trà sữa",
        category: "drink",
        description: "Trà sữa thơm béo, mát lạnh",
        price: 45000,
        image: "tra-sua.jpg"
    },
    {
        id: 17,
        name: "Cà phê muối",
        category: "drink",
        description: "Cà phê đậm vị cùng lớp kem muối",
        price: 35000,
        image: "ca-phe-muoi.jpg"
    },
    {
        id: 18,
        name: "Trà hoa cúc mật ong",
        category: "drink",
        description: "Trà hoa cúc thanh nhẹ cùng mật ong",
        price: 39000,
        image: "tra-hoa-cuc.jpg"
    },
    {
        id: 19,
        name: "Matcha latte",
        category: "drink",
        description: "Matcha kết hợp sữa tươi",
        price: 42000,
        image: "matcha-latte.jpg"
    },
    {
        id: 20,
        name: "Soda việt quất bạc hà",
        category: "drink",
        description: "Soda việt quất mát lạnh",
        price: 38000,
        image: "soda-viet-quat.jpg"
    },
    {
        id: 21,
        name: "Coca-Cola",
        category: "drink",
        description: "Coca-Cola mát lạnh",
        price: 22000,
        image: "coca-cola.jpg"
    },
    {
        id: 22,
        name: "Sprite",
        category: "drink",
        description: "Sprite vị chanh tươi mát",
        price: 22000,
        image: "sprite.jpg"
    },
    {
        id: 23,
        name: "Nước suối",
        category: "drink",
        description: "Nước uống tinh khiết",
        price: 15000,
        image: "nuoc-suoi.jpg"
    }
];

// 2. LAY PHAN TU HTML

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

const foodSavings = document.getElementById("foodSavings");
const foodSavingRow = document.getElementById("foodSavingRow");
const foodCartCount = document.getElementById("foodCartCount");
const foodCategoryTitle = document.getElementById("foodCategoryTitle");
const foodResultCount = document.getElementById("foodResultCount");

const backToRoom = document.getElementById("backToRoom");
const continueToPayment =
    document.getElementById("continueToPayment");

const viewCombos = document.getElementById("viewCombos");

// 3. DOC DU LIEU DAT PHONG

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

function calculateRoomPrice() {
    if (!bookingData) return 0;

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

// 4. GIO HANG

const cart = {};
let currentCategory = "all";

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

// 5. DINH DANG TIEN

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

// 6. THONG TIN DAT PHONG

function renderBookingInfo() {
    if (!bookingData) {
        foodMovie.textContent = "Chưa chọn phim";
        foodDate.textContent = "--";
        foodRoom.textContent = "--";
        foodTime.textContent = "--";
        foodDuration.textContent = "--";
        foodRoomPrice.textContent = "0đ";

        continueToPayment.disabled = true;
        return;
    }

    foodMovie.textContent =
        bookingData.movieTitle || "Chưa xác định";

    foodDate.textContent =
        bookingData.date || "--";

    foodRoom.textContent =
        roomNames[bookingData.roomType] ||
        bookingData.roomType ||
        "--";

    foodTime.textContent =
        bookingData.startTime || "--";

    foodDuration.textContent =
        formatDuration(bookingData.duration);

    foodRoomPrice.textContent =
        formatMoney(roomPrice);

    continueToPayment.disabled = !(
        bookingData.movieId &&
        bookingData.date &&
        bookingData.roomType &&
        bookingData.startTime &&
        Number(bookingData.duration) > 0 &&
        roomPrice > 0
    );
}

// 7. HIEN THI ANH THAT
// Neu chua co file anh, hien placeholder.

function createFoodImage(item) {
    const imageBox = document.createElement("div");
    imageBox.className = "food-card-image";

    const img = document.createElement("img");
    img.src = imageFolder + item.image;
    img.alt = item.name;
    img.loading = "lazy";

    img.addEventListener("error", () => {
        img.remove();

        const placeholder = document.createElement("div");
        placeholder.className = "food-image-placeholder";
        placeholder.textContent =
            "Chưa có ảnh chụp thật của " + item.name;

        imageBox.appendChild(placeholder);
    }, { once: true });

    imageBox.appendChild(img);

    if (item.category === "combo") {
        const badge = document.createElement("span");
        badge.className = "food-card-badge combo";

        const saving =
            item.originalPrice - item.price;

        badge.textContent =
            "Tiết kiệm " + formatMoney(saving);

        imageBox.appendChild(badge);
    }

    return imageBox;
}

// 8. HIEN THI DANH SACH MON

function renderMenu() {
    const keyword = foodSearch.value
        .trim()
        .toLocaleLowerCase("vi-VN");

    const filteredItems = menuItems.filter(item => {
        const matchCategory =
            currentCategory === "all" ||
            item.category === currentCategory;

        const matchSearch =
            item.name.toLocaleLowerCase("vi-VN")
                .includes(keyword) ||
            item.description.toLocaleLowerCase("vi-VN")
                .includes(keyword);

        return matchCategory && matchSearch;
    });

    const categoryTitles = {
        all: "Tất cả món",
        combo: "Combo ưu đãi",
        food: "Đồ ăn",
        drink: "Nước uống"
    };

    foodCategoryTitle.textContent =
        categoryTitles[currentCategory];

    foodResultCount.textContent =
        filteredItems.length + " món";

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

        const imageBox = createFoodImage(item);
        card.appendChild(imageBox);

        const content = document.createElement("div");
        content.className = "food-card-content";

        const title = document.createElement("h3");
        title.textContent = item.name;

        const description = document.createElement("p");
        description.textContent = item.description;

        const bottom = document.createElement("div");
        bottom.className = "food-card-bottom";

        const priceBox = document.createElement("div");
        priceBox.className = "food-price-box";

        if (item.originalPrice) {
            const oldPrice = document.createElement("span");
            oldPrice.className = "food-old-price";
            oldPrice.textContent =
                formatMoney(item.originalPrice);

            priceBox.appendChild(oldPrice);
        }

        const price = document.createElement("strong");
        price.className = "food-price";
        price.textContent = formatMoney(item.price);
        priceBox.appendChild(price);

        if (item.originalPrice) {
            const saveLabel = document.createElement("span");
            saveLabel.className = "food-save-label";
            saveLabel.textContent =
                "Giảm " +
                formatMoney(item.originalPrice - item.price);

            priceBox.appendChild(saveLabel);
        }

        const addButton = document.createElement("button");
        addButton.type = "button";
        addButton.className = "food-add-button";
        addButton.textContent = "+ Thêm";

        addButton.addEventListener("click", () => {
            addToCart(item.id);
        });

        bottom.appendChild(priceBox);
        bottom.appendChild(addButton);

        content.appendChild(title);
        content.appendChild(description);
        content.appendChild(bottom);

        card.appendChild(content);
        foodGrid.appendChild(card);
    });
}

// 9. THEM MON

function addToCart(itemId) {
    cart[itemId] = (cart[itemId] || 0) + 1;

    renderCart();
    saveCart();
}

// 10. TANG GIAM SO LUONG

function changeQuantity(itemId, amount) {
    if (!cart[itemId]) return;

    cart[itemId] += amount;

    if (cart[itemId] <= 0) {
        delete cart[itemId];
    }

    renderCart();
    saveCart();
}

// 11. DANH SACH MON DA CHON

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

// 12. TINH TIEN

function calculateFoodTotal() {
    return getSelectedFoods().reduce(
        (total, item) =>
            total + item.price * item.quantity,
        0
    );
}

function calculateSavings() {
    return menuItems.reduce((total, item) => {
        if (!item.originalPrice) return total;

        const quantity = cart[item.id] || 0;

        return total +
            (item.originalPrice - item.price) * quantity;
    }, 0);
}

// 13. LUU DU LIEU

function saveCart() {
    if (!bookingData) return;

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

// 14. HIEN THI GIO HANG

function renderCart() {
    foodCartItems.replaceChildren();

    const selectedFoods = getSelectedFoods();

    const totalQuantity = selectedFoods.reduce(
        (total, item) => total + item.quantity,
        0
    );

    foodCartCount.textContent =
        totalQuantity + " món";

    if (selectedFoods.length === 0) {
        const message = document.createElement("p");
        message.className = "booking-hint";
        message.textContent =
            "Bạn chưa chọn món nào.";

        foodCartItems.appendChild(message);
    }

    selectedFoods.forEach(item => {
        const row = document.createElement("div");
        row.className = "food-cart-item";

        const info = document.createElement("div");
        info.className = "food-cart-item-info";

        const name = document.createElement("strong");
        name.textContent =
            item.name + " x" + item.quantity;

        const subtotal = document.createElement("small");
        subtotal.textContent =
            formatMoney(item.price * item.quantity);

        info.appendChild(name);
        info.appendChild(subtotal);

        const quantityBox = document.createElement("div");
        quantityBox.className = "food-quantity";

        const decrease = document.createElement("button");
        decrease.type = "button";
        decrease.textContent = "−";
        decrease.setAttribute(
            "aria-label",
            "Giảm số lượng " + item.name
        );

        decrease.addEventListener("click", () => {
            changeQuantity(item.id, -1);
        });

        const quantity = document.createElement("span");
        quantity.textContent = item.quantity;

        const increase = document.createElement("button");
        increase.type = "button";
        increase.textContent = "+";
        increase.setAttribute(
            "aria-label",
            "Tăng số lượng " + item.name
        );

        increase.addEventListener("click", () => {
            changeQuantity(item.id, 1);
        });

        quantityBox.appendChild(decrease);
        quantityBox.appendChild(quantity);
        quantityBox.appendChild(increase);

        row.appendChild(info);
        row.appendChild(quantityBox);

        foodCartItems.appendChild(row);
    });

    const totalFoodPrice = calculateFoodTotal();
    const savings = calculateSavings();

    foodRoomPrice.textContent =
        formatMoney(roomPrice);

    foodTotal.textContent =
        formatMoney(totalFoodPrice);

    foodGrandTotal.textContent =
        formatMoney(roomPrice + totalFoodPrice);

    foodSavings.textContent =
        formatMoney(savings);

    foodSavingRow.style.display =
        savings > 0 ? "flex" : "none";
}

// 15. LOC DANH MUC

function selectCategory(category) {
    currentCategory = category;

    filterButtons.forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.category === category
        );
    });

    renderMenu();
}

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        selectCategory(button.dataset.category);
    });
});

// 16. TIM KIEM

foodSearch.addEventListener("input", renderMenu);

// 17. NUT XEM COMBO

if (viewCombos) {
    viewCombos.addEventListener("click", () => {
        foodSearch.value = "";
        selectCategory("combo");

        document.querySelector(".food-toolbar")
            .scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
    });
}

// 18. QUAY LAI CHON PHONG

backToRoom.addEventListener("click", () => {
    saveCart();
    window.location.href = "booking.html";
});

// 19. TIEP TUC THANH TOAN

continueToPayment.addEventListener("click", () => {
    if (!bookingData) {
        alert(
            "Chưa có thông tin đặt phòng.\n" +
            "Vui lòng quay lại chọn phòng."
        );
        return;
    }

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

    saveCart();
    window.location.href = "booking-payment.html";
});

// 20. KHOI TAO

function initBookingFood() {
    console.log("ChillFlix Food & Drink loaded");

    renderBookingInfo();
    renderMenu();
    renderCart();

    if (bookingData) {
        saveCart();
    }
}

initBookingFood();
