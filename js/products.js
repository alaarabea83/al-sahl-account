let editIndex = null;
let deleteIndex = null;

window.onload = function () {
  loadData();
  renderProducts();
  document.getElementById("addProductBtn").onclick = addProductHandler;
};

function addProductHandler() {
  const name = document.getElementById("productName").value.trim();
  const price = +document.getElementById("productPrice").value;
  const openingQty = +document.getElementById("productQty").value;

  if (!name) return showModal("من فضلك أدخل اسم المنتج");

  // qty الحالي = الرصيد الافتتاحي عند الإضافة
  products.push({ name, price, openingQty });

  document.getElementById("productName").value = "";
  document.getElementById("productPrice").value = "";
  document.getElementById("productQty").value = "";

  saveData();
  renderProducts();
  showSuccessModal("تم إضافة المنتج بنجاح ✅");
}

function getCurrentQty(productName) {
  const product = products.find((p) => p.name === productName);
  if (!product) return 0;

  let qty = product.openingQty;

  // 🔴 المبيعات
  sales.forEach((sale) => {
    // حالة items (فاتورة)
    if (sale.items) {
      sale.items.forEach((item) => {
        if (item.name === productName) {
          qty -= item.qty;
        }
      });
    }

    // حالة بيع مباشر
    if (sale.product === productName) {
      qty -= sale.qty;
    }
  });

  // 🟢 المشتريات
  purchases.forEach((pur) => {
    if (pur.product === productName) {
      qty += pur.qty;
    }
  });

  return qty;
}

function renderProducts(searchQuery = "") {
  const tbody = document.querySelector("#productsTable tbody");
  tbody.innerHTML = "";

  products.forEach((p, index) => {
    // فلتر البحث
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery)) return;

    const currentQty = getCurrentQty(p.name);

    const tr = document.createElement("tr");
    tr.innerHTML = `
  <td>${p.name}</td>
  <td>${currentQty}</td>
  <td>${p.price.toFixed(2)}</td>
  <td class="actions">
    <button class="btn btn-edit" onclick="openEditModal(${index})">✏️</button>
    <button class="btn btn-delete" onclick="openDeleteModal(${index})">🗑️</button>
    <button class="btn btn-info" onclick="openProductMovement(${index})">📄</button>
  </td>
`;

    tbody.appendChild(tr);
  });
}

// البحث في المنتجات
document.getElementById("searchProduct").addEventListener("input", function () {
  const query = this.value.trim().toLowerCase();
  renderProducts(query);
});

function openEditModal(index) {
  editIndex = index;
  const p = products[index];
  document.getElementById("editProductName").value = p.name;
  document.getElementById("editProductQty").value = p.openingQty; // الرصيد الافتتاحي
  document.getElementById("editProductPrice").value = p.price;
  document.getElementById("editModal").style.display = "flex";
}

function saveProductEdit() {
  if (editIndex === null) return;

  const name = document.getElementById("editProductName").value.trim();
  const openingQty = +document.getElementById("editProductQty").value;
  const price = +document.getElementById("editProductPrice").value;

  if (!name) return showModal("من فضلك أدخل اسم المنتج");

  products[editIndex].name = name;
  products[editIndex].openingQty = openingQty;
  products[editIndex].price = price;

  saveData();
  renderProducts();
  closeEditModal();
  showSuccessModal("تم تعديل المنتج بنجاح ✅");
}

function closeEditModal() {
  editIndex = null;
  document.getElementById("editModal").style.display = "none";
}

function openDeleteModal(index) {
  deleteIndex = index;
  document.getElementById("deleteModal").style.display = "flex";
}

function closeDeleteModal() {
  deleteIndex = null;
  document.getElementById("deleteModal").style.display = "none";
}

function confirmDelete() {
  if (deleteIndex === null) return;
  products.splice(deleteIndex, 1);
  saveData();
  renderProducts();
  closeDeleteModal();
  showSuccessModal("تم حذف المنتج بنجاح ✅");
}

function showModal(message, title = "تنبيه") {
  document.getElementById("modalTitle").innerText = title;
  document.getElementById("modalMessage").innerText = message;
  document.getElementById("appModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("appModal").style.display = "none";
}

function showSuccessModal(message) {
  document.getElementById("successMessage").innerText = message;
  document.getElementById("successModal").style.display = "flex";
}

function closeSuccessModal() {
  document.getElementById("successModal").style.display = "none";
}

function openProductMovement(index) {
  const p = products[index];
  if (!p) return;

  const tbody = document.getElementById("movementBody");
  tbody.innerHTML = "";

  let currentQty = p.openingQty;

  // أول صف: الرصيد الافتتاحي
  const trOpening = document.createElement("tr");
  trOpening.innerHTML = `<td>-</td><td>الرصيد الافتتاحي</td><td>0</td><td>${currentQty}</td>`;
  tbody.appendChild(trOpening);

  // مشتريات
  purchases
    .filter((pur) => pur.product === p.name)
    .forEach((pur) => {
      currentQty += pur.qty;
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${pur.date}</td><td>مشتريات</td><td>+${pur.qty}</td><td>${currentQty}</td>`;
      tbody.appendChild(tr);
    });

  // مبيعات
  sales.forEach((sale) => {
    if (sale.items) {
      sale.items.forEach((item) => {
        if (item.name === p.name) {
          currentQty -= item.qty;
          const tr = document.createElement("tr");
          tr.innerHTML = `<td>${sale.date}</td><td>مبيعات</td><td>-${item.qty}</td><td>${currentQty}</td>`;
          tbody.appendChild(tr);
        }
      });
    }

    if (sale.product === p.name) {
      currentQty -= sale.qty;
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${sale.date}</td><td>مبيعات</td><td>-${sale.qty}</td><td>${currentQty}</td>`;
      tbody.appendChild(tr);
    }
  });

  document.getElementById("movementProductName").innerText = p.name;
  document.getElementById("productMovementModal").style.display = "flex";
}

function closeProductMovementModal() {
  document.getElementById("productMovementModal").style.display = "none";
}
