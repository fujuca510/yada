import { ipcMain, app, BrowserWindow } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
ipcMain.handle("get-daily-questions", async (_event, dateStr) => {
  const fileName = `questions-${dateStr}.json`;
  const localDir = app.getPath("userData");
  const localPath = path.join(localDir, fileName);
  if (fs.existsSync(localPath)) {
    try {
      const data = await fsPromises.readFile(localPath, "utf-8");
      console.log(`Loading daily questions from local storage: ${localPath}`);
      return JSON.parse(data);
    } catch (error) {
      console.error("Error reading local file:", error);
    }
  }
  const url = `https://raw.githubusercontent.com/fujuca510/yada/main/src/assets/${fileName}`;
  console.log(`Downloading daily questions from: ${url}`);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const dataText = await response.text();
    const parsed = JSON.parse(dataText);
    await fsPromises.writeFile(localPath, dataText, "utf-8");
    console.log(`Saved daily questions to local storage: ${localPath}`);
    return parsed;
  } catch (error) {
    console.error(`Failed to download daily questions from ${url}:`, error);
    return null;
  }
});
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs")
    }
  });
  win.maximize();
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(createWindow);
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
