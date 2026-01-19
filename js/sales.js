window.onload = function () {
  loadData();
  renderCustomerSelect();
  renderSales();

  document.getElementById("addItemBtn").onclick = addInvoiceItem;
  document.getElementById("saveInvoiceBtn").onclick = saveSale;
};

// عرض العملاء في select
function renderCustomerSelect() {
  const sel = document.getElementById("invoiceCustomer");
  if (!sel) return;
  sel.innerHTML =
    `<option value="">نقدي بدون عميل</option>` +
    customers.map((c, i) => `<option value="${i}">${c.name}</option>`).join("");
}

// إضافة صف منتج
function addInvoiceItem() {
  const container = document.getElementById("invoiceItems");
  if (!container) return;
  container.innerHTML += `
    <div class="form-row">
      <select class="itemProduct">${products.map((p, i) => `<option value="${i}">${p.name}</option>`)}</select>
      <input type="number" class="itemQty" placeholder="الكمية" min="1" value="1">
    </div>
  `;
}

// حفظ الفاتورة
function saveSale() {
  const container = document.getElementById("invoiceItems");
  const paidAmountEl = document.getElementById("paidAmount");
  const customerIndex = document.getElementById("invoiceCustomer").value;
  const customer = customerIndex !== "" ? customers[customerIndex] : null;

  if (!container || !paidAmountEl) return;

  let total = 0;
  const paid = +paidAmountEl.value || 0;

  const itemProducts = container.querySelectorAll(".itemProduct");
  const itemQtys = container.querySelectorAll(".itemQty");

  itemProducts.forEach((sel, i) => {
    let qty = +itemQtys[i].value;
    const p = products[sel.value];
    if (qty > p.qty) qty = p.qty;
    p.qty -= qty;
    total += qty * p.price;
  });

  if (customer) customer.balance += total - paid;

  cash.income += paid;

  sales.push({
    customer: customer ? customer.name : "نقدي",
    total,
    paid,
    remaining: total - paid,
    date: new Date().toLocaleDateString(),
  });

  container.innerHTML = "";
  paidAmountEl.value = "";
  saveData();
  renderSales();
}

// عرض الفواتير
function renderSales() {
  const tbody = document.querySelector("#salesTable tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  sales.forEach((s) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${s.customer}</td><td>${s.total}</td><td>${s.paid}</td><td>${s.remaining}</td><td>${s.date}</td>`;
    tbody.appendChild(tr);
  });
}
