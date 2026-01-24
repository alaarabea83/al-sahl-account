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

  // لو في تعديل فاتورة
  if (editInvoiceIndex !== null) {
    const oldInvoice = sales[editInvoiceIndex];

    // 1️⃣ إرجاع المخزون القديم
    oldInvoice.items.forEach((item) => {
      const product = products.find((p) => p.name === item.name);
      if (product) {
        product.qty += item.qty;
      }
    });

    // 2️⃣ تعديل رصيد العميل القديم
    if (oldInvoice.customer !== "نقدي") {
      const customer = customers.find((c) => c.name === oldInvoice.customer);
      if (customer) {
        customer.balance -= oldInvoice.total - oldInvoice.paid;
      }
    }

    // 3️⃣ تعديل الخزنة
    cash.income -= oldInvoice.paid;
    if (cash.income < 0) cash.income = 0;

    // حذف الفاتورة القديمة
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

    if (qty > product.qty) {
      showModal(`الكمية غير متاحة للمنتج ${product.name}`);
      return;
    }

    // خصم المخزون
    product.qty -= qty;

    total += qty * product.price;

    items.push({
      name: product.name,
      qty,
      price: product.price,
    });
  }

  // تحديث العميل
  let customerName = "نقدي";
  if (customerIndex !== "") {
    const customer = customers[customerIndex];
    customer.balance += total - paid;
    customerName = customer.name;
  }

  // تحديث الخزنة
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
  document.getElementById("invoiceCustomer").value = ""; // 👈 إعادة اختيار العميل للوضع الافتراضي

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
          <button class="btn-delete" onclick="deleteInvoice(${index})">🗑️</button>
          <button class="btn-edit" onclick="editInvoice(${index})">✏️</button>

        </td>
      `;

      tbody.appendChild(tr);
    });
}

function editInvoice(index) {
  const invoice = sales[index];
  editInvoiceIndex = index;

  const customerSelect = document.getElementById("invoiceCustomer");

  if (invoice.customer === "نقدي") {
    customerSelect.value = "";
  } else {
    customerSelect.value = customers.findIndex(
      (c) => c.name === invoice.customer,
    );
  }

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
                `<option value="${i}" ${p.name === item.name ? "selected" : ""}>${p.name}</option>`,
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
   حذف فاتورة
================================ */
function deleteInvoice(index) {
  if (!confirm("هل أنت متأكد من حذف الفاتورة؟")) return;

  const invoice = sales[index];

  /* ===============================
     1️⃣ إرجاع المخزون
  ================================ */
  invoice.items.forEach((item) => {
    const product = products.find((p) => p.name === item.name);
    if (product) {
      product.qty += item.qty;
    }
  });

  /* ===============================
     2️⃣ تعديل رصيد العميل
  ================================ */
  if (invoice.customer !== "نقدي") {
    const customer = customers.find((c) => c.name === invoice.customer);
    if (customer) {
      customer.balance -= invoice.total - invoice.paid;
    }
  }

  /* ===============================
     3️⃣ تعديل الخزنة (المهم 👈)
  ================================ */
  cash.income -= invoice.paid;

  if (cash.income < 0) cash.income = 0; // حماية إضافية

  /* ===============================
     4️⃣ حذف الفاتورة
  ================================ */
  sales.splice(index, 1);

  saveData();
  renderSales();

  // لو صفحة الخزنة مفتوحة
  if (typeof renderCashStatement === "function") {
    renderCashStatement();
  }

  showModal("تم حذف الفاتورة وتحديث الخزنة بنجاح ✅", "نجاح");
}

/* ===============================
   مودال
================================ */
function showModal(message, title = "تنبيه") {
  document.getElementById("modalTitle").innerText = title;
  document.getElementById("modalMessage").innerText = message;
  document.getElementById("appModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("appModal").style.display = "none";
}
