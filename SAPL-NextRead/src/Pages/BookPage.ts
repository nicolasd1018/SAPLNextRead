import { getGenres } from '../API/HardcoverAPI';
import templateString from '../Pages/BookPage.template.html?raw';

class BookPage extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
    return ["title", "author", "description", "imgUrl", "subtitle", 'id'];
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
            const id = this.getAttribute('id');
            const genreSpace = this.shadowRoot.getElementById('genre-space');

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

            if (id){
                const genres = await getGenres(Number(id));
                genres.forEach((genre, index) => {
                    const genreTag = document.createElement('div');
                    genreTag.id = `genre-tag-${index}`;
                    genreTag.className = 'tag';
                    genreTag.innerText = genre;
                    genreSpace?.appendChild(genreTag);
                })
            }
        }
    }
}

if (!customElements.get('book-page')) {
    customElements.define('book-page',BookPage );
}

export default BookPage;