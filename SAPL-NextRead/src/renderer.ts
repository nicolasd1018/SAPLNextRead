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
import { book } from './API/HardcoverAPI';

console.log(
  '👋 This message is being logged by "renderer.ts", included via Vite',
);

const mainPage = document.createElement('main-page');
const bookPage = document.createElement('book-page');

export const changePage = (book: book | undefined = undefined) => {
  if (book) {
    mainPage.style.display = 'none';
    console.log(book);
    bookPage.setAttribute('imgUrl', book.image.url);
    bookPage.setAttribute('title', book.title);
    bookPage.setAttribute('subtitle', book.subtitle);
    bookPage.setAttribute('author', book.contributions[0].author.name);
    bookPage.setAttribute('description', book.description)

    document.body.append(bookPage);
  }
  else {
    document.body.removeChild(bookPage);
    mainPage.style.display = 'block';
  }
}

document.addEventListener("DOMContentLoaded", () => {
    const header = document.getElementById("header");
    if (header)
      header.addEventListener("click", async()=>{changePage()} );
});

document.body.appendChild(mainPage);