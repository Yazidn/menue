const electron = require("electron");
let isItFS = false;

function fullscreen() {
  let window = electron.remote.getCurrentWindow();
  window.setFullScreen(!isItFS);
  isItFS = !isItFS;
}

function home() {
  document.querySelector(".inventory-page").style.display = "none";
  document.querySelector(".settings-page").style.display = "none";
  document.querySelector(".stats-page").style.display = "none";
  document.querySelector(".home-page").style.display = "grid";
}

function inventory() {
  document.querySelector(".dishes input").style.display = "none";
  document.querySelector(".dishes input").value = "";

  renderDishesList();
  renderCategoriesList();
  document.querySelector(".home-page").style.display = "none";
  document.querySelector(".inventory-page").style.display = "grid";
}

function settings() {
  renderValuesFromCurrent();
  document.querySelector(".home-page").style.display = "none";
  document.querySelector(".settings-page").style.display = "grid";
}

function stats() {
  renderStats();
  document.querySelector(".home-page").style.display = "none";
  document.querySelector(".stats-page").style.display = "grid";
}

function about() {
  document.querySelector(".about-dim").style.display = "block";
  document.querySelector(".about-modal").style.display = "block";
}

function openAddDishModal() {
  renderCategoriesOptions();

  document.querySelector(".add-dish-dim").style.display = "block";
  document.querySelector(".add-dish-modal").style.display = "block";
  document.querySelector(".add-dish-modal input:first-of-type").focus();
}

function openAddCategoryModal() {
  document.querySelector(".add-category-dim").style.display = "block";
  document.querySelector(".add-category-modal").style.display = "block";
  document.querySelector(".add-category-modal input").focus();
}

function openEditCategoryModal() {
  document.querySelector(".edit-category-dim").style.display = "block";
  document.querySelector(".edit-category-modal").style.display = "block";
  document.querySelector(".edit-category-modal input:last-of-type").focus();
}

function clearForm(form) {
  document.querySelector(form).reset();

  if (form === "#add-dish-form")
    document.querySelector(".file-info").textContent = "Choisissez une image";
}

function enter(button) {
  if (event.keyCode === 13) document.querySelector(`.${button}`).click();
}