import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
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

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Xuất database để sử dụng trong file khác
export { database, ref, push, set };

document.addEventListener("DOMContentLoaded", function () {
  function editRow(button) {
    let row = button.closest("tr");
    if (!row) return;

    let cells = row.querySelectorAll("td:not(:last-child)");
    cells.forEach((cell) => (cell.contentEditable = true));

    row.querySelector(".save-btn").disabled = false;
    button.disabled = true;
  }

  function saveRow(button) {
    let row = button.closest("tr");
    if (!row) return;

    let cells = row.querySelectorAll("td:not(:last-child)");
    cells.forEach((cell) => (cell.contentEditable = false));

    row.querySelector(".edit-btn").disabled = false;
    button.disabled = true;
  }

  function deleteRow(button) {
    let row = button.closest("tr");
    if (row) row.remove();
  }

  function addRow() {
    let table = document.getElementById("productTable");
    let newRow = document.createElement("tr");

    newRow.innerHTML = `
            <td contenteditable="true"></td>
            <td contenteditable="true"></td>
            <td contenteditable="true"></td>
            <td contenteditable="true"></td>
            <td contenteditable="true"></td>
            <td>
                <button class="edit-btn">sửa</button>
                <button class="save-btn">Lưu</button>
                <button class="delete-btn">Xóa</button>
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

  document.getElementById("addRowBtn").addEventListener("click", addRow);

  document.querySelectorAll(".edit-btn").forEach((button) => {
    button.addEventListener("click", function () {
      editRow(this);
    });
  });

  document.querySelectorAll(".save-btn").forEach((button) => {
    button.addEventListener("click", function () {
      saveRow(this);
    });
  });

  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", function () {
      deleteRow(this);
    });
  });
});
