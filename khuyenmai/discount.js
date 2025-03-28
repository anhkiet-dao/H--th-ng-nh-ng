import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  onValue,
  get,
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
    get(dbRef).then((snapshot) => {
      table.innerHTML = "";
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
    get(productsRef).then((snapshot) => {
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          let product = childSnapshot.val();
          let discountRef = ref(database, `discounts/${product.id}`);

          get(discountRef).then((discountSnapshot) => {
            if (!discountSnapshot.exists()) {
              let discountData = {
                id: product.id,
                name: product.name,
                discount: "",
                datestart: "",
                dateend: "",
              };
              set(discountRef, discountData);
            }
          });
        });
      }
    });
  }

  function addProductRow(product) {
    let newRow = document.createElement("tr");

    newRow.innerHTML = `
      <td>${product.id}</td>
      <td>${product.name}</td>
      <td contenteditable="false">${product.discount || ""}</td>
      <td contenteditable="false">${product.datestart || ""}</td>
      <td contenteditable="false">${product.dateend || ""}</td>
      <td>
        <button class="edit-btn">Sửa</button>
        <button class="save-btn" disabled>Lưu</button>
      </td>
    `;

    table.appendChild(newRow);

    let editButton = newRow.querySelector(".edit-btn");
    let saveButton = newRow.querySelector(".save-btn");
    let editableCells = newRow.querySelectorAll("td[contenteditable]");

    editButton.addEventListener("click", function () {
      editableCells.forEach((cell) =>
        cell.setAttribute("contenteditable", "true")
      );
      editButton.disabled = true;
      saveButton.disabled = false;
    });

    saveButton.addEventListener("click", function () {
      saveRow(newRow);
      editableCells.forEach((cell) =>
        cell.setAttribute("contenteditable", "false")
      );
      editButton.disabled = false;
      saveButton.disabled = true;
    });
  }

  function saveRow(row) {
    let productData = {
      id: row.cells[0].textContent,
      name: row.cells[1].textContent,
      discount: row.cells[2].textContent,
      datestart: row.cells[3].textContent,
      dateend: row.cells[4].textContent,
    };

    set(ref(database, `discounts/${productData.id}`), productData);
  }

  syncProductsToDiscounts();
  loadDiscounts();
});
