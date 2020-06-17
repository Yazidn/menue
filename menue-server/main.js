const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

let win;

function createWindow() {
  splash = new BrowserWindow({
    width: 400,
    height: 250,
    frame: false,
    backgroundColor: "#1d1d1d",
    icon: path.join(__dirname, "assets/icons/png/64x64.png"),
    alwaysOnTop: true,
  });
  splash.loadFile("splash.html");

  win = new BrowserWindow({
    width: 1100,
    minWidth: 1100,
    height: 660,
    minHeight: 660,
    icon: path.join(__dirname, "assets/icons/png/64x64.png"),
    show: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.loadFile("index.html");
  win.setMenu(null);

  ipcMain.on("ready", () => {
    splash.destroy();
    win.show();
  });

  win.on("closed", () => {
    win = null;
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (win === null) {
    createWindow();
  }
});