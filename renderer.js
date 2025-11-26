const audioElementsList = document.getElementById('sidebar');
const musicList = document.getElementById('music-list');
const fileCount = document.getElementById('file-count');
const clearButton = document.getElementById('clear');
const deleteButton = document.getElementById('delete');
const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('play-pause-btn');
const stopBtn = document.getElementById('stop-btn');
const volumeSlider = document.getElementById('volume-slider');
const songTitle = document.getElementById('song-title');
const currentTimeElement = document.getElementById('current-time');
const progressBar = document.getElementById('progress-bar');
const duration = document.getElementById('duration');
const nextButton = document.getElementById('next-btn');
const prevButton = document.getElementById('prev-btn');
const songDisplay = document.getElementById('songDisplay');
const songDisplayTitle = document.getElementById('songTitle');
const songDisplayArtist = document.getElementById('songArtist');
const songDisplayAlbum = document.getElementById('songAlbum');
const songDisplayYear = document.getElementById('songYear');
const songDisplayGenre = document.getElementById('songGenre');
let musicLibrary = [];
let fileSet = new Set(); // nie da si? raz zrobi? new Set(), po co powtarza? ni?ej w funkcji? 

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
    progressBar.value = audioPlayer.currentTime; // ustawia progress bar na pocz±tku na 0
    duration.innerText = formatTime(d);
});

progressBar.addEventListener('input', (e) => {
    const percentage = progressBar.value; // aktualny miejsce na pasku progressBar
    const newTime = (percentage / 100) * audioPlayer.duration;
    audioPlayer.currentTime = newTime;
    progressBar.value = newTime;
})

audioPlayer.addEventListener('timeupdate', () => {
    let percentage = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    currentTimeElement.innerText = formatTime(audioPlayer.currentTime);
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

    musicLibrary.forEach((song, index) => {
        const liItem = document.createElement('li');
        liItem.innerText = song.metadata.common.title || 'Unknown Title';
        //console.log('song.metadata', song.metadata);
        liItem.dataset.id = song.file;
        fragment.appendChild(liItem);
    });
    if (musicLibrary.length > 0) {
        audioPlayer.src = musicLibrary[0].url;
    }
    musicList.appendChild(fragment); // po mapie dodaje wszystkie piosenki kt?re sa teraz we frgamencie do musicList
};

function updateSongDisplay() {
    const currentSong = getSongByURL(audioPlayer.src);
    const currentSongIndex = getIndexById(currentSong.url);
    const currentIndex = parseInt(currentSongIndex, 10);
    const currentSongData = musicLibrary[currentIndex];
    if (currentSongData && currentSongData.metadata?.common) {
        songTitle.innerText = currentSongData.metadata.common.title;
    } else {
        songTitle.innerText = 'Uknown Title';
    };
    document.querySelectorAll('#music-list li').forEach(li => li.classList.remove('greenText'));
    const safe = CSS.escape(currentSongData.file); // CSS.escape: escapes all special sign, przerabia backslashe, dziala we wszystkich przegladarkach + electron
    const activeSong = document.querySelector(`[data-id="${safe}"]`); // nalezy umiescic cudzyslowy dooko³a wartosci: ${safe}
    //document.querySelector(`[data-file-song^="${audioPlayer.dataset.currentSong}"]`);
    if (activeSong) activeSong.classList.add('greenText');
    songDisplayShow();
};

function getMetadataForCurrentSong() {
    const currentSong = getSongByURL(audioPlayer.src);
    const currentSongIndex = getIndexById(currentSong.url);
    const currentIndex = parseInt(currentSongIndex, 10);
    const currentSongData = musicLibrary[currentIndex];
    return currentSongData.metadata;
}

function songDisplayShow() {
    const metadata = getMetadataForCurrentSong(); 
    console.log('currrentSongMetadata', metadata);
    songDisplayTitle.textContent = metadata?.common.title || "Unknown title";
    songDisplayArtist.textContent = metadata?.common.artist || "Unknown artist";
    songDisplayAlbum.textContent = metadata?.common.album || "Unknown title";
    songDisplayYear.textContent = metadata?.common.year || "Unknown artist";
    songDisplayGenre.textContent = metadata?.common.genre || "Unknown title";
}

function getSongById(id) {
    return musicLibrary.find(s => s.file === id);
};

function getIndexById(id) {
    return musicLibrary.findIndex(song => song.url === id);
};

function getSongByCurrentIndex(index) {
    return musicLibrary[index];
};

function getSongByURL(url) {
    return musicLibrary.find(u => u.url === url);
}

// deleteButton.addEventListener('click', () => {

// })

musicList.addEventListener('click', async (e) => { // dodaje eventListner do
    if (e.target.tagName === 'LI') {
        const id = e.target.dataset.id;
        const songData = getSongById(id);
        const songURL = await window.electronAPI.getFileURL(songData.file);
        audioPlayer.src = songURL;
        audioPlayer.play();

        document.querySelectorAll('#music-list li').forEach(li => li.classList.remove('greenText')); // przechodzi po wszystkich elementach i usuwa klasê greentext
        e.target.classList.add('greenText');
        updateSongDisplay();
    };
    //if(e.target.tagName === 'BUTTON') {

    //}
});

playPauseBtn.addEventListener('click', async () => {
    if (audioPlayer.paused) {
        audioPlayer.play().catch(err => {
            console.error('Failed to play:')
            notification.message = 'Nie mo¿na otworzyæ pliku';
        });
        playPauseBtn.innerText = 'Pause';
        //const activeSong = document.querySelector(`[data-file-song^="${audioPlayer.dataset.currentSong}"]`);
        updateSongDisplay();
        songDisplayShow();
    } else {
        audioPlayer.pause();
        playPauseBtn.innerText = 'Play';
        document.querySelectorAll('#music-list li').forEach(li => li.classList.remove('greenText'));
    }
});

nextButton.addEventListener('click', () => {
    const currentSong = getSongByURL(audioPlayer.src);
    const currentSongIndex = getIndexById(currentSong.url);
    if(currentSongIndex < musicLibrary.length - 1) {
        audioPlayer.src = getSongByCurrentIndex(currentSongIndex + 1).url; // napisac playSongByIndex()
       // audioPlayer.dataset.currentId = 
        audioPlayer.play();
    }
    updateSongDisplay();
});

prevButton.addEventListener('click', () => {
    console.log('prevBtn');
    const currentSong = getSongByURL(audioPlayer.src);
    const currentSongIndex = getIndexById(currentSong.url);

    console.log('musicLibrary.length', musicLibrary.length);
    if (currentSongIndex < musicLibrary.length - 1) {
        audioPlayer.src = getSongByCurrentIndex(currentSongIndex - 1).url;
        audioPlayer.play();
    }
    updateSongDisplay();
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

deleteButton.addEventListener('click', () => {
    
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