/* ==========================================================================
   CHILLFLIX ADMIN - F&B & VOUCHER CONTROLLER
   ========================================================================== */

function formatMoney(amount) {
    return new Intl.NumberFormat("vi-VN").format(Math.max(0, Math.round(Number(amount) || 0))) + "đ";
}

// 1. DANH SÁCH 16 MÓN GỐC CHUẨN CỦA QUÁN
const DEFAULT_MENU = [
    { id: 1, name: "Combo Couple Cine", category: "combo", tag: "Bán chạy", description: "1 Bắp phô mai lớn + 2 Trà đào cam sả + Khăn ướt thơm", price: 99000, originalPrice: 125000, imageUrl: "https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=400", isAvailable: true },
    { id: 2, name: "Combo Bắp Nước Tiết Kiệm", category: "combo", tag: "Best Seller", description: "1 Bắp bơ lớn tự chọn vị + 1 Nước ngọt ướp lạnh", price: 75000, originalPrice: 95000, imageUrl: "https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400", isAvailable: true },
    { id: 3, name: "Combo Party Nhóm 4", category: "combo", tag: "Nhóm 4 người", description: "2 Bắp mix lớn + 1 Nachos sốt phô mai + 4 Trà trái cây", price: 169000, originalPrice: 215000, imageUrl: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400", isAvailable: true },
    { id: 4, name: "Combo Đêm Muộn Chill", category: "combo", tag: "Sau 21:00", description: "1 Khoai tây múi cau giòn nóng + 2 Trà hoa cúc mật ong ấm", price: 85000, originalPrice: 105000, imageUrl: "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400", isAvailable: true },
    { id: 5, name: "Trà Đào Cam Sả Ủ Lạnh", category: "drink", tag: "Bán chạy", description: "Vị trà thanh mát, đào ngâm giòn ngọt, thoảng hương sả tươi", price: 38000, imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400", isAvailable: true },
    { id: 6, name: "Trà Sữa Bơ Nướng Cine", category: "drink", tag: "Hot Trend", description: "Trà Oolong nướng đậm vị quyện lớp kem bơ sánh mịn béo ngậy", price: 45000, imageUrl: "https://images.unsplash.com/photo-1558857563-b371033873b8?w=400", isAvailable: true },
    { id: 7, name: "Cà Phê Muối Kem Béo", category: "drink", tag: "", description: "Cà phê pha phin truyền thống phủ lớp kem muối mặn dịu", price: 35000, imageUrl: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400", isAvailable: true },
    { id: 8, name: "Trà Hoa Cúc Mật Ong", category: "drink", tag: "Thư giãn", description: "Hoa cúc sấy lạnh kết hợp mật ong rừng giúp thư giãn tinh thần", price: 39000, imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400", isAvailable: true },
    { id: 9, name: "Matcha Latte Kem Sữa", category: "drink", tag: "", description: "Bột Matcha Nhật Bản đánh bông cùng sữa tươi thanh trùng", price: 42000, imageUrl: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400", isAvailable: true },
    { id: 10, name: "Soda Việt Quất Bạc Hà", category: "drink", tag: "", description: "Sảng khoái lăn tăn gas cùng mứt việt quất và lá bạc hà tươi", price: 38000, imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400", isAvailable: true },
    { id: 11, name: "Coca-Cola / Sprite Tươi", category: "drink", tag: "", description: "Lon 320ml ướp lạnh sâu kèm ly đá viên tinh khiết", price: 22000, imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400", isAvailable: true },
    { id: 12, name: "Bắp Phô Mai Caramel Mix", category: "food", tag: "Bán chạy", description: "Bắp nổ tươi tại chỗ, áo đều sốt caramel và bột phô mai béo thơm", price: 49000, imageUrl: "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?w=400", isAvailable: true },
    { id: 13, name: "Nachos Giòn & Sốt Phô Mai", category: "food", tag: "Mới", description: "Bánh ngô Mexico giòn tan chấm sốt phô mai ấm và salsa cà chua", price: 55000, imageUrl: "https://images.unsplash.com/photo-1582169296194-e4d644c48063?w=400", isAvailable: true },
    { id: 14, name: "Khoai Tây Múi Cau Thảo Mộc", category: "food", tag: "", description: "Khoai tây nguyên vỏ chiên vàng giòn lắc lá hương thảo", price: 35000, imageUrl: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=400", isAvailable: true },
    { id: 15, name: "Gà Popcorn Chiên Giòn", category: "food", tag: "", description: "Gà viên chiên nóng giòn rụm dùng kèm tương ớt mận", price: 59000, imageUrl: "https://images.unsplash.com/photo-1562967914-608f82629710?w=400", isAvailable: true },
    { id: 16, name: "Xúc Xích Đức Áp Chảo", category: "food", tag: "", description: "Xúc xích xông khói khía mặt nướng thơm lừng kèm mù tạt mật ong", price: 39000, imageUrl: "https://images.unsplash.com/photo-1619740455993-9e612b1af08a?w=400", isAvailable: true }
];

// 2. DANH SÁCH VOUCHER GỐC
const DEFAULT_VOUCHERS = [
    { code: "PHIM20", discountType: "percent", discountValue: 20, appliesTo: "room", exp: "2026-12-31", desc: "Giảm 20% tiền phòng cho thành viên mới", isActive: true },
    { code: "CHILL10", discountType: "percent", discountValue: 10, appliesTo: "total", exp: "2026-12-31", desc: "Giảm 10% tổng đơn cho suất chiếu đêm từ 21:00", isActive: true },
    { code: "FNBCOUPLE", discountType: "fixed", discountValue: 45000, appliesTo: "fnb", exp: "2026-11-30", desc: "Tặng 1 phần bắp caramel khi đặt phòng Couple", isActive: true }
];

let fnbList = [];
let voucherList = [];
let currentActiveTab = "food"; // "food" hoặc "voucher"
let currentSearch = "";
let currentCategory = "all";

document.addEventListener("DOMContentLoaded", () => {
    initClock();
    loadData();
    setupTabSwitching();
    setupSearchFilter();
    setupModals();
});

// NẠP DỮ LIỆU
function loadData() {
    try {
        const savedFnb = localStorage.getItem("chillflix_admin_menu");
        fnbList = savedFnb ? JSON.parse(savedFnb) : DEFAULT_MENU;
    } catch (e) {
        fnbList = DEFAULT_MENU;
    }

    try {
        const savedVouchers = localStorage.getItem("chillflix_admin_vouchers");
        voucherList = savedVouchers ? JSON.parse(savedVouchers) : DEFAULT_VOUCHERS;
    } catch (e) {
        voucherList = DEFAULT_VOUCHERS;
    }

    updateKpis();
    renderFnbTable();
    renderVoucherTable();
}

function saveData() {
    localStorage.setItem("chillflix_admin_menu", JSON.stringify(fnbList));
    localStorage.setItem("chillflix_admin_vouchers", JSON.stringify(voucherList));
    updateKpis();
}

// CẬP NHẬT 4 THẺ SỐ LIỆU KPI
function updateKpis() {
    const totalFood = fnbList.length;
    const availFood = fnbList.filter(f => f.isAvailable).length;
    const outFood = totalFood - availFood;
    const activeV = voucherList.filter(v => v.isActive).length;

    setText("kpiTotalFood", `${totalFood} <small>món</small>`);
    setText("kpiAvailableFood", `${availFood} <small>món</small>`);
    setText("kpiOutOfStockFood", `${outFood} <small>món</small>`);
    setText("kpiActiveVouchers", `${activeV} <small>mã</small>`);

    setText("countTabFood", totalFood);
    setText("countTabVoucher", voucherList.length);
}

// ==========================================
// RENDER BẢNG THỰC ĐƠN F&B
// ==========================================
function renderFnbTable() {
    const tbody = document.getElementById("fnbTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    let list = [...fnbList];

    if (currentCategory !== "all") {
        list = list.filter(item => item.category === currentCategory);
    }

    if (currentSearch) {
        list = list.filter(item => 
            item.name.toLowerCase().includes(currentSearch) || 
            (item.description && item.description.toLowerCase().includes(currentSearch))
        );
    }

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">Không tìm thấy món ăn nào phù hợp.</td></tr>`;
        return;
    }

    const catBadge = {
        combo: `<span class="badge badge--warning">🍿 Combo Ưu Đãi</span>`,
        drink: `<span class="badge badge--info">🍹 Đồ Uống Pha Chế</span>`,
        food:  `<span class="badge" style="background: var(--surface-2); color: var(--text);">🧀 Bắp Rang &amp; Snack</span>`
    };

    list.forEach(item => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <img src="${item.imageUrl || 'https://picsum.photos/50/50'}" alt="${item.name}" style="width: 44px; height: 44px; border-radius: 6px; object-fit: cover; border: 1px solid var(--border);" onerror="this.src='https://picsum.photos/50/50'" />
                    <div>
                        <strong>${item.name}</strong>
                        <p style="font-size: 11.5px; color: var(--text-muted); margin: 2px 0 0; max-width: 280px; line-height: 1.4;">${item.description || ''}</p>
                    </div>
                </div>
            </td>
            <td>${catBadge[item.category] || item.category}</td>
            <td><strong style="color: var(--primary); font-size: 14.5px;">${formatMoney(item.price)}</strong></td>
            <td><span style="text-decoration: line-through; color: var(--text-muted); font-size: 12px;">${item.originalPrice ? formatMoney(item.originalPrice) : '--'}</span></td>
            <td>${item.tag ? `<span class="badge badge--danger">${item.tag}</span>` : '<span style="color: var(--text-muted); font-size: 12px;">--</span>'}</td>
            <td>
                <label class="switch-toggle-label">
                    <input type="checkbox" class="toggle-fnb-status" data-id="${item.id}" ${item.isAvailable ? 'checked' : ''} />
                    <span class="toggle-slider"></span>
                    <span class="toggle-text" style="font-size: 12px; font-weight: 600; color: ${item.isAvailable ? 'var(--success)' : 'var(--danger)'};">
                        ${item.isAvailable ? 'Đang phục vụ' : 'Hết hàng'}
                    </span>
                </label>
            </td>
            <td style="text-align: right; white-space: nowrap;">
                <button type="button" class="btn btn--outline btn-edit-fnb" data-id="${item.id}" style="height: 30px; padding: 0 10px; font-size: 11.5px; margin-right: 4px;">Sửa</button>
                <button type="button" class="btn btn--outline btn-del-fnb" data-id="${item.id}" style="height: 30px; padding: 0 8px; font-size: 11.5px; color: var(--danger); border-color: rgba(229,72,77,0.4);">✕</button>
            </td>
        `;

        // Bật/tắt trạng thái Còn/Hết hàng
        tr.querySelector(".toggle-fnb-status").addEventListener("change", (e) => {
            item.isAvailable = e.target.checked;
            saveData();
            renderFnbTable();
        });

        // Sửa món
        tr.querySelector(".btn-edit-fnb").addEventListener("click", () => openEditFnbModal(item));

        // Xóa món
        tr.querySelector(".btn-del-fnb").addEventListener("click", () => {
            if (confirm(`Xóa món [${item.name}] khỏi thực đơn?`)) {
                fnbList = fnbList.filter(f => f.id !== item.id);
                saveData();
                renderFnbTable();
            }
        });

        tbody.appendChild(tr);
    });
}

// ==========================================
// RENDER BẢNG VOUCHER KHUYẾN MÃI
// ==========================================
function renderVoucherTable() {
    const tbody = document.getElementById("voucherTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    let list = [...voucherList];

    if (currentSearch) {
        list = list.filter(v => v.code.toLowerCase().includes(currentSearch) || (v.desc && v.desc.toLowerCase().includes(currentSearch)));
    }

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">Chưa có voucher nào phù hợp.</td></tr>`;
        return;
    }

    const appMap = {
        room: "Tiền giờ phòng",
        total: "Tổng hóa đơn",
        fnb: "Ẩm thực F&B"
    };

    list.forEach(v => {
        const tr = document.createElement("tr");

        const valText = v.discountType === "percent" ? `${v.discountValue}%` : formatMoney(v.discountValue);

        tr.innerHTML = `
            <td><span class="t-code-pill" style="font-size: 14px; letter-spacing: 1px;">${v.code}</span></td>
            <td>${v.discountType === "percent" ? "Giảm theo phần trăm" : "Giảm tiền mặt"}</td>
            <td><strong style="color: var(--primary); font-size: 15px;">${valText}</strong></td>
            <td><span class="badge badge--info">${appMap[v.appliesTo] || v.appliesTo}</span></td>
            <td><span style="font-size: 12.5px;">📅 ${v.exp || '31/12/2026'}</span></td>
            <td>
                <label class="switch-toggle-label">
                    <input type="checkbox" class="toggle-voucher-status" data-code="${v.code}" ${v.isActive ? 'checked' : ''} />
                    <span class="toggle-slider"></span>
                    <span style="font-size: 12px; font-weight: 600; color: ${v.isActive ? 'var(--success)' : 'var(--danger)'};">
                        ${v.isActive ? 'Kích hoạt' : 'Tạm tắt'}
                    </span>
                </label>
            </td>
            <td style="text-align: right; white-space: nowrap;">
                <button type="button" class="btn btn--outline btn-edit-voucher" data-code="${v.code}" style="height: 30px; padding: 0 10px; font-size: 11.5px; margin-right: 4px;">Sửa</button>
                <button type="button" class="btn btn--outline btn-del-voucher" data-code="${v.code}" style="height: 30px; padding: 0 8px; font-size: 11.5px; color: var(--danger); border-color: rgba(229,72,77,0.4);">✕</button>
            </td>
        `;

        tr.querySelector(".toggle-voucher-status").addEventListener("change", (e) => {
            v.isActive = e.target.checked;
            saveData();
            renderVoucherTable();
        });

        tr.querySelector(".btn-edit-voucher").addEventListener("click", () => openEditVoucherModal(v));

        tr.querySelector(".btn-del-voucher").addEventListener("click", () => {
            if (confirm(`Xác nhận xóa vĩnh viễn voucher [${v.code}]?`)) {
                voucherList = voucherList.filter(item => item.code !== v.code);
                saveData();
                renderVoucherTable();
            }
        });

        tbody.appendChild(tr);
    });
}

// ==========================================
// CHUYỂN ĐỔI TAB & ĐỒNG BỘ LINK HASH #vouchers
// ==========================================
function setupTabSwitching() {
    const tabBtnFood = document.getElementById("tabBtnFood");
    const tabBtnVoucher = document.getElementById("tabBtnVoucher");
    const secFood = document.getElementById("sectionFoodTable");
    const secVoucher = document.getElementById("sectionVoucherTable");
    const addBtn = document.getElementById("btnOpenAddModal");
    const navFood = document.getElementById("navItemFnb");
    const navVoucher = document.getElementById("navItemVoucher");

    function switchTab(type) {
        currentActiveTab = type;
        if (type === "voucher") {
            tabBtnFood.classList.remove("active");
            tabBtnVoucher.classList.add("active");
            secFood.style.display = "none";
            secVoucher.style.display = "block";
            addBtn.innerHTML = "<span>+</span> Tạo Voucher Mới";
            navFood?.classList.remove("active");
            navVoucher?.classList.add("active");
            document.getElementById("filterCategorySelect").style.display = "none";
        } else {
            tabBtnVoucher.classList.remove("active");
            tabBtnFood.classList.add("active");
            secVoucher.style.display = "none";
            secFood.style.display = "block";
            addBtn.innerHTML = "<span>+</span> Thêm Món F&B Mới";
            navVoucher?.classList.remove("active");
            navFood?.classList.add("active");
            document.getElementById("filterCategorySelect").style.display = "block";
        }
    }

    tabBtnFood?.addEventListener("click", () => {
        window.location.hash = "";
        switchTab("food");
    });

    tabBtnVoucher?.addEventListener("click", () => {
        window.location.hash = "vouchers";
        switchTab("voucher");
    });

    // Tự động nhận diện hash trên URL
    if (window.location.hash === "#vouchers") {
        switchTab("voucher");
    }

    window.addEventListener("hashchange", () => {
        if (window.location.hash === "#vouchers") switchTab("voucher");
        else switchTab("food");
    });
}

// ==========================================
// FORM MODAL THÊM / SỬA MÓN & VOUCHER
// ==========================================
function setupModals() {
    const addBtn = document.getElementById("btnOpenAddModal");

    // Modal F&B
    const fnbDrawer = document.getElementById("modalFnbBox");
    const fnbOverlay = document.getElementById("modalFnbOverlay");
    const closeFnb = document.getElementById("btnCloseFnbModal");

    // Modal Voucher
    const vDrawer = document.getElementById("modalVoucherBox");
    const vOverlay = document.getElementById("modalVoucherOverlay");
    const closeV = document.getElementById("btnCloseVoucherModal");

    const closeAll = () => {
        fnbDrawer?.classList.remove("open");
        fnbOverlay?.classList.remove("open");
        vDrawer?.classList.remove("open");
        vOverlay?.classList.remove("open");
    };

    closeFnb?.addEventListener("click", closeAll);
    fnbOverlay?.addEventListener("click", closeAll);
    closeV?.addEventListener("click", closeAll);
    vOverlay?.addEventListener("click", closeAll);

    addBtn?.addEventListener("click", () => {
        if (currentActiveTab === "food") {
            document.getElementById("fnbModalTitle").textContent = "Thêm Món F&B Mới";
            document.getElementById("formFnbItem").reset();
            document.getElementById("fnbItemId").value = "";
            fnbDrawer?.classList.add("open");
            fnbOverlay?.classList.add("open");
        } else {
            document.getElementById("voucherModalTitle").textContent = "Tạo Mã Voucher Mới";
            document.getElementById("formVoucherItem").reset();
            document.getElementById("voucherItemOldCode").value = "";
            vDrawer?.classList.add("open");
            vOverlay?.classList.add("open");
        }
    });

    // SUBMIT FORM MÓN F&B
    document.getElementById("formFnbItem")?.addEventListener("submit", (e) => {
        e.preventDefault();
        const id = document.getElementById("fnbItemId").value;
        const name = document.getElementById("fnbItemName").value.trim();
        const category = document.getElementById("fnbItemCategory").value;
        const price = Number(document.getElementById("fnbItemPrice").value) || 0;
        const origPrice = Number(document.getElementById("fnbItemOrigPrice").value) || null;
        const tag = document.getElementById("fnbItemTag").value.trim();
        const img = document.getElementById("fnbItemImg").value.trim();
        const desc = document.getElementById("fnbItemDesc").value.trim();

        if (id) {
            // Sửa
            const item = fnbList.find(f => f.id === Number(id));
            if (item) {
                item.name = name;
                item.category = category;
                item.price = price;
                item.originalPrice = origPrice;
                item.tag = tag;
                if (img) item.imageUrl = img;
                item.description = desc;
            }
        } else {
            // Thêm mới
            const newId = Date.now();
            fnbList.unshift({
                id: newId,
                name,
                category,
                price,
                originalPrice: origPrice,
                tag,
                imageUrl: img || "https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=400",
                description: desc,
                isAvailable: true
            });
        }

        saveData();
        renderFnbTable();
        closeAll();
        alert("✅ Đã cập nhật thực đơn F&B thành công!");
    });

    // SUBMIT FORM VOUCHER
    document.getElementById("formVoucherItem")?.addEventListener("submit", (e) => {
        e.preventDefault();
        const oldCode = document.getElementById("voucherItemOldCode").value;
        const code = document.getElementById("vCode").value.trim().toUpperCase();
        const discountType = document.getElementById("vType").value;
        const discountValue = Number(document.getElementById("vValue").value) || 10;
        const appliesTo = document.getElementById("vAppliesTo").value;
        const exp = document.getElementById("vExp").value || "2026-12-31";
        const desc = document.getElementById("vDesc").value.trim();

        if (oldCode) {
            const v = voucherList.find(item => item.code === oldCode);
            if (v) {
                v.code = code;
                v.discountType = discountType;
                v.discountValue = discountValue;
                v.appliesTo = appliesTo;
                v.exp = exp;
                v.desc = desc;
            }
        } else {
            if (voucherList.some(item => item.code === code)) {
                return alert("⚠️ Mã voucher này đã tồn tại trong hệ thống!");
            }
            voucherList.unshift({
                code,
                discountType,
                discountValue,
                appliesTo,
                exp,
                desc,
                isActive: true
            });
        }

        saveData();
        renderVoucherTable();
        closeAll();
        alert(`✅ Đã lưu mã voucher [${code}] thành công! Khách hàng có thể áp dụng mã này khi đặt phòng.`);
    });
}

function openEditFnbModal(item) {
    document.getElementById("fnbModalTitle").textContent = "Chỉnh Sửa Món F&B";
    document.getElementById("fnbItemId").value = item.id;
    document.getElementById("fnbItemName").value = item.name;
    document.getElementById("fnbItemCategory").value = item.category;
    document.getElementById("fnbItemPrice").value = item.price;
    document.getElementById("fnbItemOrigPrice").value = item.originalPrice || "";
    document.getElementById("fnbItemTag").value = item.tag || "";
    document.getElementById("fnbItemImg").value = item.imageUrl || "";
    document.getElementById("fnbItemDesc").value = item.description || "";

    document.getElementById("modalFnbBox")?.classList.add("open");
    document.getElementById("modalFnbOverlay")?.classList.add("open");
}

function openEditVoucherModal(v) {
    document.getElementById("voucherModalTitle").textContent = "Chỉnh Sửa Voucher";
    document.getElementById("voucherItemOldCode").value = v.code;
    document.getElementById("vCode").value = v.code;
    document.getElementById("vType").value = v.discountType;
    document.getElementById("vValue").value = v.discountValue;
    document.getElementById("vAppliesTo").value = v.appliesTo;
    document.getElementById("vExp").value = v.exp || "";
    document.getElementById("vDesc").value = v.desc || "";

    document.getElementById("modalVoucherBox")?.classList.add("open");
    document.getElementById("modalVoucherOverlay")?.classList.add("open");
}

function setupSearchFilter() {
    document.getElementById("tableLocalSearch")?.addEventListener("input", (e) => {
        currentSearch = e.target.value.trim().toLowerCase();
        if (currentActiveTab === "food") renderFnbTable();
        else renderVoucherTable();
    });

    document.getElementById("filterCategorySelect")?.addEventListener("change", (e) => {
        currentCategory = e.target.value;
        renderFnbTable();
    });
}

function initClock() {
    const clockEl = document.getElementById("adminLiveClock");
    if (!clockEl) return;
    const update = () => {
        const now = new Date();
        clockEl.textContent = `🕒 ${now.toLocaleTimeString('vi-VN')} · ${now.toLocaleDateString('vi-VN')}`;
    };
    update();
    setInterval(update, 1000);
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = val;
}