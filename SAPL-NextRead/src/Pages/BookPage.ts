import templateString from '../Pages/BookPage.template.html?raw';

class BookPage extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ["title", "author", "description", "imgUrl", "subtitle", 'id', 'genres', 'moods', 'contentWarning'];
    }

    async connectedCallback() {
        if (this.shadowRoot) {
            this.shadowRoot.innerHTML = templateString;
            const imgUrl = this.getAttribute('imgUrl');
            const bookCover = this.shadowRoot.getElementById('book-cover');
            const title = this.getAttribute('title');
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

            if (imgUrl && bookCover && bookCover instanceof HTMLImageElement){
                bookCover.src = imgUrl;
            }

            if (title && bookTitle && bookTitle instanceof HTMLElement){
                bookTitle.innerHTML = title;
                const result = await window.electronAPI.runAgeFinder(title.replaceAll('%', '%25').replaceAll(' ', '%20'));
                console.log(result);
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

        }
    }
}

if (!customElements.get('book-page')) {
    customElements.define('book-page',BookPage );
}

export default BookPage;