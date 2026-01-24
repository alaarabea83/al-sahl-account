const expenseTitle = document.getElementById("expenseTitle");
const expenseAmount = document.getElementById("expenseAmount");
const expenseCustomer = document.getElementById("expenseCustomer");
const addExpenseBtn = document.getElementById("addExpenseBtn");
const expenseTableBody = document.querySelector("#expenseTable tbody");

function renderExpenseCustomerSelect() {
  const opts =
    `<option value="">نقدي بدون عميل</option>` +
    customers.map((c, i) => `<option value="${i}">${c.name}</option>`).join("");
  expenseCustomer.innerHTML = opts;
}

function addExpense() {
  const title = expenseTitle.value.trim();
  const amount = +expenseAmount.value;
  const customerIndex = expenseCustomer.value;
  const customer = customerIndex !== "" ? customers[customerIndex] : null;

  if (!title || !amount) {
    showModal("من فضلك أكمل جميع البيانات");
    return;
  }

  if (customer) customer.balance += amount;
  cash.expenses += amount;

  const newOrder = sales.length + purchases.length + incomes.length + expenses.length + 1;

  expenses.push({
    title,
    amount,
    customer: customer ? customer.name : "نقدي",
    date: new Date().toLocaleDateString(),
    order: newOrder
  });

  expenseTitle.value = "";
  expenseAmount.value = "";
  expenseCustomer.value = "";

  saveData();
  renderExpenses();
  renderCash();
  renderExpenseCustomerSelect();
}

function renderExpenses() {
  expenseTableBody.innerHTML = "";

  expenses.sort((a, b) => (a.order || 0) - (b.order || 0));

  expenses.forEach((e) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${e.title}</td><td>${e.amount.toFixed(2)}</td><td>${e.customer}</td><td>${e.date}</td>`;
    expenseTableBody.appendChild(tr);
  });
}

addExpenseBtn.addEventListener("click", addExpense);

window.onload = function () {
  loadData();
  renderExpenseCustomerSelect();
  renderExpenses();
  renderCash();
}

function showModal(message, title = "تنبيه") {
  document.getElementById("modalTitle").innerText = title;
  document.getElementById("modalMessage").innerText = message;
  document.getElementById("appModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("appModal").style.display = "none";
}
