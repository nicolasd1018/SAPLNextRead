import templateString from '../Pages/MainPage.template.html?raw';
import { book, getRecommendations } from '../API/HardcoverAPI';
import '../components/Searchbar.js'; // Just the path, no variable name!
import Searchbar from '../components/Searchbar.js';
import { changePage } from '../renderer';




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

        if (searchBar && searchBar instanceof HTMLInputElement) {
            searchBar.addEventListener("keydown", async (event) => {
                if (event.key === "Enter") {
                    event.preventDefault();
                    x = -1;
                    books = await getRecommendations(searchBar.value);
                    this.fillBookCarousel(books, bookSpace!, x);
                    if (bookSpace && bookSpace instanceof HTMLElement)
                    {
                        bookCovers = this.shadowRoot?.querySelectorAll(".book-cover")!
                        if (bookCovers) {
                            console.log(bookCovers)
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
            });
        }

        if (rightArrow && rightArrow instanceof HTMLImageElement) {
            rightArrow.addEventListener("click", async  (event) => {
                x += 1;
                this.fillBookCarousel(books, bookSpace!, x);
            })
        }

        if (leftArrow && leftArrow instanceof HTMLImageElement) {
            leftArrow.addEventListener("click", async  (event) => {
                if (x > -1) {
                    x -= 1;
                    this.fillBookCarousel(books, bookSpace!, x);
                    console.log('test')
                }
            })
        }

        
    }
  }
}

customElements.define('main-page', MainPage);
