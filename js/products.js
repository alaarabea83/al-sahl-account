// تأكد إن data.js اتعمل load
window.onload = function () {
  loadData();
  renderProducts();
  document.getElementById("addProductBtn").onclick = addProductHandler;
};

// إضافة منتج جديد
function addProductHandler() {
  const name = document.getElementById("productName").value.trim();
  const price = +document.getElementById("productPrice").value;
  const qty = +document.getElementById("productQty").value;

  if (!name) return alert("ادخل اسم المنتج");
  products.push({ name, price, qty });

  document.getElementById("productName").value = "";
  document.getElementById("productPrice").value = "";
  document.getElementById("productQty").value = "";

  saveData();
  renderProducts();
}

// عرض المنتجات في الجدول
function renderProducts() {
  const tbody = document.querySelector("#productsTable tbody");
  tbody.innerHTML = "";
  products.forEach((p) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${p.name}</td><td>${p.qty}</td><td>${p.price.toFixed(2)}</td>`;
    tbody.appendChild(tr);
  });
}
