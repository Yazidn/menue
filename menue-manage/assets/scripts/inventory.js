function createDish() {
  let addDishForm = document.querySelector("#add-dish-form");
  let formData = new FormData(addDishForm);

  if (!formData.get("name") || !formData.get("price")) {
    swal("Oops!", "Vous devez définir au moins un nom et un prix", "info", {
      buttons: false,
    });
  } else {
    fetch(`http://${config.server}:${config.port}/dishes`, {
      method: "POST",
      body: formData,
    })
      .then((res) => {
        if (!res.ok)
          swal(
            "Le plat existe déjà",
            "Essayez avec un nom différent",
            "error",
            {
              buttons: false,
            }
          );

        return res.json();
      })
      .then((response) => {
        updateDishesList(response);

        swal(`${formData.get("name")}`, "A été ajouté au menu", "success", {
          buttons: false,
        });
      })
      .catch((error) => {
        swal("Problème de serveur", "Redémarrer et réessayer", "error", {
          buttons: false,
        });
      });

    closeModal("add-dish-modal", "add-dish-dim");
  }
}

function deleteAllDishes() {
  swal({
    title: "Êtes-vous sûr?",
    text: "Cela supprimera tous vos plats",
    icon: "warning",
    buttons: true,
  }).then((willDelete) => {
    if (willDelete) {
      fetch(`http://${config.server}:${config.port}/dishes`, {
        method: "DELETE",
      })
        .then((res) => {
          renderDishesList();

          swal("Succès", "Tous les plats ont été supprimés", "success", {
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
}

function createCategory() {
  let addCategoryForm = document.querySelector("#add-category-form");

  if (!addCategoryForm.title.value) {
    swal("Oops!", "Choisissez un titre pour votre catégorie", "info", {
      buttons: false,
    });
  } else {
    fetch(`http://${config.server}:${config.port}/categories`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: addCategoryForm.title.value,
      }),
    })
      .then((res) => res.json())
      .then((response) => {
        updateCategoriesList(response);
      })
      .catch((error) => {
        swal("Problème de serveur", "Redémarrer et réessayer", "error", {
          buttons: false,
        });
      });

    closeModal("add-category-modal", "add-category-dim");
  }
}

function deleteAllCategories() {
  swal({
    title: "Êtes-vous sûr?",
    text:
      "Cela supprimera toutes vos catégories. Les plats de ces catégories seront déplacés dans Other",
    icon: "warning",
    buttons: true,
  }).then((willDelete) => {
    if (willDelete) {
      fetch(`http://${config.server}:${config.port}/categories`, {
        method: "DELETE",
      })
        .then((res) => {
          renderCategoriesList();

          swal(
            "Succès",
            "Toutes les catégories ont été supprimées",
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
    }
  });
}

function editCategory() {
  let editCategoryForm = document.querySelector("#edit-category-form");

  if (editCategoryForm.title.value != "") {
    fetch(`http://${config.server}:${config.port}/categories`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        oldTitle: editCategoryForm.oldTitle.value,
        title: editCategoryForm.title.value,
      }),
    })
      .then((res) => res.json())
      .then((response) => {
        updateCategoriesList(response);
        renderDishesList();

        swal("Succès", "La catégorie a été renommée", "success", {
          buttons: false,
        });
      })
      .catch((error) => {
        swal("Problème de serveur", "Redémarrer et réessayer", "error", {
          buttons: false,
        });
      });

    closeModal("edit-category-modal", "edit-category-dim");
  } else {
    swal("Oops!", "La catégorie a besoin d'un titre", "info", {
      buttons: false,
    });
  }
}

function displaySearchInventory() {
  let input = document.querySelector(".dishes input");

  if (input.style.display == "none") {
    input.style.display = "block";
    input.focus();
  } else {
    input.value = "";
    input.style.display = "none";
    renderDishesList();
  }
}

function searchInventory() {
  let input = document.querySelector(".dishes input");
  document.querySelector(".dishes ul").innerHTML = "";

  fetch(`http://${config.server}:${config.port}/dishes`)
    .then((res) => res.json())
    .then((response) => {
      response.forEach((dish) => {
        if (dish.name.toLowerCase().indexOf(input.value.toLowerCase()) !== -1) {
          createDishesHTML(dish);
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
  document.querySelector(".dishes ul").innerHTML = "";

  fetch(`http://${config.server}:${config.port}/dishes-sort/${parameter}`)
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

function chooseImage() {
  document.querySelector("#real-input").click();

  document.querySelector("#real-input").onchange = function (e) {
    const name = e.target.value.split(/\\|\//).pop();
    const truncated = name.length > 20 ? name.substr(name.length - 20) : name;

    document.querySelector(".file-info").textContent = truncated;
  };
}