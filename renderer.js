
const audioElementsList = document.getElementById('sidebar');
const musicList = document.getElementById('music-list');

let fileSet = new Set(); // nie da się raz zrobić new Set(), po co powtarzać niżej w funkcji? 
let progressStatus = 'idle';

const state = { // ten obiekt obsługuje nam spinner - idle
    _progressStatus: 'idle', 
    set progressStatus(value) {
        this._progressStatus = value;
        if(value === 'idle') {
            document.body.classList.remove('in-progress');
        } else {
            document.body.classList.add('in-progress');
        }
    },
    get progressStatus() {
        return this._progressStatus;
    }
}

const notification = { // na podstawie tego obiektu getterów i setterów zrobić notyfikacje ile plików zostało wczytane.
  _message: null,
  set message(value) {
    this._message = value;
    
    if (value) {
      // robisz logikę wyświetlenia powiadomienia
    }
    
    setTimeout(function() {
      notification.message = null;
    }, 3000);
  },
  get message() {
    return this._message;
  }
}

notification.message = "dodano 5 piosenek";


document.getElementById('upload').addEventListener('click', async () => {
    state.progressStatus = 'in-progress';
   //progressStatus ? document.body.classList.add('hidden') : document.body.classList.add('.showSp');
    const files = await window.electronAPI.loadFiles(); // musi poczekać na pliki stąd await (asynchronicznie)
    //fileSet.add([...files]);
    console.log('files', files);
    addFileList(files);
    state.progressStatus = 'idle';
    const message = `Zaimportowano: ${files.length} plików muzycznych`;
    alert(message);
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