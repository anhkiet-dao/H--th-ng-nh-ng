document.addEventListener("DOMContentLoaded", function () {
  function updateStatus(message) {
    document.getElementById("statusMessage").textContent = message;
  }

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

  function editRow(button) {
    let row = button.closest("tr");
    if (!row) return;

    let cells = row.querySelectorAll("td[contenteditable]");
    cells.forEach((cell) => {
      cell.contentEditable = "true"; // Cho phép chỉnh sửa
    });

    row.querySelector(".save-btn").disabled = false;
    button.disabled = true; // Tắt nút "Sửa"
  }

  function saveRow(button) {
    let row = button.closest("tr");
    if (!row) return;

    let cells = row.querySelectorAll("td[contenteditable]");
    cells.forEach((cell) => {
      cell.contentEditable = "false"; // Tắt chỉnh sửa
    });

    row.querySelector(".edit-btn").disabled = false;
    button.disabled = true; // Tắt nút "Lưu"
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
            <td contenteditable="true" data-placeholder="SPXXX">SPXXX</td>
            <td contenteditable="true" data-placeholder="Tên sản phẩm">Tên sản phẩm</td>
            <td contenteditable="true" data-placeholder="Giá">Giá</td>
            <td contenteditable="true" data-placeholder="Ngày tháng">Ngày tháng</td>
            <td contenteditable="true" data-placeholder="Số lượng">Số lượng</td>
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

  document.querySelectorAll("td[contenteditable]").forEach((cell) => {
    cell.addEventListener("focus", function () {
      handleFocus(cell);
    });

    cell.addEventListener("blur", function () {
      handleBlur(cell);
    });
  });
});
