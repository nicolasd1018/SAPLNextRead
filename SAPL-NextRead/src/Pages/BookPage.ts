import { add } from 'mathjs';
import templateString from '../Pages/BookPage.template.html?raw';
import User from '../Types/User';

class BookPage extends HTMLElement {
    private _bookSeries:{position: number, series: {name: string, books_count: number}}[] = [];
    private _user: User | undefined = undefined;

    get bookSeries(): {position: number, series: {name: string, books_count: number}}[] {
        return this._bookSeries;
    }

    set bookSeries(bookSeries: {position: number, series: {name: string, books_count: number}}[]) {
        this._bookSeries = bookSeries;
    }

    get user(): User | undefined {
        return this._user;
    }

    set user(user: User | undefined) {
        this._user = user;
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ["bookTitle", "author", "description", "imgUrl", "subtitle", 'id', 'genres', 'moods', 'contentWarning', 'ageRating'];
    }

    async connectedCallback() {
        if (this.shadowRoot) {
            this.shadowRoot.innerHTML = templateString;
            const imgUrl = this.getAttribute('imgUrl');
            const bookCover = this.shadowRoot.getElementById('book-cover');
            const title = this.getAttribute('bookTitle');
            const bookTitle = this.shadowRoot.getElementById('title');
            const author = this.getAttribute('author');
            const authorText = this.shadowRoot.getElementById('author');
            const description = this.getAttribute('description');
            const descriptionText = this.shadowRoot.getElementById('description');
            const genreSpace = this.shadowRoot.getElementById('genre-space');
            const genres = this.getAttribute('genres');
            const warningSpace = this.shadowRoot.getElementById('warning-space');
            const contentWarnings = this.getAttribute('contentWarnings');
            const moodSpace = this.shadowRoot.getElementById('mood-space');
            const moods = this.getAttribute('moods');
            const ageTag = this.shadowRoot.getElementById('age-rating');
            const ageRating = this.getAttribute('ageRating');
            const seriesTracker = this.shadowRoot.getElementById('series-tracker');
            const addToList = this.shadowRoot.getElementById('add-to-list');
            const removeFromList = this.shadowRoot.getElementById('remove-from-list');


            if (imgUrl && bookCover && bookCover instanceof HTMLImageElement){
                bookCover.src = imgUrl;
            }

            if (title && bookTitle && bookTitle instanceof HTMLElement){
                bookTitle.innerHTML = title;
            }

            if (author && authorText && authorText instanceof HTMLElement){
                authorText.innerHTML = `By ${author}`;
            }

            if (description && descriptionText && descriptionText instanceof HTMLElement){
                descriptionText.innerHTML = description;
            }

            if (genres && genreSpace){
                genres.split(',').forEach((genre, index) => {
                    const genreTag = document.createElement('div');
                    genreTag.id = `genre-tag-${index}`;
                    genreTag.className = 'tag';
                    genreTag.innerText = genre;
                    genreSpace?.appendChild(genreTag);
                });
            }

            if (contentWarnings && warningSpace) {
                contentWarnings.split(',').forEach((warning, index)=>{
                    const warningTag = document.createElement('div');
                    warningTag.id = `warning-tag-${index}`;
                    warningTag.className = 'tag';
                    warningTag.innerText = warning;
                    warningSpace?.appendChild(warningTag);
                });
            }

            if (moodSpace && moods) {
                moods.split(',').forEach((mood, index)=>{
                    const moodTag = document.createElement('div');
                    moodTag.id = `mood-tag-${index}`;
                    moodTag.className = 'tag';
                    moodTag.innerText = mood;
                    moodSpace?.appendChild(moodTag);
                });
            }

            if (ageRating && ageTag) {
                ageTag.innerText = ageRating;
                if (ageRating === 'Toddler') {
                    ageTag.title = 'Under 5'
                }
                else if (ageRating === 'Juvenile Beginner') {
                    ageTag.title = '5 to 7'
                }
                else if (ageRating === 'Juvenile') {
                    ageTag.title = '8 to 12'
                }
                else if (ageRating === 'Young Adult') {
                    ageTag.title = '13 to 18'
                }
                else if (ageRating === 'Adult') {
                    ageTag.title = 'Not written with children in mind'
                }
            }

            if (seriesTracker && this.bookSeries.length > 0) {
                this.bookSeries.forEach((series)=> {
                    const seriesLine = document.createElement('div');
                    seriesLine.textContent = `${series.position} of ${series.series.books_count} in ${series.series.name}`;
                    seriesTracker.appendChild(seriesLine);
                })
            }

            if (addToList && removeFromList) {
                this.user?.searchLists.forEach((list)=> {
                    if (!list.books.includes(title!)) {
                        const option = document.createElement('option') as HTMLOptionElement;
                        option.id = `add-to-list-${list.id}`;
                        option.value = `${list.id}`;
                        option.textContent = list.name;
                        addToList.appendChild(option);
                    }
                });
                
                addToList.addEventListener('change', (event) => {
                    const id = Number((event.target as HTMLSelectElement).value);
                    (addToList as HTMLSelectElement).value = "";

                    window.api.updateList(id,[...this.user!.searchLists.find((list)=> list.id === id)!.books, title!]).then(()=>{
                        this.user!.searchLists.find((list)=> list.id === id)!.books=[...this.user!.searchLists.find((list)=> list.id === id)!.books, title!];
                        const option = this.shadowRoot?.getElementById(`add-to-list-${id}`)!;
                        addToList.removeChild(option);
                        option.id = option.id.replace('add-to-list', 'remove-from-list');
                        removeFromList.appendChild(option);
                    })
                });

                this.user?.searchLists.forEach((list)=> {
                    if (list.books.includes(title!)) {
                        const option = document.createElement('option') as HTMLOptionElement;
                        option.id = `remove-from-list-${list.id}`;
                        option.value = `${list.id}`;
                        option.textContent = list.name;
                        removeFromList.appendChild(option);
                    }
                });

                removeFromList.addEventListener('change', (event) => {
                    const id = Number((event.target as HTMLSelectElement).value);
                    (removeFromList as HTMLSelectElement).value = "";

                    window.api.updateList(id,this.user!.searchLists.find((list)=> list.id === id)!.books.filter((book)=>book !== title)).then(()=>{
                        this.user!.searchLists.find((list)=> list.id === id)!.books=[...this.user!.searchLists.find((list)=> list.id === id)!.books, title!];

                        const option = this.shadowRoot?.getElementById(`remove-from-list-${id}`)!;
                        console.log(option);
                        removeFromList.removeChild(option);
                        option.id = option.id.replace('remove-from-list', 'add-to-list');
                        addToList.appendChild(option);
                    })
                });
            }
        }
    }
}

if (!customElements.get('book-page')) {
    customElements.define('book-page',BookPage );
}

export default BookPage;