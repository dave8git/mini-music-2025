const { contextBridge, ipcMain, ipcRenderer } = require('electron');

// udostępnia API dla renderer (renderer będzie mógł czytać używać poniższych funkcji)
contextBridge.exposeInMainWorld('electronAPI', {
    loadFiles: (files) => ipcRenderer.invoke('uploadFiles'), // ipcRenderer - inter process communicationl, tutaj komunikacja pomiędzy mainem a rendererem z użyciem preloada, czyli renderer wywołuje
    // getMetaData:
    appName: 'Mini Music Player'
});

// linia 5 - jeżeli pojawi się z renderera żądanie wykonania loadFiles to odpal uploadFiles z main.js