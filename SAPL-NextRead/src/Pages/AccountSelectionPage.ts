import templateString from '../Pages/AccountSelectionPage.template.html?raw';

export default class AccountSelectionPage extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render()
    }

    render() {
        
        if (this.shadowRoot) {
            this.shadowRoot.innerHTML = templateString;
        }
    }
}

if (!customElements.get('account-selection-page')) {
    customElements.define('account-selection-page',AccountSelectionPage );
}
