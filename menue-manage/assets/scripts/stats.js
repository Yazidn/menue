function renderStats() {
  fetch(`http://${config.server}:${config.port}/stats`)
    .then((res) => res.json())
    .then((response) => {
      document.querySelector(
        ".statistics .revenue"
      ).innerHTML = `${response.revenue} <span>${config.currency}</span>`;

      document.querySelector(".statistics .all-dishes").textContent =
        response.dishes;
      document.querySelector(".statistics .available-dishes").textContent =
        response.availableDishes;

      renderChart(
        "Meilleures ventes",
        "chart-1",
        response.categoriesTitles,
        response.categoriesCount,
        config.chart1
      );
      renderChart(
        "Rapport",
        "chart-2",
        ["Total", "Servi", "Annulé"],
        response.orders,
        config.chart2
      );
    })
    .catch((err) => {
      swal("Problème de serveur", "Redémarrer et réessayer", "error", {
        buttons: false,
      });
    });
}

function renderChart(title, canvas, labels, data, type) {
  let color = tinycolor(
    document.documentElement.style.getPropertyValue("--accent")
  );
  let colorList = [];

  labels.forEach((label, index) => {
    if (color.isLight())
      colorList.length === 0
        ? colorList.push(color.darken(index).toRgbString())
        : colorList.push(color.darken(index + 10).toRgbString());
    else
      colorList.length === 0
        ? colorList.push(color.brighten(index).toRgbString())
        : colorList.push(color.brighten(index + 10).toRgbString());
  });

  let ctx = document.getElementById(canvas).getContext("2d");

  let chart = new Chart(ctx, {
    type: type,
    data: {
      labels: labels,
      datasets: [
        {
          label: title,
          data: data,
          backgroundColor: colorList,
          borderColor: type !== "line" ? colorList : color.toRgbString(),
          borderWidth: 2,
          pointRadius: 5,
          pointBackgroundColor: colorList,
          fill: true,
          backgroundColor:
            type === "line" || type === "radar"
              ? color.setAlpha(0.3)
              : colorList,
        },
      ],
    },
    options: {
      layout: {
        padding: 10,
      },
      events: ["click"],
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
            },
          },
        ],
      },
    },
  });
}