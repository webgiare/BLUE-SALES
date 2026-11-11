
const $ = id => document.getElementById(id);

const STORAGE_KEY = "blueSalesOrders";
const MENU_KEY = "blueSalesMenus";
const PASSWORD_KEY = "blueSalesPassword";

let cart = [];
let orders = [];
let menus = {};
let currentBusiness = "Trà sữa";

// MENU MẪU
const defaultMenus = {
  "Trà sữa": [
    { name: "Trà sữa truyền thống", prices: { M: 25000, L: 30000, XL: 35000 } },
    { name: "Trà sữa trân châu", prices: { M: 28000, L: 33000, XL: 38000 } },
    { name: "Trà sữa matcha", prices: { M: 30000, L: 35000, XL: 40000 } },
    { name: "Matcha Latte", prices: { M: 30000, L: 35000, XL: 40000 } },
    { name: "Matcha Dừa", prices: { M: 32000, L: 37000, XL: 42000 } },
    { name: "Trà đào", prices: { M: 25000, L: 30000, XL: 35000 } },
    { name: "Trà vải", prices: { M: 25000, L: 30000, XL: 35000 } },
    { name: "Trà chanh", prices: { M: 20000, L: 25000, XL: 30000 } },
    { name: "Trà tắc", prices: { M: 15000, L: 20000, XL: 25000 } },
    { name: "Trà dâu", prices: { M: 28000, L: 33000, XL: 38000 } },
    { name: "Trà xoài", prices: { M: 28000, L: 33000, XL: 38000 } },
    { name: "Trà sen", prices: { M: 25000, L: 30000, XL: 35000 } },
    { name: "Trà ô long", prices: { M: 25000, L: 30000, XL: 35000 } },
    { name: "Trà sữa socola", prices: { M: 28000, L: 33000, XL: 38000 } },
    { name: "Trà sữa khoai môn", prices: { M: 28000, L: 33000, XL: 38000 } },
    { name: "Trà sữa dâu", prices: { M: 28000, L: 33000, XL: 38000 } },
    { name: "Trà sữa bạc hà", prices: { M: 28000, L: 33000, XL: 38000 } },
    { name: "Trà sữa ô long", prices: { M: 30000, L: 35000, XL: 40000 } },
    { name: "Trà sữa thái xanh", prices: { M: 25000, L: 30000, XL: 35000 } },
    { name: "Trà sữa thái đỏ", prices: { M: 25000, L: 30000, XL: 35000 } },
    { name: "Sữa tươi trân châu đường đen", prices: { M: 30000, L: 35000, XL: 40000 } },
    { name: "Cacao sữa", prices: { M: 25000, L: 30000, XL: 35000 } },
    { name: "Sữa chua", prices: { M: 25000, L: 30000, XL: 35000 } }
  ],
  "Cà phê": [
    { name: "Cà phê đen", prices: { M: 20000, L: 25000, XL: 30000 } },
    { name: "Cà phê sữa", prices: { M: 25000, L: 30000, XL: 35000 } },
    { name: "Bạc xỉu", prices: { M: 25000, L: 30000, XL: 35000 } },
    { name: "Cà phê muối", prices: { M: 30000, L: 35000, XL: 40000 } },
    { name: "Americano", prices: { M: 25000, L: 30000, XL: 35000 } },
    { name: "Latte", prices: { M: 30000, L: 35000, XL: 40000 } },
    { name: "Cappuccino", prices: { M: 30000, L: 35000, XL: 40000 } },
    { name: "Mocha", prices: { M: 30000, L: 35000, XL: 40000 } },
    { name: "Espresso", prices: { M: 20000, L: 25000, XL: 30000 } }
  ]
};

// TIỆN ÍCH
function money(value) {
  return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
}

function getLocalDate() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("-");
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

// ĐỌC VÀ LƯU DỮ LIỆU
function loadData() {
  try {
    const savedOrders = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    orders = Array.isArray(savedOrders) ? savedOrders : [];

    const savedMenus = JSON.parse(
      localStorage.getItem(MENU_KEY) || "null"
    );

    menus = savedMenus && typeof savedMenus === "object"
      ? savedMenus
      : JSON.parse(JSON.stringify(defaultMenus));

    if (!Array.isArray(menus["Trà sữa"])) {
      menus["Trà sữa"] = JSON.parse(JSON.stringify(defaultMenus["Trà sữa"]));
    }

    if (!Array.isArray(menus["Cà phê"])) {
      menus["Cà phê"] = JSON.parse(JSON.stringify(defaultMenus["Cà phê"]));
    }

    // Đưa đơn hàng cũ vào danh mục Trà sữa
    orders = orders.map(order => ({
      ...order,
      business: order.business || "Trà sữa"
    }));

  } catch (error) {
    orders = [];
    menus = JSON.parse(JSON.stringify(defaultMenus));
    alert("Có lỗi khi đọc dữ liệu. Hãy kiểm tra bộ nhớ trình duyệt.");
  }
}

function saveOrders() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    return true;
  } catch (error) {
    alert("Không thể lưu đơn hàng.");
    return false;
  }
}

function saveMenus() {
  try {
    localStorage.setItem(MENU_KEY, JSON.stringify(menus));
    return true;
  } catch (error) {
    alert("Không thể lưu menu.");
    return false;
  }
}

// ĐĂNG NHẬP
function showApp() {
  $("loginScreen").style.display = "none";
  $("app").classList.remove("app-hidden");
}

function login() {
  const password = $("loginPassword").value;
  const savedPassword = localStorage.getItem(PASSWORD_KEY) || "123456";

  if (password === savedPassword) {
    $("loginError").textContent = "";
    $("loginPassword").value = "";
    showApp();
  } else {
    $("loginError").textContent = "Mật khẩu không chính xác.";
  }
}

function lockApp() {
  $("app").classList.add("app-hidden");
  $("loginScreen").style.display = "grid";
  $("loginPassword").value = "";
}

function changePassword() {
  const newPassword = $("newPassword").value.trim();

  if (newPassword.length < 4) {
    alert("Mật khẩu cần có ít nhất 4 ký tự.");
    return;
  }

  localStorage.setItem(PASSWORD_KEY, newPassword);
  $("newPassword").value = "";
  alert("Đổi mật khẩu thành công!");
}

// NGÀY HÔM NAY
function showToday() {
  $("todayLabel").textContent =
    new Date().toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
}

// CHUYỂN DANH MỤC
function switchBusiness(business) {
  if (!menus[business]) return;

  currentBusiness = business;
  cart = [];

  document.querySelectorAll(".business-btn").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.business === business
    );
  });

  $("productName").value = "";
  $("productPrice").value = "";
  $("productSize").value = "";

  renderCart();
  renderMenu();
  renderSuggestions();
  renderAll();
}

// MENU GỢI Ý
function renderSuggestions() {
  const datalist = $("productSuggestions");

  datalist.innerHTML = menus[currentBusiness].map(item =>
    `<option value="${escapeHTML(item.name)}"></option>`
  ).join("");
}

function findMenuItem(name) {
  return menus[currentBusiness].find(item =>
    item.name.toLowerCase() === name.trim().toLowerCase()
  );
}

function fillPrice() {
  const name = $("productName").value.trim();
  const size = $("productSize").value;
  const item = findMenuItem(name);

  if (!item) {
    $("priceHint").textContent =
      "Chọn món có trong menu để tự điền giá.";
    return;
  }

  if (!size) {
    $("priceHint").textContent =
      "Đã tìm thấy món. Hãy chọn size.";
    return;
  }

  const price = item.prices[size];

  if (price !== null && price !== undefined && price !== "") {
    $("productPrice").value = price;
    $("priceHint").textContent =
      "Đã tự động điền giá từ menu.";
  } else {
    $("productPrice").value = "";
    $("priceHint").textContent =
      "Món này chưa có giá cho size " + size + ".";
  }
}

// QUẢN LÝ MENU
function addMenuItem() {
  const name = $("menuName").value.trim();

  if (!name) {
    alert("Bạn hãy nhập tên món.");
    return;
  }

  const prices = {
    M: Number($("menuPriceM").value),
    L: Number($("menuPriceL").value),
    XL: Number($("menuPriceXL").value)
  };

  const hasPrice = ["M", "L", "XL"].some(size =>
    $( "menuPrice" + size ).value.trim() !== ""
  );

  if (!hasPrice) {
    alert("Hãy nhập ít nhất một mức giá.");
    return;
  }

  if (Object.values(prices).some(price =>
    !Number.isSafeInteger(price) || price < 0
  )) {
    for (const size of ["M", "L", "XL"]) {
      const value = $("menuPrice" + size).value.trim();
      if (value !== "" &&
          (!Number.isSafeInteger(Number(value)) || Number(value) < 0)) {
        alert("Giá món không hợp lệ.");
        return;
      }
    }
  }

  if (findMenuItem(name)) {
    alert("Món này đã có trong menu.");
    return;
  }

  menus[currentBusiness].push({ name, prices });

  if (!saveMenus()) {
    menus[currentBusiness].pop();
    return;
  }

  $("menuName").value = "";
  $("menuPriceM").value = "";
  $("menuPriceL").value = "";
  $("menuPriceXL").value = "";

  renderMenu();
  renderSuggestions();
  alert("Đã thêm món vào menu.");
}

function renderMenu() {
  const list = $("menuList");
  const items = menus[currentBusiness];

  if (!items.length) {
    list.innerHTML =
      '<div class="empty-state">Menu chưa có món nào.</div>';
    return;
  }

  list.innerHTML = items.map((item, index) => {
    const priceText = ["M", "L", "XL"]
      .filter(size => item.prices[size] !== "" &&
        item.prices[size] !== null &&
        item.prices[size] !== undefined)
      .map(size => size + ": " + money(item.prices[size]))
      .join(" · ");

    return `
      <div class="menu-row">
        <div>
          <strong>${escapeHTML(item.name)}</strong>
          <small>${priceText || "Chưa có giá"}</small>
        </div>
        <div class="menu-row-actions">
          <button class="edit-menu" data-edit-menu="${index}">Sửa</button>
          <button class="delete-menu" data-delete-menu="${index}">Xóa</button>
        </div>
      </div>
    `;
  }).join("");
}

function editMenuItem(index) {
  const item = menus[currentBusiness][index];
  if (!item) return;

  const name = prompt("Tên món:", item.name);
  if (name === null) return;

  const newName = name.trim();
  if (!newName) {
    alert("Tên món không được để trống.");
    return;
  }

  const prices = {};

  for (const size of ["M", "L", "XL"]) {
    const oldPrice = item.prices[size] ?? "";
    const value = prompt("Giá size " + size + " (để trống nếu không có):", oldPrice);

    if (value === null) return;

    if (value.trim() === "") {
      prices[size] = "";
    } else if (!Number.isSafeInteger(Number(value)) || Number(value) < 0) {
      alert("Giá size " + size + " không hợp lệ.");
      return;
    } else {
      prices[size] = Number(value);
    }
  }

  const duplicate = menus[currentBusiness].some((other, i) =>
    i !== index && other.name.toLowerCase() === newName.toLowerCase()
  );

  if (duplicate) {
    alert("Tên món này đã tồn tại.");
    return;
  }

  const oldItem = menus[currentBusiness][index];
  menus[currentBusiness][index] = { name: newName, prices };

  if (!saveMenus()) {
    menus[currentBusiness][index] = oldItem;
    return;
  }

  renderMenu();
  renderSuggestions();
}

function deleteMenuItem(index) {
  const item = menus[currentBusiness][index];
  if (!item) return;

  if (!confirm("Xóa món " + item.name + " khỏi menu?")) return;

  const old = menus[currentBusiness].splice(index, 1);

  if (!saveMenus()) {
    menus[currentBusiness].splice(index, 0, ...old);
    return;
  }

  renderMenu();
  renderSuggestions();
}

$("menuList").addEventListener("click", event => {
  const editButton = event.target.closest("[data-edit-menu]");
  const deleteButton = event.target.closest("[data-delete-menu]");

  if (editButton) {
    editMenuItem(Number(editButton.dataset.editMenu));
  }

  if (deleteButton) {
    deleteMenuItem(Number(deleteButton.dataset.deleteMenu));
  }
});

// GIỎ HÀNG
function getCartTotal() {
  return cart.reduce((sum, item) =>
    sum + item.quantity * item.price, 0
  );
}

function addProduct() {
  const name = $("productName").value.trim();
  const size = $("productSize").value;
  const quantity = Number($("productQuantity").value);
  const price = Number($("productPrice").value);

  if (!name) {
    alert("Bạn hãy nhập tên món.");
    $("productName").focus();
    return;
  }

  if (!Number.isSafeInteger(quantity) || quantity < 1) {
    alert("Số lượng phải là số nguyên lớn hơn 0.");
    return;
  }

  if ($("productPrice").value.trim() === "" ||
      !Number.isSafeInteger(price) || price < 0) {
    alert("Bạn hãy nhập giá bán hợp lệ.");
    $("productPrice").focus();
    return;
  }

  const lineTotal = quantity * price;

  if (!Number.isSafeInteger(lineTotal) ||
      !Number.isSafeInteger(getCartTotal() + lineTotal)) {
    alert("Số tiền quá lớn.");
    return;
  }

  cart.push({
    name,
    size,
    quantity,
    price
  });

  $("productName").value = "";
  $("productSize").value = "";
  $("productQuantity").value = "1";
  $("productPrice").value = "";
  $("priceHint").textContent =
    "Chọn món và size để tự điền giá trong menu.";

  $("productName").focus();
  renderCart();
}

function renderCart() {
  const list = $("cartList");

  if (!cart.length) {
    list.innerHTML =
      '<div class="empty-state">Chưa có sản phẩm nào.</div>';
  } else {
    list.innerHTML = cart.map((item, index) => `
      <div class="cart-item">
        <div class="item-info">
          <strong>${escapeHTML(item.name)}
            ${item.size ? "(" + escapeHTML(item.size) + ")" : ""}
          </strong>
          <span>${item.quantity} x ${money(item.price)}</span>
        </div>

        <div class="item-right">
          <span class="item-price">
            ${money(item.quantity * item.price)}
          </span>
          <button class="remove-btn" data-remove="${index}">Xóa</button>
        </div>
      </div>
    `).join("");
  }

  $("cartTotal").textContent = money(getCartTotal());
}

$("cartList").addEventListener("click", event => {
  const button = event.target.closest("[data-remove]");
  if (!button) return;

  const index = Number(button.dataset.remove);

  if (Number.isInteger(index) &&
      index >= 0 && index < cart.length) {
    cart.splice(index, 1);
    renderCart();
  }
});

// LƯU ĐƠN HÀNG
function saveOrder() {
  if (!cart.length) {
    alert("Bạn chưa thêm sản phẩm vào đơn.");
    return;
  }

  const total = getCartTotal();

  if (!Number.isSafeInteger(total)) {
    alert("Tổng tiền không hợp lệ.");
    return;
  }

  const order = {
    id: Date.now().toString() +
      Math.random().toString(36).slice(2, 7),
    date: getLocalDate(),
    time: new Date().toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit"
    }),
    business: currentBusiness,
    items: cart.map(item => ({ ...item })),
    total
  };

  orders.unshift(order);

  if (!saveOrders()) {
    orders.shift();
    return;
  }

  cart = [];
  renderCart();
  renderAll();

  alert("Đã lưu đơn hàng thành công!");
}

// THỐNG KÊ
function getOrdersByDate(date) {
  return orders.filter(order =>
    order.date === date &&
    (order.business || "Trà sữa") === currentBusiness
  );
}

function countProducts(orderList) {
  return orderList.reduce((sum, order) =>
    sum + order.items.reduce(
      (itemSum, item) => itemSum + Number(item.quantity || 0),
      0
    ), 0
  );
}

function calculateRevenue(orderList) {
  return orderList.reduce((sum, order) =>
    sum + Number(order.total || 0), 0
  );
}

function renderDashboard() {
  const todayOrders = getOrdersByDate(getLocalDate());

  $("todayRevenue").textContent =
    money(calculateRevenue(todayOrders));

  $("todayOrders").textContent = todayOrders.length;

  $("todayProducts").textContent =
    countProducts(todayOrders);
}

function renderReport() {
  const selectedOrders = getOrdersByDate($("reportDate").value);

  $("reportRevenue").textContent =
    money(calculateRevenue(selectedOrders));

  $("reportOrders").textContent = selectedOrders.length;

  $("reportProducts").textContent =
    countProducts(selectedOrders);
}

// LỊCH SỬ
function renderHistory() {
  const selectedOrders = getOrdersByDate($("historyDate").value);
  const history = $("orderHistory");

  if (!selectedOrders.length) {
    history.innerHTML =
      '<div class="empty-state">Không có đơn hàng nào trong ngày này.</div>';
    return;
  }

  history.innerHTML = selectedOrders.map(order => {
    const details = order.items.map(item =>
      `${escapeHTML(item.name)}${item.size ? " (" + escapeHTML(item.size) + ")" : ""} x ${item.quantity}`
    ).join(", ");

    return `
      <div class="history-order">
        <div class="history-head">
          <strong>Đơn hàng #${escapeHTML(order.id.slice(-5))}</strong>
          <span>${escapeHTML(order.time || "")}</span>
        </div>

        <div class="history-details">${details}</div>

        <div class="history-bottom">
          <strong>${money(order.total)}</strong>
          <button class="delete-order" data-delete="${escapeHTML(order.id)}">
            Xóa đơn
          </button>
        </div>
      </div>
    `;
  }).join("");
}

$("orderHistory").addEventListener("click", event => {
  const button = event.target.closest("[data-delete]");
  if (!button) return;

  const id = button.dataset.delete;

  if (!confirm("Bạn có chắc chắn muốn xóa đơn hàng này không?")) {
    return;
  }

  const oldOrders = orders;
  orders = orders.filter(order => order.id !== id);

  if (!saveOrders()) {
    orders = oldOrders;
    return;
  }

  renderAll();
});

// XUẤT CSV
function exportCSV() {
  const date = $("reportDate").value;
  const selectedOrders = getOrdersByDate(date);

  if (!selectedOrders.length) {
    alert("Ngày này chưa có đơn hàng để xuất báo cáo.");
    return;
  }

  const rows = [
    ["Ma don", "Ngay", "Gio", "Danh muc", "Ten hang",
     "Size", "So luong", "Don gia", "Thanh tien"]
  ];

  selectedOrders.forEach(order => {
    order.items.forEach(item => {
      rows.push([
        order.id,
        order.date,
        order.time || "",
        order.business || "Trà sữa",
        item.name,
        item.size || "",
        item.quantity,
        item.price,
        item.quantity * item.price
      ]);
    });
  });

  const csv = "\uFEFF" + rows.map(row =>
    row.map(value =>
      '"' + String(value).replace(/"/g, '""') + '"'
    ).join(",")
  ).join("\r\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `bao-cao-${currentBusiness}-${date}.csv`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

// CẬP NHẬT GIAO DIỆN
function renderAll() {
  renderDashboard();
  renderReport();
  renderHistory();
}

// KHỞI CHẠY
function init() {
  loadData();

  const today = getLocalDate();

  $("reportDate").value = today;
  $("historyDate").value = today;

  showToday();
  renderCart();
  renderMenu();
  renderSuggestions();
  renderAll();

  $("loginBtn").addEventListener("click", login);
  $("loginPassword").addEventListener("keydown", event => {
    if (event.key === "Enter") login();
  });

  $("lockBtn").addEventListener("click", lockApp);
  $("changePasswordBtn").addEventListener("click", changePassword);

  $("addProductBtn").addEventListener("click", addProduct);
  $("saveOrderBtn").addEventListener("click", saveOrder);
  $("exportBtn").addEventListener("click", exportCSV);
  $("addMenuBtn").addEventListener("click", addMenuItem);

  $("productName").addEventListener("input", fillPrice);
  $("productSize").addEventListener("change", fillPrice);

  $("reportDate").addEventListener("change", renderReport);
  $("historyDate").addEventListener("change", renderHistory);

  document.querySelectorAll(".business-btn").forEach(button => {
    button.addEventListener("click", () =>
      switchBusiness(button.dataset.business)
    );
  });

  $("productName").addEventListener("keydown", event => {
    if (event.key === "Enter") {
      $("productSize").focus();
    }
  });

  $("productSize").addEventListener("keydown", event => {
    if (event.key === "Enter") {
      $("productQuantity").focus();
    }
  });

  $("productQuantity").addEventListener("keydown", event => {
    if (event.key === "Enter") {
      $("productPrice").focus();
    }
  });

  $("productPrice").addEventListener("keydown", event => {
    if (event.key === "Enter") addProduct();
  });
}

init();
