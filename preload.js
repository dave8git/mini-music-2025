const { contextBridge, ipcRenderer } = require('electron');
const { pathToFileURL } = require('url');
// udostępnia API dla renderer (renderer będzie mógł czytać używać poniższych funkcji)
contextBridge.exposeInMainWorld('electronAPI', {
    loadFiles: (files) => ipcRenderer.invoke('uploadFiles'), // ipcRenderer - inter process communicationl, tutaj komunikacja pomiędzy mainem a rendererem z użyciem preloada, czyli renderer wywołuje
    // getMetaData
    getFileURL: (filePath) => ipcRenderer.invoke('get-file-url', filePath),
    appName: 'Mini Music Player'
});

// linia 5 - jeżeli pojawi się z renderera żądanie wykonania loadFiles to odpal uploadFiles z main.js