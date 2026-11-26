import User from "../Types/User";
import templateString from '../Pages/SettingsPage.template.html?raw';
import { changePage, setUser } from "../renderer";
import AddListModal from "../components/addListModal";
import "../components/addListModal";
import addListModal from "../components/addListModal";

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

    async render() {
        if (this.shadowRoot) {
            this.shadowRoot.innerHTML = templateString;
            const saveImageButton : HTMLButtonElement | undefined = this.shadowRoot.getElementById('save-picture') as HTMLButtonElement | undefined;
            const imageInput : HTMLInputElement | undefined = this.shadowRoot.getElementById('picture-input') as HTMLInputElement | undefined;
            const allowListsCheckbox : HTMLInputElement | undefined = this.shadowRoot.getElementById('allow-lists') as HTMLInputElement | undefined;
            const ratingThresholdInput : HTMLInputElement | undefined = this.shadowRoot.getElementById('rating-threshold-input') as HTMLInputElement | undefined;
            const firstNameInput : HTMLInputElement | undefined = this.shadowRoot.getElementById('name-input') as HTMLInputElement | undefined; 
            const lastNameInput : HTMLInputElement | undefined = this.shadowRoot.getElementById('last-name-input') as HTMLInputElement | undefined;
            const emailInput : HTMLInputElement | undefined = this.shadowRoot.getElementById('email-input') as HTMLInputElement | undefined;
            const addressInput : HTMLInputElement | undefined = this.shadowRoot.getElementById('address-input') as HTMLInputElement | undefined;
            const genderInput : HTMLInputElement | undefined = this.shadowRoot.getElementById('gender-input') as HTMLInputElement | undefined;
            const saveSettingsButton : HTMLButtonElement | undefined = this.shadowRoot.getElementById('save-settings') as HTMLButtonElement | undefined;
            const usernameInput : HTMLInputElement | undefined = this.shadowRoot.getElementById('username-input') as HTMLInputElement | undefined;
            const passwordInput : HTMLInputElement | undefined = this.shadowRoot.getElementById('password-input') as HTMLInputElement | undefined;
            const addListButton : HTMLButtonElement | undefined = this.shadowRoot.getElementById('add-list') as HTMLButtonElement | undefined;
            const deleteListButton : HTMLButtonElement | undefined = this.shadowRoot.getElementById('delete-list') as HTMLButtonElement | undefined;
            const listSelect : HTMLSelectElement | undefined = this.shadowRoot.getElementById('list-select') as HTMLSelectElement | undefined;
            const addListModal = this.shadowRoot?.querySelector('add-list-modal') as AddListModal | undefined;
            addListModal!.user = this.user;

            if (allowListsCheckbox && this.user) {
                allowListsCheckbox.checked = this.user.allowedToUseData;
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
            }
            if (firstNameInput && this.user) {
                firstNameInput.value = this.user.firstName ;
                
            }
            if (lastNameInput && this.user) {
                lastNameInput.value = this.user.lastName ;
            }
            if (emailInput && this.user) {
                emailInput.value = this.user.email ;
            }
            if (addressInput && this.user) {
                addressInput.value = this.user.address ;
            }
            if (genderInput && this.user) {
                genderInput.value = this.user.gender ;
            }
            if (usernameInput && this.user) {
                usernameInput.value = this.user.userName;
            }
            if (passwordInput && this.user) {
                passwordInput.value = "";
                passwordInput.placeholder = "Leave blank to keep password.";
            }

            if (saveSettingsButton) {
                saveSettingsButton.addEventListener('click', async () => {
                    if (this.user) {
                        const updatedUser: User = {
                            ...this.user,
                            firstName: firstNameInput?.value ?? this.user.firstName,
                            lastName: lastNameInput?.value ?? this.user.lastName,
                            email: emailInput?.value ?? this.user.email,
                            address: addressInput?.value ?? this.user.address,
                            gender: genderInput?.value ?? this.user.gender
                        };
                        const newThreshold = parseInt(ratingThresholdInput!.value); 
                        if (!isNaN(newThreshold) && newThreshold >= 0 && newThreshold <= 5) {
                            const updatedUser: User = {...this.user!, bookRatingThreshold: newThreshold};
                            await window.api.updateBookRatingThreshold(this.user!.id, newThreshold);
                            setUser(updatedUser);
                        }
                        if (updatedUser.firstName !== this.user.firstName) {
                            await window.api.updateFirstName(this.user.id, updatedUser.firstName);
                        }
                        if (updatedUser.lastName !== this.user.lastName) {
                            await window.api.updateLastName(this.user.id, updatedUser.lastName);
                        }
                        if (updatedUser.email !== this.user.email) {
                            await window.api.updateEmail(this.user.id, updatedUser.email);
                        }
                        if (updatedUser.address !== this.user.address) {
                            await window.api.updateAddress(this.user.id, updatedUser.address);
                        }
                        if (updatedUser.gender !== this.user.gender) {
                            await window.api.updateGender(this.user.id, updatedUser.gender);
                        }
                        if (usernameInput && usernameInput.value !== this.user.userName) {
                            // Assuming you have a method to update the username in your API
                            await window.api.updateUsername(this.user.id, usernameInput.value);
                            updatedUser.userName = usernameInput.value;
                        }
                        if (passwordInput && passwordInput.value && passwordInput.value !== "") {
                            // Assuming you have a method to update the password in your API
                            await window.api.updatePassword(this.user.id, passwordInput.value);
                        }
                        setUser(updatedUser);
                    }
                });
            }

            if (addListButton) {
                addListButton.addEventListener('click', () => {
                    
                    if (addListModal) {
                        addListModal.style.display = 'flex';
                    }
                });
            }

            if (deleteListButton && listSelect) {
                deleteListButton.addEventListener('click', async () => {
                    const selectedListId = parseInt(listSelect.value);
                    await window.api.deleteList(selectedListId);
                    const updatedUser = await window.api.getUser(this.user!.id);
                    setUser(updatedUser);
                    const selectedOption = listSelect.querySelector(`option[value="${selectedListId}"]`);
                    if (selectedOption) {
                        listSelect.removeChild(selectedOption);
                    }
                });
            }

            if (addListModal) {
                addListModal.addEventListener('create-new-list', (event) => {
                    const newListId = (event as CustomEvent<{ id: number }>).detail.id;
                    const newOption = document.createElement('option');
                    newOption.value = newListId.toString();
                    newOption.textContent = `List ${newListId}`;
                    listSelect?.appendChild(newOption);
                });
            }

            if (listSelect && this.user) {
                this.user.searchLists.filter((list) => list.name !== 'Liked Books' && list.name !== 'Disliked Books').forEach((list) => {
                    const option = new Option(list.name, list.id.toString());
                    listSelect?.appendChild(option);
                });
            }
        }
    }
}

customElements.define('settings-page', SettingsPage);