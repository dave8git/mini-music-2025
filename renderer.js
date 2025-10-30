
const audioElementsList = document.getElementById('sidebar');
const musicList = document.getElementById('music-list');
const fileCount = document.getElementById('file-count');
const clearButton = document.getElementById('clear');

let fileSet = new Set(); // nie da siê raz zrobiæ new Set(), po co powtarzaæ ni¿ej w funkcji? 
let progressStatus = 'idle';

const state = { // ten obiekt obs³uguje nam spinner - idle
    _progressStatus: 'idle',
    set progressStatus(value) {
        this._progressStatus = value;
        if (value === 'idle') {
            document.body.classList.remove('in-progress');
        } else {
            document.body.classList.add('in-progress');
        }
    },
    get progressStatus() {
        return this._progressStatus;
    }
}

const notification = { // na podstawie tego obiektu getterów i setterów zrobiæ notyfikacje ile plików zosta³o wczytane.
    _message: null,
    set message(value) {
        this._message = value;

        if (value !== null && value !== undefined) {
            fileCount.textContent = value;
            fileCount.classList.remove('hidden');

            setTimeout(function () {
                fileCount.classList.add('hidden');
            }, 2000);

            setTimeout(() => {
                fileCount.textContent = ''; // ca³kowite wyczyszczenie po zaniku
            }, 2500);
        }
    },
    get message() {
        return this._message;
    }
};

document.getElementById('upload').addEventListener('click', async () => {
    state.progressStatus = 'in-progress';
    const files = await window.electronAPI.loadFiles(); // musi poczekaæ na pliki st±d await (asynchronicznie)
    console.log('files', files);
    addFileList(files);
    state.progressStatus = 'idle';
    notification.message = `Zaimportowano: ${files.length} plików muzycznych`;
});

clearButton.addEventListener('click', () => {

    musicList.innerHTML = '';
    fileSet.clear();
    notification.message = 'Lista zosta³a wyczyszczona ??';
    setTimeout(() => {
        notification.message = 'Hey dodaj jakie¶ piosenki... bo tak jako¶ pusto na tej playli¶cie ?? ??';
    }, 3000);
});

function addFileList(filesArr) { 
    filesArr.forEach((file) => { // forEach wype³nia fileSeta, ¿eby pozbyc sie duplikatów
        fileSet.add(file.file); 
    });
    const fragment = document.createDocumentFragment(); // tworzy fragment bêdzie w pamiêci kontenerem dla piosenke
    [...fileSet].map((filePath) => { // przechodzi po fileSet, po kolei przez wszystkie scie¿ki w fileSet
        const liItem = document.createElement('li'); // tworzy element li
        const currentFile = filesArr.find(file => file.file === filePath); // zzwraca element z tablicy pziosenek który równa siê obecnej ¶cie¿ce z fileSet
        liItem.innerHTML = currentFile.metadata.common.title; // filesArr pochodzi z maina z piosenkami a filePath to ¶cie¿ka unikalna
        liItem.dataset.filePath = filePath;
        fragment.appendChild(liItem); // dodaje item LI do fragment
    });

    musicList.appendChild(fragment); // po mapie dodaje wszystkie piosenki które sa teraz we frgamencie do musicList
    musicList.addEventListener('click', (e) => { // dodaje eventListner do
        if (e.target.tagName === 'LI') {
            console.log(e.target.dataset.filePath);
        }
    })

    // dodaæ audio w HTML, z³apaæ je, i dodaæ SRC ¶cie¿kê
}

function play(filePath) {

}

window.addEventListener('DOMContentLoaded', () => {
    console.log('Renderer is working ?');

    if (window.electronAPI) {
        console.log('Electron API jest dostêpne:', window.electronAPI);
        console.log('Nazwa aplikacji w pliku preload.js to:', window.electronAPI.appName);
    } else {
        console.log('? Brak skonfigurowanego electronAPI. Sprawd¼ plik preload tam wpis webPreferences.');
    }

    const titleBar = document.getElementById('title-bar');
    if (titleBar) {
        titleBar.textContent = window.electronAPI?.appName || 'Music Player';
    }
});