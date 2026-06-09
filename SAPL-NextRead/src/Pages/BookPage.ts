import templateString from '../Pages/BookPage.template.html?raw';

class BookPage extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
    return ["title", "author", "description", "imgUrl", "subtitle"];
  }


    connectedCallback() {
        if (this.shadowRoot) {
            this.shadowRoot.innerHTML = templateString;
            const imgUrl = this.getAttribute('imgUrl');
            const bookCover = this.shadowRoot.getElementById('book-cover');
            const title = this.getAttribute('title');
            const bookTitle = this.shadowRoot.getElementById('title');
            const subtitle = this.getAttribute('subtitle');
            const subtitleSpace = this.shadowRoot.getElementById('subtitle')
            const author = this.getAttribute('author');
            const authorText = this.shadowRoot.getElementById('author');
            const description = this.getAttribute('description');
            const descriptionText = this.shadowRoot.getElementById('description')

            if (imgUrl && bookCover && bookCover instanceof HTMLImageElement){
                bookCover.src = imgUrl;
            }

            if (title && bookTitle && bookTitle instanceof HTMLElement){
                if (subtitle) {
                    title.replace(subtitle, "")
                }
                bookTitle.innerHTML = title;
            }

            if (subtitle && subtitleSpace && subtitleSpace instanceof HTMLElement) {
                    subtitleSpace.innerHTML = subtitle;
            }

            if (author && authorText && authorText instanceof HTMLElement){
                authorText.innerHTML = `By ${author}`;
            }

            if (description && descriptionText && descriptionText instanceof HTMLElement){
                descriptionText.innerHTML = description;
            }
        }
    }
}

if (!customElements.get('book-page')) {
    customElements.define('book-page',BookPage );
}

export default BookPage;