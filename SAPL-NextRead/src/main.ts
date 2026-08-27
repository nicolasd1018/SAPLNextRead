import { app, BrowserWindow, ipcMain, Options } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { PythonShell } from 'python-shell';
import { fileURLToPath } from 'url';
import { DatabaseSync, StatementResultingChanges } from 'node:sqlite'; 
import User from './Types/User';
import bcrypt from "bcryptjs";
import UseState from './Types/UseState';
import BookList from './Types/bookList';
import { json } from 'node:stream/consumers';
import { number } from 'mathjs';



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
  CREATE TABLE IF NOT EXISTS useStates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  whiteList TEXT NOT NULL DEFAULT '[]',
  blackList TEXT NOT NULL DEFAULT '[]',
  ageRange TEXT NOT NULL DEFAULT '[]',
  bipocFilter BOOLEAN NOT NULL DEFAULT 0,
  lgbtqFilter BOOLEAN NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    useState_id INTEGER,
    username TEXT NOT NULL,
    password TEXT, 
    profilePicture TEXT,
    FOREIGN KEY (useState_id) REFERENCES useStates(id) 
  );  

  CREATE TABLE IF NOT EXISTS bookLists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  books TEXT NOT NULL DEFAULT '[]',
  FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

ipcMain.handle('make-user', async (event, username: string, password?: string) => {
    try {
        const createUseState = db.prepare(`INSERT INTO useStates DEFAULT VALUES`);
        const useState = createUseState.run();
        const useStateId = useState.lastInsertRowid;
        let user: StatementResultingChanges;
        if (password) {
          const createUser = db.prepare(`INSERT INTO users (useState_id, username, password) VALUES (?, ?, ?)`);
          const manualSalt = bcrypt.genSaltSync(10);
          const manualHash = bcrypt.hashSync(password, manualSalt);
          user = createUser.run(useStateId, username, manualHash );
        }
        else {
          const createUser = db.prepare(`INSERT INTO users (useState_id, username) VALUES (?, ?)`);
          user = createUser.run(useStateId, username);
        }
        const userId = user.lastInsertRowid;
        const createBookList = db.prepare('INSERT INTO bookLists (user_id, name) VALUES (?,?)');
        createBookList.run(userId, 'Liked Books');
        createBookList.run(userId, 'Disliked Books');
    } catch (error) {
        console.error("Database query make-user failed:", error);
        throw error;
    }
});

ipcMain.handle('get-users', async (event) => {
    try {
        const getUsers = db.prepare(`SELECT * FROM users`);
        const users = getUsers.all();
         return users.map((preUser)=> {
          const getUseState = db.prepare(`SELECT * FROM useStates WHERE id = ?`);
          const useState = getUseState.get(preUser.useState_id);
          const getBookLists = db.prepare(`SELECT * FROM bookLists WHERE user_id= ?`);
          const bookLists = getBookLists.all(preUser.id);
          const newUser: User = {id: preUser.id as number, useState: {whiteList: JSON.parse(useState!.whiteList as string), blackList: JSON.parse(useState!.blackList as string), ageRange: JSON.parse(useState!.ageRange as string), bipocFilter: !!useState!.bipocFilter, lgbtqFilter: !!useState!.lgbtqFilter}, userName: preUser.username as string, searchLists: [...bookLists.map((list)=> {return {...list, books: JSON.parse(list.books as string)}}) as unknown as BookList[]]};
         return newUser;
        })
    } catch (error) {
        console.error("Database query get-users failed:", error);
        throw error;
    }
});

ipcMain.handle('get-password', async (event, id: number) =>{
    const getPassword = db.prepare(`SELECT password FROM users WHERE id = ?`);
    const password = getPassword.get(id);
    
    return password ? password.password : null;
})


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


