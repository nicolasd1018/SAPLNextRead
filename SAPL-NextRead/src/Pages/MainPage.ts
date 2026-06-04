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
        const leftArrow = this.shadowRoot.getElementById("left-arrow")
        let x = -1;
        if (searchBar && searchBar instanceof HTMLInputElement) {
            searchBar.addEventListener("keydown", async function(event){
                if (event.key === "Enter") {
                    event.preventDefault()
                    var books = await getRecommendations(searchBar.value)
                    bookSpace!.innerHTML = ''
                    
                    bookSpace!.innerHTML += `<img src=${x < 0 ? "/placeholder.png" : books[x].image.url} style="width: 15vw; height: calc(15vw * 1.5); padding-right: 10vw;">`
                    bookSpace!.innerHTML += `<img src=${books[x+1].image.url} style="width: 23vw; height: calc(23vw * 1.5;)">`
                    bookSpace!.innerHTML += `<img src=${books[x+2].image.url} style="width: 15vw; height: calc(15vw * 1.5); padding-left: 10vw;">`
                }
            });
        }

        if (leftArrow && leftArrow instanceof HTMLImageElement) {
            leftArrow.addEventListener("click", async function (event) {
                x += 1;
            })
        }
    }
  }
}

customElements.define('main-page', MainPage);
