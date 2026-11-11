
// ================================
// BLUE SALES - MAIN JAVASCRIPT
// ================================

const DEFAULT_PASSWORD = "123456";

let password = localStorage.getItem("blue_password") || DEFAULT_PASSWORD;

let data = JSON.parse(localStorage.getItem("blue_sales_data") || "{}");

let currentBusiness = "";
let currentStore = "";
let cart = [];

// Lưu dữ liệu
function saveData() {
  localStorage.setItem("blue_sales_data", JSON.stringify(data));
}

// Tạo dữ liệu cửa hàng
function getStores() {
  if (!data[currentBusiness]) {
    data[currentBusiness] = {};
  }
  return data[currentBusiness];
}

function getStore() {
  const stores = getStores();

  if (!stores[currentStore]) {
    stores[currentStore] = {
      menu: [],
      orders: []
    };
  }

  return stores[currentStore];
}

// ĐĂNG NHẬP
function login() {
  const input = document.getElementById("password").value;
  const error = document.getElementById("login-error");

  if (input === password) {
    document.getElementById("login-screen").hidden = true;
    document.getElementById("main-screen").hidden = false;
    error.textContent = "";
  } else {
    error.textContent = "Mật khẩu không chính xác!";
  }
}

// ĐĂNG XUẤT
function logout() {
  document.getElementById("main-screen").hidden = true;
  document.getElementById("login-screen").hidden = false;
  document.getElementById("password").value = "";
  backHome();
}

// CHỌN LOẠI HÌNH
function selectBusiness(type) {
  currentBusiness = type;

  document.getElementById("store-screen").hidden = false;
  document.getElementById("sales-screen").hidden = true;

  document.querySelector(".business-list").hidden = true;

  document.getElementById("business-title").textContent =
    type === "trasua" ? "TRÀ SỮA" : "CÀ PHÊ";

  renderStores();
}

// HIỂN THỊ CỬA HÀNG
function renderStores() {
  const list = document.getElementById("store-list");
  list.innerHTML = "";

  const stores = getStores();

  Object.keys(stores).forEach(name => {
    const item = document.createElement("div");
    item.className = "store-item";

    const title = document.createElement("h3");
    title.textContent = name;

    const open = document.createElement("button");
    open.textContent = "Mở cửa hàng";
    open.onclick = () => openStore(name);

    item.append(title, open);
    list.appendChild(item);
  });
}

// TẠO CỬA HÀNG
function createStore() {
  const name = prompt("Nhập tên cửa hàng:");

  if (!name || !name.trim()) return;

  const stores = getStores();

  if (stores[name.trim()]) {
    alert("Tên cửa hàng đã tồn tại!");
    return;
  }

  stores[name.trim()] = {
    menu: [],
    orders: []
  };

  saveData();
  renderStores();
}

// MỞ CỬA HÀNG
function openStore(name) {
  currentStore = name;

  document.getElementById("store-screen").hidden = true;
  document.getElementById("sales-screen").hidden = false;

  document.getElementById("store-title").textContent = name;

  cart = [];
  openSales();
}

// QUAY LẠI
function backHome() {
  currentBusiness = "";
  currentStore = "";

  document.querySelector(".business-list").hidden = false;
  document.getElementById("store-screen").hidden = true;
  document.getElementById("sales-screen").hidden = true;
}

function backStores() {
  cart = [];

  document.getElementById("sales-screen").hidden = true;
  document.getElementById("store-screen").hidden = false;

  renderStores();
}

// QUẢN LÝ MENU
function openMenu() {
  const content = document.getElementById("content");
  const store = getStore();

  content.innerHTML = `
    <h3>Quản lý menu</h3>
    <input id="product-name" placeholder="Tên món, ví dụ Matcha Latte">
    <input id="product-price" type="number" placeholder="Giá bán (VNĐ)">
    <button onclick="addProduct()">+ Thêm món</button>
    <hr>
    <div id="menu-list"></div>
  `;

  renderMenu();
}

function addProduct() {
  const name = document.getElementById("product-name").value.trim();
  const price = Number(document.getElementById("product-price").value);

  if (!name || !price || price < 0) {
    alert("Vui lòng nhập tên món và giá hợp lệ!");
    return;
  }

  const menu = getStore().menu;

  if (menu.some(p => p.name.toLowerCase() === name.toLowerCase())) {
    alert("Món này đã có trong menu!");
    return;
  }

  menu.push({
    id: Date.now(),
    name,
    price
  });

  saveData();
  openMenu();
}

// HIỂN THỊ MENU
function renderMenu() {
  const list = document.getElementById("menu-list");
  const menu = getStore().menu;

  list.innerHTML = "";

  menu.forEach(product => {
    const item = document.createElement("div");
    item.className = "store-item";

    const name = document.createElement("strong");
    name.textContent = product.name;

    const price = document.createElement("p");
    price.textContent = product.price.toLocaleString("vi-VN") + " đ";

    const remove = document.createElement("button");
    remove.textContent = "Xóa";
    remove.onclick = () => deleteProduct(product.id);

    item.append(name, price, remove);
    list.appendChild(item);
  });
}

function deleteProduct(id) {
  if (!confirm("Bạn muốn xóa món này?")) return;

  const store = getStore();
  store.menu = store.menu.filter(p => p.id !== id);

  saveData();
  openMenu();
}

// BÁN HÀNG
function openSales() {
  const content = document.getElementById("content");

  content.innerHTML = `
    <h3>Tạo đơn hàng</h3>
    <input id="search-product"
      placeholder="Tìm món... Ví dụ: mat"
      oninput="searchProducts()">

    <div id="suggestions"></div>
    <div id="cart-list"></div>

    <h3 id="total-price">Tổng: 0 đ</h3>

    <button onclick="completeOrder()">
      THANH TOÁN
    </button>
  `;

  renderCart();
}

// TÌM MÓN VÀ GỢI Ý
function searchProducts() {
  const keyword = document
    .getElementById("search-product")
    .value.toLowerCase()
    .trim();

  const suggestions = document.getElementById("suggestions");
  suggestions.innerHTML = "";

  if (!keyword) return;

  const menu = getStore().menu;

  const results = menu.filter(product =>
    product.name.toLowerCase().includes(keyword)
  );

  results.forEach(product => {
    const button = document.createElement("button");

    button.textContent =
      product.name + " - " +
      product.price.toLocaleString("vi-VN") + " đ";

    button.style.display = "block";
    button.style.width = "100%";
    button.style.padding = "12px";
    button.style.margin = "5px 0";

    button.onclick = () => {
      addToCart(product.id);
      document.getElementById("search-product").value = "";
      suggestions.innerHTML = "";
    };

    suggestions.appendChild(button);
  });
}

// THÊM MÓN VÀO ĐƠN
function addToCart(id) {
  const product = getStore().menu.find(p => p.id === id);

  if (!product) return;

  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    });
  }

  renderCart();
}

// HIỂN THỊ GIỎ HÀNG
function renderCart() {
  const list = document.getElementById("cart-list");
  if (!list) return;

  list.innerHTML = "";

  cart.forEach(item => {
    const row = document.createElement("div");
    row.className = "store-item";

    const name = document.createElement("strong");
    name.textContent = item.name;

    const amount = document.createElement("p");
    amount.textContent =
      item.price.toLocaleString("vi-VN") +
      " đ × " + item.quantity;

    const minus = document.createElement("button");
    minus.textContent = "−";
    minus.onclick = () => changeQuantity(item.id, -1);

    const plus = document.createElement("button");
    plus.textContent = "+";
    plus.onclick = () => changeQuantity(item.id, 1);

    row.append(name, amount, minus, plus);
    list.appendChild(row);
  });

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  document.getElementById("total-price").textContent =
    "Tổng: " + total.toLocaleString("vi-VN") + " đ";
}

// TĂNG GIẢM SỐ LƯỢNG
function changeQuantity(id, amount) {
  const item = cart.find(p => p.id === id);

  if (!item) return;

  item.quantity += amount;

  if (item.quantity <= 0) {
    cart = cart.filter(p => p.id !== id);
  }

  renderCart();
}

// THANH TOÁN
function completeOrder() {
  if (cart.length === 0) {
    alert("Đơn hàng chưa có sản phẩm!");
    return;
  }

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  getStore().orders.push({
    id: Date.now(),
    date: new Date().toISOString(),
    items: JSON.parse(JSON.stringify(cart)),
    total
  });

  saveData();

  alert("Thanh toán thành công!\nTổng tiền: " +
    total.toLocaleString("vi-VN") + " đ");

  cart = [];
  openSales();
}

// BÁO CÁO
function openReports() {
  const content = document.getElementById("content");
  const orders = getStore().orders;

  const today = new Date().toLocaleDateString("vi-VN");

  const todayOrders = orders.filter(order =>
    new Date(order.date).toLocaleDateString("vi-VN") === today
  );

  const revenue = todayOrders.reduce(
    (sum, order) => sum + order.total, 0
  );

  content.innerHTML = `
    <h3>Báo cáo hôm nay</h3>
    <p>Số đơn: ${todayOrders.length}</p>
    <h2>Doanh thu: ${revenue.toLocaleString("vi-VN")} đ</h2>
    <hr>
    <h3>Lịch sử đơn hàng</h3>
    <div id="order-history"></div>
  `;

  const history = document.getElementById("order-history");

  [...orders].reverse().forEach(order => {
    const item = document.createElement("div");
    item.className = "store-item";

    const date = document.createElement("p");
    date.textContent = new Date(order.date).toLocaleString("vi-VN");

    const amount = document.createElement("strong");
    amount.textContent = order.total.toLocaleString("vi-VN") + " đ";

    item.append(date, amount);
    history.appendChild(item);
  });
}
