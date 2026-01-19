/* ===============================
   البيانات الأساسية
================================ */

let customers = [];
let products = [];
let sales = [];
let purchases = [];
let incomes = [];
let expenses = [];

let cash = {
  opening: 0,
  income: 0,
  expenses: 0,
};

/* ===============================
   LocalStorage
================================ */

function saveData() {
  localStorage.setItem("customers", JSON.stringify(customers));
  localStorage.setItem("products", JSON.stringify(products));
  localStorage.setItem("sales", JSON.stringify(sales));
  localStorage.setItem("purchases", JSON.stringify(purchases));
  localStorage.setItem("incomes", JSON.stringify(incomes));
  localStorage.setItem("expenses", JSON.stringify(expenses));
  localStorage.setItem("cash", JSON.stringify(cash));
}

function loadData() {
  customers = JSON.parse(localStorage.getItem("customers")) || [];
  products = JSON.parse(localStorage.getItem("products")) || [];
  sales = JSON.parse(localStorage.getItem("sales")) || [];
  purchases = JSON.parse(localStorage.getItem("purchases")) || [];
  incomes = JSON.parse(localStorage.getItem("incomes")) || [];
  expenses = JSON.parse(localStorage.getItem("expenses")) || [];

  cash = JSON.parse(localStorage.getItem("cash")) || {
    opening: 0,
    income: 0,
    expenses: 0,
  };
}

/* ===============================
   أدوات مساعدة عامة
================================ */

function formatDate(date = new Date()) {
  return date.toISOString().split("T")[0];
}

function getCashFinal() {
  return (cash.opening || 0) + (cash.income || 0) - (cash.expenses || 0);
}
