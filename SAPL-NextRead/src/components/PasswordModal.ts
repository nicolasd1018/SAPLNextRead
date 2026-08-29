import templateString from '../components/PasswordModal.template.html?raw';
import bcrypt from "bcryptjs";
import { changePage } from '../renderer';

export default class PasswordModal extends HTMLElement{
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    _password = '';
    _userId: number = -1;

    get password () {
        return this._password;
    }

    set password (password: string) {
        this._password = password;
    }

    get userId() {
        return this._userId;
    }

    set userId (id: number) {
        this._userId = id;
    }

    async connectedCallback() {
        if (this.shadowRoot) {
            this.shadowRoot.innerHTML = templateString;
            const closeButton = this.shadowRoot.getElementById('close-button');
            const submitButton = this.shadowRoot.getElementById('submit-button') as HTMLButtonElement;
            const passwordInput = this.shadowRoot.getElementById('password') as HTMLInputElement;
            
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    passwordInput.value = '';
                    this.style.display = 'none';
                });
            }

            if (submitButton && passwordInput) {
                passwordInput.addEventListener('input', () => {
                    if (passwordInput.value === '')
                        submitButton.disabled = true;
                    else
                        submitButton.removeAttribute('disabled');
                });

                submitButton.addEventListener('click', async ()=>{
                    if (bcrypt.compareSync(passwordInput.value, this.password)) {
                        const user = await window.api.getUser(this.userId);
                        changePage(user);
                    }
                    
                });
            }

        }
    }
}

if (!customElements.get('password-modal')) {
    customElements.define('password-modal',PasswordModal );
}