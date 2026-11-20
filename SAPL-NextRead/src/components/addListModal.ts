import templateString from '../components/addListModal.template.html?raw';
import { setUser } from '../renderer';
import User from '../Types/User';

export default class AddListModal extends HTMLElement {
    _user: User | undefined = undefined;

    get user() {
        return this._user;
    }
    set user(user: User | undefined) {
        this._user = user;
    }
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        if (this.shadowRoot) {
            this.shadowRoot.innerHTML = templateString;
            const closeButton = this.shadowRoot.getElementById('close-button');
            const createListButton = this.shadowRoot.getElementById('add-list-button') as HTMLButtonElement;
            const listNameInput = this.shadowRoot.getElementById('list-name') as HTMLInputElement;

            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    listNameInput.value = '';
                    this.style.display = 'none';
                });
            }

            if (listNameInput) {
                listNameInput.addEventListener('input', () => {
                    if (listNameInput.checkValidity() && createListButton) {
                        createListButton.disabled = false;
                    } else if (createListButton) {
                        createListButton.disabled = true;
                    }
                });
            }

            if (createListButton && listNameInput) {
                createListButton.addEventListener('click', async () => {
                    await window.api.addList(this.user?.id ?? 0, listNameInput.value);
                    window.api.getUser(this.user?.id ?? 0).then((updatedUser) => {
                        setUser(updatedUser);
                        listNameInput.value = '';
                    });
                });
            }
        }
    }
}

if (!customElements.get('add-list-modal')) {
    customElements.define('add-list-modal', AddListModal);
}