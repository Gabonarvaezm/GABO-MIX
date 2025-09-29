const audio = document.getElementById("audioPlayer");
const playPauseBtn = document.getElementById("playPauseBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const forwardBtn = document.getElementById("forwardBtn");
const backwardBtn = document.getElementById("backwardBtn");
const vinilo = document.getElementById("vinilo");
const uploadForm = document.getElementById("uploadForm");
const fileInput = document.getElementById("fileInput");
const playlist = document.getElementById("playlist");

let songs = [];
let currentSongIndex = 0;

// Cargar canción actual
function loadSong(index) {
    if (songs.length > 0) {
        audio.src = songs[index].url;
        audio.play();
        vinilo.style.animationPlayState = "running";
    }
}

// Play/Pause
playPauseBtn.addEventListener("click", () => {
    if (audio.paused) {
        audio.play();
        vinilo.style.animationPlayState = "running";
    } else {
        audio.pause();
        vinilo.style.animationPlayState = "paused";
    }
});

// Botón anterior
prevBtn.addEventListener("click", () => {
    if (songs.length > 0) {
        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        loadSong(currentSongIndex);
    }
});

// Botón siguiente
nextBtn.addEventListener("click", () => {
    if (songs.length > 0) {
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        loadSong(currentSongIndex);
    }
});

// Adelantar 10s
forwardBtn.addEventListener("click", () => {
    audio.currentTime += 10;
});

// Retroceder 10s
backwardBtn.addEventListener("click", () => {
    audio.currentTime -= 10;
});

// Subir archivo
uploadForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const file = fileInput.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        songs.push({ name: file.name, url: url });
        updatePlaylist();
        if (songs.length === 1) {
            loadSong(0);
        }
    }
});

// Actualizar Playlist
function updatePlaylist() {
    playlist.innerHTML = "";
    songs.forEach((song, index) => {
        const li = document.createElement("li");
        li.textContent = song.name;

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "❌";
        deleteBtn.classList.add("deleteBtn");
        deleteBtn.addEventListener("click", () => {
            songs.splice(index, 1);
            if (currentSongIndex === index) {
                audio.pause();
                vinilo.style.animationPlayState = "paused";
                if (songs.length > 0) {
                    currentSongIndex = 0;
                    loadSong(0);
                } else {
                    audio.src = "";
                }
            }
            updatePlaylist();
        });

        li.appendChild(deleteBtn);
        playlist.appendChild(li);
    });
}
