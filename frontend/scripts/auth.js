//authentication and mongodb features
const registerLoginOverlay = document.querySelector("#register-login-overlay");
const home = document.querySelector("#home");
const avatar = document.querySelector("#avatar");
const userDisplay = document.querySelector("#user-display");
const logoutButton = document.querySelector("#logout-button");

const loginButton = document.querySelector("#login-button");
const registerButton = document.querySelector("#register-button");

const closeButtons = document.querySelectorAll(".form-close");

const loginForm = document.querySelector("#login-form");
const registerForm = document.querySelector("#register-form");
const forgotForm = document.querySelector("#forgot-form");
const resetPasswordForm = document.querySelector("#reset-password-form");

const loginLink = document.querySelector("#login-link");
const forgotLink = document.querySelector("#forgot-link");
const registerLink = document.querySelector("#register-link");
const resetLink = document.querySelector("#reset-link");

let currentEmail;

// const baseUrl = "http://localhost:3000";
let baseUrl = "https://wallet-watcher-backend.vercel.app";

axios.defaults.withCredentials = true;

export function saveDataToDB() {
  let data = {
    balance: localStorage.getItem("balance"),
    expenseData: localStorage.getItem("expenseData"),
  };
  currentEmail &&
    axios
      .post(`${baseUrl}/api/save`, { email: currentEmail, data })
      .then((res) => console.log(res.data))
      .catch((err) => {
        console.log(err);
        alert(`Error: ${err}`);
      });
}

export function openLoginAndRegister(elem) {
  closeLoginAndRegister();
  home.style.display = "none";
  registerLoginOverlay.style.display = "flex";
  elem.innerText == "Login" && (loginForm.style.display = "flex");
  elem.innerText == "Register" && (registerForm.style.display = "flex");
}

export function closeLoginAndRegister() {
  home.style.display = "flex";
  loginForm.style.display = "none";
  registerForm.style.display = "none";
  forgotForm.style.display = "none";
  resetPasswordForm.style.display = "none";
}

export function openForgot() {
  closeLoginAndRegister();
  home.style.display = "none";
  forgotForm.style.display = "flex";
}

export function openReset() {
  closeLoginAndRegister();
  home.style.display = "none";
  resetPasswordForm.style.display = "flex";
}

export function register(e) {
  e.preventDefault();
  let email = document.querySelector("#register-email").value;
  let password = document.querySelector("#register-password").value;
  let avatar = document.querySelector("#avatar-url").value;
  axios
    .post(`${baseUrl}/api/register`, { email, password, avatar })
    .then((res) =>
      res.data === `${email} is now registered!`
        ? ((localStorage.setItem("balance", "0"),
          localStorage.setItem("expenseData", "[]")),
          alert(res.data),
          closeLoginAndRegister())
        : alert(res.data)
    )
    .catch((err) => {
      console.log(err);
      alert(`Error: ${err}`);
    });
}

export function login(e) {
  e.preventDefault();

  let email = document.querySelector("#login-email").value;
  let password = document.querySelector("#login-password").value;

  axios
    .post(`${baseUrl}/api/login`, { email, password })
    .then((res) => {
      res.data[0] === "You are now logged in"
        ? ((logoutButton.style.display = "inline-block"),
          (userDisplay.style.display = "inline-block"),
          (currentEmail = email),
          (userDisplay.innerText = `Welcome ${currentEmail}!`),
          (registerLoginOverlay.style.display = "none"),
          res.data[1] &&
            (localStorage.setItem("balance", res.data[1].balance),
            localStorage.setItem("expenseData", res.data[1].expenseData)),
          alert(res.data[0]),
          closeLoginAndRegister(),
          location.reload())
        : ((currentEmail = ""), alert("Wrong Password"));
    })
    .catch((err) => {
      console.log(err);
      alert(`Error: ${err}`);
    });
}

export function logout() {
  axios
    .get(`${baseUrl}/api/logout`)
    .then((res) => {
      saveDataToDB();
      loginButton.style.display = "inline-block";
      registerButton.style.display = "inline-block";
      logoutButton.style.display = "none";
      userDisplay.style.display = "none";
      userDisplay.innerText = "";
      currentEmail = "";
      alert(res.data);
      closeLoginAndRegister();
      localStorage.removeItem("balance");
      localStorage.removeItem("expenseData");
      location.reload();
    })
    .catch((err) => {
      console.log(err);
    });
}

export function forgotPassword(e) {
  e.preventDefault();
  let email = document.querySelector("#forgot-email").value;
  axios
    .post(`${baseUrl}/api/forgot-password`, { email })
    .then((res) => {
      alert(res.data);
      res.data === "Email sent" && (closeLoginAndRegister(), openReset());
    })
    .catch((err) => {
      console.log(err);
      alert(`Error: ${err}`);
    });
}

export function resetPassword(e) {
  e.preventDefault();

  let resetUrl = document.querySelector("#reset-code").value;
  let newPassword = document.querySelector("#new-password").value;

  resetUrl &&
    axios
      .post(`${baseUrl}/api/reset-password/${resetUrl}`, {
        password: newPassword,
      })
      .then((res) => {
        res.data === "Password updated"
          ? (alert(res.data), closeLoginAndRegister())
          : alert(`Error! ${res.data}`);
      })
      .catch((err) => {
        console.log(err);
        alert(`Error: ${err}`);
      });
}

export function verify() {
  axios
    .get(`${baseUrl}/api/verify`)
    .then((res) => {
      res.data.login === true
        ? ((currentEmail = res.data.email),
          (userDisplay.innerText = `Welcome ${currentEmail}!`),
          (registerLoginOverlay.style.display = "none"),
          (userDisplay.style.display = "inline-block"),
          res.data.avatar && (avatar.src = res.data.avatar),
          res.data.data &&
            (localStorage.setItem("balance", res.data.data.balance),
            localStorage.setItem("expenseData", res.data.data.expenseData)))
        : (registerLoginOverlay.style.display = "flex");
    })
    .catch((err) => {
      console.log(err);
    });
}

// open login and register panels from home
loginButton.addEventListener("click", (e) => openLoginAndRegister(e.target));
registerButton.addEventListener("click", (e) => openLoginAndRegister(e.target));

//handle extra links to login, register,forgot and reset panels
loginLink.addEventListener("click", (e) => {
  openLoginAndRegister(loginButton);
});
registerLink.addEventListener("click", (e) => {
  openLoginAndRegister(registerButton);
});
forgotLink.addEventListener("click", (e) => {
  openForgot();
});
resetLink.addEventListener("click", (e) => {
  openReset();
});

// handle close and logout
logoutButton.addEventListener("click", logout);
closeButtons.forEach((elem) =>
  elem.addEventListener("click", closeLoginAndRegister)
);

loginForm.addEventListener("submit", (e) => login(e));
registerForm.addEventListener("submit", (e) => register(e));
forgotForm.addEventListener("submit", (e) => forgotPassword(e));
resetPasswordForm.addEventListener("submit", (e) => resetPassword(e));
