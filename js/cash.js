window.onload = function () {
  loadData();
  renderCashStatement();
  renderCash();

  document.getElementById("filterCashBtn").onclick = renderCashStatement;
};

function renderCashStatement() {
  const tbody = document.querySelector("#cashStatementTable tbody");
  if (!tbody) return;

  const from = document.getElementById("cashFromDate")?.value;
  const to = document.getElementById("cashToDate")?.value;

  tbody.innerHTML = "";
  let balance = cash.opening || 0;

  // جميع الحركات المالية
  const allEntries = [
    ...sales.map((s) => ({
      date: s.date,
      desc: "فاتورة مبيعات",
      debit: s.remaining,
      credit: 0,
    })),
    ...purchases.map((p) => ({
      date: p.date,
      desc: "فاتورة مشتريات",
      debit: 0,
      credit: p.paid,
    })),
    ...incomes.map((i) => ({
      date: i.date,
      desc: i.title,
      debit: 0,
      credit: i.amount,
    })),
    ...expenses.map((e) => ({
      date: e.date,
      desc: e.title,
      debit: e.amount,
      credit: 0,
    })),
  ];

  // ترتيب حسب التاريخ
  allEntries
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .forEach((e) => {
      if (from && new Date(e.date) < new Date(from)) return;
      if (to && new Date(e.date) > new Date(to)) return;
      balance += (e.debit || 0) - (e.credit || 0);
      tbody.innerHTML += `<tr>
                <td>${e.date}</td>
                <td>${e.desc}</td>
                <td>${e.debit || 0}</td>
                <td>${e.credit || 0}</td>
                <td>${balance.toFixed(2)}</td>
              </tr>`;
    });

  renderCash(); // تحديث الملخص
}

function renderCash() {
  document.getElementById("cashOpening").innerText = (
    cash.opening || 0
  ).toFixed(2);
  document.getElementById("cashIncome").innerText = (cash.income || 0).toFixed(
    2,
  );
  document.getElementById("cashExpenses").innerText = (
    cash.expenses || 0
  ).toFixed(2);
  document.getElementById("cashFinal").innerText = (
    (cash.opening || 0) +
    (cash.income || 0) -
    (cash.expenses || 0)
  ).toFixed(2);
}
