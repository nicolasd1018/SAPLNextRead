import { getAllContentWarnings, getAllGenres, getAllMoods } from '../API/HardcoverAPI';
import templateString from '../components/TagMenu.template.html?raw'

class TagMenu extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ["tag-type"];
    }

    private whiteListTags: Map<string,string[]> = new Map([['genre', []], ['mood', []], ['content-warning', []]]);
    private blackListTags:  Map<string,string[]> = new Map([['genre', []], ['mood', []], ['content-warning', []]]);
    tagType: string = 'genre';
    tagIndexes= new Map([['genre', 0], ['mood', 0], ['content-warning',0]]);
    tags: Map<string,string[]> = new Map([['genre', []], ['mood', []], ['content-warning', []]]);

    createTags(tags: string[]) {
        if (this.shadowRoot) {
            const whiteList = this.shadowRoot.getElementById('white-list');
            const blackList = this.shadowRoot.getElementById('black-list');
            whiteList!.innerHTML = '';
            blackList!.innerHTML = '';
            if (whiteList && whiteList instanceof HTMLElement && blackList && blackList instanceof HTMLElement) {
                whiteList.innerHTML = '';
                blackList.innerHTML = '';
                tags.forEach((tag, index)=> {
                    const whiteGenreTag = document.createElement('div');
                    whiteGenreTag.id = `genre-tag-${index}`;
                    whiteGenreTag.className = 'tag';
                    if (this.whiteListTags.get(this.tagType)!.includes(tag)) {
                        whiteGenreTag.classList.toggle('selected');
                    }
                    whiteGenreTag.innerText = tag;
                    whiteGenreTag.addEventListener('click', ()=>{
                        whiteGenreTag.classList.toggle('selected');
                        if (this.whiteListTags.get(this.tagType)!.includes(tag)) 
                            this.whiteListTags.set(this.tagType, this.whiteListTags.get(this.tagType)!.filter((bTag) => bTag !== tag));
                        else
                            this.whiteListTags.set(this.tagType, [...this.whiteListTags.get(this.tagType)!, tag]);
                    });
                    
                    const blackGenreTag = document.createElement('div');
                    blackGenreTag.id = `genre-tag-${index}`;
                    blackGenreTag.className = 'tag';
                    blackGenreTag.innerText = tag;
                    if (this.blackListTags.get(this.tagType)!.includes(tag)) {
                        blackGenreTag.classList.toggle('selected');
                    }
                    blackGenreTag.addEventListener('click', ()=>{
                        blackGenreTag.classList.toggle('selected');
                        if (this.blackListTags.get(this.tagType)!.includes(tag)) 
                            this.blackListTags.set(this.tagType,this.blackListTags.get(this.tagType)!.filter((bTag) => bTag !== tag));
                        else
                            this.blackListTags.set(this.tagType,[...this.whiteListTags.get(this.tagType)!, tag]);
                        
                    });
                    
                    whiteList.appendChild(whiteGenreTag);
                    blackList.appendChild(blackGenreTag);
                });
            } 
        }
    }

    async getTags(index: number = 0){
        const tagType = this.getAttribute('tag-type');
        var tags: string[] = [];
        if (tagType && tagType === 'genre')
                tags = await getAllGenres(index);
        if (tagType && tagType === 'content-warning')
                tags = await getAllContentWarnings(index);
        if (tagType && tagType === 'mood')
                tags = await getAllMoods(index);
        return tags;
    }

    async attributeChangedCallback(oldValue: string | null,newValue: string | null,) {
        if (oldValue !== newValue)
            await this.render()
    }

    async render(){
        if (this.shadowRoot) {
            this.shadowRoot.innerHTML = templateString;
            this.tagType = this.getAttribute('tag-type') ?? 'genre';
            const searchBar = this.shadowRoot.getElementById('search-bar');
            const whiteList = this.shadowRoot.getElementById('white-list');
            const blackList = this.shadowRoot.getElementById('black-list');
            

            if (this.tags.get(this.tagType)?.length === 0)
                this.tags.set(this.tagType, await this.getTags());
            if (searchBar && searchBar instanceof HTMLInputElement) {
                searchBar.addEventListener("keydown", async (event) => {
                    if (event.key === "Enter") { 
                        whiteList?.scrollTo({top: 0});
                        blackList?.scrollTo({top: 0});
                        this.createTags(this.tags.get(this.tagType)!.filter((tag)=> tag.toLowerCase().includes(searchBar.value.toLowerCase())));
                    }
                });
                searchBar.addEventListener('search', () => {
                    if (searchBar.value === '') {
                        whiteList?.scrollTo({top: 0});
                        blackList?.scrollTo({top: 0});
                        this.createTags(this.tags.get(this.tagType)!);
                    }
                });
            }

            this.createTags(this.tags.get(this.tagType)!);
            
            if(whiteList && whiteList instanceof HTMLElement) {
                whiteList!.addEventListener('scroll', async () => {
                    const distanceToBottom = whiteList.scrollHeight - whiteList.clientHeight - whiteList.scrollTop;

                    // Check if distance is 0 (with a 1px buffer for zoom/rounding)
                    if (Math.abs(distanceToBottom) <= 1) {
                        var newTags: string[] = [];
                        this.tagIndexes.set(this.tagType, this.tagIndexes.get(this.tagType)!+1);
                        newTags = await this.getTags(this.tagIndexes.get(this.tagType));
                        this.tags.set(this.tagType, [...this.tags.get(this.tagType)!,...newTags]);
                        this.createTags(this.tags.get(this.tagType)!.filter((tag) => tag.includes((searchBar as HTMLInputElement)!.value)));
                    }

                });
            }

            if(blackList && blackList instanceof HTMLElement) {
                blackList.addEventListener('scroll', async () => {
                    const distanceToBottom = whiteList!.scrollHeight - blackList.clientHeight - blackList.scrollTop;

                    // Check if distance is 0 (with a 1px buffer for zoom/rounding)
                    if (Math.abs(distanceToBottom) <= 1) {
                        var newTags: string[] = [];
                        this.tagIndexes.set(this.tagType, this.tagIndexes.get(this.tagType)!+1);
                        newTags = await this.getTags(this.tagIndexes.get(this.tagType));
                        this.tags.set(this.tagType, [...this.tags.get(this.tagType)!,...newTags]);
                        this.createTags(this.tags.get(this.tagType)!.filter((tag) => tag.includes((searchBar as HTMLInputElement)!.value)));
                    }
                });
            }
        }
        console.log(this.tags);
    }

    async connectedCallback() {
        await this.render();
    }
}

if (!customElements.get('tag-menu')) {
    customElements.define('tag-menu',TagMenu );
}

export default TagMenu;