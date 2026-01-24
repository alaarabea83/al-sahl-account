window.onload = function () {
  loadData();
  renderCustomerSelect();
  renderIncome();

  document.getElementById("addIncomeBtn").onclick = addIncome;
};

function renderCustomerSelect() {
  const sel = document.getElementById("incomeCustomer");
  if (!sel) return;
  sel.innerHTML =
    `<option value="">نقدي بدون عميل</option>` +
    customers.map((c, i) => `<option value="${i}">${c.name}</option>`).join("");
}

function addIncome() {
  const title = document.getElementById("incomeTitle").value.trim();
  const amount = +document.getElementById("incomeAmount").value;
  const customerIndex = document.getElementById("incomeCustomer").value;
  const customer = customerIndex !== "" ? customers[customerIndex] : null;

  if (!title || !amount) {
    showModal("من فضلك أكمل جميع البيانات");
    return;
  }

  if (customer) customer.balance -= amount;
  cash.income += amount;

  const newOrder = sales.length + purchases.length + incomes.length + expenses.length + 1;

  incomes.push({
    title,
    amount,
    customer: customer ? customer.name : "نقدي",
    date: new Date().toLocaleDateString(),
    order: newOrder
  });

  document.getElementById("incomeTitle").value = "";
  document.getElementById("incomeAmount").value = "";
  document.getElementById("incomeCustomer").value = "";

  saveData();
  renderIncome();
}

function renderIncome() {
  const tbody = document.querySelector("#incomeTable tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  incomes.sort((a, b) => (a.order || 0) - (b.order || 0));

  incomes.forEach((i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${i.title}</td><td>${i.amount}</td><td>${i.customer}</td><td>${i.date}</td>`;
    tbody.appendChild(tr);
  });
}

function showModal(message, title = "تنبيه") {
  document.getElementById("modalTitle").innerText = title;
  document.getElementById("modalMessage").innerText = message;
  document.getElementById("appModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("appModal").style.display = "none";
}
