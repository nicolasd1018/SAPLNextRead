import templateString from '../components/searchBar.template.html?raw'
import User from '../Types/User';

class Searchbar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }
    _mode = "title"
    _user: User | undefined = undefined;

    get mode() {
        return this._mode;
    }

    private set mode(mode: string) {
        this._mode = mode;
    }

    get user() {
        return this._user;
    }

    set user(user: User | undefined) {
        this._user = user;
        this.render();
    }

    connectedCallback() {
        this.render();
    }

    render() {
        if (this.shadowRoot && this.user) {
            this.shadowRoot.innerHTML = templateString;
            const modeSelect = this.shadowRoot.getElementById('search-type');
            const searchInput = this.shadowRoot.getElementById('search-bar') as HTMLInputElement;
            const bookListSelect = this.shadowRoot.getElementById("book-lists-search") as HTMLSelectElement;
            const listSearchButton = this.shadowRoot.getElementById("list-search-button") as HTMLButtonElement | undefined;

            if (modeSelect) {
                modeSelect.addEventListener('change', (event) => {
                    if ((event.target as HTMLSelectElement).value === 'title') {
                        this.mode = 'title';
                        searchInput.removeAttribute('pattern');
                        searchInput.disabled = false;
                        searchInput.value = '';
                        bookListSelect.style.display = "none";
                        listSearchButton!.style.display = "none";
                    }
                    else if ((event.target as HTMLSelectElement).value === 'isbn10') {
                        this.mode = 'isbn10';
                        searchInput.pattern = '[0-9]';
                        searchInput.disabled = false;
                        searchInput.value = '';
                        bookListSelect.style.display = "none";
                        listSearchButton!.style.display = "none";
                    }
                    else if ((event.target as HTMLSelectElement).value === 'isbn13') {
                        this.mode = 'isbn13';
                        searchInput.pattern = '[0-9]';
                        searchInput.disabled = false;
                        searchInput.value = '';
                        bookListSelect.style.display = "none";
                        listSearchButton!.style.display = "none";
                    }
                    else if ((event.target as HTMLSelectElement).value === 'author') {
                        this.mode = 'author';
                        searchInput.removeAttribute('pattern');
                        searchInput.disabled = false;
                        searchInput.value = '';
                        bookListSelect.style.display = "none";
                        listSearchButton!.style.display = "none";
                    }
                    else if ((event.target as HTMLSelectElement).value === 'publisher') {
                        this.mode = 'publisher';
                        searchInput.removeAttribute('pattern');
                        searchInput.disabled = false;
                        searchInput.value = '';
                        bookListSelect.style.display = "none";
                        listSearchButton!.style.display = "none";
                    }
                    else if ((event.target as HTMLSelectElement).value === 'like-dislike') {
                        this.mode = 'like-dislike';
                        searchInput.removeAttribute('pattern');
                        searchInput.disabled = true;
                        searchInput.value = '';
                        bookListSelect.style.display = "none";
                        listSearchButton!.style.display = "none";
                        this.dispatchEvent(new CustomEvent('change-search-criteria'));
                    }
                    else if ((event.target as HTMLSelectElement).value === "book-list") {
                        this.mode = "book-list";
                        bookListSelect.style.display = "block";
                        listSearchButton!.style.display = "block";
                        searchInput.disabled = true;
                        searchInput.value = '';
                    }
                    
                });
            }

            searchInput.addEventListener('input', () =>{
                if (!searchInput.checkValidity())
                {
                    searchInput.value = searchInput.value.replace(/[^0-9 ]/g, ''); 
                }
            });

            this.user.searchLists.forEach((list) => {
                if (list.name !== "Liked Books" && list.name !== "Disliked Books"){
                    const newOption = new Option(list.name, list.name);
                    bookListSelect.appendChild(newOption);
                }
            });

            if (listSearchButton) {
                listSearchButton.addEventListener("click", ()=>{
                    this.dispatchEvent(new CustomEvent('search-by-list', {detail: {list: this.user?.searchLists.find((list) => list.name === bookListSelect.value)}}));
                })
            }
        }
    }
}

if (!customElements.get('nextread-searchbar')) {
    customElements.define('nextread-searchbar',Searchbar );
}

export default Searchbar;