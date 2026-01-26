let editInvoiceIndex = null;

// عند تحميل الصفحة
window.onload = function () {
  loadData();
  renderCustomerSelect();
  renderSales();

  document.getElementById("addItemBtn").onclick = addInvoiceItem;
  document.getElementById("saveInvoiceBtn").onclick = saveSale;

  // عند اختيار العميل، نعرض رصيده الحالي
  document
    .getElementById("invoiceCustomer")
    .addEventListener("change", function () {
      const index = this.value;
      const balanceInput = document.getElementById("customerBalance");
      balanceInput.value = index === "" ? 0 : customers[index].balance || 0;
      updateGrandTotal();
    });

  // ربط حقل المدفوع لتحديث المتبقي تلقائيًا
  document
    .getElementById("paidAmount")
    .addEventListener("input", updateRemaining);
};

// ===============================
// عرض العملاء
// ===============================
function renderCustomerSelect() {
  const sel = document.getElementById("invoiceCustomer");
  if (!sel) return;

  sel.innerHTML =
    `<option value="">إختر عميل</option>` +
    `<option value="">نقدي بدون عميل</option>` +
    customers.map((c, i) => `<option value="${i}">${c.name}</option>`).join("");
}

// ===============================
// إضافة صف منتج جديد للفاتورة
// ===============================
function addInvoiceItem() {
  const container = document.getElementById("invoiceItems");
  if (!container) return;

  const row = document.createElement("div");
  row.className = "form-row invoice-item";

  row.innerHTML = `
    <select class="itemProduct">
    <option value="">إختر منتج</option>
      ${products.map((p, i) => `<option value="${i}">${p.name}</option>`).join("")}
    </select>
    <input type="number" class="itemQty" placeholder="الكمية" min="1">
    <input type="number" class="itemPrice" placeholder="سعر البيع" min="0" readonly>
    <input type="number" class="itemTotal" placeholder="الإجمالي" readonly>
    <button type="button" class="btn-delete-item">❌</button>
  `;

  container.appendChild(row);

  const productSelect = row.querySelector(".itemProduct");
  const qtyInput = row.querySelector(".itemQty");
  const priceInput = row.querySelector(".itemPrice");
  const totalInput = row.querySelector(".itemTotal");
  const deleteBtn = row.querySelector(".btn-delete-item");

  function updateRowTotal() {
    const qty = +qtyInput.value || 0;
    const price = +priceInput.value || 0;
    totalInput.value = qty * price;
    updateInvoiceTotal();
  }

  productSelect.addEventListener("change", function () {
    const product = products[this.value];
    priceInput.value = product ? product.price : 0;
    updateRowTotal();
  });

  qtyInput.addEventListener("input", updateRowTotal);

  deleteBtn.addEventListener("click", () => {
    row.remove();
    updateInvoiceTotal();
  });
}

// ===============================
// تحديث إجمالي الفاتورة
// ===============================
function updateInvoiceTotal() {
  const rows = document.querySelectorAll(".invoice-item");
  let total = 0;
  rows.forEach((row) => {
    total += +row.querySelector(".itemTotal").value || 0;
  });
  document.getElementById("invoiceTotal").value = total;
  updateGrandTotal();
}

// ===============================
// تحديث الإجمالي الكلي = رصيد العميل + إجمالي الفاتورة
// ===============================
function updateGrandTotal() {
  const customerBalance =
    +document.getElementById("customerBalance").value || 0;
  const invoiceTotal = +document.getElementById("invoiceTotal").value || 0;
  document.getElementById("grandTotal").value = customerBalance + invoiceTotal;
  updateRemaining();
}

// ===============================
// تحديث المتبقي بعد الدفع
// ===============================
function updateRemaining() {
  const grandTotal = +document.getElementById("grandTotal").value || 0;
  const paid = +document.getElementById("paidAmount").value || 0;
  document.getElementById("remainingAmount").value = grandTotal - paid;
}

// ===============================
// حفظ الفاتورة
// ===============================
function saveSale() {
  const container = document.getElementById("invoiceItems");
  const paidEl = document.getElementById("paidAmount");
  const customerIndex = document.getElementById("invoiceCustomer").value;

  if (editInvoiceIndex !== null) {
    const oldInvoice = sales[editInvoiceIndex];

    oldInvoice.items.forEach((item) => {
      const product = products.find((p) => p.name === item.name);
      if (product) product.qty += item.qty;
    });

    if (oldInvoice.customer !== "نقدي") {
      const customer = customers.find((c) => c.name === oldInvoice.customer);
      if (customer) customer.balance -= oldInvoice.total - oldInvoice.paid;
    }

    cash.income -= oldInvoice.paid;
    if (cash.income < 0) cash.income = 0;

    sales.splice(editInvoiceIndex, 1);
    editInvoiceIndex = null;
  }

  if (!container || !paidEl) return;

  const productEls = container.querySelectorAll(".itemProduct");
  const qtyEls = container.querySelectorAll(".itemQty");

  if (productEls.length === 0) {
    showModal("من فضلك أضف منتج واحد على الأقل");
    return;
  }

  let total = 0;
  let paid = +paidEl.value || 0;
  let items = [];

  for (let i = 0; i < productEls.length; i++) {
    const pIndex = productEls[i].value;
    const qty = +qtyEls[i].value;
    const product = products[pIndex];

    if (!qty || qty <= 0) {
      showModal("الكمية يجب أن تكون أكبر من صفر");
      return;
    }

    product.qty -= qty;
    total += qty * product.price;

    items.push({
      name: product.name,
      qty,
      price: product.price,
    });
  }

  let customerName = "نقدي";
  let previousBalance = 0;
  let newBalance = 0;

  if (customerIndex !== "") {
    const customer = customers[customerIndex];
    previousBalance = customer.balance;
    customer.balance += total - paid;
    newBalance = customer.balance;
    customerName = customer.name;
  } else {
    previousBalance = 0;
    newBalance = total - paid;
  }

  cash.income += paid;

  const order =
    sales.length + purchases.length + incomes.length + expenses.length + 1;

  sales.push({
    customer: customerName,
    items, // ✅ ده المهم
    total,
    paid,
    remaining: total - paid,
    previousBalance,
    newBalance,
    date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
    order,
  });

  saveData();
  container.innerHTML = "";
  paidEl.value = "";
  document.getElementById("invoiceCustomer").value = "";
  document.getElementById("customerBalance").value = 0;
  document.getElementById("invoiceTotal").value = 0;
  document.getElementById("grandTotal").value = 0;
  document.getElementById("remainingAmount").value = 0;

  renderSales();
  showModal("تم حفظ الفاتورة بنجاح ✅", "نجاح");
}

// ===============================
// عرض الفواتير
// ===============================
function renderSales() {
  const tbody = document.querySelector("#salesTable tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  sales
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .forEach((invoice, index) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
  <td>${index + 1}</td>
  <td>${invoice.date}</td>
  <td>${invoice.customer}</td>
  <td>${invoice.total}</td>
  <td>${invoice.paid}</td>
  <td>${invoice.remaining}</td>
  <td>${invoice.previousBalance || 0}</td>
  <td>${invoice.newBalance || 0}</td>
  <td>
    <button class="btn-delete" onclick="confirmDeleteInvoice(${index})">🗑️</button>
    <button class="btn-edit" onclick="editInvoice(${index})">✏️</button>
  </td>
`;
      tbody.appendChild(tr);
    });
}

// ===============================
// تعديل فاتورة
// ===============================
function editInvoice(index) {
  const invoice = sales[index];
  editInvoiceIndex = index;

  const customerSelect = document.getElementById("invoiceCustomer");
  customerSelect.value =
    invoice.customer === "نقدي"
      ? ""
      : customers.findIndex((c) => c.name === invoice.customer);

  document.getElementById("paidAmount").value = invoice.paid;

  const container = document.getElementById("invoiceItems");
  container.innerHTML = "";

  invoice.items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "form-row invoice-item";

    row.innerHTML = `
      <select class="itemProduct">
        ${products
          .map(
            (p, i) =>
              `<option value="${i}" ${
                p.name === item.name ? "selected" : ""
              }>${p.name}</option>`,
          )
          .join("")}
      </select>
      <input type="number" class="itemQty" value="${item.qty}" min="1">
      <input type="number" class="itemPrice" value="${products.find((p) => p.name === item.name).price}" readonly>
      <input type="number" class="itemTotal" value="${item.qty * products.find((p) => p.name === item.name).price}" readonly>
      <button type="button" class="btn-delete-item">❌</button>
    `;

    container.appendChild(row);

    const productSelect = row.querySelector(".itemProduct");
    const qtyInput = row.querySelector(".itemQty");
    const priceInput = row.querySelector(".itemPrice");
    const totalInput = row.querySelector(".itemTotal");
    const deleteBtn = row.querySelector(".btn-delete-item");

    function updateRowTotal() {
      const qty = +qtyInput.value || 0;
      const price = +priceInput.value || 0;
      totalInput.value = qty * price;
      updateInvoiceTotal();
    }

    productSelect.addEventListener("change", function () {
      const product = products[this.value];
      priceInput.value = product ? product.price : 0;
      updateRowTotal();
    });

    qtyInput.addEventListener("input", updateRowTotal);
    deleteBtn.addEventListener("click", () => {
      row.remove();
      updateInvoiceTotal();
    });
  });

  updateInvoiceTotal();
  showModal("تم تحميل الفاتورة بالأعلى للتعديل ✏️", "تعديل فاتورة");
}

// ===============================
// حذف فاتورة
// ===============================
function deleteInvoice(index) {
  const invoice = sales[index];

  invoice.items.forEach((item) => {
    const product = products.find((p) => p.name === item.name);
    if (product) product.qty += item.qty;
  });

  if (invoice.customer !== "نقدي") {
    const customer = customers.find((c) => c.name === invoice.customer);
    if (customer) customer.balance -= invoice.total - invoice.paid;
  }

  cash.income -= invoice.paid;
  if (cash.income < 0) cash.income = 0;

  sales.splice(index, 1);
  saveData();
  renderSales();
}

// ===============================
// مودال حذف وفقط
// ===============================
function confirmDeleteInvoice(index) {
  showDeleteModal("هل أنت متأكد من حذف هذه الفاتورة؟ لا يمكن التراجع.", () => {
    deleteInvoice(index);
    showModal("تم حذف الفاتورة وتحديث الخزنة بنجاح ✅", "نجاح");
  });
}

function filterSalesByDate() {
  const from = document.getElementById("fromDate").value;
  const to = document.getElementById("toDate").value;

  if (!from && !to) {
    renderSales();
    return;
  }

  const filtered = sales.filter((invoice) => {
    if (!invoice.date) return false;

    if (from && invoice.date < from) return false;
    if (to && invoice.date > to) return false;

    return true;
  });

  renderSales(filtered);
}

function resetSalesFilter() {
  document.getElementById("fromDate").value = "";
  document.getElementById("toDate").value = "";
  renderSales();
}

// ===============================
// مودال عام
// ===============================
let deleteCallback = null;

function showDeleteModal(message, onConfirm) {
  const appModal = document.getElementById("appModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalMessage = document.getElementById("modalMessage");
  const modalConfirmBtn = document.getElementById("modalConfirmBtn");
  const modalCancelBtn = document.getElementById("modalCancelBtn");
  const modalOkBtn = document.getElementById("modalOkBtn");

  modalTitle.innerText = "تأكيد الحذف";
  modalMessage.innerText = message;

  modalConfirmBtn.style.display = "flex";
  modalCancelBtn.style.display = "flex";
  modalOkBtn.style.display = "none";

  deleteCallback = onConfirm;
  appModal.style.display = "flex";

  modalConfirmBtn.onclick = () => {
    if (deleteCallback) deleteCallback();
    closeModal();
  };

  modalCancelBtn.onclick = closeModal;
}

function showModal(message, title = "تنبيه") {
  const appModal = document.getElementById("appModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalMessage = document.getElementById("modalMessage");
  const modalConfirmBtn = document.getElementById("modalConfirmBtn");
  const modalCancelBtn = document.getElementById("modalCancelBtn");
  const modalOkBtn = document.getElementById("modalOkBtn");

  modalTitle.innerText = title;
  modalMessage.innerText = message;

  modalConfirmBtn.style.display = "none";
  modalCancelBtn.style.display = "none";
  modalOkBtn.style.display = "flex";

  appModal.style.display = "flex";

  modalOkBtn.onclick = closeModal;
}

function closeModal() {
  document.getElementById("appModal").style.display = "none";
  deleteCallback = null;
}
