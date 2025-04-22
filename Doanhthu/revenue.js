import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  child,
  push,
  set,
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

export { database, ref, push, set };

function normalizeDate(dateStr, isFromFirebase = false) {
  if (!dateStr) return null;

  if (!isFromFirebase && dateStr.includes("-")) {
    return dateStr;
  }

  if (isFromFirebase) {
    const timeAndDate = dateStr.split(" ");
    if (timeAndDate.length < 2) return null;

    const timePart = timeAndDate[0]; // HH:mm:ss
    const datePart = timeAndDate[1]; // DD/MM/YYYY

    const [day, month, year] = datePart.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  return null;
}

function showNotification(message) {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.style.display = "block";

  // Reset animation bằng cách tạo lại node
  const newNotification = notification.cloneNode(true);
  notification.parentNode.replaceChild(newNotification, notification);
}

async function loadRevenueData(selectedDate = null) {
  try {
    const dbRef = ref(database);
    const revenueSnapshot = await get(child(dbRef, "donHang"));

    if (!revenueSnapshot.exists()) {
      console.warn("Không có dữ liệu doanh thu.");
      return;
    }

    const tableBody = document.querySelector("#sanPhamTable tbody");
    tableBody.innerHTML = "";
    let totalRevenue = 0;

    const normalizedSelectedDate = selectedDate
      ? normalizeDate(selectedDate)
      : null;
    console.log("Ngày đã chọn (chuẩn hóa):", normalizedSelectedDate);

    revenueSnapshot.forEach((childSnapshot) => {
      const order = childSnapshot.val();

      const normalizedOrderDate = normalizeDate(order.thoiGian, true);
      console.log("Ngày đơn hàng (chuẩn hóa):", normalizedOrderDate);

      if (
        !normalizedSelectedDate ||
        normalizedOrderDate === normalizedSelectedDate
      ) {
        const row = tableBody.insertRow();

        row.insertCell(0).textContent = order.thoiGian;
        row.insertCell(
          1
        ).textContent = `${order.tongTien.toLocaleString()} VND`;

        const detailButton = document.createElement("button");
        detailButton.innerHTML = '<i class="fas fa-info-circle"></i>';
        detailButton.classList.add("detail-btn");

        detailButton.onclick = () =>
          viewDetails(
            order.danhSachSanPham,
            order.soHoaDon,
            order.thoiGian,
            order.tongTien
          );
        row.insertCell(2).appendChild(detailButton);

        totalRevenue += order.tongTien;
      }
    });

    document.getElementById(
      "tongThanhToan"
    ).innerHTML = `<strong>${totalRevenue.toLocaleString()} VND</strong>`;

    if (tableBody.rows.length === 0 && normalizedSelectedDate) {
      showNotification(`Không có đơn hàng nào vào ngày ${selectedDate}`);
    }
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu doanh thu:", error);
  }
}

document.getElementById("clearButton").addEventListener("click", function () {
  document.getElementById("filterDate").value = "";
  loadRevenueData();
});

document
  .getElementById("clearButtonMonth")
  .addEventListener("click", function () {
    document.getElementById("filterMonth").value = "";
    document.getElementById("thongBaoDoanhThuThang").style.display = "none";
    loadRevenueData();
  });

function viewDetails(orderItems, soHoaDon, thoiGian, tongTien) {
  const modalBody = document.getElementById("modalBody");
  const mainContent = document.getElementById("mainContent");
  const soHoaDonElement = document.getElementById("soHoaDon");
  const thoiGianElement = document.getElementById("thoiGian");
  const TongtienElement = document.getElementById("Tongtien");
  modalBody.innerHTML = "";
  soHoaDonElement.textContent = `Số hóa đơn: ${soHoaDon}`;
  thoiGianElement.textContent = `Thời gian: ${thoiGian}`;
  orderItems.forEach((item, index) => {
    const row = `<tr>
        <td>${item.maSP}</td>
        <td>${item.tenSP}</td>
        <td>${item.giaSP.toLocaleString()}</td>
        <td>${item.soLuong}</td>
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
    mainContent.style.display = "block";
    document.getElementById("detailModal").style.display = "none";
  });
}

document.addEventListener("DOMContentLoaded", () => loadRevenueData());
document.getElementById("filterButton").addEventListener("click", () => {
  const selectedDate = document.getElementById("filterDate").value;
  if (!selectedDate) {
    showNotification("Vui lòng chọn ngày!");
    return;
  }
  loadRevenueData(selectedDate);
});

document.getElementById("filterMonthButton").addEventListener("click", () => {
  const selectedMonth = document.getElementById("filterMonth").value; // yyyy-mm
  if (!selectedMonth) {
    showNotification("Vui lòng chọn tháng!");
    return;
  }

  calculateMonthlyRevenue(selectedMonth);
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

      // Thời gian trong DB có định dạng: "HH:mm:ss DD/MM/YYYY"
      const parts = time.split(" ");
      if (parts.length === 2) {
        const [day, month, year] = parts[1].split("/");
        const orderMonthStr = `${year}-${month.padStart(2, "0")}`;
        if (orderMonthStr === monthStr) {
          total += order.tongTien || 0;
        }
      }
    });

    document.getElementById("tongDoanhThuThang").textContent =
      total.toLocaleString() + " VND";
    document.getElementById("thongBaoDoanhThuThang").style.display = "block";
  } catch (error) {
    console.error("Lỗi khi tính doanh thu theo tháng:", error);
  }
}
