import templateString from '../Pages/AccountSelectionPage.template.html?raw';
import '../components/addUserModal'
import AddUserModal from '../components/addUserModal';

export default class AccountSelectionPage extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render()
    }

    render() {
        
        if (this.shadowRoot) {
            this.shadowRoot.innerHTML = templateString;
            const createUserButton = this.shadowRoot.getElementById('create-new-account-button');
            const addUserModal = this.shadowRoot.querySelector('add-user-modal') as AddUserModal;
            console.log(addUserModal);
            if (createUserButton && addUserModal) {
                createUserButton.addEventListener('click', () => {
                    addUserModal.style.display = 'inline';
                });
            }
        }
    }
}

if (!customElements.get('account-selection-page')) {
    customElements.define('account-selection-page',AccountSelectionPage );
}
