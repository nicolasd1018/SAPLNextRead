import templateString from '../Pages/MainPage.template.html?raw';
import { book, getBook, getRecommendations } from '../API/HardcoverAPI';
import '../components/Searchbar.js'; 
import { changePage } from '../renderer';
import '../components/LoadingScreen';
import '../components/FilterModal';
import '../components/ErrorModal'
import ErrorModal from '../components/ErrorModal';
import Tag from '../Types/Tag';
import FilterModal from '../components/FilterModal';
import User from '../Types/User';




export class MainPage extends HTMLElement {
    #books: book[] = [];
    _user: User | undefined =  undefined;
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    fillBookCarousel(books: book[], bookSpace: HTMLElement, x: number) {

        try {
            bookSpace!.innerHTML = ''
            bookSpace!.innerHTML += x < 0 ? '<div style="width: 15vw; height: calc(15vw * 1.5);"></div>':`<img id="book-cover" data-book-index="${x}" class="book-cover" src=${books[x].image.url} title="${books[x].title}" style="width: 15vw; height: calc(15vw * 1.5);">`;
            bookSpace!.innerHTML += `<img id="book-cover" data-book-index="${x+1}" class="book-cover" src=${books[x+1].image.url} title="${books[x+1].title}" style="width: 23vw; height: calc(23vw * 1.5);">`;
            bookSpace!.innerHTML += `<img id="book-cover" data-book-index="${x+2}" class="book-cover" src=${books[x+2].image.url} title="${books[x+2].title}" style="width: 15vw; height: calc(15vw * 1.5);">`;
        } catch {}
    }

    async availabilityCheck(books: book[]) {
        const asyncResults = await Promise.all(
                        books.map(async (book) => {
                            const usableSubtitle = book.title.includes(book.subtitle) ? book.subtitle : '';
                            const age = await window.electronAPI.runAgeFinder(book.title.replace(book.subtitle, '').replace(usableSubtitle, '').replaceAll('%', '%25').replaceAll(' ', '%20'), usableSubtitle );
                            return {index: book.id, age: age[0] };
                        })
                    );
        books.forEach((book) => {book.ageRating = asyncResults.find((result)=> result.index === book.id)!.age!;} )
        return books.filter((book)=> book.ageRating !== 'Error Retrieving Age');
    }

    set user(newUser : User | undefined) {
        this._user = newUser ? { ...this._user, ...newUser }: undefined;
        this.render();
    }

    get user() {
        return this._user;
    }

    // 3. Example internal method that updates the lists
    addToWhiteList(item: Tag) {
        const updatedWhiteList = [...this._user!.useState.whiteList, item];
        this._user!.useState = { whiteList: updatedWhiteList, blackList: this._user!.useState.blackList, ageRange: this._user!.useState.ageRange, bipocFilter: this._user!.useState.bipocFilter, lgbtqFilter: this._user!.useState.lgbtqFilter }; // Uses the setter above
    }

    addToBlackList(item: Tag) {
        const updatedBlackList = [...this._user!.useState.blackList, item];
        this._user!.useState = { whiteList: this._user!.useState.whiteList, blackList: updatedBlackList, ageRange: this._user!.useState.ageRange, bipocFilter: this._user!.useState.bipocFilter, lgbtqFilter: this._user!.useState.lgbtqFilter }; // Uses the setter above
    }


   connectedCallback() {
        this.render()
    }

    filterBooks () {
        if ( this.user) {
            if (this.user.useState.whiteList.filter((tag) => tag.type === 'genre').length !== 0) 
                this.#books = this.#books.filter((book)=>book.genres.some((genre)=> {return this.user!.useState.whiteList.map((tag)=> tag.name).includes(genre.tag.tag);}));
            if (this.user.useState.whiteList.filter((tag) => tag.type === 'mood').length !== 0) 
                this.#books = this.#books.filter((book)=>book.moods.some((mood)=> {return this.user!.useState.whiteList.map((tag)=> tag.name).includes(mood.tag.tag);}));
            if (this.user.useState.whiteList.filter((tag) => tag.type === 'content-warning').length !== 0) 
                this.#books = this.#books.filter((book)=>book.contentWarnings.some((contentWarning)=> {return this.user!.useState.whiteList.map((tag)=> tag.name).includes(contentWarning.tag.tag);}));

            if (this.user.useState.blackList.filter((tag) => tag.type === 'genre').length !== 0) 
                this.#books = this.#books.filter((book)=>book.genres.every((genre)=> {console.log(this.user!.useState.blackList.map((tag)=> tag.name), genre.tag.tag, this.user!.useState.blackList.map((tag)=> tag.name).includes(genre.tag.tag));return !this.user!.useState.blackList.map((tag)=> tag.name).includes(genre.tag.tag);}));
            if (this.user.useState.blackList.filter((tag) => tag.type === 'mood').length !== 0)  
                this.#books = this.#books.filter((book)=>book.moods.every((mood)=> {return !this.user!.useState.blackList.map((tag)=> tag.name).includes(mood.tag.tag);}));
            if (this.user.useState.blackList.filter((tag) => tag.type === 'content-warning').length !== 0) 
                this.#books = this.#books.filter((book)=>book.contentWarnings.every((contentWarning)=> {return !this.user!.useState.blackList.map((tag)=> tag.name).includes(contentWarning.tag.tag);}));
            this.#books = this.#books.filter((book) => this.user!.useState.ageRange.includes(book.ageRating));
        }
    }

  render() {
    if (this.shadowRoot && this.user) {
        this.shadowRoot.innerHTML = templateString;
        const searchBar = this.shadowRoot.querySelector("nextread-searchbar")?.shadowRoot?.getElementById("search-bar");
        const bookSpace = this.shadowRoot.getElementById("book-space");
        const rightArrow = this.shadowRoot.getElementById("right-arrow");
        const leftArrow = this.shadowRoot.getElementById("left-arrow");
        const loadingScreen = this.shadowRoot.getElementById('loading-screen');
        const filterButton = this.shadowRoot.getElementById('filter-button');
        const filterModal = this.shadowRoot.getElementById('filter-modal');
        const errorModal = this.shadowRoot.getElementById('error-modal');
        const bookTitle = this.shadowRoot.getElementById('book-title');
        const searchedCover = this.shadowRoot.getElementById('searched-cover') as HTMLImageElement | undefined;
        const bookslike = this.shadowRoot.getElementById('books-like');
        let bookCovers: NodeListOf<Element> = document.querySelectorAll(':not(*)');;
        let x = -1;
        let iteration = 0;

        if (searchBar && searchBar instanceof HTMLInputElement) {
            searchBar.addEventListener("keydown", async (event) => {
                if (event.key === "Enter") {
                    event.preventDefault();
                    x = -1;
                    // get book recommendations from Hardcover
                    loadingScreen!.style.display = 'flex';
                    const searchedBook: book = await getBook(searchBar.value) as unknown as book;
                    this.#books = await getRecommendations(searchedBook.title, this.user!.useState.bipocFilter, this.user!.useState.lgbtqFilter);
                    // filter out all the duplicates
                    if (this.#books.length > 0) {
                        this.#books = [...new Set(this.#books.map(p => JSON.stringify(p)))].map(p => JSON.parse(p));
                    
                        // check to see if books are available in SAPL catalogue and filter out the ones that aren't
                        this.#books = await this.availabilityCheck(this.#books);

                        this.filterBooks();
                        
                        this.fillBookCarousel(this.#books, bookSpace!, x);
                        if (bookSpace && bookSpace instanceof HTMLElement)
                        {
                            bookCovers = this.shadowRoot?.querySelectorAll(".book-cover")!
                            if (bookCovers) {
                                bookCovers.forEach((bc)=> {
                                    const bookIndex = Number(bc.getAttribute('data-book-index'));
                                    if (bookIndex >= 0){
                                        bc.addEventListener("click", async (event) => {
                                            changePage(undefined, this.#books[bookIndex])
                                        })
                                    }
                                })
                            }
                        }

                        if (bookTitle && searchedBook && searchedCover && bookslike) {
                            bookslike.style.display = 'flex';
                            bookTitle.textContent = searchedBook.title;
                            bookTitle.addEventListener(('click'), () => {
                                changePage(undefined, searchedBook);
                            });
                            searchedCover.src = searchedBook.image.url;
                            searchedCover.addEventListener('click', () => {
                                changePage(undefined, searchedBook);
                            });
                        }
                    }
                    else if (errorModal && errorModal instanceof HTMLElement){
                        errorModal.setAttribute('error-title', 'Search Input Error');
                        errorModal.setAttribute('error-message', 'There has been an error finding books like the one  entered. The most likely explanation is that the title was input incorrectly. Please try again with the exact title, including exact capitalization, punctuation, and spacing.');
                        (errorModal as ErrorModal).addInformation();
                        errorModal.style.display = 'flex';
                    }
                    loadingScreen!.style.display = 'none';
                }
            });
        }

        if (rightArrow && rightArrow instanceof HTMLImageElement) {
            rightArrow.addEventListener("click", async  (event) => {
                
                x += 1;
                if (x >= this.#books.length -3){
                    iteration += 1;
                    loadingScreen!.style.display = 'flex';
                    let newBooks = await getRecommendations((searchBar as HTMLInputElement)!.value,this.user!.useState.bipocFilter, this.user!.useState.lgbtqFilter, iteration);
                    newBooks = [...new Set(newBooks.map(p => JSON.stringify(p)))].map(p => JSON.parse(p));
                    newBooks = await this.availabilityCheck(newBooks);
                    this.#books = [...this.#books, ...newBooks];
                    this.#books = [...new Set(this.#books.map(p => JSON.stringify(p)))].map(p => JSON.parse(p));
                    this.filterBooks();
                }
                this.fillBookCarousel(this.#books, bookSpace!, x);
                loadingScreen!.style.display = 'none';
                if (bookSpace && bookSpace instanceof HTMLElement)
                    {
                        bookCovers = this.shadowRoot?.querySelectorAll(".book-cover")!
                        if (bookCovers) {
                            bookCovers.forEach((bc)=> {
                                const bookIndex = Number(bc.getAttribute('data-book-index'));
                                if (x >= 0){
                                    bc.addEventListener("click", async (event) => {
                                        changePage(undefined, this.#books[bookIndex])
                                    })
                                }
                            })
                        }
                    }
            })
        }

        if (leftArrow && leftArrow instanceof HTMLImageElement) {
            leftArrow.addEventListener("click", async  (event) => {
                if (x > -1) {
                    x -= 1;
                    
                    this.fillBookCarousel(this.#books, bookSpace!, x);
                    if (bookSpace && bookSpace instanceof HTMLElement)
                    {
                        bookCovers = this.shadowRoot?.querySelectorAll(".book-cover")!
                        if (bookCovers) {
                            bookCovers.forEach((bc)=> {
                                const bookIndex = Number(bc.getAttribute('data-book-index'));
                                if (bookIndex >= 0){
                                    bc.addEventListener("click", async (event) => {
                                        changePage(undefined, this.#books[bookIndex])
                                    })
                                }
                            })
                        }
                    }
                }
            })
        }

        if (filterButton && filterButton instanceof HTMLButtonElement){
            filterButton.addEventListener('click',()=>{
                if (filterModal && filterModal instanceof HTMLElement){
                    filterModal.style.display = 'flex';
                }
            });
            (filterModal as FilterModal).setUser(this._user!);
            console.log('1.5', (filterModal as FilterModal).user);
        }
    }
  }
}

customElements.define('main-page', MainPage);
