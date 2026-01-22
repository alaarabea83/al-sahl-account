// ربط العناصر
const expenseTitle = document.getElementById("expenseTitle");
const expenseAmount = document.getElementById("expenseAmount");
const expenseCustomer = document.getElementById("expenseCustomer");
const addExpenseBtn = document.getElementById("addExpenseBtn");
const expenseTableBody = document.querySelector("#expenseTable tbody");

// تحميل قائمة العملاء في select
function renderExpenseCustomerSelect() {
  const opts =
    `<option value="">نقدي بدون عميل</option>` +
    customers.map((c, i) => `<option value="${i}">${c.name}</option>`).join("");
  expenseCustomer.innerHTML = opts;
}

// إضافة مصروف
function addExpense() {
  const title = expenseTitle.value.trim();
  const amount = +expenseAmount.value;
  const customerIndex = expenseCustomer.value;
  const customer = customerIndex !== "" ? customers[customerIndex] : null;

  if (!title || !amount) {
  showModal("من فضلك أكمل جميع البيانات");
  return;
}


  // تعديل رصيد العميل و خزنة المصروفات
  if (customer) customer.balance += amount;
  cash.expenses += amount;

  expenses.push({
    title,
    amount,
    customer: customer ? customer.name : "نقدي",
    date: new Date().toLocaleDateString(),
  });

  // مسح الحقول
  expenseTitle.value = "";
  expenseAmount.value = "";
  expenseCustomer.value = "";

  // تحديث العرض والبيانات
  saveData();
  renderExpenses();
  renderCash();
  renderExpenseCustomerSelect();
}

// عرض المصروفات
function renderExpenses() {
  expenseTableBody.innerHTML = "";
  expenses.forEach((e) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${e.title}</td><td>${e.amount.toFixed(2)}</td><td>${e.customer}</td><td>${e.date}</td>`;
    expenseTableBody.appendChild(tr);
  });
}

// حدث الضغط على زر الإضافة
addExpenseBtn.addEventListener("click", addExpense);

// عند تحميل الصفحة
window.onload = function () {
  loadData();                   // تحميل البيانات من localStorage
  renderExpenseCustomerSelect();
  renderExpenses();
  renderCash();                 // تحديث الخزنة
};

// ===== MODAL FUNCTIONS =====
function showModal(message, title = "تنبيه") {
  document.getElementById("modalTitle").innerText = title;
  document.getElementById("modalMessage").innerText = message;
  document.getElementById("appModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("appModal").style.display = "none";
}

