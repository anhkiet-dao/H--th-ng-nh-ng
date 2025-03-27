import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  remove,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCOsWpn50GmILkdfGoHluQ8SFIN3tIUDtE",
  authDomain: "nt131p22.firebaseapp.com",
  databaseURL:
    "https://nt131p22-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "nt131p22",
  storageBucket: "nt131p22.appspot.com",
  messagingSenderId: "485453782957",
  appId: "1:485453782957:web:e3f269e3a57e083fd4cb24",
  measurementId: "G-QVQ8RGM1J1",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

document.addEventListener("DOMContentLoaded", function () {
  function handleFocus(cell) {
    if (cell.textContent.trim() === cell.dataset.placeholder) {
      cell.textContent = ""; // Xóa placeholder khi focus
    }
  }

  function handleBlur(cell) {
    if (cell.textContent.trim() === "") {
      cell.textContent = cell.dataset.placeholder; // Trả lại placeholder nếu bỏ trống
    }
  }

  function loadProducts() {
    const dbRef = ref(database, "products");
    get(dbRef).then((snapshot) => {
      if (snapshot.exists()) {
        const table = document.getElementById("productTable");
        table.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
          let product = childSnapshot.val();
          addProductRow(product);
        });
      }
    });
  }

  function addProductRow(product) {
    let table = document.getElementById("productTable");
    let newRow = document.createElement("tr");

    newRow.innerHTML = `
      <td contenteditable="true" data-placeholder="SPXXX">${product.id}</td>
      <td contenteditable="true" data-placeholder="Tên sản phẩm">${product.name}</td>
      <td contenteditable="true" data-placeholder="Giá">${product.price}</td>
      <td contenteditable="true" data-placeholder="Ngày tháng">${product.date}</td>
      <td contenteditable="true" data-placeholder="Số lượng">${product.quantity}</td>
      <td>
          <button class="edit-btn">Sửa</button>
          <button class="save-btn">Lưu</button>
          <button class="delete-btn">Xóa</button>
      </td>
    `;

    table.appendChild(newRow);

    newRow.querySelectorAll("td[contenteditable]").forEach((cell) => {
      cell.addEventListener("focus", function () {
        handleFocus(cell);
      });

      cell.addEventListener("blur", function () {
        handleBlur(cell);
      });
    });

    newRow.querySelector(".edit-btn").addEventListener("click", function () {
      editRow(this);
    });

    newRow.querySelector(".save-btn").addEventListener("click", function () {
      saveRow(this);
    });

    newRow.querySelector(".delete-btn").addEventListener("click", function () {
      deleteRow(this);
    });
  }

  function editRow(button) {
    let row = button.closest("tr");
    row.querySelectorAll("td[contenteditable]").forEach((cell) => {
      cell.contentEditable = "true";
    });
    row.querySelector(".save-btn").disabled = false;
    button.disabled = true;
  }

  function saveRow(button) {
    let row = button.closest("tr");
    row.querySelectorAll("td[contenteditable]").forEach((cell) => {
      cell.contentEditable = "false";
    });
    row.querySelector(".edit-btn").disabled = false;
    button.disabled = true;

    let productData = {
      id: row.cells[0].textContent,
      name: row.cells[1].textContent,
      price: row.cells[2].textContent,
      date: row.cells[3].textContent,
      quantity: row.cells[4].textContent,
    };

    set(ref(database, `products/${productData.id}`), productData);
  }

  function deleteRow(button) {
    let row = button.closest("tr");
    let productId = row.cells[0].textContent;
    remove(ref(database, `products/${productId}`));
    row.remove();
  }

  function addRow() {
    let productId = "SP" + Math.floor(Math.random() * 1000);
    let product = {
      id: productId,
      name: "Tên sản phẩm",
      price: "Giá",
      date: "Ngày tháng",
      quantity: "Số lượng",
    };
    addProductRow(product);
  }

  document.getElementById("addRowBtn").addEventListener("click", addRow);
  loadProducts();

  document.querySelectorAll("td[contenteditable]").forEach((cell) => {
    cell.addEventListener("focus", function () {
      handleFocus(cell);
    });

    cell.addEventListener("blur", function () {
      handleBlur(cell);
    });
  });
});
