import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  child,
  push,
  set,
  remove,
  onChildAdded,
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

function layGioVietNam() {
  return new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
}

function theoDoiDonHangMoi() {
  const orderRef = ref(database, "order");

  onChildAdded(orderRef, (snapshot) => {
    const { masp, soluong } = snapshot.val();
    layThongTinSanPham(masp, soluong);
  });
}

function showNotification(message) {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.style.display = "block";

  const newNotification = notification.cloneNode(true);
  notification.parentNode.replaceChild(newNotification, notification);
}

async function layThongTinSanPham(maSP, soLuong) {
  if (!maSP) return;
  try {
    const productSnapshot = await get(child(ref(database), `products/${maSP}`));
    if (!productSnapshot.exists()) return;

    const productData = productSnapshot.val();
    const giaSP = productData.price || 0;

    const discountRef = child(ref(database), `discounts/${maSP}/discount`);
    const discountSnapshot = await get(discountRef);
    const giamGia = discountSnapshot.exists() ? discountSnapshot.val() : 0;

    themSanPhamVaoBang(maSP, productData.name, giaSP, soLuong, giamGia);
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu sản phẩm:", error);
  }
}

function themSanPhamVaoBang(maSP, tenSP, giaSP, soLuong, giamGia) {
  const tongGia = giaSP * soLuong;
  const thanhToan = tongGia - (tongGia * giamGia) / 100;

  const newRow = document.querySelector("#sanPhamTable tbody").insertRow();
  newRow.innerHTML = `
    <td>${maSP}</td>
    <td>${tenSP}</td>
    <td>${giaSP.toLocaleString()}</td>
    <td>${soLuong}</td>
    <td>${tongGia.toLocaleString()}</td>
    <td>${giamGia}</td>
    <td>${thanhToan.toLocaleString()}</td>`;

  updateTotal();
}

function updateTotal() {
  let total = [...document.querySelectorAll("#sanPhamTable tbody tr")].reduce(
    (sum, row) => sum + parseFloat(row.cells[6].textContent.replace(/\D/g, "")),
    0
  );

  document.getElementById(
    "tongThanhToan"
  ).innerHTML = `<strong>${total.toLocaleString()} VND</strong>`;
}

async function laySanPhamTheoMa(maSP) {
  if (!maSP) return;
  try {
    const productSnapshot = await get(child(ref(database), `products/${maSP}`));
    if (!productSnapshot.exists()) return;

    const product = productSnapshot.val();
    document.getElementById("tenSP").value = product.name || "";
    document.getElementById("giaSP").value = product.price || 0;

    const discountSnapshot = await get(
      child(ref(database), `discounts/${maSP}`)
    );
    document.getElementById("giamGia").value = discountSnapshot.exists()
      ? discountSnapshot.val().discount || 0
      : 0;

    tinhTien();
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
  }
}

document.getElementById("maSP").addEventListener("input", function () {
  laySanPhamTheoMa(this.value.trim());
});

document.querySelectorAll(".calculate-input").forEach((input) => {
  input.addEventListener("input", tinhTien);
});

function tinhTien() {
  const giaSP = parseFloat(document.getElementById("giaSP").value) || 0;
  const soLuong = parseInt(document.getElementById("soLuong").value) || 0;
  const giamGia = parseFloat(document.getElementById("giamGia").value) || 0;
  if (!giaSP || !soLuong) return;

  const tongGia = giaSP * soLuong;
  const thanhToan = tongGia - (tongGia * giamGia) / 100;

  document.getElementById(
    "tongGia"
  ).textContent = `${tongGia.toLocaleString()} VND`;
  document.getElementById(
    "thanhToan"
  ).textContent = `${thanhToan.toLocaleString()} VND`;
}

async function thanhToan() {
  const rows = [...document.querySelectorAll("#sanPhamTable tbody tr")];
  if (!rows.length)
    return showNotification("Chưa có sản phẩm nào để thanh toán!");
  const soHoaDonSpan = document.getElementById("soHoaDon");
  const soHoaDon = `${new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "")}${Math.floor(10000 + Math.random() * 90000)}`;
  soHoaDonSpan.textContent = soHoaDon;

  const donHang = rows.map((row) => ({
    maSP: row.cells[0].textContent,
    tenSP: row.cells[1].textContent,
    giaSP: parseFloat(row.cells[2].textContent.replace(/\D/g, "")),
    soLuong: parseInt(row.cells[3].textContent),
    giamGia: parseFloat(row.cells[5].textContent.replace(/\D/g, "")),
    tongGia: parseFloat(row.cells[4].textContent.replace(/\D/g, "")),
    thanhToan: parseFloat(row.cells[6].textContent.replace(/\D/g, "")),
  }));

  try {
    await set(push(ref(database, "donHang")), {
      soHoaDon: soHoaDon,
      thoiGian: layGioVietNam(),
      danhSachSanPham: donHang,
      tongTien: donHang.reduce((sum, sp) => sum + sp.thanhToan, 0),
    });

    await remove(ref(database, "order"));

    hienThiHoaDon(donHang);

    document.querySelector("#sanPhamTable tbody").innerHTML = "";
    updateTotal();
  } catch (error) {
    console.error("Lỗi khi thanh toán:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  theoDoiDonHangMoi();
  document.getElementById("btnThanhToan").addEventListener("click", thanhToan);
});

function hienThiHoaDon(donHang) {
  const hoaDonDiv = document.getElementById("hoaDon");
  const mainContent = document.getElementById("mainContent");
  const tbody = document.getElementById("hoaDonNoiDung");
  const thoiGianSpan = document.getElementById("hoaDonThoiGian");
  const tongTienSpan = document.getElementById("hoaDonTongTien");

  tbody.innerHTML = "";
  let tongTien = 0;

  donHang.forEach((sp) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${sp.maSP}</td>
      <td>${sp.tenSP}</td>
      <td>${sp.giaSP.toLocaleString()}</td>
      <td>${sp.soLuong}</td>
      <td>${sp.giamGia}</td>
      <td>${sp.thanhToan.toLocaleString()}</td>
    `;
    tbody.appendChild(row);
    tongTien += sp.thanhToan;
  });

  thoiGianSpan.textContent = layGioVietNam();
  tongTienSpan.textContent = tongTien.toLocaleString();
  mainContent.style.display = "none";
  hoaDonDiv.style.display = "block";

  document.getElementById("printButton").addEventListener("click", function () {
    hoaDonDiv.style.display = "none";
    mainContent.style.display = "block";
  });
}
