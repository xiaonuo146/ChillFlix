
/* =========================================
   CHILLFLIX - BƯỚC 3: THANH TOÁN
   ========================================= */

// =========================================
// 1. ĐỌC THÔNG TIN ĐẶT PHÒNG
// =========================================

let bookingData = null;

try {
    const savedBooking = sessionStorage.getItem(
        "chillflixBooking"
    );

    if (savedBooking) {
        bookingData = JSON.parse(savedBooking);
    }
} catch (error) {
    console.error("Lỗi đọc dữ liệu đặt phòng:", error);
}

// =========================================
// 2. CÁC HÀM DÙNG CHUNG
// =========================================

function formatMoney(amount) {
    return new Intl.NumberFormat("vi-VN").format(
        Number(amount) || 0
    ) + "đ";
}

function formatDuration(hours) {
    const totalMinutes = Math.round(
        Number(hours) * 60
    );

    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;

    if (m === 0) {
        return `${h} giờ`;
    }

    return `${h} giờ ${m} phút`;
}

function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}

// =========================================
// 3. LẤY CÁC PHẦN TỬ HTML
// =========================================

const paymentForm = document.getElementById(
    "paymentForm"
);

const customerNameInput = document.getElementById(
    "customerName"
);

const customerPhoneInput = document.getElementById(
    "customerPhone"
);

const customerEmailInput = document.getElementById(
    "customerEmail"
);

// Mã giảm giá
const voucherInput = document.getElementById(
    "voucherCode"
);

const applyVoucherButton = document.getElementById(
    "applyVoucher"
);

const voucherMessage = document.getElementById(
    "voucherMessage"
);

// Nút xác nhận
const confirmButton = document.getElementById(
    "confirmPayment"
);

// =========================================
// 4. TÍNH TIỀN ĐẶT PHÒNG
// =========================================

const roomTotal = Number(
    bookingData?.roomTotal
) || 0;

const foods = Array.isArray(bookingData?.foods)
    ? bookingData.foods
    : [];

const foodTotal = foods.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 0;

    return sum + price * quantity;
}, 0);

const originalTotal = roomTotal + foodTotal;

// Giảm giá ban đầu
let discount = 0;

// Mã đang được áp dụng
let appliedVoucher = "";

// Phương thức thanh toán
let paymentMethod = "momo";

// =========================================
// 5. HIỂN THỊ THÔNG TIN ĐƠN HÀNG
// =========================================

function renderBooking() {

    if (!bookingData) {
        alert(
            "Chưa có thông tin đặt phòng.\n" +
            "Vui lòng quay lại bước chọn phòng."
        );

        window.location.href = "booking.html";
        return;
    }

    const roomNames = {
        couple: "Couple A / B",
        group4: "Nhóm 4 Sao Hỏa",
        vip: "Nhóm 10 Hành Tinh"
    };

    // Thông tin phim
    setText(
        "paymentMovie",
        bookingData.movieTitle || "Chưa xác định"
    );

    // Ngày chiếu
    setText(
        "paymentDate",
        bookingData.date || "--"
    );

    // Loại phòng
    setText(
        "paymentRoom",
        roomNames[bookingData.roomType] ||
        bookingData.roomType ||
        "--"
    );

    // Giờ bắt đầu
    setText(
        "paymentTime",
        bookingData.startTime || "--"
    );

    // Thời lượng
    setText(
        "paymentDuration",
        formatDuration(bookingData.duration || 2)
    );

    // Tiền phòng
    setText(
        "paymentRoomTotal",
        formatMoney(roomTotal)
    );

    // Tiền đồ ăn
    setText(
        "paymentFoodTotal",
        formatMoney(foodTotal)
    );

    // Hiển thị danh sách đồ ăn
    renderFoodList();

    // Cập nhật tổng thanh toán
    updateTotal();
}

// =========================================
// 6. HIỂN THỊ DANH SÁCH ĐỒ ĂN
// =========================================

function renderFoodList() {

    const foodContainer = document.getElementById(
        "paymentFoodList"
    );

    if (!foodContainer) {
        console.error(
            "Không tìm thấy phần tử paymentFoodList"
        );
        return;
    }

    foodContainer.replaceChildren();

    if (foods.length === 0) {
        const message = document.createElement("p");

        message.className = "booking-hint";
        message.textContent = "Không chọn đồ ăn.";

        foodContainer.appendChild(message);
        return;
    }

    foods.forEach(item => {

        const row = document.createElement("div");
        row.className = "payment-food-item";

        const name = document.createElement("span");

        name.textContent =
            `${item.name} x${item.quantity}`;

        const price = document.createElement("strong");

        price.textContent = formatMoney(
            Number(item.price) *
            Number(item.quantity)
        );

        row.append(name, price);

        foodContainer.appendChild(row);
    });
}

// =========================================
// 7. CẬP NHẬT TỔNG THANH TOÁN
// =========================================

function updateTotal() {

    const finalTotal = Math.max(
        0,
        originalTotal - discount
    );

    setText(
        "paymentDiscount",
        formatMoney(discount)
    );

    setText(
        "paymentGrandTotal",
        formatMoney(finalTotal)
    );

    return finalTotal;
}

// =========================================
// 8. ÁP DỤNG MÃ GIẢM GIÁ
// =========================================

if (applyVoucherButton && voucherInput) {

    applyVoucherButton.addEventListener(
        "click",
        () => {

            const code = voucherInput.value
                .trim()
                .toUpperCase();

            if (code === "PHIM20") {

                // Giảm 20% tổng tiền
                discount = Math.round(
                    originalTotal * 0.2
                );

                appliedVoucher = "PHIM20";

                if (voucherMessage) {
                    voucherMessage.textContent =
                        "Áp dụng thành công! Giảm 20%.";
                }

            } else {

                discount = 0;
                appliedVoucher = "";

                if (voucherMessage) {
                    voucherMessage.textContent = code
                        ? "Mã giảm giá không hợp lệ."
                        : "Vui lòng nhập mã giảm giá.";
                }
            }

            updateTotal();
        }
    );

    // Nếu sửa mã sau khi áp dụng,
    // phải bấm Áp dụng lại
    voucherInput.addEventListener("input", () => {

        if (appliedVoucher) {
            discount = 0;
            appliedVoucher = "";

            if (voucherMessage) {
                voucherMessage.textContent =
                    "Mã đã thay đổi. Hãy áp dụng lại.";
            }

            updateTotal();
        }
    });
}

// =========================================
// 9. CHỌN PHƯƠNG THỨC THANH TOÁN
// =========================================

const paymentOptions = document.querySelectorAll(
    'input[name="paymentMethod"]'
);

paymentOptions.forEach(option => {

    option.addEventListener("change", () => {

        if (option.checked) {
            paymentMethod = option.value;
        }
    });

    if (option.checked) {
        paymentMethod = option.value;
    }
});

// =========================================
// 10. KIỂM TRA THÔNG TIN KHÁCH HÀNG
// =========================================

function validateCustomer() {

    const customerName =
        customerNameInput?.value.trim() || "";

    const customerPhone =
        customerPhoneInput?.value.trim() || "";

    const customerEmail =
        customerEmailInput?.value.trim() || "";

    if (
        !customerName ||
        !customerPhone ||
        !customerEmail
    ) {
        alert(
            "Vui lòng nhập đầy đủ thông tin khách hàng!"
        );

        return null;
    }

    // Kiểm tra số điện thoại Việt Nam
    const phoneRegex = /^0\d{9}$/;

    if (!phoneRegex.test(customerPhone)) {
        alert(
            "Số điện thoại phải gồm 10 chữ số " +
            "và bắt đầu bằng số 0."
        );

        return null;
    }

    // Kiểm tra email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(customerEmail)) {
        alert("Email không hợp lệ.");
        return null;
    }

    return {
        name: customerName,
        phone: customerPhone,
        email: customerEmail
    };
}

// =========================================
// 11. XÁC NHẬN ĐẶT PHÒNG
// =========================================

function confirmBooking() {

    if (!bookingData) {
        alert("Chưa có thông tin đặt phòng!");
        return;
    }

    // Kiểm tra thông tin khách hàng
    const customer = validateCustomer();

    if (!customer) {
        return;
    }

    // Tính tiền sau giảm giá
    const finalTotal = updateTotal();

    // Tạo mã vé mô phỏng
    const ticketCode =
        "CF-DEMO-" + Date.now().toString().slice(-8);

    // Lưu toàn bộ thông tin
    const finalBooking = {

        ...bookingData,

        // Thông tin phòng
        roomTotal: roomTotal,

        // Thông tin đồ ăn
        foods: foods,
        foodTotal: foodTotal,

        // Thông tin giảm giá
        voucherCode: appliedVoucher,
        discount: discount,

        // Tổng tiền
        grandTotal: finalTotal,
        finalTotal: finalTotal,

        // Khách hàng
        customer: customer,

        // Phương thức thanh toán
        paymentMethod: paymentMethod,

        // Trạng thái mô phỏng
        paymentStatus: "demo",
        bookingStatus: "demo",

        // Mã vé mẫu
        ticketCode: ticketCode
    };

    try {

        // Lưu dữ liệu cho Bước 4
        sessionStorage.setItem(
            "chillflixBooking",
            JSON.stringify(finalBooking)
        );

        // Chuyển sang trang nhận vé
        window.location.href =
            "booking-success.html";

    } catch (error) {

        console.error(
            "Không thể lưu thông tin đặt phòng:",
            error
        );

        alert(
            "Không thể lưu thông tin đặt phòng. " +
            "Vui lòng thử lại."
        );
    }
}

// =========================================
// 12. XỬ LÝ FORM THANH TOÁN
// =========================================

if (paymentForm) {

    paymentForm.addEventListener(
        "submit",
        event => {

            // Ngăn tải lại trang
            event.preventDefault();

            confirmBooking();
        }
    );

} else if (confirmButton) {

    // Trường hợp HTML không có form
    confirmButton.addEventListener(
        "click",
        event => {

            event.preventDefault();

            confirmBooking();
        }
    );
}

// =========================================
// 13. KHỞI TẠO TRANG
// =========================================

renderBooking();