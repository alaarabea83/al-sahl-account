window.onload = function () {
  loadData();
  renderCustomers();
  document.getElementById("addCustomerBtn").onclick = addCustomerHandler;
};

// إضافة عميل جديد
function addCustomerHandler() {
  const name = document.getElementById("customerName").value.trim();
  const balance = +document.getElementById("openingBalance").value || 0;

  if (!name) return alert("ادخل اسم العميل");

  customers.push({
    name: name,
    openingBalance: balance, // الرصيد الإفتتاحي ثابت
    balance: balance, // الرصيد الحالي متغير
  });

  document.getElementById("customerName").value = "";
  document.getElementById("openingBalance").value = "";

  saveData();
  renderCustomers();
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
