import templateString from '../Pages/MainPage.template.html?raw';
import { book, getRecommendations } from './API/HardcoverAPI';



export class MainPage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    // this.fillBookCarousel =this.fillBookCarousel.bind(this);
  }

    fillBookCarousel(books: book[], bookSpace: HTMLElement, x: number) {
        bookSpace!.innerHTML = ''
                    
                    bookSpace!.innerHTML += `<img src=${x < 0 ? "/placeholder.png" : books[x].image.url} style="width: 15vw; height: calc(15vw * 1.5); padding-right: 10vw;">`
                    bookSpace!.innerHTML += `<img src=${books[x+1].image.url} style="width: 23vw; height: calc(23vw * 1.5;)">`
                    bookSpace!.innerHTML += `<img src=${books[x+2].image.url} style="width: 15vw; height: calc(15vw * 1.5); padding-left: 10vw;">`
    }

   connectedCallback() {
    if (this.shadowRoot) {
        this.shadowRoot.innerHTML = templateString;
        const searchBar = this.shadowRoot.getElementById("search-bar");
        const bookSpace = this.shadowRoot.getElementById("book-space");
        const rightArrow = this.shadowRoot.getElementById("right-arrow")
        const leftArrow = this.shadowRoot.getElementById("left-arrow")
        let x = -1;
        var books: book[];
        
        if (searchBar && searchBar instanceof HTMLInputElement) {
            searchBar.addEventListener("keydown", async (event) => {
                if (event.key === "Enter") {
                    event.preventDefault();
                    books = await getRecommendations(searchBar.value);
                this.fillBookCarousel(books, bookSpace!, x);
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
                x -= 1;
                this.fillBookCarousel(books, bookSpace!, x);
            })
        }
    }
  }
}

customElements.define('main-page', MainPage);
