
const audioElementsList = document.getElementById('sidebar');

document.getElementById('upload').addEventListener('click', async () => {
    const files = await window.electronAPI.loadFiles(); // musi poczekać na pliki stąd await (asynchronicznie)
    files.forEach((file) => {
        const audioElement = document.createElement('audio');
        audioElement.controls = true;
        audioElement.src = file;
        audioElementsList.appendChild(audioElement);
    })

    console.log('files', files);
});


window.addEventListener('DOMContentLoaded', () => {
    console.log('Renderer is working ✅');

    if (window.electronAPI) {
        console.log('Electron API jest dostępne:', window.electronAPI);
        console.log('Nazwa aplikacji w pliku preload.js to:', window.electronAPI.appName);
    } else {
        console.log('❌ Brak skonfigurowanego electronAPI. Sprawdź plik preload tam wpis webPreferences.');
    }

    const titleBar = document.getElementById('title-bar');
    if(titleBar) {
        titleBar.textContent = window.electronAPI?.appName || 'Music Player';
    }
});