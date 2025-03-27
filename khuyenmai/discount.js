import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  onValue,
} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-database.js";

// Cấu hình Firebase
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
  const table = document.getElementById("productTable");

  function loadDiscounts() {
    const dbRef = ref(database, "discounts");
    onValue(dbRef, (snapshot) => {
      table.innerHTML = ""; // Xóa bảng cũ để cập nhật mới
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          let product = childSnapshot.val();
          addProductRow(product);
        });
      }
    });
  }

  function syncProductsToDiscounts() {
    const productsRef = ref(database, "products");
    onValue(productsRef, (snapshot) => {
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          let product = childSnapshot.val();
          let discountData = {
            id: product.id,
            name: product.name,
            price: "", // Giá khuyến mãi, mặc định rỗng
            datestart: "",
            dateend: "",
          };
          set(ref(database, `discounts/${product.id}`), discountData);
        });
      }
    });
  }

  function addProductRow(product) {
    let newRow = document.createElement("tr");

    newRow.innerHTML = `
      <td>${product.id}</td>
      <td>${product.name}</td>
      <td contenteditable="true">${product.price || ""}</td>
      <td contenteditable="true">${product.datestart || ""}</td>
      <td contenteditable="true">${product.dateend || ""}</td>
      <td>
        <button class="edit-btn">Sửa</button>
        <button class="save-btn">Lưu</button>
      </td>
    `;

    table.appendChild(newRow);

    newRow.querySelector(".edit-btn").addEventListener("click", function () {
      editRow(this);
    });

    newRow.querySelector(".save-btn").addEventListener("click", function () {
      saveRow(this);
    });
  }

  function editRow(button) {
    let row = button.closest("tr");
    row.querySelectorAll("td[contenteditable]").forEach((cell) => {
      cell.contentEditable = "true";
    });
  }

  function saveRow(button) {
    let row = button.closest("tr");
    let productData = {
      id: row.cells[0].textContent,
      name: row.cells[1].textContent,
      price: row.cells[2].textContent,
      datestart: row.cells[3].textContent,
      dateend: row.cells[4].textContent,
    };

    set(ref(database, `discounts/${productData.id}`), productData);
  }

  syncProductsToDiscounts();
  loadDiscounts();
});
