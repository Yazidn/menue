const { ipcRenderer } = require("electron");

function createCatalogHTML(dish, selected) {
  let newDish = document.createElement("div");
  newDish.classList.add("dish-card");

  tippy(newDish, {
    content: dish.name,
    theme: "menue",
    delay: [600, 300],
  });

  let dishImg = document.createElement("div");
  dishImg.classList.add("dish-img");

  if (dish.image === "default.jpg")
    dishImg.style.backgroundImage = `url('assets/images/default.jpg')`;
  else
    dishImg.style.backgroundImage = `url('http://${config.server}:${config.port}/${dish.image}')`;

  let dishOverlay = document.createElement("div");
  dishOverlay.classList.add("dish-overlay");

  if (selected) newDish.classList.toggle("selected-dish");

  newDish.onclick = function () {
    newDish.classList.toggle("selected-dish");

    if (orderSelectedDishesStrings.includes(dish.name)) {
      orderSelectedDishesStrings.splice(
        orderSelectedDishesStrings.indexOf(dish.name),
        1
      );
      orderSelectedDishes.splice(orderSelectedDishes.indexOf(dish), 1);
    } else {
      orderSelectedDishesStrings.push(dish.name);
      orderSelectedDishes.push(dish);
    }
  };

  let dishName = document.createElement("h1");
  dishName.textContent = dish.name;

  let dishPrice = document.createElement("p");
  dishPrice.classList.add("dish-price");
  dishPrice.textContent = dish.price;

  let dishCurrency = document.createElement("span");
  dishCurrency.classList.add("currency");
  dishCurrency.textContent = config.currency;

  newDish.appendChild(dishImg);
  newDish.appendChild(dishOverlay);
  dishOverlay.appendChild(dishName);
  dishPrice.appendChild(dishCurrency);
  dishOverlay.appendChild(dishPrice);
  newDish.appendChild(dishOverlay);

  document.querySelector(".catalog-ctn").appendChild(newDish);
}

function renderCatalog(ft) {
  document.querySelector(".catalog-ctn").innerHTML = "";

  fetch(`http://${config.server}:${config.port}/dishes-av`)
    .then((res) => res.json())
    .then((response) => {
      response.forEach((dish) => {
        createCatalogHTML(dish, orderSelectedDishesStrings.includes(dish.name));
      });

      if (ft) ipcRenderer.send("ready");
    })
    .catch((err) => {
      if (ft) ipcRenderer.send("ready");

      swal("Problème de serveur", "Redémarrer et réessayer", "error", {
        buttons: false,
      });
    });
}

function createCategoriesHTML(category) {
  let newCategory = document.createElement("li");
  newCategory.textContent = category.title;

  if (category.title === "All") {
    newCategory.classList.add("selected-category");
  }

  newCategory.onclick = function () {
    document.querySelector(".catalog-ctn").innerHTML = "";
    if (category.title === "All") {
      document.querySelectorAll(".categories ul li").forEach((element) => {
        element.classList.remove("selected-category");
      });
      newCategory.classList.add("selected-category");
      renderCatalog();
    } else {
      document.querySelectorAll(".categories ul li").forEach((element) => {
        element.classList.remove("selected-category");
      });

      newCategory.classList.add("selected-category");

      fetch(
        `http://${config.server}:${config.port}/dishes-av/${category.title}`
      )
        .then((res) => res.json())
        .then((response) => {
          response.forEach((dish) => {
            createCatalogHTML(
              dish,
              orderSelectedDishesStrings.includes(dish.name)
            );
          });
        })
        .catch((err) => {
          swal("Problème de serveur", "Redémarrer et réessayer", "error", {
            buttons: false,
          });
        });
    }
  };

  document.querySelector(".categories ul").append(newCategory);
}

function renderCategories() {
  document.querySelector(".categories ul").innerHTML = "";

  fetch(`http://${config.server}:${config.port}/categories-all`)
    .then((res) => res.json())
    .then((response) => {
      response.forEach((category) => {
        createCategoriesHTML(category);
      });
    })
    .catch((err) => {
      swal("Problème de serveur", "Redémarrer et réessayer", "error", {
        buttons: false,
      });
    });
}

function createOrderDishesHTML(dish) {
  let nod = document.createElement("li");

  let nodImg = document.createElement("div");
  nodImg.classList.add("order-img");

  if (dish.image === "default.jpg")
    nodImg.style.backgroundImage = `url('assets/images/default.jpg')`;
  else
    nodImg.style.backgroundImage = `url('http://${config.server}:${config.port}/${dish.image}')`;

  let nodQntCtn = document.createElement("div");
  nodQntCtn.classList.add("qnt-btn-ctn");

  let nodQntUp = document.createElement("button");
  nodQntUp.innerHTML = '<i class="fas fa-caret-up"></i>';

  tippy(nodQntUp, {
    content: "Augmenter la quantité",
    theme: "menue",
    placement: "right",
    delay: [600, 300],
  });

  let nodQntDown = document.createElement("button");
  nodQntDown.innerHTML = '<i class="fas fa-caret-down"></i>';

  tippy(nodQntDown, {
    content: "Diminuer la quantité",
    placement: "right",
    theme: "menue",
    delay: [600, 300],
  });

  let nodName = document.createElement("p");
  nodName.textContent = dish.name;

  let nodQnt = document.createElement("span");
  nodQnt.classList.add("qnt");
  nodQnt.textContent = 1;

  let nodPrice = document.createElement("p");
  nodPrice.textContent = dish.price + " ";
  nodPrice.classList.add("price");

  dish.totalDishPrice = parseInt(nodPrice.textContent);

  let nodCurrency = document.createElement("span");
  nodCurrency.textContent = config.currency;

  nodQntUp.onclick = function () {
    nodQnt.textContent = parseInt(nodQnt.textContent) + 1;

    orderBody.dishes[orderBody.dishes.indexOf(dish)].quantity = parseInt(
      nodQnt.textContent
    );
    orderBody.dishes[orderBody.dishes.indexOf(dish)].totalDishPrice =
      parseInt(nodPrice.textContent) * parseInt(nodQnt.textContent);

    renderTotalPrice();

    tippy(nodName, {
      content: `Quantité: ${dish.quantity}`,
      theme: "menue",
      delay: [600, 300],
    });
  };

  nodQntDown.onclick = function () {
    if (nodQnt.textContent > 1) {
      nodQnt.textContent -= 1;

      orderBody.dishes[orderBody.dishes.indexOf(dish)].quantity = parseInt(
        nodQnt.textContent
      );
      orderBody.dishes[orderBody.dishes.indexOf(dish)].totalDishPrice =
        parseInt(nodPrice.textContent) * parseInt(nodQnt.textContent);

      renderTotalPrice();

      tippy(nodName, {
        content: `Quantité: ${dish.quantity}`,
        theme: "menue",
        delay: [600, 300],
      });
    } else if (nodQnt.textContent == 1) {
      swal("Oops!", "Vous ne pouvez pas avoir zéro en quantité", "info", {
        buttons: false,
      });
    }
  };

  orderBody.dishes[orderBody.dishes.indexOf(dish)].quantity = parseInt(
    nodQnt.textContent
  );

  renderTotalPrice();

  nod.append(nodImg);
  nodQntCtn.append(nodQntUp);
  nodQntCtn.append(nodQntDown);
  nod.append(nodQntCtn);
  nodName.append(nodQnt);
  nod.append(nodName);
  nodPrice.append(nodCurrency);
  nod.append(nodPrice);

  tippy(nodName, {
    content: `Quantité: ${dish.quantity}`,
    theme: "menue",
    delay: [600, 300],
  });

  document.querySelector(".confirm-order ul").append(nod);
}

function renderOrderDishes(dishes) {
  document.querySelector(".confirm-order ul").innerHTML = "";

  dishes.forEach((dish) => {
    createOrderDishesHTML(dish);
  });
}