"use strict";
const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
if (require("electron-squirrel-startup")) {
  app.quit();
}
let mainWindow;
let serverProcess;
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  serverProcess = spawn("npm", ["run", "server"], {
    stdio: "inherit",
    shell: true
  });
  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
};
app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
  if (serverProcess) {
    serverProcess.kill();
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.on("before-quit", () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});
