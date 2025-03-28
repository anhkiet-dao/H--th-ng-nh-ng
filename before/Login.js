function login() {
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;
  var errorMessage = document.getElementById("error-message");

  if (username === "admin" && password === "1234") {
    fetch("select.html")
      .then((response) => response.text())
      .then((data) => {
        document.body.innerHTML = "";
        document.body.insertAdjacentHTML("beforeend", data);

        let link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "select.css";
        document.head.appendChild(link);

        let script = document.createElement("script");
        script.src = "select.js?v=" + new Date().getTime();
        script.onload = function () {
          console.log("select.js đã tải và chạy thành công!");
        };
        script.onerror = function () {
          console.error("Lỗi tải script.js");
        };
        document.body.appendChild(script);
      })
      .catch((error) => console.error("Lỗi tải trang: ", error));
  } else {
    errorMessage.textContent = "Tên đăng nhập hoặc mật khẩu sai!";
  }
}
