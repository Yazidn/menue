const { webFrame } = require("electron");
const tinycolor = require("tinycolor2");
const tippy = require("tippy.js");

const Datastore = require("nedb");
let settingsDB = new Datastore({
  filename: "./config/settings",
  autoload: true,
});

let settingsForm = document.querySelector("#settings-form");
let root = document.documentElement;

const config = {};

loadSettings(true);

function setConfig(ft, currentSettings) {
  config.server = currentSettings[0].server;
  config.port = currentSettings[0].port;
  config.theme = currentSettings[0].theme;
  config.color = currentSettings[0].color;
  config.currency = currentSettings[0].currency;
  config.roundness = currentSettings[0].roundness;
  config.shop = currentSettings[0].shop;
  config.chart1 = currentSettings[0].chart1;
  config.chart2 = currentSettings[0].chart2;
  config.spacing = currentSettings[0].spacing;
  config.zoom = currentSettings[0].zoom;
  config.animations = currentSettings[0].animations;

  if (ft) {
    socket = io(`http://localhost:${config.port}`);
    socket.on("order", renderView);

    tippy("button", {
      theme: "menue",
      delay: [600, 300],
    });

    tippy("svg", {
      theme: "menue",
      placement: "right",
      delay: [600, 300],
    });
  }

  let accent = `${tinycolor(config.color).toRgb().r}, ${
    tinycolor(config.color).toRgb().g
  }, ${tinycolor(config.color).toRgb().b}`;

  root.style.setProperty("--accent", config.color);
  root.style.setProperty("--accent-alt", accent);
  root.style.setProperty("--roundness", config.roundness);
  root.style.setProperty("--spacing", config.spacing);
  root.style.setProperty("--animations", config.animations);

  if (tinycolor(config.color).isLight())
    root.style.setProperty("--btn-text", "#000");
  else root.style.setProperty("--btn-text", "#fff");

  if (config.theme === "light") root.classList.remove("dark-theme");
  else root.classList.add("dark-theme");

  webFrame.setZoomFactor(parseFloat(config.zoom));

  if (ft) renderView(true);
  else renderView(false);
}

function loadSettings(ft) {
  settingsDB.find({ profile: "current" }, (err, currentSettings) => {
    if (err) console.log(err);
    else {
      if (currentSettings.length === 0) insertDefaultEntries(ft);
      else setConfig(ft, currentSettings);
    }
  });
}

function insertDefaultEntries(ft) {
  settingsDB.insert(
    [
      {
        profile: "default",
        server: "127.0.0.1",
        port: 3000,
        theme: "light",
        color: "#134ac9",
        currency: "DA",
        roundness: "10px",
        shop: "Menue",
        chart1: "bar",
        chart2: "line",
        spacing: "10px",
        zoom: 0.8,
        animations: "0.5s",
      },
      {
        profile: "current",
        server: "127.0.0.1",
        port: 3000,
        theme: "light",
        color: "#134ac9",
        currency: "DA",
        roundness: "10px",
        shop: "Menue",
        chart1: "bar",
        chart2: "line",
        spacing: "10px",
        zoom: 0.8,
        animations: "0.5s",
      },
    ],
    (err, currentSettings) => {
      setConfig(ft, currentSettings);
    }
  );
}

function revertToDefaults() {
  swal({
    title: "Êtes-vous sûr?",
    text: "Cela réinitialisera tous vos paramètres",
    icon: "warning",
    buttons: true,
  }).then((willReset) => {
    if (willReset) {
      settingsDB.find({ profile: "default" }, (err, defaultSettings) => {
        settingsDB.update(
          { profile: "current" },
          {
            profile: "current",
            server: "127.0.0.1",
            port: 3000,
            theme: "light",
            color: "#134ac9",
            currency: "DA",
            roundness: "10px",
            shop: "Menue",
            chart1: "bar",
            chart2: "line",
            spacing: "10px",
            zoom: 0.8,
            animations: "0.5s",
          },
          (err, doc) => {
            if (err) console.log(err);
            else {
              setFormContent(defaultSettings);

              loadSettings(false);
              home();
            }
          }
        );
      });
    }
  });
}

function applySettings() {
  settingsDB.update(
    { profile: "current" },
    {
      profile: "current",
      server: settingsForm.server.value,
      port: settingsForm.port.value,
      theme: settingsForm.theme.value,
      color: settingsForm.color.value,
      currency: settingsForm.currency.value,
      roundness: String(settingsForm.roundness.value) + "px",
      shop: settingsForm.shop.value,
      chart1: settingsForm.chart1.value,
      chart2: settingsForm.chart2.value,
      spacing: String(settingsForm.spacing.value) + "px",
      zoom: settingsForm.zoom.value,
      animations: settingsForm.animations.value + "s",
    },
    {},
    (err, doc) => {
      if (err) console.log(err);

      loadSettings(false);
      home();
    }
  );
}

function renderValuesFromCurrent() {
  settingsDB.find({ profile: "current" }, (err, currentSettings) => {
    if (err) console.log(err);
    else {
      setFormContent(currentSettings);
    }
  });
}

function setFormContent(settings) {
  settingsForm.server.value = settings[0].server;
  settingsForm.port.value = settings[0].port;
  settingsForm.theme.value = settings[0].theme;
  settingsForm.color.value = settings[0].color;
  settingsForm.currency.value = settings[0].currency;
  settingsForm.roundness.value = settings[0].roundness.slice(0, -2);
  settingsForm.shop.value = settings[0].shop;
  settingsForm.chart1.value = settings[0].chart1;
  settingsForm.chart2.value = settings[0].chart2;
  settingsForm.spacing.value = settings[0].spacing.slice(0, -2);
  settingsForm.zoom.value = settings[0].zoom;
  settingsForm.animations.value = settings[0].animations.slice(0, -1);
}

function updateDefaultEntry() {
  settingsDB.update(
    { profile: "default" },
    {
      profile: "default",
      server: "127.0.0.1",
      port: 3000,
      theme: "light",
      color: "#134ac9",
      currency: "DA",
      roundness: "10px",
      shop: "Menue",
      chart1: "bar",
      chart2: "line",
      spacing: "10px",
      zoom: 0.8,
      animations: "0.5s",
    }
  );
}

function resetIds() {
  fetch(`http://${config.server}:${config.port}/orders`)
    .then((res) => res.json())
    .then((response) => {
      if (response.orders.length === 0) {
        swal({
          title: "Êtes-vous sûr?",
          text:
            "Cela réinitialisera les identifiants et comptera à partir de zéro",
          icon: "warning",
          buttons: true,
        }).then((willReset) => {
          if (willReset) {
            fetch(`http://${config.server}:${config.port}/identifiers`, {
              method: "DELETE",
            })
              .then((res) => {
                swal(
                  "Les identifiants ont été réinitialisés",
                  "Nous compterons à partir de zéro à nouveau",
                  "success",
                  {
                    buttons: false,
                  }
                );
              })
              .catch((err) => console.log(err));
          }
        });
      } else {
        swal(
          "Il y a des commandes actives",
          "Vous ne pouvez réinitialiser les identifiants que lorsqu'il n'y a pas de commandes actives ou en attente",
          "info",
          {
            buttons: false,
          }
        );
      }
    })
    .catch((err) => {
      swal("Problème de serveur", "Redémarrer et réessayer", "error", {
        buttons: false,
      });
    });
}

function deleteAllOrders() {
  swal({
    title: "Êtes-vous sûr?",
    text:
      "Cela réinitialisera vos statistiques et supprimera toutes les commandes de la base de données",
    icon: "warning",
    buttons: true,
  }).then((willDelete) => {
    if (willDelete) {
      fetch(`http://${config.server}:${config.port}/orders`, {
        method: "DELETE",
      })
        .then((res) => {
          renderView(false);
          swal(
            "Succès",
            "Les statistiques et les commandes ont été réinitialisées",
            "success",
            {
              buttons: false,
            }
          );
        })
        .catch((err) => console.log(err));
    }
  });
}