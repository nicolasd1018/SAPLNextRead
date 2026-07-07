import { getAllGenres } from '../API/HardcoverAPI';
import templateString from '../components/TagMenu.template.html?raw'

class TagMenu extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ["tag-type"];
    }

    async connectedCallback() {
        if (this.shadowRoot) {
            this.shadowRoot.innerHTML = templateString;
            const tagType = this.getAttribute('tag-type');
            const whiteList = this.shadowRoot.getElementById('white-list');
            const blackList = this.shadowRoot.getElementById('black-list');

            if (tagType && whiteList && whiteList instanceof HTMLElement && blackList && blackList instanceof HTMLElement) {
                if (tagType === 'genre'){
                    const genres = await getAllGenres();
                    genres.forEach((genre, index)=> {
                        const whiteGenreTag = document.createElement('div');
                        whiteGenreTag.id = `genre-tag-${index}`;
                        whiteGenreTag.className = 'tag';
                        whiteGenreTag.innerText = genre;
                        
                        const blackGenreTag = document.createElement('div');
                        blackGenreTag.id = `genre-tag-${index}`;
                        blackGenreTag.className = 'tag';
                        blackGenreTag.innerText = genre;
                        
                        whiteList.appendChild(whiteGenreTag);
                        blackList.appendChild(blackGenreTag);
                    })
                }
            } 
        }
    }
}

if (!customElements.get('tag-menu')) {
    customElements.define('tag-menu',TagMenu );
}

export default TagMenu;