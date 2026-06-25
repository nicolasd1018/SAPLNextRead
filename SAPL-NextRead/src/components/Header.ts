import templateString from '../components/Header.template.html?raw'
import { changePage } from '../renderer';

class Header extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        if (this.shadowRoot) {
            this.shadowRoot.innerHTML = templateString;
            const header = this.shadowRoot.getElementById("header");
                
            if (header)
                header.addEventListener("click", async()=>{changePage()} );
        }
    }
}

if (!customElements.get('nextread-header')) {
    customElements.define('nextread-header',Header );
}

export default Header;