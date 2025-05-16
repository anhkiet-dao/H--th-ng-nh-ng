import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  child,
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

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, push, set };

function normalizeDate(dateStr, isFromFirebase = false) {
  if (!dateStr) return null;

  if (!isFromFirebase && dateStr.includes("-")) {
    return dateStr;
  }

  if (isFromFirebase) {
    const timeAndDate = dateStr.split(" ");
    if (timeAndDate.length < 2) return null;

    const timePart = timeAndDate[0];
    const datePart = timeAndDate[1];

    const [day, month, year] = datePart.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  return null;
}

function showNotification(message) {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.style.display = "block";

  const newNotification = notification.cloneNode(true);
  notification.parentNode.replaceChild(newNotification, notification);
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("sanPhamTable").style.display = "none";
  document.getElementById("tongThanhToan").style.display = "none";
});

async function loadRevenueData(
  selectedDate = null,
  selectedMonth = null,
  selectedBranch = null
) {
  try {
    const dbRef = ref(database);
    const revenueSnapshot = await get(child(dbRef, "donHang"));

    const tableBody = document.querySelector("#sanPhamTable tbody");
    const invoiceInfo = document.getElementById("invoiceInfo");
    tableBody.innerHTML = "";
    invoiceInfo.innerHTML = "";
    let totalRevenue = 0;
    let hasData = false;

    const normalizedSelectedDate = selectedDate
      ? normalizeDate(selectedDate)
      : null;

    revenueSnapshot.forEach((childSnapshot) => {
      const order = childSnapshot.val();
      const time = order.thoiGian || "";
      const normalizedOrderDate = normalizeDate(order.thoiGian, true);

      const matchesDate =
        !normalizedSelectedDate ||
        normalizedOrderDate === normalizedSelectedDate;

      const matchesMonth =
        !selectedMonth ||
        (() => {
          const parts = time.split(" ");
          if (parts.length === 2) {
            const [day, month, year] = parts[1].split("/");
            const orderMonthStr = `${year}-${month.padStart(2, "0")}`;
            return orderMonthStr === selectedMonth;
          }
          return false;
        })();

      const matchesBranch =
        !selectedBranch || order.chiNhanh === selectedBranch;

      if (matchesDate && matchesMonth && matchesBranch) {
        hasData = true;
        const row = tableBody.insertRow();
        row.insertCell(0).textContent = order.thoiGian;
        row.insertCell(1).textContent = order.soHoaDon;
        row.insertCell(
          2
        ).textContent = `${order.tongTien.toLocaleString()} VND`;

        const detailButton = document.createElement("button");
        detailButton.innerHTML = '<i class="fas fa-info-circle"></i>';
        detailButton.classList.add("detail-btn");
        detailButton.onclick = () =>
          viewDetails(
            order.danhSachSanPham,
            order.soHoaDon,
            order.thoiGian,
            order.tongTien,
            order.chiNhanh
          );
        row.insertCell(3).appendChild(detailButton);

        totalRevenue += order.tongTien;
      }
    });

    if (hasData) {
      document.getElementById("sanPhamTable").style.display = "table";
      document.getElementById("tongThanhToan").style.display = "block";
      document.getElementById(
        "tongThanhToan"
      ).innerHTML = `Tổng tiền: ${totalRevenue.toLocaleString()} VND`;
    } else {
      document.getElementById("sanPhamTable").style.display = "none";
      document.getElementById("tongThanhToan").style.display = "none";
      if (selectedDate) {
        invoiceInfo.innerHTML = `<p style='color: red; font-weight: bold;'>Không có hóa đơn ngày ${selectedDate}.</p>`;
      } else if (selectedMonth) {
        invoiceInfo.innerHTML = `<p style='color: red; font-weight: bold;'>Không có hóa đơn trong tháng ${selectedMonth}.</p>`;
      }
    }
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu doanh thu:", error);
  }
}

document.getElementById("clearbranch").addEventListener("click", function () {
  const filterBranch = document.getElementById("branchSelect").value;
  if (!filterBranch) {
    showNotification("Bạn chưa chọn chi nhánh nào để lọc!");
    return;
  }
  showNotification("Đang xóa lựa chọn...");
  document.getElementById("branchSelect").value = "Chọn chi nhánh";
  document.getElementById("sanPhamTable").style.display = "none";
  document.getElementById("tongThanhToan").style.display = "none";
  document.getElementById("invoiceInfo").innerHTML = "";
});

document.getElementById("clearButton").addEventListener("click", function () {
  const filterDate = document.getElementById("filterDate").value;
  if (!filterDate) {
    showNotification("Bạn chưa chọn ngày nào để lọc!");
    return;
  }
  showNotification("Đang xóa lựa chọn...");
  document.getElementById("filterDate").value = "";
  document.getElementById("sanPhamTable").style.display = "none";
  document.getElementById("tongThanhToan").style.display = "none";
  document.getElementById("invoiceInfo").innerHTML = "";
});

document
  .getElementById("clearButtonMonth")
  .addEventListener("click", function () {
    const filterDate = document.getElementById("filterMonth").value;
    if (!filterDate) {
      showNotification("Bạn chưa chọn tháng nào để lọc!");
      return;
    }
    showNotification("Đang xóa lựa chọn...");
    document.getElementById("filterMonth").value = "";
    document.getElementById("sanPhamTable").style.display = "none";
    document.getElementById("tongThanhToan").style.display = "none";
    document.getElementById("invoiceInfo").innerHTML = "";
  });

function viewDetails(orderItems, soHoaDon, thoiGian, tongTien, chiNhanh) {
  showNotification(`Đang xem chi tiết hóa đơn...`);
  const modalBody = document.getElementById("modalBody");
  const mainContent = document.getElementById("mainContent");
  const soHoaDonElement = document.getElementById("soHoaDon");
  const thoiGianElement = document.getElementById("thoiGian");
  const TongtienElement = document.getElementById("Tongtien");
  const chiNhanhElement = document.getElementById("chiNhanh");

  modalBody.innerHTML = "";
  chiNhanhElement.textContent = `Chi nhánh: ${chiNhanh}`;
  soHoaDonElement.textContent = `Số hóa đơn: ${soHoaDon}`;
  thoiGianElement.textContent = `Thời gian: ${thoiGian}`;

  orderItems.forEach((item, index) => {
    const row = `<tr>
        <td>${item.maSP}</td>
        <td>${item.tenSP}</td>
        <td>${item.giaSP.toLocaleString()}</td>
        <td>${item.soLuong} kg</td>
        <td>${(item.giaSP * item.soLuong).toLocaleString()}</td>
        <td>${item.giamGia}%</td>
        <td>${item.thanhToan.toLocaleString()}</td>
      </tr>`;
    modalBody.innerHTML += row;
  });

  TongtienElement.textContent = `Tổng tiền: ${tongTien.toLocaleString()} VND`;

  mainContent.style.display = "none";
  document.getElementById("detailModal").style.display = "block";

  const backButton = document.getElementById("backButton");
  backButton.replaceWith(backButton.cloneNode(true));
  document.getElementById("backButton").addEventListener("click", function () {
    showNotification("Đang quay lại...");
    mainContent.style.display = "block";
    document.getElementById("detailModal").style.display = "none";
  });
}

document.getElementById("filterButton").addEventListener("click", () => {
  const selectedDate = document.getElementById("filterDate").value;
  if (!selectedDate) {
    showNotification("Vui lòng chọn ngày!");
    return;
  }
  loadRevenueData(selectedDate);
});

document.getElementById("filterbranchButton").addEventListener("click", () => {
  const selectedBranch = document.getElementById("branchSelect").value;
  if (!selectedBranch || selectedBranch === "Tất cả") {
    showNotification("Vui lòng chọn chi nhánh!");
    return;
  }
  showNotification(`Đang lọc chi nhánh: ${selectedBranch}...`);
  loadRevenueData(null, null, selectedBranch);
});

document.getElementById("filterMonthButton").addEventListener("click", () => {
  const selectedMonth = document.getElementById("filterMonth").value;
  if (!selectedMonth) {
    showNotification("Vui lòng chọn tháng!");
    return;
  }
  calculateMonthlyRevenue(selectedMonth).then(() => {
    loadRevenueData(null, selectedMonth);
  });
});

async function calculateMonthlyRevenue(monthStr) {
  try {
    const dbRef = ref(database);
    const revenueSnapshot = await get(child(dbRef, "donHang"));

    if (!revenueSnapshot.exists()) {
      console.warn("Không có dữ liệu doanh thu.");
      return;
    }

    let total = 0;
    revenueSnapshot.forEach((childSnapshot) => {
      const order = childSnapshot.val();
      const time = order.thoiGian || "";

      const parts = time.split(" ");
      if (parts.length === 2) {
        const [day, month, year] = parts[1].split("/");
        const orderMonthStr = `${year}-${month.padStart(2, "0")}`;
        if (orderMonthStr === monthStr) {
          total += order.tongTien || 0;
        }
      }
    });

    loadRevenueData(null, monthStr);
  } catch (error) {
    console.error("Lỗi khi tính doanh thu theo tháng:", error);
  }
}
