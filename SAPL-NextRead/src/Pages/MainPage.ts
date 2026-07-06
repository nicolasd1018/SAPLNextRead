import templateString from '../Pages/MainPage.template.html?raw';
import { book, getRecommendations } from '../API/HardcoverAPI';
import '../components/Searchbar.js'; 
import { changePage } from '../renderer';
import '../components/LoadingScreen';




export class MainPage extends HTMLElement {
    #books: book[] = []
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

    async availabilityCheck(books: book[]){
        const asyncResults = await Promise.all(
                        this.#books.map(async (book, index) => {
                            const result = await window.electronAPI.runWebScraper(book.title.replaceAll('%', '%25').replaceAll(' ', '%20'));
                            return {index: index, present: result[0] === 'True'};
                        })
                    );
        return books.filter((book, index)=> asyncResults.find((r)=> r.index===index)?.present)
    }

   connectedCallback() {
    if (this.shadowRoot) {
        this.shadowRoot.innerHTML = templateString;
        const searchBar = this.shadowRoot.querySelector("nextread-searchbar")?.shadowRoot?.getElementById("search-bar");
        const bookSpace = this.shadowRoot.getElementById("book-space");
        const rightArrow = this.shadowRoot.getElementById("right-arrow");
        const leftArrow = this.shadowRoot.getElementById("left-arrow");
        const loadingScreen = this.shadowRoot.getElementById('loading-screen');
        let bookCovers: NodeListOf<Element> = document.querySelectorAll(':not(*)');;
        let x = -1;
        let iteration = 0;
        

        if (searchBar && searchBar instanceof HTMLInputElement) {
            searchBar.addEventListener("keydown", async (event) => {
                if (event.key === "Enter") {
                    event.preventDefault();
                    x = -1;
                    // get book recommendations from Hardcover
                    loadingScreen!.style.display = 'flex';
                    this.#books = await getRecommendations(searchBar.value);
                    // filter out all the duplicates
                    this.#books = [...new Set(this.#books.map(p => JSON.stringify(p)))].map(p => JSON.parse(p));

                    // check to see if books are available in SAPL catalogue and filter out the ones that aren't
                    this.#books = await this.availabilityCheck(this.#books);
                    loadingScreen!.style.display = 'none';
                    this.fillBookCarousel(this.#books, bookSpace!, x);
                    if (bookSpace && bookSpace instanceof HTMLElement)
                    {
                        bookCovers = this.shadowRoot?.querySelectorAll(".book-cover")!
                        if (bookCovers) {
                            bookCovers.forEach((bc)=> {
                                const bookIndex = Number(bc.getAttribute('data-book-index'));
                                if (bookIndex >= 0){
                                    bc.addEventListener("click", async (event) => {
                                        changePage(this.#books[bookIndex])
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
                if (x >= this.#books.length -3){
                    iteration += 1;
                    loadingScreen!.style.display = 'flex';
                    let newBooks = await getRecommendations((searchBar as HTMLInputElement)!.value, iteration);
                    newBooks = [...new Set(newBooks.map(p => JSON.stringify(p)))].map(p => JSON.parse(p));
                    newBooks = await this.availabilityCheck(newBooks);
                    this.#books = [...this.#books, ...newBooks];
                    this.#books = [...new Set(this.#books.map(p => JSON.stringify(p)))].map(p => JSON.parse(p));
                }
                this.fillBookCarousel(this.#books, bookSpace!, x);
                loadingScreen!.style.display = 'none';
                if (bookSpace && bookSpace instanceof HTMLElement)
                    {
                        bookCovers = this.shadowRoot?.querySelectorAll(".book-cover")!
                        if (bookCovers) {
                            bookCovers.forEach((bc)=> {
                                const bookIndex = Number(bc.getAttribute('data-book-index'));
                                if (x >= 0){
                                    bc.addEventListener("click", async (event) => {
                                        changePage(this.#books[bookIndex])
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
                    
                    this.fillBookCarousel(this.#books, bookSpace!, x);
                    if (bookSpace && bookSpace instanceof HTMLElement)
                    {
                        bookCovers = this.shadowRoot?.querySelectorAll(".book-cover")!
                        if (bookCovers) {
                            bookCovers.forEach((bc)=> {
                                const bookIndex = Number(bc.getAttribute('data-book-index'));
                                if (bookIndex >= 0){
                                    bc.addEventListener("click", async (event) => {
                                        changePage(this.#books[bookIndex])
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
