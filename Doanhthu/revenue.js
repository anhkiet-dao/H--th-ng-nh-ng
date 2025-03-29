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

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Xuất database để sử dụng trong file khác
export { database, ref, push, set };

async function loadRevenueData() {
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

    revenueSnapshot.forEach((childSnapshot) => {
      const order = childSnapshot.val();
      const row = tableBody.insertRow();

      row.insertCell(0).textContent = order.thoiGian;
      row.insertCell(1).textContent = `${order.tongTien.toLocaleString()} VND`;

      const detailButton = document.createElement("button");
      detailButton.innerHTML = '<i class="fas fa-info-circle"></i>';
      detailButton.classList.add("detail-btn");

      detailButton.onclick = () => viewDetails(order.danhSachSanPham);
      row.insertCell(2).appendChild(detailButton);

      totalRevenue += order.tongTien;
    });

    document.getElementById(
      "tongThanhToan"
    ).innerHTML = `<strong>${totalRevenue.toLocaleString()} VND</strong>`;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu doanh thu:", error);
  }
}

// Hiển thị chi tiết đơn hàng trong bảng modal
function viewDetails(orderItems) {
  const modalBody = document.getElementById("modalBody");
  modalBody.innerHTML = "";
  orderItems.forEach((item, index) => {
    const row = `<tr>
        <td>${index + 1}</td>
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
  document.getElementById("detailModal").style.display = "block";
}

// Đóng modal
document.getElementById("backButton").addEventListener("click", function () {
  document.getElementById("detailModal").style.display = "none";
});

document.addEventListener("DOMContentLoaded", loadRevenueData);
