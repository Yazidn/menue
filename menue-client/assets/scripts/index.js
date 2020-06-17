function renderOrderCount() {
  fetch(`http://${config.server}:${config.port}/orders-count`)
    .then(res => res.json())
    .then(response => {
      document.querySelector(".order-count").textContent = response;
    })
    .catch(err => {
      swal("Problème de serveur", "Redémarrer et réessayer", "error", {
        buttons: false
      });
    });
}

function updateView(ft) {
  renderCatalog(ft);
  renderCategories();
  renderOrderCount();
}