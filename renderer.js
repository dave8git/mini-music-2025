
const audioElementsList = document.getElementById('sidebar');
const musicList = document.getElementById('music-list');
const fileCount = document.getElementById('file-count');
const clearButton = document.getElementById('clear');
const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('play-pause-btn');
const stopBtn = document.getElementById('stop-btn');
const volumeSlider = document.getElementById('volume-slider');
const songTitle = document.getElementById('song-title');
let musicLibrary = [];
let fileSet = new Set(); // nie da si? raz zrobi? new Set(), po co powtarza? ni?ej w funkcji? 
let progressStatus = 'idle';

const state = { // ten obiekt obs?uguje nam spinner - idle
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

const notification = { // na podstawie tego obiektu getter?w i setter?w zrobi? notyfikacje ile plik?w zosta?o wczytane.
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
                fileCount.textContent = ''; // ca?kowite wyczyszczenie po zaniku
            }, 2500);
        }
    },
    get message() {
        return this._message;
    }
};

document.getElementById('upload').addEventListener('click', async () => {
    state.progressStatus = 'in-progress';
    const files = await window.electronAPI.loadFiles(); // musi poczeka? na pliki st?d await (asynchronicznie)
    console.log('files', files);
    addFileList(files);
    state.progressStatus = 'idle';
    notification.message = `Zaimportowano: ${files.length} plik?w muzycznych`;
});

clearButton.addEventListener('click', () => {

    musicList.innerHTML = '';
    fileSet.clear();
    notification.message = 'Lista zosta?a wyczyszczona ??';
    setTimeout(() => {
        notification.message = 'Hey dodaj jakie? piosenki... bo tak jako? pusto na tej playli?cie ?? ??';
    }, 3000);
});

function addFileList(filesArr) {
    filesArr.forEach((file) => { // forEach wype?nia fileSeta, ?eby pozbyc sie duplikat?w
        const filePath = file.file;
        if (!fileSet.has(filePath)) {
            fileSet.add(filePath);
            musicLibrary.push({
                file: filePath,
                metadata: file.metadata
            })
        }
    });
    musicList.innerHTML = '';
    const fragment = document.createDocumentFragment(); // tworzy fragment b?dzie w pami?ci kontenerem dla piosenke

    [...fileSet].map((filePath) => { // przechodzi po fileSet, po kolei przez wszystkie scie?ki w fileSet
        const liItem = document.createElement('li'); // tworzy element li
        const currentFile = musicLibrary.find(file => file.file === filePath); // zzwraca element z tablicy pziosenek kt?ry r?wna si? obecnej ?cie?ce z fileSet
        liItem.innerHTML = currentFile.metadata.common.title; // filesArr pochodzi z maina z piosenkami a filePath to ?cie?ka unikalna
        liItem.dataset.filePath = filePath;
        liItem.dataset.fileSong = cleanUpFileURL(filePath);
        fragment.appendChild(liItem); // dodaje item LI do fragment
    });

    const firstSong = fileSet.values().next().value; // przy inicjalizacji listy wrzucamy playerowi pierwsz± zaczytan± ¶cie¿kê (piosenkê)
    audioPlayer.src = firstSong; // teraz bêzie gra³ jak go siê wywo³a w³asnie tê piosenkê. 
    audioPlayer.dataset.currentSong = cleanUpFileURL(firstSong);
    musicList.appendChild(fragment); // po mapie dodaje wszystkie piosenki kt?re sa teraz we frgamencie do musicList
    // doda? audio w HTML, z?apa? je, i doda? SRC ?cie?k?
};

musicList.addEventListener('click', async (e) => { // dodaje eventListner do
    if (e.target.tagName === 'LI') {
        //console.log(e.target.dataset.filePath);
        const songURL = await window.electronAPI.getFileURL(e.target.dataset.filePath);
        audioPlayer.src = songURL;
        audioPlayer.dataset.currentSong = cleanUpFileURL(e.target.dataset.filePath);
        audioPlayer.play();

        document.querySelectorAll('#music-list li').forEach(li => li.classList.remove('greenText')); // przechodzi po wszystkich elementach i usuwa klasê greentext
        e.target.classList.add('greenText');
    }
    const currentSongData = musicLibrary.find(
        song => cleanUpFileURL(song.file) === audioPlayer.dataset.currentSong
    );

    if (currentSongData && currentSongData.metadata?.common) {
        songTitle.innerText = currentSongData.metadata.common.title;
    } else {
        songTitle.innerText = 'Uknown Title';
    }
});

function cleanUpFileURL(s) {
    return s.replaceAll("/", "_").replaceAll(":", "").replaceAll(" ", "_").replaceAll("\\", "_").replaceAll(".", "");
};

playPauseBtn.addEventListener('click', async () => {
    if (audioPlayer.paused) {
        audioPlayer.play();
        playPauseBtn.innerText = 'Pause';
        const activeSong = document.querySelector(`[data-file-song^="${audioPlayer.dataset.currentSong}"]`);
        const currentSongData = musicLibrary.find(
            song => cleanUpFileURL(song.file) === audioPlayer.dataset.currentSong
        );
        if(currentSongData && currentSongData.metadata?.common?.title) {
            songTitle.innerText = currentSongData.metadata.common.title;
        } else {
            songTitle.innerText = 'Unknown title';
        }
        activeSong.classList.add('greenText');
    } else {
        audioPlayer.pause();
        playPauseBtn.innerText = 'Play';
         document.querySelectorAll('#music-list li').forEach(li => li.classList.remove('greenText'));
    }
});

audioPlayer.addEventListener('ended', () => {
    stopPlayback();
});

function stopPlayback() {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
};

audioPlayer.addEventListener('error', (e) => {
    console.error('Playback error:', e);
});

volumeSlider.addEventListener('input', (e) => {
    audioPlayer.volume = e.target.value / 100;
    console.log('volumeSlider moved');
});

audioPlayer.volume = 0.5;
volumeSlider.value = 50;

window.addEventListener('DOMContentLoaded', () => {
    console.log('Renderer is working ?');

    if (window.electronAPI) {
        console.log('Electron API jest dost?pne:', window.electronAPI);
        console.log('Nazwa aplikacji w pliku preload.js to:', window.electronAPI.appName);
    } else {
        console.log('? Brak skonfigurowanego electronAPI. Sprawd? plik preload tam wpis webPreferences.');
    }

    const titleBar = document.getElementById('title-bar');
    if (titleBar) {
        titleBar.textContent = window.electronAPI?.appName || 'Music Player';
    }
});