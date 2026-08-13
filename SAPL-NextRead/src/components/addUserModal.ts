import templateString from '../components/addUserModal.template.html?raw';

export default class AddUserModal extends HTMLElement{
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['error-title', 'error-message'];
    }

    async connectedCallback() {
        if (this.shadowRoot) {
            this.shadowRoot.innerHTML = templateString;
            // window.api.addUser('')
        }
    }
}

if (!customElements.get('add-user-modal')) {
    customElements.define('add-user-modal',AddUserModal );
}