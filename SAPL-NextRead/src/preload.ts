// See the Electron documentation for details on how to use preload scripts:

import { contextBridge, ipcRenderer } from "electron";

// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
contextBridge.exposeInMainWorld('electronAPI', {
    runWebScraper: (text: string  ) => ipcRenderer.invoke('run-web-scraper', text),
    runAgeFinder: (text: string) => ipcRenderer.invoke('run-age-finder', text)
});
    