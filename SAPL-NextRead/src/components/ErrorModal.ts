import templateString from '../components/ErrorModal.template.html?raw';
import './tagMenu';
export default class ErrorModal extends HTMLElement{
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        if (this.shadowRoot) {
            this.shadowRoot.innerHTML = templateString;
            const closeButton = this.shadowRoot.getElementById('close-button');
            
            if (closeButton && closeButton instanceof HTMLElement){
                closeButton.addEventListener('click', ()=>{
                    this.shadowRoot?.querySelectorAll('.tab-button.selected').forEach((button)=> button.classList.toggle('selected'));
                    this.style.display = 'none';
                });
            }
        }
    }
}

if (!customElements.get('error-modal')) {
    customElements.define('error-modal',ErrorModal );
}