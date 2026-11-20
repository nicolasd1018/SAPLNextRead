import templateString from '../components/addUserModal.template.html?raw';

export default class AddUserModal extends HTMLElement{
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        if (this.shadowRoot) {
            this.shadowRoot.innerHTML = templateString;
            const closeButton = this.shadowRoot.getElementById('close-button');
            const createUserButton = this.shadowRoot.getElementById('save-button') as HTMLButtonElement;

            const usernameInput = this.shadowRoot.getElementById('username') as HTMLInputElement;
            const passwordInput = this.shadowRoot.getElementById('password') as HTMLInputElement;
            const confirmPasswordInput = this.shadowRoot.getElementById('confirm-password') as HTMLInputElement;
            const addressInput = this.shadowRoot.getElementById('address') as HTMLInputElement;
            const firstNameInput = this.shadowRoot.getElementById('first-name') as HTMLInputElement;
            const lastNameInput = this.shadowRoot.getElementById('last-name') as HTMLInputElement;
            const emailInput = this.shadowRoot.getElementById('email') as HTMLInputElement;
            const genderInput = this.shadowRoot.getElementById('gender') as HTMLInputElement;
            
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    usernameInput.value = '';
                    addressInput.value = '';
                    firstNameInput.value = '';
                    lastNameInput.value = '';
                    emailInput.value = '';
                    genderInput.value = ''; 
                    this.style.display = 'none';
                });
            }

            if (usernameInput) {
                usernameInput.addEventListener('input', () => {
                    if (usernameInput.checkValidity() && createUserButton && passwordInput.checkValidity() && confirmPasswordInput.value === passwordInput.value) {
                        createUserButton.disabled = false;
                    } else if (createUserButton ) {
                    }
                })
            }

            if (createUserButton && usernameInput) {
                createUserButton.addEventListener('click', async ()=>{
                    const id = await window.api.addUser(usernameInput.value, (passwordInput.value ?? undefined), addressInput.value, firstNameInput.value, lastNameInput.value, emailInput.value, genderInput.value);
                    usernameInput.value = '';
                    this.style.display = 'none';
                    this.dispatchEvent(new CustomEvent('create-new-user', {detail: {id: id}}));
                })
            }

            if (passwordInput && confirmPasswordInput) {
                passwordInput.addEventListener('input', ()=>{
                    if (passwordInput.checkValidity() && confirmPasswordInput.value === passwordInput.value && usernameInput.checkValidity()) {
                        createUserButton.disabled = false;
                    }
                    else {
                        createUserButton.disabled = true;
                    }
                });
                confirmPasswordInput.addEventListener('input', ()=>{
                    if (passwordInput.checkValidity() && confirmPasswordInput.value === passwordInput.value && usernameInput.checkValidity()) {
                        createUserButton.disabled = false;
                    }
                    else {
                        createUserButton.disabled = true;
                    }
                });
            }
        }
    }
}

if (!customElements.get('add-user-modal')) {
    customElements.define('add-user-modal',AddUserModal );
}