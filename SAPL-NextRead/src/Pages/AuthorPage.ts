import Author from "../Types/Author";
import templateString from '../Pages/AuthorPage.template.html?raw';

export default class AuthorPage extends HTMLElement {
    _author?: Author;
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    get author() {
        return this._author;
    }

    set author(author: Author | undefined) {
        this._author = author;
        this.render();
    }

    connectedCallback() {
        this.render();
    }

    render() {
        console.log(this.author);
        if (this.shadowRoot && this.author){
            this.shadowRoot.innerHTML = templateString;
            const authorImg = this.shadowRoot.getElementById('author-img') as HTMLImageElement | undefined;
            const authorName = this.shadowRoot.getElementById('author-name') as HTMLElement | undefined;

            if (authorImg) {
                authorImg.src = this.author.image.url;
            }

            if (authorName) {
                authorName.innerText = `${this.author.title ?? ''} ${this.author.name}`
            }
        }
    }
}

customElements.define('author-page', AuthorPage);