import { app, BrowserWindow, ipcMain, Options } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { PythonShell } from 'python-shell';
import { DatabaseSync, StatementResultingChanges } from 'node:sqlite'; 
import User from './Types/User';
import bcrypt from "bcryptjs";
import BookList from './Types/bookList';



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
  ageRange TEXT NOT NULL DEFAULT '${JSON.stringify(['Toddler', 'Juvenile Beginner', 'Juvenile', 'Young Adult', 'Adult'])}',
  bipocFilter BOOLEAN NOT NULL DEFAULT 0,
  lgbtqFilter BOOLEAN NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    useState_id INTEGER,
    username TEXT NOT NULL,
    password TEXT, 
    profilePicture BLOB,
    allowedToUseData BOOLEAN NOT NULL DEFAULT 0,
    bookRatingThreshold INTEGER NOT NULL DEFAULT 4,
    address TEXT,
    firstName TEXT,
    lastName TEXT,
    email TEXT,
    gender TEXT,
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

ipcMain.handle('make-user', async (event, username: string, password: string, address: string, firstName: string, lastName: string, email: string, gender: string) => {
    try {
        const createUseState = db.prepare(`INSERT INTO useStates DEFAULT VALUES`);
        const useState = createUseState.run();
        const useStateId = useState.lastInsertRowid;
        let user: StatementResultingChanges;
        if (password) {
          const createUser = db.prepare(`INSERT INTO users (useState_id, username, password, address, firstName, lastName, email, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
          const manualSalt = bcrypt.genSaltSync(10);
          const manualHash = bcrypt.hashSync(password, manualSalt);
          user = createUser.run(useStateId, username, manualHash, address, firstName, lastName, email, gender);
        }
        else {
          const createUser = db.prepare(`INSERT INTO users (useState_id, username) VALUES (?, ?)`);
          user = createUser.run(useStateId, username);
        }
        const userId = user.lastInsertRowid;
        const createBookList = db.prepare('INSERT INTO bookLists (user_id, name) VALUES (?,?)');
        createBookList.run(userId, 'Liked Books');
        createBookList.run(userId, 'Disliked Books');
        return user.lastInsertRowid;
    } catch (error) {
        console.error("Database query make-user failed:", error);
        throw error;
    }
});

ipcMain.handle('get-users', async (event) => {
    try {
        const getUsers = db.prepare(`SELECT * FROM users`);
        const users = getUsers.all();
        console.log(users);
         return users.map((preUser)=> {
          const getUseState = db.prepare(`SELECT * FROM useStates WHERE id = ?`);
          const useState = getUseState.get(preUser.useState_id);
          const getBookLists = db.prepare(`SELECT * FROM bookLists WHERE user_id= ?`);
          const bookLists = getBookLists.all(preUser.id);
          let imageSrcString: string | undefined = undefined;
          if (preUser.profilePicture && preUser.profilePicture !== null) {
            const uint8Array = preUser.profilePicture as Uint8Array;
            const binaryString = Array.from(uint8Array, byte => String.fromCharCode(byte)).join('');
            const base64String = btoa(binaryString);
            imageSrcString = `data:image/png;base64,${base64String}`;
          }

          const newUser: User = {profilePicture: imageSrcString, id: preUser.id as number, useState: {whiteList: JSON.parse(useState!.whiteList as string), blackList: JSON.parse(useState!.blackList as string), ageRange: JSON.parse(useState!.ageRange as string), bipocFilter: !!useState!.bipocFilter, lgbtqFilter: !!useState!.lgbtqFilter}, userName: preUser.username as string, searchLists: [...bookLists.map((list)=> {return {...list, books: JSON.parse(list.books as string)}}) as unknown as BookList[],], allowedToUseData: !!preUser.allowedToUseData, bookRatingThreshold: preUser.bookRatingThreshold as number, firstName: preUser.firstName as string, lastName: preUser.lastName as string, email: preUser.email as string, address: preUser.address as string, gender: preUser.gender as string};
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

ipcMain.handle('get-user', (event, id: number) => {
  try {
    const getUser = db.prepare('SELECT id, useState_id, username, profilePicture, allowedToUseData, bookRatingThreshold, firstName, lastName, email, address, gender FROM users WHERE id = ?');
    const  preUser = getUser.get(id);

    const getUseState = db.prepare(`SELECT * FROM useStates WHERE id = ?`);
    const useState = getUseState.get(preUser!.useState_id);
    const getBookLists = db.prepare(`SELECT * FROM bookLists WHERE user_id= ?`);
    const bookLists = getBookLists.all(preUser!.id);
    let imageSrcString: string | undefined = undefined;
    if (preUser!.profilePicture && preUser!.profilePicture !== null) {
      const uint8Array = preUser!.profilePicture as Uint8Array;
      const binaryString = Array.from(uint8Array, byte => String.fromCharCode(byte)).join('');
      const base64String = btoa(binaryString);
      imageSrcString = `data:image/png;base64,${base64String}`;
    }
    const newUser: User = {profilePicture: imageSrcString, id: preUser!.id as number, useState: {whiteList: JSON.parse(useState!.whiteList as string), blackList: JSON.parse(useState!.blackList as string), ageRange: JSON.parse(useState!.ageRange as string), bipocFilter: !!useState!.bipocFilter, lgbtqFilter: !!useState!.lgbtqFilter}, userName: preUser!.username as string, searchLists: [...bookLists.map((list)=> {return {...list, books: JSON.parse(list.books as string)}}) as unknown as BookList[]], allowedToUseData: !!preUser!.allowedToUseData, bookRatingThreshold: preUser!.bookRatingThreshold as number, firstName: preUser!.firstName as string, lastName: preUser!.lastName as string, email: preUser!.email as string, address: preUser!.address as string, gender: preUser!.gender as string};
    return newUser;
  } catch (error) {
        console.error("Database query get-users failed:", error);
        throw error;
    }
});

ipcMain.handle('update-profile-pic', (event, id: number, profilePicture: Uint8Array<ArrayBuffer>) => {
  const updateUser = db.prepare('UPDATE users SET profilePicture = ? WHERE id = ?');
  updateUser.run(profilePicture!, id);
});

ipcMain.handle('update-list', (event, id: number, list: string[]) => {
  const updateList = db.prepare(`UPDATE bookLists SET books = ? WHERE id = ?`);
  updateList.run(JSON.stringify(list), id)
});

ipcMain.handle('update-allowed-to-use-data', (event, id: number, allowedToUseData: boolean) => {
  const updateAllowedToUseData = db.prepare(`UPDATE users SET allowedToUseData = ? WHERE id = ?`);
  updateAllowedToUseData.run(allowedToUseData ? 1 : 0, id);
});

ipcMain.handle('update-book-rating-threshold', (event, id: number, bookRatingThreshold: number) => {
  const updateBookRatingThreshold = db.prepare(`UPDATE users SET bookRatingThreshold = ? WHERE id = ?`);
  updateBookRatingThreshold.run(bookRatingThreshold, id);
});
ipcMain.handle('update-first-name', (event, id: number, firstName: string) => {
  const updateFirstName = db.prepare(`UPDATE users SET firstName = ? WHERE id = ?`);
  updateFirstName.run(firstName, id);
});
ipcMain.handle('update-last-name', (event, id: number, lastName: string) => {
  const updateLastName = db.prepare(`UPDATE users SET lastName = ? WHERE id = ?`);
  updateLastName.run(lastName, id);
});
ipcMain.handle('update-email', (event, id: number, email: string) => {
  const updateEmail = db.prepare(`UPDATE users SET email = ? WHERE id = ?`);
  updateEmail.run(email, id);
});
ipcMain.handle('update-address', (event, id: number, address: string) => {
  const updateAddress = db.prepare(`UPDATE users SET address = ? WHERE id = ?`);
  updateAddress.run(address, id);
});
ipcMain.handle('update-gender', (event, id: number, gender: string) => {
  const updateGender = db.prepare(`UPDATE users SET gender = ? WHERE id = ?`);
  updateGender.run(gender, id);
});
ipcMain.handle('update-username', (event, id: number, username: string) => {  
  const updateUsername = db.prepare(`UPDATE users SET userName = ? WHERE id = ?`);
  updateUsername.run(username, id);
});
ipcMain.handle('update-password', (event, id: number, password: string) => {  
  const updatePassword = db.prepare(`UPDATE users SET password = ? WHERE id = ?`);
  const manualSalt = bcrypt.genSaltSync(10);
  const manualHash = bcrypt.hashSync(password, manualSalt);
  updatePassword.run(manualHash, id);
});

ipcMain.handle('add-list', (event, userId: number, listName: string) => {
  const addList = db.prepare(`INSERT INTO bookLists (user_id, name) VALUES (?, ?)`);
  const result = addList.run(userId, listName);
  return result.lastInsertRowid;
});

ipcMain.handle('delete-list', (event,  listId: number) => {
  const deleteList = db.prepare(`DELETE FROM bookLists WHERE id = ?`);
  deleteList.run(listId);
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


