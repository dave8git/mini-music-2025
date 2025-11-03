const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const fs = require('fs').promises;
const mm = require('music-metadata');
const path = require('path');
const { pathToFileURL } = require('url');
let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        minWidth: 800,
        minHeight: 500,
        backgroundColor: '#121212', // Dark theme background
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true
        }
    });

    mainWindow.loadFile('index.html');

    // Opcjonalnie tutaj można dodać DevTools
    mainWindow.webContents.openDevTools();

    // Usuń obiekt window, kiedy okno zostaje zamknięte
}

ipcMain.handle('uploadFiles', async () => { // nasłuchuje na 'uploadFiles' 
    const { filePaths } = await dialog.showOpenDialog( // czeka na okienko dialogowe - interakcje użytkownika z oknem dialogowym
        {
            properties: ['openFile', 'multiSelections'],
            filters: [
                { name: 'Music', extensions: ['mp3'] },
            ]
        },
    );
    console.log('filePaths', filePaths);
    const promisesFilePaths = await Promise.all(filePaths.map((filePath) => {
        return mm.parseFile(filePath);
    }));
    console.log('promisesFilePaths', promisesFilePaths);
    return filePaths.map((file, index) => {
        return {
            file, // !!! punktem styku będzie ścieżka
            metadata: promisesFilePaths[index],
        }
    });
});


// handle zwraca wartość która przekazywana jest dalej (do renderer poprzez bridge)
// on tylko nasłuchuje i przekazuje

app.on('ready', createWindow);

ipcMain.handle('get-file-url', (_, filePath) => {
    return pathToFileURL(filePath).href;
});

// Kiedy wszystkie okna zostaną zakończ działanie aplikacji (no chyba, że aplikacja działa na macu)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
        mainWindow.on('closed', () => {
            mainWindow = null;
        });
    }
});