import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  remove,
  get,
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

function showNotification(message) {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.style.display = "block";

  const newNotification = notification.cloneNode(true);
  notification.parentNode.replaceChild(newNotification, notification);
}

document.addEventListener("DOMContentLoaded", function () {
  function loadProducts() {
    const dbRef = ref(database, "products");
    get(dbRef).then((snapshot) => {
      if (snapshot.exists()) {
        const table = document.getElementById("productTable");
        table.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
          let product = childSnapshot.val();
          addProductRow(product, false);
        });
      }
    });
  }

  function addProductRow(product, isNew) {
    let table = document.getElementById("productTable");
    let newRow = document.createElement("tr");

    newRow.innerHTML = `
      <td contenteditable="${isNew}">${product.id}</td>
      <td contenteditable="${isNew}">${product.name}</td>
      <td contenteditable="${isNew}">${product.price}</td>
      <td contenteditable="${isNew}">${product.date}</td>
      <td contenteditable="${isNew}">${product.quantity}</td>
      <td>
          <button class="edit-btn" ${
            isNew ? "disabled" : ""
          }><i class="fas fa-edit"></i></button>
          <button class="save-btn">${
            isNew
              ? '<i class="fas fa-save"></i>'
              : '<i class="fas fa-save"></i>'
          }</button>
          <button class="delete-btn"><i class="fas fa-trash"></i></button>
      </td>
    `;

    table.appendChild(newRow);

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
    showNotification(`Đang chỉnh sửa sản phẩm...`);
    let row = button.closest("tr");
    row.querySelectorAll("td[contenteditable]").forEach((cell) => {
      cell.contentEditable = "true";
    });

    row.querySelector(".save-btn").disabled = false;
    button.disabled = true;
  }

  function saveRow(button) {
    showNotification(`Đang lưu sản phẩm...`);
    let row = button.closest("tr");

    let productData = {
      id: row.cells[0].textContent.trim(),
      name: row.cells[1].textContent.trim(),
      price: row.cells[2].textContent.trim(),
      date: row.cells[3].textContent.trim(),
      quantity: row.cells[4].textContent.trim(),
    };

    // Lưu vào bảng products
    set(ref(database, `products/${productData.id}`), productData)
      .then(() => {
        console.log("Sản phẩm đã được lưu vào products!");

        // Tạo dữ liệu khuyến mãi mặc định
        let discountData = {
          id: productData.id,
          name: productData.name,
          discount: "",
          start: "",
          end: "",
        };

        // Lưu vào bảng discounts
        return set(ref(database, `discounts/${productData.id}`), discountData);
      })
      .then(() => {
        console.log("Sản phẩm đã được đồng bộ vào discounts!");

        // Khóa chỉnh sửa sau khi lưu
        row.querySelectorAll("td[contenteditable]").forEach((cell) => {
          cell.contentEditable = "false";
        });

        row.querySelector(".edit-btn").disabled = false;
        button.disabled = true;
      })
      .catch((error) => {
        console.error("Lỗi khi lưu:", error);
      });
  }

  function deleteRow(button) {
    showNotification(`Đang xóa sản phẩm...`);
    let row = button.closest("tr");
    let productId = row.cells[0].textContent;

    // Xóa sản phẩm khỏi products
    remove(ref(database, `products/${productId}`))
      .then(() => {
        return remove(ref(database, `discounts/${productId}`));
      })
      .then(() => {
        row.remove();
      })
      .catch((error) => {
        console.error("Lỗi khi xóa sản phẩm:", error);
      });
  }

  function addRow() {
    showNotification(`Đang thêm sản phẩm mới...`);
    let table = document.getElementById("productTable");
    let newRow = document.createElement("tr");

    let productId = "SP" + Math.floor(Math.random() * 1000);

    newRow.innerHTML = `
      <td contenteditable="true">${productId}</td>
      <td contenteditable="true"></td>
      <td contenteditable="true"></td>
      <td contenteditable="true"></td>
      <td contenteditable="true"></td>
      <td>
          <button class="edit-btn" disabled><i class="fas fa-edit"></i></button>
          <button class="save-btn"><i class="fas fa-save"></i></button>
          <button class="delete-btn"><i class="fas fa-trash"></i></button>
      </td>
    `;

    table.appendChild(newRow);

    newRow.querySelector(".save-btn").addEventListener("click", function () {
      saveRow(this);
    });

    newRow.querySelector(".delete-btn").addEventListener("click", function () {
      newRow.remove();
    });
  }

  document.getElementById("addRowBtn").addEventListener("click", addRow);
  loadProducts();
});
