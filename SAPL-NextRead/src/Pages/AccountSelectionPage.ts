import templateString from '../Pages/AccountSelectionPage.template.html?raw';
import '../components/addUserModal'
import AddUserModal from '../components/addUserModal';
import '../components/PasswordModal';
import PasswordModal from '../components/PasswordModal';
import { changePage } from '../renderer';

export default class AccountSelectionPage extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        await this.render()
    }

    async render() {
        if (this.shadowRoot) {
            this.shadowRoot.innerHTML = templateString;
            const container = this.shadowRoot.getElementById('account-selection-page-container');
            const createUserButton = this.shadowRoot.getElementById('create-new-account-button');
            const addUserModal = this.shadowRoot.querySelector('add-user-modal') as AddUserModal;
            const users = await window.api.getUsers();

            if (container) {
                
                users.forEach(user => {
                    const userHolder = document.createElement('div');
                    userHolder.id = `${user.id}-${user.userName}-holder`;
                    userHolder.className = 'user-holder';
                    
                    const userButton = document.createElement('input') as HTMLInputElement;
                    userButton.type = 'image';
                    userButton.src = '/placeholder_profile_pick.png';
                    userButton.className = 'user-button';
                    userButton.id = `${user.id}-${user.userName}-button`;

                    const userLabel = document.createElement('label') as HTMLLabelElement;
                    userLabel.htmlFor = userButton.id;
                    userLabel.textContent = user.userName

                    userHolder.append(userButton);
                    userHolder.append(userLabel);
                    container.prepend(userHolder);
                });
            }

            if (createUserButton && addUserModal) {
                createUserButton.addEventListener('click', () => {
                    addUserModal.style.display = 'inline';
                });
                addUserModal.addEventListener('create-new-user', async () => {
                    await this.render();
                })
            }

            const userPics = this.shadowRoot.querySelectorAll('.user-button');
            userPics.forEach((userPic) => {
                userPic.addEventListener('click', async ()=>{
                    const id: number = Number(userPic.id.split('-')[0]);
                    const passwordModal = this.shadowRoot?.querySelector('password-modal');
                    const password = await window.api.getPassword(id);
                    if (password !== null && passwordModal) {
                        (passwordModal as PasswordModal).password = password;
                        (passwordModal as PasswordModal).userId = id;
                        (passwordModal as PasswordModal).style.display = 'flex';
                    }
                    else {
                        const user = await window.api.getUser(id);
                        changePage(user);
                    }
                })
            })
        }
    }
}

if (!customElements.get('account-selection-page')) {
    customElements.define('account-selection-page',AccountSelectionPage );
}
