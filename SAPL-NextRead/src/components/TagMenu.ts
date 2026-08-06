import { first, from } from 'rxjs';
import { getAllContentWarnings, getAllGenres, getAllMoods } from '../API/HardcoverAPI';
import templateString from '../components/TagMenu.template.html?raw'
import { setUseState } from '../renderer';
import Tag from '../Types/Tag';

class TagMenu extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ["tag-type"];
    }

    setWhiteList(type: string, tags: string[]) {
        this.whiteListTags.set(type, tags);
        this.render();
    }

    setBlackList(type: string, tags: string[]) {
        this.blackListTags.set(type, tags);
        this.render();
    }

    controlFromSlider(fromSlider: HTMLInputElement, toSlider: HTMLInputElement) {
        const [from, to] = this.getParsed(fromSlider, toSlider);
        this.fillSlider(fromSlider, toSlider, '#C6C6C6', '#602983', toSlider);
        if (from > to) {
            fromSlider.value = to;
        } else {
        }
    }

    controlToSlider(fromSlider: HTMLInputElement, toSlider: HTMLInputElement) {
        const [from, to] = this.getParsed(fromSlider, toSlider);
        this.fillSlider(fromSlider, toSlider, '#C6C6C6', '#602983', toSlider);
        this.setToggleAccessible(toSlider);
        if (from <= to) {
            toSlider.value = to;
        } else {
            toSlider.value = from;
        }
    }

    getParsed(currentFrom: HTMLInputElement, currentTo: HTMLInputElement) {
        const from = currentFrom.value;
        const to = currentTo.value;
        return [from, to];
    }

    fillSlider(from:HTMLInputElement, to:HTMLInputElement, sliderColor: string, rangeColor: string, controlSlider:HTMLInputElement) {
        const rangeDistance = parseInt(to.max)-parseInt(to.min);
        const fromPosition = parseInt(from.value) - parseInt(to.min);
        const toPosition = parseInt(to.value) - parseInt(to.min);
        controlSlider.style.background = `linear-gradient(
        to right,
        ${sliderColor} 0%,
        ${sliderColor} ${(fromPosition)/(rangeDistance)*100}%,
        ${rangeColor} ${((fromPosition)/(rangeDistance))*100}%,
        ${rangeColor} ${(toPosition)/(rangeDistance)*100}%, 
        ${sliderColor} ${(toPosition)/(rangeDistance)*100}%, 
        ${sliderColor} 100%)`;
    }

    setToggleAccessible(currentTarget: HTMLInputElement) {
        const toSlider = this.shadowRoot!.querySelector('#to-slider') as HTMLElement;
        if (Number(currentTarget.value) <= 0 ) {
            toSlider.style.zIndex = '2';
        } else {
            toSlider.style.zIndex = '0';
        }
    }

    whiteListTags: Map<string,string[]> = new Map([['genre', []], ['mood', []], ['content-warning', []]]);
    blackListTags:  Map<string,string[]> = new Map([['genre', []], ['mood', []], ['content-warning', []]]);
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
                    const firstTag = this.whiteListTags.get(this.tagType)?.[0];
                    if (this.whiteListTags.get(this.tagType)!.includes(tag)) {
                        console.log('test');
                        whiteGenreTag.classList.toggle('selected');
                    }
                    whiteGenreTag.innerText = tag;
                    whiteGenreTag.addEventListener('click', ()=>{
                        whiteGenreTag.classList.toggle('selected');
                        if (this.whiteListTags.get(this.tagType)!.includes(tag)) {
                            this.whiteListTags.set(this.tagType, this.whiteListTags.get(this.tagType)!.filter((bTag) => bTag !== tag));
                        }
                        else {
                            this.whiteListTags.set(this.tagType, [...this.whiteListTags.get(this.tagType)!, tag]);
                        }
                        this.dispatchEvent(new CustomEvent('set-filter', {detail:{whiteList: Array.from(this.whiteListTags, ([key, values]) =>(values.map((value)=>({name: value, type: key} as Tag))))[0], blackList:Array.from(this.blackListTags, ([key, values]) =>(values.map((value)=>({name: value, type: key} as Tag))))[0]}}));
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
                        if (this.blackListTags.get(this.tagType)!.includes(tag)) {
                            this.blackListTags.set(this.tagType,this.blackListTags.get(this.tagType)!.filter((bTag) => bTag !== tag));
                        }
                        else {
                            this.blackListTags.set(this.tagType,[...this.whiteListTags.get(this.tagType)!, tag]);
                        }
                        this.dispatchEvent(new CustomEvent('set-filter', {detail:{whiteList: Array.from(this.whiteListTags, ([key, values]) =>(values.map((value)=>({name: value, type: key} as Tag))))[0], blackList:Array.from(this.blackListTags, ([key, values]) =>(values.map((value)=>({name: value, type: key} as Tag))))[0]}}));
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
            const tagHolder = this.shadowRoot.getElementById('tag-holder');
            const miscSpace = this.shadowRoot.getElementById('misc-space');
            this.tagType = this.getAttribute('tag-type') ?? 'genre';
            if (this.tagType !== 'misc' && tagHolder && miscSpace) {
                tagHolder.style.display = 'inline';
                miscSpace.style.display = 'none';

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
            else if (tagHolder && miscSpace) {
                tagHolder.style.display = 'none';
                miscSpace.style.display = 'block';

                const fromSlider = this.shadowRoot.querySelector('#from-slider') as HTMLInputElement;
                const toSlider = this.shadowRoot.querySelector('#to-slider') as HTMLInputElement;
                this.fillSlider(fromSlider, toSlider, '#C6C6C6', '#602983', toSlider);
                this.setToggleAccessible(toSlider);

                fromSlider!.oninput = () => this.controlFromSlider(fromSlider, toSlider);
                toSlider!.oninput = () => this.controlToSlider(fromSlider, toSlider);
            }
        }
    }

    async connectedCallback() {
        await this.render();
    }
}

if (!customElements.get('tag-menu')) {
    customElements.define('tag-menu',TagMenu );
}

export default TagMenu;