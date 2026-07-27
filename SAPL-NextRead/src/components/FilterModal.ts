import templateString from '../components/FilterModal.template.html?raw';
import './TagMenu';
export default class FilterModal extends HTMLElement{
    tab: string = 'genre';
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
            const tagSpace = this.shadowRoot.querySelector('tag-menu');
            (tabButtons.entries().find((tabButton) => tabButton[1].id === "genre")![1] as HTMLElement).classList.toggle('selected');
            
            if (closeButton && closeButton instanceof HTMLElement){
                closeButton.addEventListener('click', ()=>{
                    this.shadowRoot?.querySelectorAll('.tab-button.selected').forEach((button)=> button.classList.toggle('selected'));
                    this.style.display = 'none';
                    this.tab = 'genre';
                    (tabButtons.entries().find((tabButton) => tabButton[1].id === "genre")![1] as HTMLElement).classList.toggle('selected');
                });
            }

            if (tabButtons.length !== 0 && tagSpace){
                tabButtons.forEach((button)=>{
                    
                    button.addEventListener('click', () => {
                        this.shadowRoot?.querySelectorAll('.tab-button.selected').forEach((button)=> button.classList.toggle('selected'));
                        button.classList.toggle('selected');
                        if (button.id === 'genre') {
                            this.tab = 'genre';
                            tagSpace.setAttribute('tag-type', 'genre');
                        }
                        else if (button.id === 'mood') {
                            this.tab =  'mood';
                            tagSpace.setAttribute('tag-type', 'mood');
                        }
                        else if (button.id === 'content-warning') {
                            this.tab = 'content-warning';
                            tagSpace.setAttribute('tag-type', 'content-warning');
                        }
                        else if (button.id === "misc") {
                            this.tab = 'misc';
                            tagSpace.setAttribute('tag-type', 'misc');
                        }
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