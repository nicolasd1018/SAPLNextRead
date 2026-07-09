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

    private whiteListTags: string[] = [];
    private blackListTags: string[] = [];

    createTags(tags: string[]) {
        if (this.shadowRoot) {
            const whiteList = this.shadowRoot.getElementById('white-list');
            const blackList = this.shadowRoot.getElementById('black-list');
            if (whiteList && whiteList instanceof HTMLElement && blackList && blackList instanceof HTMLElement) {
                whiteList.innerHTML = '';
                blackList.innerHTML = '';
                tags.forEach((tag, index)=> {
                    const whiteGenreTag = document.createElement('div');
                    whiteGenreTag.id = `genre-tag-${index}`;
                    whiteGenreTag.className = 'tag';
                    if (this.whiteListTags.includes(tag)) {
                        whiteGenreTag.classList.toggle('selected');
                    }
                    whiteGenreTag.innerText = tag;
                    whiteGenreTag.addEventListener('click', ()=>{
                        whiteGenreTag.classList.toggle('selected');
                        if (this.whiteListTags.includes(tag)) 
                            this.whiteListTags = this.whiteListTags.filter((bTag) => bTag !== tag)
                        else
                            this.whiteListTags = [...this.whiteListTags, tag];
                    });
                    
                    const blackGenreTag = document.createElement('div');
                    blackGenreTag.id = `genre-tag-${index}`;
                    blackGenreTag.className = 'tag';
                    blackGenreTag.innerText = tag;
                    if (this.blackListTags.includes(tag)) {
                        blackGenreTag.classList.toggle('selected');
                    }
                    blackGenreTag.addEventListener('click', ()=>{
                        blackGenreTag.classList.toggle('selected');
                        if (this.blackListTags.includes(tag)) 
                            this.blackListTags = this.blackListTags.filter((bTag) => bTag !== tag)
                        else
                            this.blackListTags = [...this.whiteListTags, tag];
                        
                    });
                    
                    whiteList.appendChild(whiteGenreTag);
                    blackList.appendChild(blackGenreTag);
                });
            } 
        }
    }

    async connectedCallback() {
        if (this.shadowRoot) {
            this.shadowRoot.innerHTML = templateString;
            const tagType = this.getAttribute('tag-type');
            const searchBar = this.shadowRoot.getElementById('search-bar');
            const whiteList = this.shadowRoot.getElementById('white-list');
            const blackList = this.shadowRoot.getElementById('black-list');
            var tags: string[] = [];
            var tagIndex= 0;

            if (tagType && tagType === 'genre')
                tags = await getAllGenres();
            if (searchBar && searchBar instanceof HTMLInputElement) {
                searchBar.addEventListener("keydown", async (event) => {
                    if (event.key === "Enter") { 
                        whiteList?.scrollTo({top: 0});
                        blackList?.scrollTo({top: 0});
                        this.createTags(tags.filter((tag)=> tag.toLowerCase().includes(searchBar.value.toLowerCase())));
                    }
                });
                searchBar.addEventListener('search', () => {
                    if (searchBar.value === '') {
                        whiteList?.scrollTo({top: 0});
                        blackList?.scrollTo({top: 0});
                        this.createTags(tags);
                    }
                });
            }

            this.createTags(tags);
            
            if(whiteList && whiteList instanceof HTMLElement) {
                whiteList!.addEventListener('scroll', async () => {
                    const distanceToBottom = whiteList.scrollHeight - whiteList.clientHeight - whiteList.scrollTop;

                    // Check if distance is 0 (with a 1px buffer for zoom/rounding)
                    if (Math.abs(distanceToBottom) <= 1) {
                        var newTags: string[] = [];
                        if (tagType === 'genre'){
                            tagIndex += 1;
                            newTags = await getAllGenres(tagIndex);
                        }
                        tags = [...tags,...newTags];
                        this.createTags(tags.filter((tag) => tag.includes((searchBar as HTMLInputElement)!.value)))
                    }

                });
            }

            if(blackList && blackList instanceof HTMLElement) {
                blackList.addEventListener('scroll', async () => {
                    const distanceToBottom = whiteList!.scrollHeight - blackList.clientHeight - blackList.scrollTop;

                    // Check if distance is 0 (with a 1px buffer for zoom/rounding)
                    if (Math.abs(distanceToBottom) <= 1) {
                        var newTags: string[] = [];
                        if (tagType === 'genre'){
                            tagIndex += 1;
                            newTags = await getAllGenres(tagIndex);
                        }
                        tags = [...tags,...newTags];
                        this.createTags(tags.filter((tag) => tag.includes((searchBar as HTMLInputElement)!.value)))
                    }

                });
            }
        }
    }
}

if (!customElements.get('tag-menu')) {
    customElements.define('tag-menu',TagMenu );
}

export default TagMenu;