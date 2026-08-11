import { app, BrowserWindow, ipcMain, Options } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { PythonShell } from 'python-shell';
import { fileURLToPath } from 'url';
import { DatabaseSync } from 'node:sqlite'; 
import User from './Types/User';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

 

const appRoot = app.getAppPath();

// 2. Point to your user data folder for SQLite data persistence
const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'SAPL_NextRead_database.db');

// Initialize the built-in database 
const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    FOREIGN KEY (useState_id) REFERENCES useState(id) ,
    username TEXT NOT NULL,
    salt TEXT,
    password TEXT, 
    profilePicture TEXT,
  );

  CREATE TABLE IF NOT EXISTS useStates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  whiteList TEXT NOT NULL DEFAULT '',
  blackList TEXT NOT NULL DEFAULT '',
  ageRange TEXT NOT NULL DEFAULT '',
  bipocFilter BOOLEAN NOT NULL DEFAULT 0 CHECK (is_active IN (0, 1)),
  lgbtqFilter BOOLEAN NOT NULL DEFAULT 0 CHECK (is_active IN (0, 1)),
  );

  CREATE TABLE IF NOT EXISTS bookLists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  books TEXT NOT NULL DEFAULT '',
  FOREIGN KEY (user_id) REFERENCES user(id),
  );
`);

ipcMain.handle('make-user', async (event, username: string) => {
    try {
        const createUseState = db.prepare(`INSERT INTO useStates DEFAULT VALUES`);
        const useState = createUseState.run();
        const useStateId = useState.lastInsertRowid;
        
        const createUser = db.prepare(`INSERT INTO users (useState_id, username) VALUES (?, ?)`);
        const user: User = { userName: username, useState};
        return user;
    } catch (error) {
        console.error("Database query failed:", error);
        throw error;
    }
});


const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 990,
    height: 700,
    minWidth: 990,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

ipcMain.handle('run-web-scraper', async (event, text) => {
    let options: Options = {
        mode: 'text',
        args: [text] // Your string is passed as a command line argument
    };

    return new Promise((resolve, reject) => {
        PythonShell.run('Web_Scraper/web_scaper.py', options).then(messages => {
            resolve(messages); // Returns array of printed outputs from Python
        }).catch(err => {
            reject(err);
        });
    });
});

ipcMain.handle('run-age-finder', async (event, text) => {
    let options: Options = {
        mode: 'text',
        args: [text] // Your string is passed as a command line argument
    };

    return new Promise((resolve, reject) => {
        PythonShell.run('Web_Scraper/age_finder.py', options).then(messages => {
            resolve(messages); // Returns array of printed outputs from Python
        }).catch(err => {
            reject(err);
        });
    });
});


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.


