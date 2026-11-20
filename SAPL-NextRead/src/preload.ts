// See the Electron documentation for details on how to use preload scripts:

import { contextBridge, ipcRenderer } from "electron";

// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
contextBridge.exposeInMainWorld('electronAPI', {
    runWebScraper: (text: string  ) => ipcRenderer.invoke('run-web-scraper', text),
    runAgeFinder: (text: string) => ipcRenderer.invoke('run-age-finder', text)
});
    
contextBridge.exposeInMainWorld('api', {
    addUser: (userName: string, password: string, address: string, firstName: string, lastName: string, email: string, gender: string) => ipcRenderer.invoke('make-user', userName, password, address, firstName, lastName, email, gender),
    getUsers: () => ipcRenderer.invoke('get-users'),
    getPassword: (id: number) => ipcRenderer.invoke('get-password', id),
    getUser: (id: number) => ipcRenderer.invoke('get-user', id),
    updateList: (id: number, list: string[]) => ipcRenderer.invoke('update-list', id, list),
    updateProfilePicture: (id: number, profilePicture: Uint8Array<ArrayBuffer>) => ipcRenderer.invoke('update-profile-pic', id, profilePicture),
    updateAllowedToUseData: (id: number, allowedToUseData: boolean) => ipcRenderer.invoke('update-allowed-to-use-data', id, allowedToUseData),
    updateBookRatingThreshold: (id: number, bookRatingThreshold: number) => ipcRenderer.invoke('update-book-rating-threshold', id, bookRatingThreshold),
    updateFirstName: (id: number, firstName: string) => ipcRenderer.invoke('update-first-name', id, firstName),
    updateLastName: (id: number, lastName: string) => ipcRenderer.invoke('update-last-name', id, lastName),
    updateEmail: (id: number, email: string) => ipcRenderer.invoke('update-email', id, email),
    updateAddress: (id: number, address: string) => ipcRenderer.invoke('update-address', id, address),
    updateGender: (id: number, gender: string) => ipcRenderer.invoke('update-gender', id, gender),
    updateUsername: (id: number, username: string) => ipcRenderer.invoke('update-username', id, username),
    updatePassword: (id: number, password: string) => ipcRenderer.invoke('update-password', id, password),
    addList: (userId: number, listName: string) => ipcRenderer.invoke('add-list', userId, listName),
    deleteList: (listId: number) => ipcRenderer.invoke('delete-list', listId)
});
