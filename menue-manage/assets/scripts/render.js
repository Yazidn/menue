function createDishesHTML(dish) {
  let newDish = document.createElement("li");

  let newDishImg = document.createElement("div");
  newDishImg.classList.add("dish-img");

  if (dish.image === "default.jpg")
    newDishImg.style.backgroundImage = `url('assets/images/default.jpg')`;
  else
    newDishImg.style.backgroundImage = `url('http://${config.server}:${config.port}/${dish.image}')`;

  let newDishNameCategoryContainer = document.createElement("div");

  let newDishName = document.createElement("p");
  newDishName.textContent = dish.name;

  let newDishCategory = document.createElement("p");
  newDishCategory.textContent = dish.category;
  newDishCategory.classList.add("dish-category");

  let newDishPrice = document.createElement("p");
  newDishPrice.classList.add("dish-price");
  newDishPrice.textContent = dish.price + " ";

  let newDishCurrency = document.createElement("span");
  newDishCurrency.textContent = config.currency;
  newDishCurrency.classList.add("currency");

  let newDishRemoveBtn = document.createElement("button");
  newDishRemoveBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';

  tippy(newDishRemoveBtn, {
    content: "Supprimer le plat",
    placement: "bottom",
    theme: "menue",
    delay: [600, 300],
  });

  let newDishAvailableToggleBtn = document.createElement("button");

  tippy(newDishAvailableToggleBtn, {
    content: "Basculer Disponible / Non disponible",
    placement: "bottom",
    theme: "menue",
    delay: [600, 300],
  });

  if (dish.available)
    newDishAvailableToggleBtn.innerHTML = '<i class="fas fa-star"></i>';
  else newDishAvailableToggleBtn.innerHTML = '<i class="far fa-star"></i>';

  newDishRemoveBtn.onclick = function () {
    swal({
      title: "Êtes-vous sûr?",
      text: `Cela supprimera ${dish.name}`,
      icon: "warning",
      buttons: true,
    }).then((willDelete) => {
      if (willDelete) {
        fetch(
          `http://${config.server}:${config.port}/dishes/${dish.name}/${dish.image}`,
          {
            method: "DELETE",
          }
        )
          .then((res) => res.json())
          .then((response) => {
            updateDishesList(response);

            swal(`${dish.name}`, "A été supprimé", "success", {
              buttons: false,
            });
          })
          .catch((err) => {
            swal("Problème de serveur", "Redémarrer et réessayer", "error", {
              buttons: false,
            });
          });
      }
    });
  };

  newDishAvailableToggleBtn.onclick = function () {
    fetch(`http://${config.server}:${config.port}/dishes-av`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: dish.name,
        available: dish.available,
      }),
    })
      .then((res) => res.json())
      .then((response) => {
        updateDishesList(response);

        swal(
          dish.name,
          `${
            dish.available
              ? "Est maintenant indisponible"
              : "Est maintenant disponible"
          }`,
          "success",
          {
            buttons: false,
          }
        );
      })
      .catch((err) => {
        swal("Problème de serveur", "Redémarrer et réessayer", "error", {
          buttons: false,
        });
      });
  };

  newDishNameCategoryContainer.append(newDishName);
  newDishNameCategoryContainer.append(newDishCategory);
  newDishPrice.append(newDishCurrency);
  newDish.append(newDishImg);
  newDish.append(newDishNameCategoryContainer);
  newDish.append(newDishPrice);
  newDish.append(newDishAvailableToggleBtn);
  newDish.append(newDishRemoveBtn);

  document.querySelector(".dishes ul").append(newDish);
}

function renderDishesList() {
  document.querySelector(".dishes ul").innerHTML = "";

  fetch(`http://${config.server}:${config.port}/dishes`)
    .then((res) => res.json())
    .then((response) => {
      response.forEach((dish) => {
        createDishesHTML(dish);
      });
    })
    .catch((err) => {
      swal("Problème de serveur", "Redémarrer et réessayer", "error", {
        buttons: false,
      });
    });
}

function updateDishesList(response) {
  document.querySelector(".dishes ul").innerHTML = "";

  response.forEach((dish) => {
    createDishesHTML(dish);
  });
}

function createCategoriesHTML(category) {
  let newCategory = document.createElement("li");

  let newCategoryName = document.createElement("p");
  newCategoryName.textContent = category.title;

  let newCategoryRemoveBtn = document.createElement("button");
  newCategoryRemoveBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';

  tippy(newCategoryRemoveBtn, {
    content: "Supprimer la catégorie",
    placement: "bottom",
    theme: "menue",
    delay: [600, 300],
  });

  let newCategoryEditBtn = document.createElement("button");
  newCategoryEditBtn.innerHTML = '<i class="fas fa-edit"></i>';

  tippy(newCategoryEditBtn, {
    content: "Modifier la catégorie",
    placement: "bottom",
    theme: "menue",
    delay: [600, 300],
  });

  newCategoryRemoveBtn.onclick = function () {
    swal({
      title: "Êtes-vous sûr?",
      text: `Cela supprimera ${category.title}`,
      icon: "warning",
      buttons: true,
    }).then((willDelete) => {
      if (willDelete) {
        fetch(
          `http://${config.server}:${config.port}/categories/${category.title}`,
          {
            method: "DELETE",
          }
        )
          .then((res) => {
            renderCategoriesList();

            swal("Succès", `${category.title} a été supprimé`, "success", {
              buttons: false,
            });
          })
          .catch((err) => {
            swal("Problème de serveur", "Redémarrer et réessayer", "error", {
              buttons: false,
            });
          });
      }
    });
  };

  newCategoryEditBtn.onclick = function () {
    document.querySelector("#edit-category-form").oldTitle.value =
      category.title;
    renderCategoryDishesList(category.title);
    openEditCategoryModal();
  };

  newCategory.append(newCategoryName);
  newCategory.append(newCategoryEditBtn);
  newCategory.append(newCategoryRemoveBtn);

  document.querySelector(".categories ul").append(newCategory);
}

function renderCategoriesList() {
  document.querySelector(".categories ul").innerHTML = "";

  fetch(`http://${config.server}:${config.port}/categories`)
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

function updateCategoriesList(response) {
  document.querySelector(".categories ul").innerHTML = "";

  response.forEach((category) => {
    createCategoriesHTML(category);
  });
}

function createCategoriesOptionsHTML(category) {
  let newOption = document.createElement("option");
  newOption.value = category.title;
  newOption.textContent = category.title;

  document.querySelector("#add-dish-form select").append(newOption);
}

function renderCategoriesOptions() {
  document.querySelector("#add-dish-form select").innerHTML =
    '<option value="Other" selected>Other</option>';

  fetch(`http://${config.server}:${config.port}/categories`)
    .then((res) => res.json())
    .then((response) => {
      response.forEach((category) => {
        createCategoriesOptionsHTML(category);
      });
    })
    .catch((err) => {
      swal("Problème de serveur", "Redémarrer et réessayer", "error", {
        buttons: false,
      });
    });
}

function createCategoryDishesHTML(dish, category) {
  let newDish = document.createElement("li");

  let newDishImg = document.createElement("div");
  newDishImg.classList.add("dish-img");

  if (dish.image === "default.jpg")
    newDishImg.style.backgroundImage = `url('assets/images/default.jpg')`;
  else
    newDishImg.style.backgroundImage = `url('http://${config.server}:${config.port}/${dish.image}')`;

  let newDishName = document.createElement("p");
  newDishName.textContent = dish.name;

  let newDishRemoveBtn = document.createElement("button");
  newDishRemoveBtn.type = "button";
  newDishRemoveBtn.innerHTML = '<i class="fas fa-times"></i>';

  tippy(newDishRemoveBtn, {
    content: "Supprimer le plat de la catégorie",
    placement: "bottom",
    theme: "menue",
    delay: [600, 300],
  });

  newDishRemoveBtn.onclick = function () {
    swal({
      title: "Êtes-vous sûr?",
      text: `Cela va déplacer ${dish.name} de ${dish.category} à Other`,
      icon: "warning",
      buttons: true,
    }).then((willDelete) => {
      if (willDelete) {
        fetch(`http://${config.server}:${config.port}/dishes`, {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            category: category.title,
            dish: dish.name,
          }),
        })
          .then((res) => renderCategoryDishesList(category))
          .catch((error) => {
            swal("Problème de serveur", "Redémarrer et réessayer", "error", {
              buttons: false,
            });
          });
      }
    });
  };

  newDish.append(newDishImg);
  newDish.append(newDishName);
  newDish.append(newDishRemoveBtn);

  document.querySelector(".edit-catg-ul-ctn ul").append(newDish);
}

function renderCategoryDishesList(category) {
  document.querySelector(".edit-catg-ul-ctn ul").innerHTML = "";

  fetch(`http://${config.server}:${config.port}/dishes/${category}`)
    .then((res) => res.json())
    .then((response) => {
      response.forEach((dish) => {
        createCategoryDishesHTML(dish, category);
      });
    })
    .catch((err) => {
      swal("Problème de serveur", "Redémarrer et réessayer", "error", {
        buttons: false,
      });
    });
}

function createCurrentOrderDishesHTML(dish) {
  let nd = document.createElement("li");

  let ndImg = document.createElement("div");
  ndImg.classList.add("dish-img");

  if (dish.image === "default.jpg")
    ndImg.style.backgroundImage = `url('assets/images/default.jpg')`;
  else
    ndImg.style.backgroundImage = `url('http://${config.server}:${config.port}/${dish.image}')`;

  let ndName = document.createElement("p");
  ndName.textContent = dish.name;

  tippy(ndName, {
    content: `Quantité: ${dish.quantity}`,
    placement: "bottom",
    theme: "menue",
    delay: [600, 300],
  });

  let ndQnt = document.createElement("span");
  ndQnt.textContent = dish.quantity;
  ndQnt.classList.add("qnt");

  let ndPrice = document.createElement("p");
  ndPrice.textContent = dish.price + " ";
  ndPrice.classList.add("dish-price");

  let ndCurrency = document.createElement("span");
  ndCurrency.textContent = config.currency;

  nd.append(ndImg);
  ndName.append(ndQnt);
  nd.append(ndName);
  ndPrice.append(ndCurrency);
  nd.append(ndPrice);

  document.querySelector(".current-order ul").append(nd);
}

function createAwaitingOrdersHTML(order) {
  let no = document.createElement("li");

  let noNumberSign = document.createElement("p");
  noNumberSign.textContent = "n° ";

  let noNumber = document.createElement("span");
  noNumber.textContent = order.number;

  let noCancelBtn = document.createElement("button");
  noCancelBtn.innerHTML = '<i class="fas fa-times"></i>';

  tippy(noCancelBtn, {
    content: `Annuler`,
    theme: "menue",
    delay: [600, 300],
  });

  let noDetailsBtn = document.createElement("button");
  noDetailsBtn.innerHTML = '<i class="fas fa-stream"></i>';

  tippy(noDetailsBtn, {
    content: `Détails`,
    theme: "menue",
    delay: [600, 300],
  });

  noCancelBtn.onclick = function () {
    swal({
      title: "Êtes-vous sûr?",
      text: `Ceci annulera la commande n° ${order.number}`,
      icon: "warning",
      buttons: true,
    }).then((willCancel) => {
      if (willCancel) {
        updateOrder("cancelled", order.number);
      }
    });
  };

  noDetailsBtn.onclick = function () {
    document.querySelector(".awaiting-dim").style.display = "block";

    document.querySelector(".ao-details-dishes").innerHTML = "";
    document.querySelector(
      ".ao-details-modal h1"
    ).textContent = `Commande n° ${order.number}`;
    document.querySelector(".ao-details-modal").style.display = "grid";

    fetch(`http://${config.server}:${config.port}/orders/${order.number}`)
      .then((res) => res.json())
      .then((response) => {
        response.forEach((dish) => {
          createAwaitingOrderDetailsDishes(dish);
        });
      })
      .catch((err) => {
        swal("Problème de serveur", "Redémarrer et réessayer", "error", {
          buttons: false,
        });
      });
  };

  noNumberSign.append(noNumber);
  no.append(noNumberSign);
  no.append(noDetailsBtn);
  no.append(noCancelBtn);

  document.querySelector(".awaiting ul").append(no);
}

function createCurrentOrderHTML(order) {
  let h1 = document.createElement("h1");
  h1.textContent = "Commande n° ";

  let orderNumber = document.createElement("span");
  orderNumber.textContent = order.number;
  orderNumber.classList.add("order-number");
  h1.append(orderNumber);

  let ul = document.createElement("ul");

  let note = document.createElement("p");

  if (order.note) {
    note.textContent = order.note;
  } else {
    note.textContent = "Le client n'a pas laissé de note.";
  }

  note.classList.add("client-note");

  let totalPrice = document.createElement("h1");
  totalPrice.textContent = "Total: ";

  let price = document.createElement("span");
  price.textContent = order.total + " ";
  price.classList.add("total-price");

  let currency = document.createElement("span");
  currency.textContent = config.currency;

  totalPrice.append(price);
  totalPrice.append(currency);

  document.querySelector(".current-order-ctn").append(h1);
  document.querySelector(".current-order").append(ul);
  document.querySelector(".note-ctn").append(note);
  document.querySelector(".total-price-ctn").append(totalPrice);
}

function renderOrderDetails(order) {
  createCurrentOrderHTML(order);
}

function renderAwaitingCount(count) {
  if (count === 0)
    document.querySelector(".awaiting-ctn h1").style.display = "none";
  else {
    document.querySelector(".awaiting-ctn h1").style.display = "initial";
    document.querySelector(".awaiting-ctn h1 span").textContent = count;
  }
}

function createAwaitingOrderDetailsDishes(dish) {
  let aodd = document.createElement("li");

  let aoddImg = document.createElement("div");
  aoddImg.classList.add("dish-img");

  if (dish.image === "default.jpg")
    aoddImg.style.backgroundImage = `url('assets/images/default.jpg')`;
  else
    aoddImg.style.backgroundImage = `url('http://${config.server}:${config.port}/${dish.image}')`;

  let aoddName = document.createElement("p");
  aoddName.textContent = dish.name;

  aodd.append(aoddImg);
  aodd.append(aoddName);

  document.querySelector(".ao-details-dishes").append(aodd);
}