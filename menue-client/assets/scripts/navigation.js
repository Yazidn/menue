const electron = require("electron");
let isItFS = false;

function fullscreen() {
  let window = electron.remote.getCurrentWindow();
  window.setFullScreen(!isItFS);
  isItFS = !isItFS;
}

function order() {
  document.querySelector(".settings-page").style.display = "none";
  document.querySelector(".confirm-page").style.display = "none";
  document.querySelector(".order-page").style.display = "grid";
}

function proceed() {
  document.querySelector(".search-field").value = "";
  document.querySelector(".settings-page").style.display = "none";
  document.querySelector(".order-page").style.display = "none";
  document.querySelector(".confirm-page").style.display = "grid";
}

function confirm() {
  document.querySelector(".confirm-page").style.display = "none";
  document.querySelector(".finish-page").style.display = "grid";
}

function finish() {
  updateView(false);

  document.querySelector(".finish-page").style.display = "none";
  document.querySelector(".order-page").style.display = "grid";
}

function settings() {
  renderValuesFromCurrent();
  document.querySelector(".order-page").style.display = "none";
  document.querySelector(".settings-page").style.display = "grid";
}