import templateString from '../components/FilterModal.template.html?raw';
import './tagMenu';
export default class FilterModal extends HTMLElement{
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        if (this.shadowRoot) {
            this.shadowRoot.innerHTML = templateString;
            const closeButton = this.shadowRoot.getElementById('close-button');
            const tabButtons = this.shadowRoot.querySelectorAll('.tab-button');
            const modalContainer = this.shadowRoot.getElementById('filter-modal-container');
            
            if (closeButton && closeButton instanceof HTMLElement){
                closeButton.addEventListener('click', ()=>{
                    this.shadowRoot?.querySelectorAll('.tab-button.selected').forEach((button)=> button.classList.toggle('selected'));
                    this.style.display = 'none';
                });
            }

            if (tabButtons.length !== 0){
                tabButtons.forEach((button)=>{
                    
                    button.addEventListener('click', () => {
                        this.shadowRoot?.querySelectorAll('.tab-button.selected').forEach((button)=> button.classList.toggle('selected'));
                        button.classList.toggle('selected');
                    });
                });
            }

            if (modalContainer && modalContainer instanceof HTMLElement){
                
            }
        }
    }
}

if (!customElements.get('filter-modal')) {
    customElements.define('filter-modal',FilterModal );
}