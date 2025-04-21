function login() {
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;
  var errorMessage = document.getElementById("error-message");

  if (username === "admin" && password === "1234") {
    window.location.href = "select.html";
  } else if (username === "user" && password === "1234") {
    window.location.href = "tinhtien.html";
  } else {
    errorMessage.textContent = "Tên đăng nhập hoặc mật khẩu sai!";
  }
}
