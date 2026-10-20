import User from "../Types/User";
import templateString from '../Pages/SettingsPage.template.html?raw';

export class SettingsPage extends HTMLElement {
    _user: User | undefined = undefined;

    get user() {
        return this._user
    }

    set user(user: User | undefined) {
        this._user = user;
        this.render();
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    render() {
        if (this.shadowRoot) {
            this.shadowRoot.innerHTML = templateString;
            const saveImageButton : HTMLButtonElement | undefined = this.shadowRoot.getElementById('save-picture') as HTMLButtonElement | undefined;
            const imageInput : HTMLInputElement | undefined = this.shadowRoot.getElementById('picture-input') as HTMLInputElement | undefined;

            if (saveImageButton && imageInput) {
                imageInput.addEventListener('change', (event) => {
                    if ((event.target as HTMLInputElement).files?.length !== 0)
                        saveImageButton.disabled = false;
                    else 
                        saveImageButton.disabled = true;
                });

                saveImageButton.addEventListener('click', async () => {
                    const imgFile = imageInput.files![0];
                    const buffer = await imgFile.arrayBuffer();
                    const binaryData = new Uint8Array(buffer);
                })
            }
        }
    }
}

customElements.define('settings-page', SettingsPage);