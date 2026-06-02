import templateString from '../Pages/MainPage.template.html?raw';

export class MainPage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    if (this.shadowRoot) {
        this.shadowRoot.innerHTML = templateString;
        const searchBar = this.shadowRoot.getElementById("search-bar");
        if (searchBar && searchBar instanceof HTMLInputElement) {
            searchBar.addEventListener("keydown", function(event){
                if (event.key === "Enter") {
                    event.preventDefault()
                    console.log(searchBar.value)
                }
            });
        }
    }
  }
}

customElements.define('main-page', MainPage);
