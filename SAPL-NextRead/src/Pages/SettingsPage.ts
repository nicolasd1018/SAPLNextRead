import User from "../Types/User";
import templateString from '../Pages/SettingsPage.template.html?raw';
import { changePage, setUser } from "../renderer";

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
            const allowListsCheckbox : HTMLInputElement | undefined = this.shadowRoot.getElementById('allow-lists') as HTMLInputElement | undefined;
            const ratingThresholdInput : HTMLInputElement | undefined = this.shadowRoot.getElementById('rating-threshold-input') as HTMLInputElement | undefined;
            if (allowListsCheckbox && this.user) {
                allowListsCheckbox.checked = this.user.allowedToUseData;
                console.log(allowListsCheckbox.checked);
                allowListsCheckbox.addEventListener('change', async () => {
                    if (this.user) {
                        const updatedUser: User = {...this.user!, allowedToUseData: allowListsCheckbox.checked};
                        await window.api.updateAllowedToUseData(this.user!.id, allowListsCheckbox.checked);
                        setUser(updatedUser);
                    }
                });
            }
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
                    window.api.updateProfilePicture(this.user!.id,binaryData).then(() => {
                        const blob = new Blob([binaryData]);
                        const imageUrl = URL.createObjectURL(blob);
                        const updatedUser: User = {...this.user!, profilePicture: imageUrl}
                        setUser(updatedUser);
                    });
                    imageInput.value = '';
                })
            }
            if (ratingThresholdInput && this.user) {
                ratingThresholdInput.value = this.user.bookRatingThreshold.toString();
                ratingThresholdInput.addEventListener('change', async () => {
                    const newThreshold = parseInt(ratingThresholdInput.value); 
                    if (!isNaN(newThreshold) && newThreshold >= 0 && newThreshold <= 5) {
                        const updatedUser: User = {...this.user!, bookRatingThreshold: newThreshold};
                        await window.api.updateBookRatingThreshold(this.user!.id, newThreshold);
                        setUser(updatedUser);
                    }
                });
            }
        }
    }
}

customElements.define('settings-page', SettingsPage);