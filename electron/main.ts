import { app, BrowserWindow, ipcMain } from 'electron'

import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import fsPromises from 'node:fs/promises'


const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

ipcMain.handle('get-daily-questions', async (_event, dateStr: string) => {
  const fileName = `questions-${dateStr}.json`
  const localDir = app.getPath('userData')
  const localPath = path.join(localDir, fileName)

  // 1. Check if the file exists locally
  if (fs.existsSync(localPath)) {
    try {
      const data = await fsPromises.readFile(localPath, 'utf-8')
      console.log(`Loading daily questions from local storage: ${localPath}`)
      return JSON.parse(data)
    } catch (error) {
      console.error('Error reading local file:', error)
    }
  }

  // 2. If it does not exist, download it
  const url = `https://raw.githubusercontent.com/fujuca510/yada/main/src/assets/${fileName}`
  console.log(`Downloading daily questions from: ${url}`)
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const dataText = await response.text()
    
    // Validate JSON
    const parsed = JSON.parse(dataText)
    
    // Save locally
    await fsPromises.writeFile(localPath, dataText, 'utf-8')
    console.log(`Saved daily questions to local storage: ${localPath}`)
    
    return parsed
  } catch (error) {
    console.error(`Failed to download daily questions from ${url}:`, error)
    return null
  }
})

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })
  win.maximize()

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)
