window.onload = function () {
  loadData();
  renderCustomers();
  document.getElementById("addCustomerBtn").onclick = addCustomerHandler;
};

// ====== MODAL FUNCTIONS ======
function showModal(message, title = "تنبيه") {
  document.getElementById("modalTitle").innerText = title;
  document.getElementById("modalMessage").innerText = message;
  document.getElementById("appModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("appModal").style.display = "none";
}

// إضافة عميل جديد
function addCustomerHandler() {
  const name = document.getElementById("customerName").value.trim();
  const balance = +document.getElementById("openingBalance").value || 0;

  // ✅ التحقق من البيانات
  if (!name) {
    showModal("من فضلك أدخل اسم العميل", "تنبيه");
    return;
  }

  customers.push({
    name: name,
    openingBalance: balance, // الرصيد الإفتتاحي ثابت
    balance: balance, // الرصيد الحالي متغير
  });

  // مسح الحقول
  document.getElementById("customerName").value = "";
  document.getElementById("openingBalance").value = "";

  saveData();
  renderCustomers();

  // ✅ رسالة نجاح
  showModal("تم إضافة العميل بنجاح ✅", "نجاح");
}

// عرض العملاء في الجدول
function renderCustomers() {
  const tbody = document.querySelector("#customersTable tbody");
  tbody.innerHTML = "";
  customers.forEach((c) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${c.name}</td><td>${c.balance.toFixed(2)}</td>`;
    tbody.appendChild(tr);
  });
}