const orderTotalPrice = document.querySelector(".order-total .total-price");

function renderTotalPrice() {
  let totalPriceValue = 0;

  orderBody.dishes.forEach((dish) => {
    totalPriceValue += dish.totalDishPrice;
  });

  orderBody.total = totalPriceValue;
  orderTotalPrice.textContent = totalPriceValue + " ";

  document.querySelector(".order-total .currency ").textContent =
    config.currency;
}

let orderSelectedDishesStrings = [];
let orderSelectedDishes = [];

const orderBody = {
  dishes: [],
  note: "",
  total: 0,
};

function proceedToConfirm() {
  if (orderSelectedDishesStrings.length > 0) {
    orderBody.dishes = orderSelectedDishes;
    renderOrderDishes(orderSelectedDishes);
    proceed();
  } else {
    swal(
      "Choisissez un plat",
      "Vous devez sélectionner au moins un plat avant de procéder",
      "info",
      {
        buttons: false,
      }
    );
  }
}

function confirmToFinish() {
  orderBody.note = document.querySelector(".note-ctn textarea").value;

  fetch(`http://${config.server}:${config.port}/orders`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderBody),
  })
    .then((res) => res.json())
    .then((response) => {
      document.querySelector("p.order-number").textContent = response;
      confirm();
    })
    .catch((error) => {
      swal("Problème de serveur", "Redémarrer et réessayer", "error", {
        buttons: false,
      });
    });
}

function finishOrder() {
  orderSelectedDishesStrings = [];
  orderSelectedDishes = [];

  document.querySelector(".note-ctn textarea").value = "";

  finish();
}

function searchDishes() {
  let input = document.querySelector(".search-field");

  document.querySelector(".catalog-ctn").innerHTML = "";

  fetch(`http://${config.server}:${config.port}/dishes-av`)
    .then((res) => res.json())
    .then((response) => {
      response.forEach((dish) => {
        if (dish.name.toLowerCase().indexOf(input.value.toLowerCase()) !== -1) {
          createCatalogHTML(
            dish,
            orderSelectedDishesStrings.includes(dish.name)
          );
        }
      });
    })
    .catch((err) => {
      swal("Problème de serveur", "Redémarrer et réessayer", "error", {
        buttons: false,
      });
    });
}

function sortBy(parameter) {
  document.querySelector(".catalog-ctn").innerHTML = "";

  fetch(`http://${config.server}:${config.port}/dishes-av-sort/${parameter}`)
    .then((res) => res.json())
    .then((response) => {
      response.forEach((dish) => {
        createCatalogHTML(dish, orderSelectedDishesStrings.includes(dish.name));
      });
    })
    .catch((err) => {
      swal("Problème de serveur", "Redémarrer et réessayer", "error", {
        buttons: false,
      });
    });
}