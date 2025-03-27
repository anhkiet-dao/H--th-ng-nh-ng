document.addEventListener("DOMContentLoaded", function () {
  function editRow(button) {
    let row = button.closest("tr");
    if (!row) return;

    let cells = row.querySelectorAll("td:not(:last-child)");
    cells.forEach((cell) => (cell.contentEditable = "true"));

    row.querySelector(".save-btn").disabled = false;
    button.disabled = true;
  }

  function saveRow(button) {
    let row = button.closest("tr");
    if (!row) return;

    let cells = row.querySelectorAll("td:not(:last-child)");
    cells.forEach((cell) => (cell.contentEditable = "false"));

    row.querySelector(".edit-btn").disabled = false;
    button.disabled = true;
  }

  function deleteRow(button) {
    let row = button.closest("tr");
    if (row) {
      row.remove();
    }
  }

  function addRow() {
    let table = document.getElementById("productTable");
    let newRow = document.createElement("tr");

    newRow.innerHTML = `
            <td contenteditable="true">SPXXX</td>
            <td contenteditable="true">Tên sản phẩm</td>
            <td contenteditable="true">Giá</td>
            <td contenteditable="true">dd/mm/yyyy</td>
            <td contenteditable="true">Số lượng</td>
            <td>
                <button class="edit-btn">Sửa</button>
                <button class="save-btn" disabled>Lưu</button>
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

    updateStatus("Đã thêm một hàng mới.");
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
