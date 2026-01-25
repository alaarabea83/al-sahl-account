/* ===============================
   تحميل الصفحة
================================ */
let editInvoiceIndex = null;

window.onload = function () {
  loadData();
  renderCustomerSelect();
  renderSales();

  document.getElementById("addItemBtn").onclick = addInvoiceItem;
  document.getElementById("saveInvoiceBtn").onclick = saveSale;
};

/* ===============================
   عرض العملاء
================================ */
function renderCustomerSelect() {
  const sel = document.getElementById("invoiceCustomer");
  if (!sel) return;

  sel.innerHTML =
    `<option value="">نقدي بدون عميل</option>` +
    customers.map((c, i) => `<option value="${i}">${c.name}</option>`).join("");
}

/* ===============================
   إضافة منتج للفاتورة
================================ */
function addInvoiceItem() {
  const container = document.getElementById("invoiceItems");
  if (!container) return;

  container.insertAdjacentHTML(
    "beforeend",
    `
    <div class="form-row invoice-item">
      <select class="itemProduct">
        ${products
          .map((p, i) => `<option value="${i}">${p.name}</option>`)
          .join("")}
      </select>
      <input type="number" class="itemQty" placeholder="الكمية" min="1">
    </div>
  `,
  );
}

/* ===============================
   حفظ الفاتورة
================================ */
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
  if (customerIndex !== "") {
    const customer = customers[customerIndex];
    customer.balance += total - paid;
    customerName = customer.name;
  }

  cash.income += paid;

  const order =
    sales.length + purchases.length + incomes.length + expenses.length + 1;

  sales.push({
    customer: customerName,
    items,
    total,
    paid,
    remaining: total - paid,
    date: new Date().toLocaleDateString(),
    order,
  });

  saveData();
  container.innerHTML = "";
  paidEl.value = "";
  document.getElementById("invoiceCustomer").value = "";

  renderSales();
  showModal("تم حفظ الفاتورة بنجاح ✅", "نجاح");
}

/* ===============================
   عرض الفواتير
================================ */
function renderSales() {
  const tbody = document.querySelector("#salesTable tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  sales
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .forEach((invoice, index) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${invoice.customer}</td>
        <td>${invoice.total}</td>
        <td>${invoice.paid}</td>
        <td>${invoice.remaining}</td>
        <td>${invoice.date}</td>
        <td>
          <button class="btn-delete" onclick="confirmDeleteInvoice(${index})">🗑️</button>
          <button class="btn-edit" onclick="editInvoice(${index})">✏️</button>
        </td>
      `;

      tbody.appendChild(tr);
    });
}

/* ===============================
   تعديل فاتورة
================================ */
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
    container.innerHTML += `
      <div class="form-row">
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
      </div>
    `;
  });

  showModal("تم تحميل الفاتورة للتعديل ✏️", "تعديل فاتورة");
}

/* ===============================
   حذف فاتورة (أساسي)
================================ */
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

  if (typeof renderCashStatement === "function") renderCashStatement();
}

/* ===============================
   مودال عصري لحذف الفاتورة
================================ */
function confirmDeleteInvoice(index) {
  showDeleteModal("هل أنت متأكد من حذف هذه الفاتورة؟ لا يمكن التراجع.", () => {
    deleteInvoice(index);
    showModal("تم حذف الفاتورة وتحديث الخزنة بنجاح ✅", "نجاح");
  });
}

/* ===============================
   مودال عصري + عام
================================ */
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
