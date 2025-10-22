const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');

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
        }
    });

    mainWindow.loadFile('index.html');

    // Opcjonalnie tutaj można dodać DevTools
    mainWindow.webContents.openDevTools();

    // Usuń obiekt window, kiedy okno zostaje zamknięte
}

ipcMain.handle('uploadFiles', async () => {
    const { filePaths } = await dialog.showOpenDialog( // czeka na okienko dialogowe - interakcje użytkownika z oknem dialogowym
        {
            properties: ['openFile', 'multiSelections'],
            filters: [
                { name: 'Music', extensions: ['mp3'] },
            ]
        },
    );
    return filePaths.map(file => (file));
});

// handle zwraca wartość która przekazywana jest dalej (do renderer poprzez bridge)
// on tylko nasłuchuje i przekazuje

app.on('ready', createWindow);

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