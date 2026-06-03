import templateString from '../Pages/MainPage.template.html?raw';
import { getRecommendations } from './API/HardcoverAPI';

export class MainPage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

   connectedCallback() {
    if (this.shadowRoot) {
        this.shadowRoot.innerHTML = templateString;
        const searchBar = this.shadowRoot.getElementById("search-bar");
        const carousel = this.shadowRoot.getElementById("book-carousel");
        if (searchBar && searchBar instanceof HTMLInputElement) {
            searchBar.addEventListener("keydown", async function(event){
                if (event.key === "Enter") {
                    event.preventDefault()
                    var books = await getRecommendations(searchBar.value)
                    books.slice(0,2).forEach((book)=>{
                        carousel!.innerHTML += `<img src=${book.image.url}>`
                    })
                }
            });
        }
    }
  }
}

customElements.define('main-page', MainPage);
