import templateString from '../components/LoadingScreen.template.html?raw'
import { changePage } from '../renderer';

class LoadingScreen extends HTMLElement {
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

if (!customElements.get('nextread-loading-screen')) {
    customElements.define('nextread-loading-screen',LoadingScreen );
}

export default LoadingScreen;