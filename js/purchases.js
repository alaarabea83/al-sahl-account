window.onload = function () {
  loadData();
  renderCustomerSelect();
  renderProductSelect();
  renderPurchases();

  document.getElementById("savePurchaseBtn").onclick = savePurchase;
};

// عرض العملاء في select
function renderCustomerSelect() {
  const sel = document.getElementById("purchaseCustomer");
  if (!sel) return;
  sel.innerHTML =
    `<option value="">نقدي بدون عميل</option>` +
    customers.map((c, i) => `<option value="${i}">${c.name}</option>`).join("");
}

// عرض المنتجات في select
function renderProductSelect() {
  const sel = document.getElementById("purchaseProduct");
  if (!sel) return;
  sel.innerHTML = products
    .map((p, i) => `<option value="${i}">${p.name}</option>`)
    .join("");
}

// حفظ فاتورة شراء
function savePurchase() {
  const prod = products[document.getElementById("purchaseProduct").value];
  const qty = +document.getElementById("purchaseQty").value || 0;
  const price = +document.getElementById("purchasePrice").value || 0;
  const paid = +document.getElementById("purchasePaid").value || 0;
  const customerIndex = document.getElementById("purchaseCustomer").value;
  const customer = customerIndex !== "" ? customers[customerIndex] : null;

  // ✅ تحقق من البيانات
  if (!prod || qty <= 0 || price <= 0) {
    showModal("من فضلك أكمل جميع البيانات", "تنبيه");
    return;
  }

  // تحديث المخزون
  prod.qty += qty;

  // تحديث رصيد العميل (في حالة حساب على الحساب)
  if (customer) customer.balance -= qty * price;

  // تحديث الخزنة
  cash.income -= paid;

  // تخزين الفاتورة
  purchases.push({
    product: prod.name,
    qty,
    price,
    paid,
    customer: customer ? customer.name : "نقدي",
    remaining: qty * price - paid,
    date: new Date().toLocaleDateString(),
  });

  // مسح القيم في الفورم
  document.getElementById("purchaseQty").value = "";
  document.getElementById("purchasePrice").value = "";
  document.getElementById("purchasePaid").value = "";
  document.getElementById("purchaseCustomer").value = "";

  saveData();
  renderProductSelect();
  renderPurchases();

  // ✅ رسالة نجاح
  showModal("تم حفظ الفاتورة بنجاح ✅", "نجاح");
}

// عرض المشتريات
function renderPurchases() {
  const tbody = document.querySelector("#purchasesTable tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  purchases.forEach((p) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${p.customer}</td><td>${p.product}</td><td>${p.qty}</td><td>${p.price}</td><td>${p.paid}</td><td>${p.remaining}</td><td>${p.date}</td>`;
    tbody.appendChild(tr);
  });
}

// ===== MODAL =====
function showModal(message, title = "تنبيه") {
  document.getElementById("modalTitle").innerText = title;
  document.getElementById("modalMessage").innerText = message;
  document.getElementById("appModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("appModal").style.display = "none";
}