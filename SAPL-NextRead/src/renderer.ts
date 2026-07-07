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
import { book } from './API/HardcoverAPI';

console.log(
  '👋 This message is being logged by "renderer.ts", included via Vite',
);

const mainPage = document.createElement('main-page');
const bookPage = document.createElement('book-page');
const header = document.createElement('nextread-header');

export const changePage = (book: book | undefined = undefined) => {
  if (book) {
    mainPage.style.display = 'none';
    console.log(book);
    bookPage.setAttribute('imgUrl', book.image.url);
    bookPage.setAttribute('title', book.title);
    bookPage.setAttribute('subtitle', book.subtitle);
    bookPage.setAttribute('author', book.contributions[0].author.name);
    bookPage.setAttribute('description', book.description);
    bookPage.setAttribute('id', String(book.id));
    bookPage.setAttribute('genres', book.genres.map((genre)=> genre.tag.tag).toString());
    bookPage.setAttribute('moods', book.moods.map((genre)=> genre.tag.tag).toString());
    bookPage.setAttribute('contentWarnings', book.contentWarnings.map((genre)=> genre.tag.tag).toString());

    document.body.append(bookPage);
  }
  else {
    document.body.removeChild(bookPage);
    mainPage.style.display = 'block';
  }
}


document.body.appendChild(header);
document.body.appendChild(mainPage);