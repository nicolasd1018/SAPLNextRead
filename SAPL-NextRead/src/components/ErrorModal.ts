import templateString from '../components/ErrorModal.template.html?raw';
import './tagMenu';
export default class ErrorModal extends HTMLElement{
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
            const closeButton = this.shadowRoot.getElementById('close-button');
            
            if (closeButton && closeButton instanceof HTMLElement){
                closeButton.addEventListener('click', ()=>{
                    this.style.display = 'none';
                });
            }
        }
    }

    addInformation() {
        if (this.shadowRoot) {
            const title = this.shadowRoot.getElementById('title');
            const message = this.shadowRoot.getElementById('message');

            if(title && title instanceof HTMLElement ) {
                title.innerText = this.getAttribute('error-title')!;
            }

            if (message && message instanceof HTMLElement) {
                message.innerText = this.getAttribute('error-message')!;
            }
        }
    }
}

if (!customElements.get('error-modal')) {
    customElements.define('error-modal',ErrorModal );
}