import templateString from '../components/Header.template.html?raw'
import { changePage } from '../renderer';
import User from '../Types/User';

class Header extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    _user: User | undefined = undefined;

    get user() {
        return this._user;
    }

    set user(user: User| undefined) {
        
        this._user = user;
        this.render();
    }

    connectedCallback() {
        this.render();
    }

    render() {
        if (this.shadowRoot) {
            this.shadowRoot.innerHTML = templateString;
            const logoAndTagLine = this.shadowRoot.getElementById("name-and-logo");
            const profile = this.shadowRoot.getElementById('user-profile');
                
            if (logoAndTagLine)
                logoAndTagLine.addEventListener("click", async()=>{changePage()} );

            if (profile)
            {
                if (this.user) {
                    const name = profile.querySelector('#name');
                    if (name)
                    {
                        (name as HTMLOptionElement).innerText = this.user.userName;
                    }
                    profile.style.display='flex';
                }

                const menu = profile.querySelector('select');
                if (menu)
                {
                    menu.addEventListener('change', (event) => {
                        if ((event.target as HTMLSelectElement).value === 'Logout') {
                            changePage(undefined, undefined, true);
                        }
                    })
                }
            }
        }
    }
}

if (!customElements.get('nextread-header')) {
    customElements.define('nextread-header',Header );
}

export default Header;