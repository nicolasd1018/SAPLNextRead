import { GoogleGenAI } from '@google/genai';
import templateString from '../Pages/AIPage.template.html?raw';
import User from '../Types/User';

export default class AIPage extends HTMLElement {
    _user: User | undefined;

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
    
    private render() {
        if (this.shadowRoot) {
            this.shadowRoot.innerHTML = templateString;
            const aiProfileButton = this.shadowRoot.getElementById('ai-profile-button');
            const expandHorizonButton = this.shadowRoot.getElementById('expand-horizon-button');
            const planReadingGoalButton = this.shadowRoot.getElementById('plan-reading-goal-button');
            const conversationContainer = this.shadowRoot.getElementById('conversation-container');
            const userInput = this.shadowRoot.getElementById('user-input') as HTMLInputElement;
            const loader = this.shadowRoot.querySelector('.loader') as HTMLElement;

            const ai = new GoogleGenAI({ apiKey:  ''});
            const chat = ai.chats.create({model: 'gemini-3-flash-preview'});
            chat.sendMessage({message: 'You are a helpful assistant on an application that reccomends books in the San Antonio Library and provides information and suggestions based on the user\'s data. Try to keep the responses relevant to the user\'s data and the context of the application. Wrap new lines and paragraphs in divs. Use html heading as appropriate.'});

            if (userInput && conversationContainer) {
                userInput.addEventListener('keypress', async (event) => {
                    if (event.key === 'Enter') {
                        const message = userInput.value.trim();
                        if (message) {
                            conversationContainer.insertAdjacentHTML('beforeend', `<div class="user-message">${message}</div>`);
                            userInput.value = '';
                            loader.style.display = 'flex'; // Show the loader
                            aiProfileButton?.setAttribute('disabled', 'true');
                            expandHorizonButton?.setAttribute('disabled', 'true');
                            planReadingGoalButton?.setAttribute('disabled', 'true');
                            userInput.setAttribute('disabled', 'true');
                            try {
                                
                                const response = await chat.sendMessage({message: `${message}. wrap new lines and paragraphs in divs. use html heading as appropriate.`});

                                if (conversationContainer) {
                                    conversationContainer.insertAdjacentHTML('beforeend', `<div class="ai-message">${response.text!}</div>`);
                                }
                            } catch (error) {
                                console.error('Error calling Gemini API:', error);
                            } finally {
                                loader.style.display = 'none';
                                aiProfileButton?.removeAttribute('disabled');
                                expandHorizonButton?.removeAttribute('disabled');
                                planReadingGoalButton?.removeAttribute('disabled');
                                userInput.removeAttribute('disabled');
                            }
                        }
                    }
                });
            }

            if (aiProfileButton && this.user) {
                aiProfileButton.addEventListener('click', async () => {
                loader.style.display = 'flex'; // Show the loader
                aiProfileButton.setAttribute('disabled', 'true');
                expandHorizonButton?.setAttribute('disabled', 'true');
                planReadingGoalButton?.setAttribute('disabled', 'true');
                userInput?.setAttribute('disabled', 'true');
                try {
                    const response = await chat.sendMessage({message: `Use 500 words or less, generate a user profile for me based on these lists of books and their names, gender, and address: ${this.user?.allowedToUseData ? (this.user!.searchLists.map((list)=> `${list.name} ${list.books.toLocaleString()}`)) : [] }${this.user?.allowedToUseData ? ` Gender: ${this.user!.gender}` : ''}${this.user?.allowedToUseData ? ` Address: ${this.user!.address}` : ''}. If there are none, say so. Wrap new lines and paragraphs in divs. use html heading as appropriate.`});
                    if (conversationContainer) {
                        conversationContainer.insertAdjacentHTML('beforeend', `<div class="ai-message" >${response.text!}</div>`);
                    }
                } catch (error) {
                    console.error('Error calling Gemini API:', error);
                } finally {
                    loader.style.display = 'none';
                    aiProfileButton.removeAttribute('disabled');
                    expandHorizonButton?.removeAttribute('disabled');
                    planReadingGoalButton?.removeAttribute('disabled');
                    userInput?.removeAttribute('disabled');
                }
            });
            }

            if (expandHorizonButton && this.user) {
            expandHorizonButton?.addEventListener('click', async () => {
                loader.style.display = 'flex'; // Show the loader
                aiProfileButton?.setAttribute('disabled', 'true');
                expandHorizonButton.setAttribute('disabled', 'true');
                planReadingGoalButton?.setAttribute('disabled', 'true');
                userInput?.setAttribute('disabled', 'true');
                try {
                    const response =  await chat.sendMessage({message: `Use 500 words or less, expand my literary horizons and suggest things I might like outside of my normal reading habits based on these lists of books and their names, gender, and address: ${this.user?.allowedToUseData ? (this.user!.searchLists.map((list)=> `${list.name} ${list.books.toLocaleString()}`)) : [] }${this.user?.allowedToUseData ? ` Gender: ${this.user!.gender}` : ''}${this.user?.allowedToUseData ? ` Address: ${this.user!.address}` : ''}. If there are none, say so. Wrap new lines and paragraphs in divs. use html heading as appropriate.`});

                    if (conversationContainer) {
                        conversationContainer.insertAdjacentHTML('beforeend', `<div class="ai-message">${response.text!}</div>`);
                    }
                } catch (error) {
                    console.error('Error calling Gemini API:', error);
                } finally {
                    loader.style.display = 'none'; // Hide the loader
                    aiProfileButton?.removeAttribute('disabled');
                    expandHorizonButton.removeAttribute('disabled');
                    planReadingGoalButton?.removeAttribute('disabled');
                    userInput?.removeAttribute('disabled');
                }
            });
            }

            if (planReadingGoalButton && this.user) {
            planReadingGoalButton?.addEventListener('click', async () => {
                loader.style.display = 'flex'; // Show the loader
                aiProfileButton?.setAttribute('disabled', 'true');
                expandHorizonButton?.setAttribute('disabled', 'true');
                planReadingGoalButton.setAttribute('disabled', 'true');
                userInput?.setAttribute('disabled', 'true');
                try {
                    const response = await chat.sendMessage({message: `Use 500 words or less, plan a reading goal for me based on these lists of books and their names, gender, and address: ${this.user?.allowedToUseData ? (this.user!.searchLists.map((list)=> `${list.name} ${list.books.toLocaleString()}`)) : [] }${this.user?.allowedToUseData ? ` Gender: ${this.user!.gender}` : ''}${this.user?.allowedToUseData ? ` Address: ${this.user!.address}` : ''}. If there are none, say so. Wrap new lines and paragraphs in divs. use html heading as appropriate.`});


                    if (conversationContainer) {
                        conversationContainer.insertAdjacentHTML('beforeend', `<div class="ai-message">${response.text!}</div>`);
                    }
                } catch (error) {
                    console.error('Error calling Gemini API:', error);
                } finally {
                    loader.style.display = 'none'; // Hide the loader
                    aiProfileButton?.removeAttribute('disabled');
                    expandHorizonButton?.removeAttribute('disabled');
                    planReadingGoalButton.removeAttribute('disabled');
                    userInput?.removeAttribute('disabled');
                }
            });
            }   
        }
    }

    connectedCallback() {
        this.render();
    }
}

if (!customElements.get('ai-page')) {
    customElements.define('ai-page', AIPage);
}