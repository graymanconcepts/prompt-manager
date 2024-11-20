import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Force development mode since we're in development
process.env.NODE_ENV = 'development';
const isDev = process.env.NODE_ENV === 'development';

async function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false // Allow CORS in development
    }
  });

  // In development, load from the Vite dev server
  if (isDev) {
    try {
      await mainWindow.loadURL('http://localhost:5173');
      mainWindow.webContents.openDevTools({ mode: 'right' });
    } catch (error) {
      console.error('Failed to load URL:', error);
      app.quit();
    }
  } else {
    // In production, load the built files
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
