import templateString from '../components/FilterModal.template.html?raw';
import { setUseState } from '../renderer';
import Tag from '../Types/Tag';
import UseState from '../Types/UseState';
import './TagMenu';
import TagMenu from './TagMenu';
export default class FilterModal extends HTMLElement{
    tab: string = 'genre';
    useState: UseState = {whiteList: [], blackList: [], ageRange: ['Toddler', 'Juvenile Beginner', 'Juvenile', 'Young Adult', 'Adult']};
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async setUseState( useState: UseState) {
        this.useState = useState;
        await this.render();
    }

    async connectedCallback() {
        await this.render();
    }

    async render() {
        if (this.shadowRoot) {
            this.shadowRoot.innerHTML = templateString;
            const closeButton = this.shadowRoot.getElementById('close-button');
            const tabButtons = this.shadowRoot.querySelectorAll('.tab-button');
            const tagSpace = this.shadowRoot.querySelector('tag-menu');
            const saveButton = this.shadowRoot.getElementById('save-button');
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

            if (tagSpace) {
                tagSpace.addEventListener('set-filter', (event)=>{
                    
                    this.useState ={whiteList: (event as CustomEvent).detail.whiteList, blackList:(event as CustomEvent).detail.blackList, ageRange: ages.slice((tagSpace as TagMenu).ageRangeMin,(tagSpace as TagMenu).ageRangeMax)};
                });
                (tagSpace as TagMenu).setWhiteList('genre', this.useState.whiteList.filter((tag)=> tag.type === 'genre').map((tag)=> tag.name));
                (tagSpace as TagMenu).setWhiteList('mood', this.useState.whiteList.filter((tag)=> tag.type === 'mood').map((tag)=> tag.name));
                (tagSpace as TagMenu).setWhiteList('content-warning', this.useState.whiteList.filter((tag)=> tag.type === 'content-warning').map((tag)=> tag.name));

                (tagSpace as TagMenu).setBlackList('genre', this.useState.blackList.filter((tag)=> tag.type === 'genre').map((tag)=> tag.name));
                (tagSpace as TagMenu).setBlackList('mood', this.useState.blackList.filter((tag)=> tag.type === 'mood').map((tag)=> tag.name));
                (tagSpace as TagMenu).setBlackList('content-warning', this.useState.blackList.filter((tag)=> tag.type === 'content-warning').map((tag)=> tag.name));

                await (tagSpace as TagMenu).render();
            }

            if (saveButton) {
                saveButton.addEventListener('click', ()=>{
                    setUseState(this.useState);
                })
            }
        }
    }
}

if (!customElements.get('filter-modal')) {
    customElements.define('filter-modal',FilterModal );
}