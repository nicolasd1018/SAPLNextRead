import templateString from '../components/PasswordModal.template.html?raw';
import bcrypt from "bcryptjs";

export default class PasswordModal extends HTMLElement{
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    _password = '';

    get password () {
        return this._password;
    }

    set password (password: string) {
        this._password = password;
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

                submitButton.addEventListener('click', ()=>{
                    console.log(bcrypt.compareSync(passwordInput.value, this.password));
                    
                });
            }

        }
    }
}

if (!customElements.get('password-modal')) {
    customElements.define('password-modal',PasswordModal );
}