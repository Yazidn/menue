const { ipcRenderer } = require("electron");

const orderFX = new Audio("./assets/sounds/order.mp3");
const servedFX = new Audio("./assets/sounds/served.mp3");
const emptyFX = new Audio("./assets/sounds/empty.mp3");

function renderView(ft) {
  document.querySelector(".awaiting ul").innerHTML = "";
  document.querySelector(".current-order-ctn").innerHTML = "";
  document.querySelector(".current-order").innerHTML = "";
  document.querySelector(".note-ctn").innerHTML = "";
  document.querySelector(".total-price-ctn").innerHTML = "";

  fetch(`http://${config.server}:${config.port}/orders`)
    .then((res) => res.json())
    .then((response) => {
      if (response.orders.length === 0) {
        renderNoOrders();
      } else {
        orderFX.play();

        response.orders.forEach((order) => {
          if (order.awaiting === true) {
            createAwaitingOrdersHTML(order);
          } else {
            renderOrderDetails(order);
            order.dishes.forEach((dish) => {
              createCurrentOrderDishesHTML(dish);
            });
          }
        });
        renderAwaitingCount(response.awaitingOrders);
      }

      if (ft) ipcRenderer.send("ready");
    })
    .catch((err) => {
      if (ft) ipcRenderer.send("ready");

      swal("Problème de serveur", "Redémarrer et réessayer", "error", {
        buttons: false,
      });
    });
}

function updateView(response) {
  document.querySelector(".awaiting ul").innerHTML = "";

  document.querySelector(".current-order-ctn").innerHTML = "";
  document.querySelector(".current-order").innerHTML = "";
  document.querySelector(".note-ctn").innerHTML = "";
  document.querySelector(".total-price-ctn").innerHTML = "";

  if (response.orders.length === 0) {
    renderNoOrders();
    emptyFX.play();
  } else {
    response.orders.forEach((order) => {
      servedFX.play();
      if (order.awaiting === true) {
        createAwaitingOrdersHTML(order);
      } else {
        renderOrderDetails(order);
        order.dishes.forEach((dish) => {
          createCurrentOrderDishesHTML(dish);
        });
      }
    });
    renderAwaitingCount(response.awaitingOrders);
  }
}

function markAsServed() {
  updateOrder("served");
}

function updateOrder(action, identifier) {
  fetch(`http://${config.server}:${config.port}/orders`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: action,
      identifier: identifier,
    }),
  })
    .then((res) => res.json())
    .then((response) => {
      updateView(response);
    })
    .catch((error) => {
      swal("Problème de serveur", "Redémarrer et réessayer", "error", {
        buttons: false,
      });
    });
}

function cancelOrder() {
  updateOrder("cancelled");
}

function renderNoOrders() {
  renderAwaitingCount(0);
}

function closeModal(modal, dim) {
  document.querySelector(`.${dim}`).style.display = "none";
  document.querySelector(`.${modal}`).style.display = "none";

  if (modal === "add-dish-modal") clearForm("#add-dish-form");
  if (modal === "add-category-modal") clearForm("#add-category-form");
  if (modal === "edit-category-modal") clearForm("#edit-category-form");
}