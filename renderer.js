const audioElementsList = document.getElementById('sidebar');
const musicList = document.getElementById('music-list');
const fileCount = document.getElementById('file-count');
const clearButton = document.getElementById('clear');
const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('play-pause-btn');
const stopBtn = document.getElementById('stop-btn');
const volumeSlider = document.getElementById('volume-slider');
const songTitle = document.getElementById('song-title');
const currentTimeElement = document.getElementById('current-time');
const progressBar = document.getElementById('progress-bar');
const duration = document.getElementById('duration');
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

function formatTime(seconds) {
    // je¿eli warto¶æ seconds jest niew³a¶ciwa zwróæ: 0:00
    if (isNaN(seconds) || seconds < 0) return "0:00";

    seconds = Math.floor(seconds);

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const paddedSecs = secs.toString().padStart(2, '0');

    // If shorter than 1 hour --> "M:SS"
    if (hrs === 0) {
        return `${mins}:${paddedSecs}`;
    }

    // For long files --> "H:MM:SS"
    const paddedMins = mins.toString().padStart(2, '0');
    return `${hrs}:${paddedMins}:${paddedSecs}`;
};

audioPlayer.addEventListener('loadedmetadata', () => {
    const d = audioPlayer.duration;
    const ct = audioPlayer.currentTime;
    currentTimeElement.innerText = isNaN(d) ? "0:00" : formatTime(d);
});

audioPlayer.addEventListener('timeupdate', () => {
    let percentage = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    console.log('percentage: ', percentage);
    //console.log('audioPlayer.currentTime', audioPlayer.currentTime);
    //console.log('audioPlayer.duration', audioPlayer.duration);
    progressBar.value = percentage;
});

document.getElementById('upload').addEventListener('click', async () => {
    state.progressStatus = 'in-progress';
    const files = await window.electronAPI.loadFiles(); // musi poczeka? na pliki st?d await (asynchronicznie)
    console.log('files', files);
    addFileList(files);
    state.progressStatus = 'idle';
    notification.message = `Zaimportowano: ${files.length} plik?w muzycznych`;
});

clearButton.addEventListener('click', () => {
    playPauseBtn.disabled = true;
    musicList.innerHTML = '';
    fileSet.clear();
    notification.message = 'Lista zosta?a wyczyszczona ??';
    setTimeout(() => {
        notification.message = 'Hey dodaj jakie? piosenki... bo tak jako? pusto na tej playli?cie ?? ??';
    }, 3000);
});

async function addFileList(filesArr) {
    playPauseBtn.disabled = false;
    for (const file of filesArr) { // musi byæ for ... of, poniewa¿ forEach nie dzia³a dobrze w funkcji async
        const filePath = file.file;
        if (!fileSet.has(filePath)) {
            fileSet.add(filePath);
            const url = await window.electronAPI.getFileURL(filePath);
            musicLibrary.push({
                file: filePath,
                url: url,
                metadata: file.metadata
            })
        }
    };
    musicList.innerHTML = '';
    const fragment = document.createDocumentFragment(); // tworzy fragment b?dzie w pami?ci kontenerem dla piosenke

    // [...fileSet].map((filePath) => { // przechodzi po fileSet, po kolei przez wszystkie scie?ki w fileSet
    //     const liItem = document.createElement('li'); // tworzy element li
    //     const currentFile = musicLibrary.find(file => file.file === filePath); // zzwraca element z tablicy pziosenek kt?ry r?wna si? obecnej ?cie?ce z fileSet
    //     liItem.innerHTML = currentFile.metadata.common.title; // filesArr pochodzi z maina z piosenkami a filePath to ?cie?ka unikalna
    //     liItem.dataset.filePath = filePath;
    //     liItem.dataset.index = musicLibrary.findIndex(f => f.file === filePath);
    //     fragment.appendChild(liItem); // dodaje item LI do fragment
    // });

    musicLibrary.forEach((song, index) => {
        const liItem = document.createElement('li');
        liItem.innerText = song.metadata.common.title || 'Unknown Title';
        liItem.dataset.index = index;
        fragment.appendChild(liItem);

    });

    if (musicLibrary.length > 0) {
        audioPlayer.src = musicLibrary[0].url;
        audioPlayer.dataset.currentIndex = 0;
    }
    // const firstSong = fileSet.values().next().value; // przy inicjalizacji listy wrzucamy playerowi pierwsz± zaczytan± ¶cie¿kê (piosenkê)
    // audioPlayer.src = firstSong; // teraz bêzie gra³ jak go siê wywo³a w³asnie tê piosenkê. 
    // audioPlayer.dataset.currentIndex = musicLibrary.findIndex(f => f.file === firstSong); //cleanUpFileURL(firstSong);
    musicList.appendChild(fragment); // po mapie dodaje wszystkie piosenki kt?re sa teraz we frgamencie do musicList
    // doda? audio w HTML, z?apa? je, i doda? SRC ?cie?k?
};

function updateSongDisplay() {
    const currentIndex = parseInt(audioPlayer.dataset.currentIndex, 10);
    const currentSongData = musicLibrary[currentIndex];

    if (currentSongData && currentSongData.metadata?.common) {
        songTitle.innerText = currentSongData.metadata.common.title;
    } else {
        songTitle.innerText = 'Uknown Title';
    };

    document.querySelectorAll('#music-list li').forEach(li => li.classList.remove('greenText'));
    const activeSong = document.querySelector(`[data-index=${currentIndex}]`); //document.querySelector(`[data-file-song^="${audioPlayer.dataset.currentSong}"]`);
    if (activeSong) activeSong.classList.add('greenText');
};

musicList.addEventListener('click', async (e) => { // dodaje eventListner do
    if (e.target.tagName === 'LI') {
        const index = e.target.dataset.index;
        const songData = musicLibrary[index];
        const songURL = await window.electronAPI.getFileURL(songData.file);
        audioPlayer.src = songURL;
        audioPlayer.dataset.currentIndex = index;
        audioPlayer.play();

        document.querySelectorAll('#music-list li').forEach(li => li.classList.remove('greenText')); // przechodzi po wszystkich elementach i usuwa klasê greentext
        e.target.classList.add('greenText');
        updateSongDisplay();
    }
});

playPauseBtn.addEventListener('click', async () => {
    if (audioPlayer.paused) {
        audioPlayer.play().catch(err => {
            console.error('Failed to play:')
            notification.message = 'Nie mo¿na otworzyæ pliku';
        });
        playPauseBtn.innerText = 'Pause';
        const activeSong = document.querySelector(`[data-file-song^="${audioPlayer.dataset.currentSong}"]`);
        updateSongDisplay();
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

audioPlayer.volume = 0.5;
volumeSlider.value = 50;

volumeSlider.addEventListener('input', (e) => {
    audioPlayer.volume = e.target.value / 100;
    console.log('volumeSlider moved');
});

window.addEventListener('DOMContentLoaded', () => {
    console.log('Renderer is working ?');
    playPauseBtn.disabled = true;

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