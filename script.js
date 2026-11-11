
const $ = (id) => document.getElementById(id);

const STORAGE_KEY = "blueSalesOrders";

let cart = [];
let orders = [];

// Định dạng tiền Việt Nam
function money(value) {
  return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
}

// Lấy ngày theo giờ địa phương
function getLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Chuyển ký tự đặc biệt thành dạng an toàn khi hiển thị
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

// Đọc dữ liệu đã lưu
function loadOrders() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const data = saved ? JSON.parse(saved) : [];

    orders = Array.isArray(data) ? data : [];
  } catch (error) {
    orders = [];
    alert("Không đọc được dữ liệu đã lưu trên trình duyệt.");
  }
}

// Lưu dữ liệu vào trình duyệt
function saveOrders() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    return true;
  } catch (error) {
    alert("Không thể lưu dữ liệu. Bạn hãy kiểm tra bộ nhớ trình duyệt.");
    return false;
  }
}

// Hiển thị ngày hôm nay
function showToday() {
  $("todayLabel").textContent =
    new Date().toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
}

// Tính tổng tiền trong giỏ hàng
function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.quantity * item.price, 0);
}

// Thêm sản phẩm vào đơn
function addProduct() {
  const name = $("productName").value.trim();
  const quantity = Number($("productQuantity").value);
  const price = Number($("productPrice").value);

  if (!name) {
    alert("Bạn hãy nhập tên hàng hóa.");
    $("productName").focus();
    return;
  }

  if (!Number.isSafeInteger(quantity) || quantity < 1) {
    alert("Số lượng phải là số nguyên lớn hơn 0.");
    return;
  }

  if (!Number.isSafeInteger(price) || price < 0) {
    alert("Giá bán không hợp lệ.");
    return;
  }

  const lineTotal = quantity * price;

  if (!Number.isSafeInteger(lineTotal) ||
      !Number.isSafeInteger(getCartTotal() + lineTotal)) {
    alert("Số tiền quá lớn, bạn hãy kiểm tra lại.");
    return;
  }

  cart.push({
    name,
    quantity,
    price
  });

  $("productName").value = "";
  $("productQuantity").value = "1";
  $("productPrice").value = "";

  $("productName").focus();

  renderCart();
}

// Hiển thị sản phẩm trong đơn
function renderCart() {
  const list = $("cartList");

  if (cart.length === 0) {
    list.innerHTML = '<div class="empty-state">Chưa có sản phẩm nào.</div>';
  } else {
    list.innerHTML = cart.map((item, index) => `
      <div class="cart-item">
        <div class="item-info">
          <strong>${escapeHTML(item.name)}</strong>
          <span>${item.quantity} x ${money(item.price)}</span>
        </div>

        <div class="item-right">
          <span class="item-price">
            ${money(item.quantity * item.price)}
          </span>
          <button class="remove-btn" data-remove="${index}">
            Xóa
          </button>
        </div>
      </div>
    `).join("");
  }

  $("cartTotal").textContent = money(getCartTotal());
}

// Xóa một sản phẩm khỏi đơn đang tạo
$("cartList").addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove]");

  if (!button) return;

  const index = Number(button.dataset.remove);

  if (Number.isInteger(index) && index >= 0 && index < cart.length) {
    cart.splice(index, 1);
    renderCart();
  }
});

// Lưu đơn hàng
function saveOrder() {
  if (cart.length === 0) {
    alert("Bạn chưa thêm sản phẩm vào đơn hàng.");
    return;
  }

  const total = getCartTotal();

  if (!Number.isSafeInteger(total)) {
    alert("Tổng tiền không hợp lệ.");
    return;
  }

  const order = {
    id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
    date: getLocalDate(),
    time: new Date().toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit"
    }),
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

// Lấy các đơn theo ngày
function getOrdersByDate(date) {
  return orders.filter(order => order.date === date);
}

// Tính tổng số sản phẩm trong danh sách đơn
function countProducts(orderList) {
  return orderList.reduce((sum, order) => {
    return sum + order.items.reduce(
      (itemSum, item) => itemSum + item.quantity,
      0
    );
  }, 0);
}

// Tính tổng doanh thu
function calculateRevenue(orderList) {
  return orderList.reduce((sum, order) => sum + order.total, 0);
}

// Cập nhật bảng tổng quan hôm nay
function renderDashboard() {
  const todayOrders = getOrdersByDate(getLocalDate());

  $("todayRevenue").textContent =
    money(calculateRevenue(todayOrders));

  $("todayOrders").textContent = todayOrders.length;

  $("todayProducts").textContent =
    countProducts(todayOrders);
}

// Cập nhật báo cáo theo ngày đã chọn
function renderReport() {
  const date = $("reportDate").value;
  const selectedOrders = getOrdersByDate(date);

  $("reportRevenue").textContent =
    money(calculateRevenue(selectedOrders));

  $("reportOrders").textContent =
    selectedOrders.length;

  $("reportProducts").textContent =
    countProducts(selectedOrders);
}

// Hiển thị lịch sử đơn hàng
function renderHistory() {
  const date = $("historyDate").value;
  const selectedOrders = getOrdersByDate(date);
  const history = $("orderHistory");

  if (selectedOrders.length === 0) {
    history.innerHTML =
      '<div class="empty-state">Không có đơn hàng nào trong ngày này.</div>';
    return;
  }

  history.innerHTML = selectedOrders.map(order => {
    const details = order.items.map(item =>
      `${escapeHTML(item.name)} x ${item.quantity}`
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
          <button
            class="delete-order"
            data-delete="${escapeHTML(order.id)}"
          >
            Xóa đơn
          </button>
        </div>
      </div>
    `;
  }).join("");
}

// Xóa đơn hàng đã lưu
$("orderHistory").addEventListener("click", (event) => {
  const button = event.target.closest("[data-delete]");

  if (!button) return;

  const id = button.dataset.delete;

  const confirmed = confirm(
    "Bạn có chắc chắn muốn xóa đơn hàng này không?"
  );

  if (!confirmed) return;

  const oldOrders = orders;
  orders = orders.filter(order => order.id !== id);

  if (!saveOrders()) {
    orders = oldOrders;
    return;
  }

  renderAll();
});

// Xuất báo cáo CSV để mở bằng Excel
function exportCSV() {
  const date = $("reportDate").value;
  const selectedOrders = getOrdersByDate(date);

  if (selectedOrders.length === 0) {
    alert("Ngày này chưa có đơn hàng để xuất báo cáo.");
    return;
  }

  const rows = [
    ["Ma don", "Ngay", "Gio", "Ten hang", "So luong", "Don gia", "Thanh tien"]
  ];

  selectedOrders.forEach(order => {
    order.items.forEach(item => {
      rows.push([
        order.id,
        order.date,
        order.time || "",
        item.name,
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
  link.download = `bao-cao-doanh-thu-${date}.csv`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

// Cập nhật toàn bộ giao diện
function renderAll() {
  renderDashboard();
  renderReport();
  renderHistory();
}

// Khởi chạy website
function init() {
  const today = getLocalDate();

  $("reportDate").value = today;
  $("historyDate").value = today;

  loadOrders();
  showToday();
  renderCart();
  renderAll();

  $("addProductBtn").addEventListener("click", addProduct);
  $("saveOrderBtn").addEventListener("click", saveOrder);
  $("exportBtn").addEventListener("click", exportCSV);

  $("reportDate").addEventListener("change", renderReport);
  $("historyDate").addEventListener("change", renderHistory);

  $("productName").addEventListener("keydown", event => {
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
    if (event.key === "Enter") {
      addProduct();
    }
  });
}

init();
