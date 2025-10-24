
const audioElementsList = document.getElementById('sidebar');
const musicList = document.getElementById('music-list');

let fileSet = new Set(); // nie da się raz zrobić new Set(), po co powtarzać niżej w funkcji? 

document.getElementById('upload').addEventListener('click', async () => {
    const files = await window.electronAPI.loadFiles(); // musi poczekać na pliki stąd await (asynchronicznie)
    //fileSet.add([...files]);
    console.log('files', files);
    addFileList(files);
});

function addFileList(filesArr) {
   musicList.innerHTML = '';
   const musicElementArr = [];
        filesArr.forEach((file) => {
        // const audioElement = document.createElement('audio');
        // audioElement.controls = true;
        // audioElement.src = file;
        // audioElementsList.appendChild(audioElement);
        musicElementArr.push(`<li>${file.metadata.common.title}</li>`);
    })
    musicList.innerHTML = musicElementArr;
    console.log(musicElementArr);
}

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