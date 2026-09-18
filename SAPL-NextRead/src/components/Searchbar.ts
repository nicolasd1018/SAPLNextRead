import templateString from '../components/searchBar.template.html?raw'

class Searchbar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }
    _mode = "title"

    get mode() {
        return this._mode;
    }

    private set mode(mode: string) {
        this._mode = mode;
    }

    connectedCallback() {
        if (this.shadowRoot) {
            this.shadowRoot.innerHTML = templateString;
            const modeSelect = this.shadowRoot.getElementById('search-type');
            const searchInput = this.shadowRoot.getElementById('search-bar') as HTMLInputElement;

            if (modeSelect) {
                modeSelect.addEventListener('change', (event) => {
                    if ((event.target as HTMLSelectElement).value === 'title') {
                        this.mode = 'title';
                        searchInput.removeAttribute('pattern');
                        searchInput.disabled = false;
                        searchInput.value = '';
                    }
                    else if ((event.target as HTMLSelectElement).value === 'isbn10') {
                        this.mode = 'isbn10';
                        searchInput.pattern = '[0-9]';
                        searchInput.disabled = false;
                        searchInput.value = '';
                    }
                    else if ((event.target as HTMLSelectElement).value === 'isbn13') {
                        this.mode = 'isbn13';
                        searchInput.pattern = '[0-9]';
                        searchInput.disabled = false;
                        searchInput.value = '';
                    }
                    else if ((event.target as HTMLSelectElement).value === 'author') {
                        this.mode = 'author';
                        searchInput.removeAttribute('pattern');
                        searchInput.disabled = false;
                        searchInput.value = '';
                    }
                    else if ((event.target as HTMLSelectElement).value === 'like-dislike') {
                        this.mode = 'like-dislike';
                        searchInput.removeAttribute('pattern');
                        searchInput.disabled = true;
                        searchInput.value = '';
                        this.dispatchEvent(new CustomEvent('change-search-criteria'));
                    }
                    
                });
            }

            searchInput.addEventListener('input', () =>{
                if (!searchInput.checkValidity())
                {
                    console.log(searchInput.pattern);
                    searchInput.value = searchInput.value.replace(/[^0-9 ]/g, ''); 
                }
            });

            
        }
    }
}

if (!customElements.get('nextread-searchbar')) {
    customElements.define('nextread-searchbar',Searchbar );
}

export default Searchbar;