
/* CHILLFLIX - BƯỚC 4: NHẬN VÉ */

// 1. Đọc thông tin đặt phòng
let bookingData = null;

try {
    const savedData = sessionStorage.getItem(
        "chillflixBooking"
    );

    if (savedData) {
        bookingData = JSON.parse(savedData);
    }
} catch (error) {
    console.error("Lỗi đọc dữ liệu vé:", error);
}

// 2. Các hàm dùng chung
function formatMoney(value) {
    return new Intl.NumberFormat("vi-VN")
        .format(Number(value) || 0) + "đ";
}

function formatDuration(hours) {
    const value = Number(hours) || 0;
    const wholeHours = Math.floor(value);
    const minutes = Math.round(
        (value - wholeHours) * 60
    );

    return minutes === 0
        ? `${wholeHours} giờ`
        : `${wholeHours} giờ ${minutes} phút`;
}

function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value ?? "---";
    }
}

// 3. Tên các loại phòng
const roomNames = {
    couple: "Couple A / B",
    group4: "Nhóm 4 Sao Hỏa",
    vip: "Nhóm 10 Hành Tinh"
};

// 4. Tên phương thức thanh toán
const paymentNames = {
    momo: "MoMo (mô phỏng)",
    vnpay: "VNPay (mô phỏng)",
    vietqr: "VietQR (mô phỏng)"
};

// 5. Hiển thị vé
function renderTicket() {
    if (!bookingData) {
        document.querySelector(".success-container")
            .innerHTML = `
                <div class="ticket">
                    <h2>Chưa có thông tin đặt phòng</h2>
                    <p>
                        Vui lòng thực hiện các bước
                        đặt phòng trước khi xem vé.
                    </p>
                    <a href="booking.html"
                       class="ticket-home">
                        Quay lại đặt phòng
                    </a>
                </div>
            `;
        return;
    }

    // Mã vé chỉ dùng để trình diễn
    const ticketCode = bookingData.ticketCode ||
        "CF-DEMO-" + Date.now().toString().slice(-8);

    bookingData.ticketCode = ticketCode;

    sessionStorage.setItem(
        "chillflixBooking",
        JSON.stringify(bookingData)
    );

    setText("ticketCode", ticketCode);

    setText(
        "ticketMovie",
        bookingData.movieTitle || "Chưa xác định"
    );

    setText(
        "ticketDate",
        bookingData.date || "---"
    );

    setText(
        "ticketTime",
        bookingData.startTime || "---"
    );

    setText(
        "ticketDuration",
        formatDuration(bookingData.duration)
    );

    setText(
        "ticketRoom",
        roomNames[bookingData.roomType] ||
        bookingData.roomType ||
        "---"
    );

    // Hỗ trợ cả hai cách lưu thông tin khách hàng
    const customer = bookingData.customer || {};

    setText(
        "ticketCustomer",
        customer.name ||
        bookingData.customerName ||
        "---"
    );

    setText(
        "ticketPhone",
        customer.phone ||
        bookingData.customerPhone ||
        "---"
    );

    setText(
        "ticketEmail",
        customer.email ||
        bookingData.customerEmail ||
        "---"
    );

    const paymentMethod =
        bookingData.paymentMethod ||
        bookingData.payment?.method;

    setText(
        "ticketPayment",
        paymentNames[paymentMethod] ||
        "Chưa xác định"
    );

    // Danh sách đồ ăn
    const foodContainer =
        document.getElementById("ticketFoods");

    foodContainer.replaceChildren();

    const foods = Array.isArray(bookingData.foods)
        ? bookingData.foods
        : [];

    if (foods.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "Không chọn đồ ăn.";
        foodContainer.appendChild(empty);
    } else {
        foods.forEach(item => {
            const row = document.createElement("div");
            row.className = "ticket-row";

            const name = document.createElement("span");
            const price = document.createElement("strong");

            const quantity = Number(item.quantity) || 0;

            name.textContent =
                `${item.name} x${quantity}`;

            price.textContent = formatMoney(
                Number(item.price) * quantity
            );

            row.append(name, price);
            foodContainer.appendChild(row);
        });
    }

    // Ưu tiên tổng tiền sau giảm giá
    const roomTotal =
        Number(bookingData.roomTotal) || 0;

    const foodTotal = foods.reduce(
        (sum, item) =>
            sum +
            Number(item.price || 0) *
            Number(item.quantity || 0),
        0
    );

    const discount =
        Number(bookingData.discount) || 0;

    const calculatedTotal = Math.max(
        0,
        roomTotal + foodTotal - discount
    );

    const total =
        bookingData.finalTotal ??
        bookingData.totalPayment ??
        calculatedTotal;

    setText("ticketTotal", formatMoney(total));
}

// 6. Nút in vé
const printButton = document.getElementById(
    "printTicket"
);

if (printButton) {
    printButton.addEventListener("click", () => {
        window.print();
    });
}

// 7. Khởi tạo
renderTicket();
