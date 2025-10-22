const { contextBridge, ipcMain, ipcRenderer } = require('electron');

// udostępnia API dla renderer (renderer będzie mógł czytać używać poniższych funkcji)
contextBridge.exposeInMainWorld('electronAPI', {
    loadFiles: (files) => ipcRenderer.invoke('uploadFiles'), // ipcRenderer - inter process communicationl, tutaj komunikacja pomiędzy mainem a rendererem z użyciem preloada, czyli renderer wywołuje
    appName: 'Mini Music Player'
});