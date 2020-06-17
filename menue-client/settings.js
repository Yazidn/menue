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
  config.zoom = currentSettings[0].zoom;
  config.animations = currentSettings[0].animations;

  if (ft) {
    socket = io(`http://localhost:${config.port}`);
    socket.on("served", renderOrderCount);
    socket.on("catalog", renderCatalog);
    socket.on("categories", renderCategories);

    tippy("button", {
      theme: "menue",
      delay: [600, 300],
    });

    tippy(".order-count", {
      theme: "menue",
    });
  }

  root.style.setProperty("--accent", config.color);
  root.style.setProperty("--roundness", config.roundness);
  root.style.setProperty("--animations", config.animations);

  if (tinycolor(config.color).isLight())
    root.style.setProperty("--btn-text", "#000");
  else root.style.setProperty("--btn-text", "#fff");

  if (config.theme === "light") root.classList.remove("dark-theme");
  else root.classList.add("dark-theme");

  webFrame.setZoomFactor(parseFloat(config.zoom));

  if (ft) updateView(true);
  else updateView(false);
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
            color: "#FF286C",
            currency: "DA",
            roundness: "10px",
            zoom: 0.8,
            animations: "0.5s",
          },
          (err, doc) => {
            if (err) console.log(err);
            else {
              setFormContent(defaultSettings);

              loadSettings(false);
              order();
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
      zoom: settingsForm.zoom.value,
      animations: settingsForm.animations.value + "s",
    },
    {},
    (err, doc) => {
      if (err) console.log(err);

      loadSettings(false);
      order();
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
      color: "#FF286C",
      currency: "DA",
      roundness: "10px",
      zoom: 0.8,
      animations: "0.5s",
    }
  );
}

function insertDefaultEntries(ft) {
  settingsDB.insert(
    [
      {
        profile: "default",
        server: "127.0.0.1",
        port: 3000,
        theme: "light",
        color: "#FF286C",
        currency: "DA",
        roundness: "10px",
        zoom: 0.8,
        animations: "0.5s",
      },
      {
        profile: "current",
        server: "127.0.0.1",
        port: 3000,
        theme: "light",
        color: "#FF286C",
        currency: "DA",
        roundness: "10px",
        zoom: 0.8,
        animations: "0.5s",
      },
    ],
    (err, currentSettings) => {
      setConfig(ft, currentSettings);
    }
  );
}