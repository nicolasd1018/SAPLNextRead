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
        const bookSpace = this.shadowRoot.getElementById("book-space");
        if (searchBar && searchBar instanceof HTMLInputElement) {
            searchBar.addEventListener("keydown", async function(event){
                if (event.key === "Enter") {
                    event.preventDefault()
                    var books = await getRecommendations(searchBar.value)
                    books.slice(0,4).forEach((book)=>{
                        bookSpace!.innerHTML += `<img src=${book.image.url} style="width: 11vw; height: calc(11vw * 1.5)">`
                    })
                }
            });
        }
    }
  }
}

customElements.define('main-page', MainPage);
