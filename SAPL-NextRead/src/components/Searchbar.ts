import templateString from '../components/searchBar.template.html?raw'

class Searchbar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        if (this.shadowRoot) {
            this.shadowRoot.innerHTML = templateString;
        }
    }
}

if (!customElements.get('nextread-searchbar')) {
    customElements.define('nextread-searchbar',Searchbar );
}

export default Searchbar;