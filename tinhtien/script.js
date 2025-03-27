import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import {
  getDatabase,
  ref,
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

function layGioVietNam() {
  const now = new Date();
  return now.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
}

// Hàm tính toán
function tinhTien() {
  const giaSP = parseFloat(document.getElementById("giaSP").value) || 0;
  const soLuong = parseInt(document.getElementById("soLuong").value) || 0;
  const giamGia = parseFloat(document.getElementById("giamGia").value) || 0;

  const tongGia = giaSP * soLuong;
  const tienGiam = tongGia * (giamGia / 100);
  const thanhToan = tongGia - tienGiam;

  document.getElementById(
    "tongGia"
  ).textContent = `${tongGia.toLocaleString()} VND`;
  document.getElementById(
    "thanhToan"
  ).textContent = `${thanhToan.toLocaleString()} VND`;
}

// Thêm sản phẩm vào bảng
function themSanPhamVaoBang() {
  const maSP = document.getElementById("maSP").value;
  const tenSP = document.getElementById("tenSP").value;
  const giaSP = parseFloat(document.getElementById("giaSP").value) || 0;
  const soLuong = parseInt(document.getElementById("soLuong").value) || 0;
  const giamGia = parseFloat(document.getElementById("giamGia").value) || 0;

  if (!maSP || !tenSP || giaSP <= 0 || soLuong <= 0) return;

  const tongGia = giaSP * soLuong;
  const tienGiam = tongGia * (giamGia / 100);
  const thanhToan = tongGia - tienGiam;

  const table = document.querySelector("#sanPhamTable tbody");
  const newRow = table.insertRow();

  newRow.insertCell(0).textContent = maSP;
  newRow.insertCell(1).textContent = tenSP;
  newRow.insertCell(2).textContent = `${giaSP.toLocaleString()} VND`;
  newRow.insertCell(3).textContent = soLuong;
  newRow.insertCell(4).textContent = `${tongGia.toLocaleString()} VND`;
  newRow.insertCell(5).textContent = `${giamGia}%`;
  newRow.insertCell(6).textContent = `${thanhToan.toLocaleString()} VND`;

  updateTotal();
}

// Cập nhật tổng thanh toán
function updateTotal() {
  let total = 0;
  document.querySelectorAll("#sanPhamTable tbody tr").forEach((row) => {
    const amount = parseFloat(row.cells[6].textContent.replace(/[^\d.]/g, ""));
    total += amount;
  });
  document.getElementById(
    "tongThanhToan"
  ).innerHTML = `<strong>${total.toLocaleString()} VND</strong>`;
}

// Thanh toán
function thanhToan() {
  const rows = document.querySelectorAll("#sanPhamTable tbody tr");
  if (rows.length === 0) {
    alert("Chưa có sản phẩm nào để thanh toán!");
    return;
  }

  const donHang = [];
  rows.forEach((row) => {
    const sanPham = {
      maSP: row.cells[0].textContent,
      tenSP: row.cells[1].textContent,
      giaSP: parseFloat(row.cells[2].textContent.replace(/[^\d.]/g, "")),
      soLuong: parseInt(row.cells[3].textContent),
      tongGia: parseFloat(row.cells[4].textContent.replace(/[^\d.]/g, "")),
      giamGia: parseFloat(row.cells[5].textContent.replace("%", "")),
      thanhToan: parseFloat(row.cells[6].textContent.replace(/[^\d.]/g, "")),
    };
    donHang.push(sanPham);
  });

  const thoiGianVietNam = layGioVietNam();

  // Debug dữ liệu trước khi lưu vào Firebase
  console.log("Dữ liệu gửi lên Firebase:", {
    thoiGian: new Date().toISOString(),
    danhSachSanPham: donHang,
    tongTien: donHang.reduce((sum, sp) => sum + sp.thanhToan, 0),
  });

  // Đẩy dữ liệu lên Firebase
  const donHangRef = push(ref(database, "donHang"));
  set(donHangRef, {
    thoiGian: thoiGianVietNam,
    danhSachSanPham: donHang,
    tongTien: donHang.reduce((sum, sp) => sum + sp.thanhToan, 0),
  })
    .then(() => {
      alert("Thanh toán thành công!");
      document.querySelector("#sanPhamTable tbody").innerHTML = "";
      document.getElementById("tongThanhToan").innerHTML =
        "<strong>0 VND</strong>";

      // Reset form
      document.getElementById("maSP").value = "";
      document.getElementById("tenSP").value = "";
      document.getElementById("giaSP").value = "";
      document.getElementById("soLuong").value = "";
      document.getElementById("giamGia").value = "";
      document.getElementById("tongGia").textContent = "0 VND";
      document.getElementById("thanhToan").textContent = "0 VND";
    })
    .catch((error) => {
      console.error("Lỗi khi lưu vào Firebase:", error);
    });
}

// Thêm sự kiện khi DOM tải xong
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".calculate-input").forEach((input) => {
    input.addEventListener("input", tinhTien);
  });

  // Sự kiện thêm sản phẩm khi nhấn Enter ở ô giảm giá
  document
    .getElementById("giamGia")
    .addEventListener("blur", themSanPhamVaoBang);

  // Sự kiện thanh toán
  document.getElementById("btnThanhToan").addEventListener("click", thanhToan);
});
