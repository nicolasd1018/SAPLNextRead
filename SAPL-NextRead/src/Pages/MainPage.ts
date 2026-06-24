import templateString from '../Pages/MainPage.template.html?raw';
import { book, getRecommendations } from '../API/HardcoverAPI';
import '../components/Searchbar.js'; // Just the path, no variable name!
import Searchbar from '../components/Searchbar.js';
import { changePage } from '../renderer';
import checkCatalogue from '../services/CheckCatalogue';




export class MainPage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

    fillBookCarousel(books: book[], bookSpace: HTMLElement, x: number) {
        bookSpace!.innerHTML = ''
                    
                    bookSpace!.innerHTML += `<img id="book-cover" data-book-index="${x}" class="book-cover" src=${x < 0 ? "/placeholder.png" : books[x].image.url} style="width: 15vw; height: calc(15vw * 1.5); padding-right: 10vw;">`
                    bookSpace!.innerHTML += `<img id="book-cover" data-book-index="${x+1}" class="book-cover" src=${books[x+1].image.url} style="width: 23vw; height: calc(23vw * 1.5);">`
                    bookSpace!.innerHTML += `<img id="book-cover" data-book-index="${x+2}" class="book-cover" src=${books[x+2].image.url} style="width: 15vw; height: calc(15vw * 1.5); padding-left: 10vw;">`
    }

   connectedCallback() {
    if (this.shadowRoot) {
        this.shadowRoot.innerHTML = templateString;
        const searchBar = this.shadowRoot.querySelector("nextread-searchbar")?.shadowRoot?.getElementById("search-bar");
        const bookSpace = this.shadowRoot.getElementById("book-space");
        const rightArrow = this.shadowRoot.getElementById("right-arrow")
        const leftArrow = this.shadowRoot.getElementById("left-arrow")
        let bookCovers: NodeListOf<Element> = document.querySelectorAll(':not(*)');; 
        let x = -1;
        var books: book[];
        let iteration = 0;

        if (searchBar && searchBar instanceof HTMLInputElement) {
            searchBar.addEventListener("keydown", async (event) => {
                if (event.key === "Enter") {
                    event.preventDefault();
                    x = -1;
                    books = await getRecommendations(searchBar.value);
                    const asyncResults = await Promise.all(
                        books.map(async (book, index) => {
                            const result = await window.electronAPI.runPythonScript(book.title.replaceAll(' ', '%20'));
                            console.log(book.title, result[0]);
                            return {index: index, present: result[0] === 'True'};
                        })
                    );
                    books = books.filter((book, index)=> asyncResults.find((r)=> r.index===index)?.present);
                    console.log(books);
                    this.fillBookCarousel(books, bookSpace!, x);
                    if (bookSpace && bookSpace instanceof HTMLElement)
                    {
                        bookCovers = this.shadowRoot?.querySelectorAll(".book-cover")!
                        if (bookCovers) {
                            bookCovers.forEach((bc)=> {
                                const bookIndex = Number(bc.getAttribute('data-book-index'));
                                if (bookIndex >= 0){
                                    bc.addEventListener("click", async (event) => {
                                        changePage(books[bookIndex])
                                    })
                                }
                            })
                        }
                    }
                }
            });
        }

        if (rightArrow && rightArrow instanceof HTMLImageElement) {
            rightArrow.addEventListener("click", async  (event) => {
                
                x += 1;
                if (x >= books.length -3){
                    iteration += 1;
                    let newBooks = await getRecommendations((searchBar as HTMLInputElement)!.value, iteration);
                    const asyncResults = await Promise.all(
                        newBooks.map(async (book, index) => {
                            const result = await window.electronAPI.runPythonScript(book.title.replaceAll(' ', '%20'));
                            console.log(book.title, result[0]);
                            return {index: index, present: result[0] === 'True'};
                        })
                    );
                    newBooks = newBooks.filter((book, index)=> asyncResults.find((r)=> r.index===index)?.present);
                    books = [...books, ...newBooks];
                    console.log(books);
                }
                this.fillBookCarousel(books, bookSpace!, x);
                if (bookSpace && bookSpace instanceof HTMLElement)
                    {
                        bookCovers = this.shadowRoot?.querySelectorAll(".book-cover")!
                        if (bookCovers) {
                            bookCovers.forEach((bc)=> {
                                const bookIndex = Number(bc.getAttribute('data-book-index'));
                                if (x >= 0){
                                    bc.addEventListener("click", async (event) => {
                                        
                                        changePage(books[bookIndex])
                                    })
                                }
                            })
                        }
                    }
            })
        }

        if (leftArrow && leftArrow instanceof HTMLImageElement) {
            leftArrow.addEventListener("click", async  (event) => {
                if (x > -1) {
                    x -= 1;
                    
                    this.fillBookCarousel(books, bookSpace!, x);
                    if (bookSpace && bookSpace instanceof HTMLElement)
                    {
                        bookCovers = this.shadowRoot?.querySelectorAll(".book-cover")!
                        if (bookCovers) {
                            bookCovers.forEach((bc)=> {
                                const bookIndex = Number(bc.getAttribute('data-book-index'));
                                if (bookIndex >= 0){
                                    bc.addEventListener("click", async (event) => {
                                        console.log(books)
                                        changePage(books[bookIndex])
                                    })
                                }
                            })
                        }
                    }
                }
            })
        }

        
    }
  }
}

customElements.define('main-page', MainPage);
