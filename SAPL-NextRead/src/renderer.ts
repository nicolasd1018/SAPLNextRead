/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.ts` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.css';
import './Pages/MainPage'
import './Pages/BookPage'
import './components/Header'
import './Pages/AccountSelectionPage'
import './Pages/AuthorPage';
import './Pages/SettingsPage';
import { book as Book } from './API/HardcoverAPI';
import { MainPage } from './Pages/MainPage';
import BookPage from './Pages/BookPage';
import User from './Types/User';
import Header from './components/Header';
import Author from './Types/Author';
import AuthorPage from './Pages/AuthorPage';
import { SettingsPage } from './Pages/SettingsPage';
import AIPage from './Pages/AIPage';
import './Pages/AIPage';



const mainPage = document.createElement('main-page');
const bookPage = document.createElement('book-page');
const authorPage = document.createElement('author-page');
const header = document.createElement('nextread-header');
const accountSelectionPage = document.createElement('account-selection-page');
const settingsPage = document.createElement('settings-page');
const aiPage = document.createElement('ai-page');


export const changePage = (user?: User, book?: Book, author?: Author, logout: boolean = false, settings: boolean = false, ai: boolean = false) => {
  if (book) {
    mainPage.style.display = 'none';
    bookPage.setAttribute('imgUrl', book.image.url);
    bookPage.setAttribute('bookTitle', book.title);
    bookPage.setAttribute('subtitle', book.subtitle);
    bookPage.setAttribute('author', book.contributions[0].author.name);
    bookPage.setAttribute('description', book.description);
    bookPage.setAttribute('id', String(book.id));
    bookPage.setAttribute('genres', book.genres.map((genre)=> genre.tag.tag).toString());
    bookPage.setAttribute('moods', book.moods.map((genre)=> genre.tag.tag).toString());
    bookPage.setAttribute('contentWarnings', book.contentWarnings.map((genre)=> genre.tag.tag).toString());
    bookPage.setAttribute('ageRating', book.ageRating);
    (bookPage as BookPage).bookSeries = book.book_series;

    document.body.append(bookPage);
  }
  else if (user)
  {
    document.body.removeChild(accountSelectionPage);
    setUser(user);
    document.body.appendChild(mainPage)
    mainPage.style.display = 'block';
  }
  else if (logout){
    setUser( undefined);
    if (document.body.contains(mainPage)) {
      document.body.removeChild(mainPage);
    }
    if (document.body.contains(bookPage)) {
      document.body.removeChild(bookPage);
    }
    if (document.body.contains(authorPage)) {
      document.body.removeChild(authorPage);
    }
    if (document.body.contains(settingsPage)) {
      document.body.removeChild(settingsPage);
    }
    if (document.body.contains(aiPage)) {
      document.body.removeChild(aiPage);
    }
    document.body.appendChild(accountSelectionPage);
  }
  else if (author) {
    mainPage.style.display = 'none';
    if (document.body.contains(bookPage)) document.body.removeChild(bookPage);
    (authorPage as AuthorPage).author = author;
    document.body.appendChild(authorPage);
  }
  else if (settings) {
    if (document.body.contains(bookPage)) document.body.removeChild(bookPage);
    if (document.body.contains(authorPage)) document.body.removeChild(authorPage);
    if (document.body.contains(aiPage)) document.body.removeChild(aiPage);
    mainPage.style.display = 'none';
    document.body.append(settingsPage);
  }
  else if (ai) {
    if (document.body.contains(bookPage)) document.body.removeChild(bookPage);
    if (document.body.contains(authorPage)) document.body.removeChild(authorPage);
    if (document.body.contains(settingsPage)) document.body.removeChild(settingsPage);
    mainPage.style.display = 'none';
    document.body.append(aiPage);
  }
  else {
    if (document.body.contains(bookPage)) document.body.removeChild(bookPage);
    if (document.body.contains(authorPage)) document.body.removeChild(authorPage);
    if (document.body.contains(settingsPage)) document.body.removeChild(settingsPage);
    if (document.body.contains(aiPage)) document.body.removeChild(aiPage);

    mainPage.style.display = 'block';
  }
}

export const setUser = (user: User | undefined) => {
  (mainPage as MainPage).user = user;
  (header as Header).user = user;
  (bookPage as BookPage).user = user;
  (settingsPage as SettingsPage).user = user;
  (aiPage as AIPage).user = user;
}


document.body.appendChild(header);
document.body.appendChild(accountSelectionPage);