function login() {
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;
  var errorMessage = document.getElementById("error-message");

  if (username === "admin" && password === "1234") {
    window.location.href = "../before/select.html";
  } else if (
    (username === "ChinhanhA" && password === "1234") ||
    (username === "ChinhanhB" && password === "1234")
  ) {
    localStorage.setItem("loggedInUser", username);
    window.location.href = "../before/tinhtien.html";
  } else {
    errorMessage.textContent = "Tên đăng nhập hoặc mật khẩu sai!";
  }
}
window.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    login();
  }
});
