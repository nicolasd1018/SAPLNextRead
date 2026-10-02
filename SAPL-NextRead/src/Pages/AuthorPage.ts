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
            const birthDate = this.shadowRoot.getElementById('birth-date') as HTMLElement | undefined;
            const deathDate = this.shadowRoot.getElementById('death-date') as HTMLElement | undefined;
            const location = this.shadowRoot.getElementById('location') as HTMLElement | undefined;
            const bookNum = this.shadowRoot.getElementById('book-num') as HTMLElement | undefined;
            const description = this.shadowRoot.getElementById('description') as HTMLElement | undefined;
            const lgbtqTag = this.shadowRoot.getElementById('lgbtq') as HTMLElement | undefined;
            const bipocTag = this.shadowRoot.getElementById('bipoc') as HTMLElement | undefined;


            if (authorImg) {
                console.log(this.author.image);
                authorImg.src = this.author.image === null ? '' :this.author.image.url;
            }

            if (authorName) {
                authorName.innerText = `${this.author.title ?? ''} ${this.author.name}`
            }

            if(birthDate) {
                birthDate.innerText = `Born: ${this.author.born_date}`;
            }

            if (deathDate) {
                deathDate.innerText = `Death: ${this.author.death_date}`;
            }

            if (location) {
                location.innerText = `Location: ${this.author.location}`;
            }

            if (bookNum) {
                bookNum.innerText = `Number of Books: ${this.author.books_count}`;
            }

            if (description) {
                description.innerText = this.author.bio;
            } 

            if (lgbtqTag) {
                if (this.author.is_lgbtq) {
                    lgbtqTag.style.display = 'flex';
                }
            }
            if (bipocTag) {
                if (this.author.is_bipoc) {
                    bipocTag.style.display = 'flex';
                }
            }
        }
    }
}

customElements.define('author-page', AuthorPage);