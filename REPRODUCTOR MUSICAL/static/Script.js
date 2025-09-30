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

// Cargar lista de archivos del servidor
async function loadPlaylist() {
    try {
        const response = await fetch('/list');
        const files = await response.json();
        songs = files.map(file => ({
            name: file,
            url: `/uploads/${file}`
        }));
        updatePlaylist();
        if (songs.length > 0 && !audio.src) {
            loadSong(0);
        }
    } catch (error) {
        console.error('Error cargando playlist:', error);
    }
}

// Cargar canción actual
function loadSong(index) {
    if (songs.length > 0 && index >= 0 && index < songs.length) {
        currentSongIndex = index;
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
prevBtn.addEventListener("click", async () => {
    try {
        const response = await fetch('/prev');
        const data = await response.json();
        if (data.prev) {
            const index = songs.findIndex(s => s.name === data.prev);
            if (index !== -1) {
                loadSong(index);
            }
        }
    } catch (error) {
        // Fallback local
        if (songs.length > 0) {
            currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
            loadSong(currentSongIndex);
        }
    }
});

// Botón siguiente
nextBtn.addEventListener("click", async () => {
    try {
        const response = await fetch('/next');
        const data = await response.json();
        if (data.next) {
            const index = songs.findIndex(s => s.name === data.next);
            if (index !== -1) {
                loadSong(index);
            }
        }
    } catch (error) {
        // Fallback local
        if (songs.length > 0) {
            currentSongIndex = (currentSongIndex + 1) % songs.length;
            loadSong(currentSongIndex);
        }
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
uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const file = fileInput.files[0];
    if (file) {
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (result.ok) {
                await loadPlaylist();
                fileInput.value = '';
            } else {
                alert('Error al subir archivo: ' + result.error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al subir archivo');
        }
    }
});

// Mover canción a nueva posición
async function moveSong(filename, newPosition) {
    try {
        const response = await fetch('/move', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                filename: filename,
                position: newPosition
            })
        });
        const result = await response.json();
        if (result.ok) {
            await loadPlaylist();
            return true;
        } else {
            console.error('Error del servidor:', result.error);
            alert('No se pudo mover la canción: ' + (result.error || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error moviendo canción:', error);
        alert('Error de conexión al mover la canción');
    }
    return false;
}

// Eliminar canción
async function deleteSong(filename) {
    try {
        const response = await fetch('/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                filename: filename
            })
        });
        const result = await response.json();
        if (result.ok) {
            await loadPlaylist();
            if (songs.length === 0) {
                audio.pause();
                audio.src = '';
                vinilo.style.animationPlayState = "paused";
            } else if (currentSongIndex >= songs.length) {
                currentSongIndex = 0;
                loadSong(0);
            }
        }
    } catch (error) {
        console.error('Error eliminando canción:', error);
    }
}

// Actualizar Playlist con drag & drop y controles de movimiento
function updatePlaylist() {
    playlist.innerHTML = "";
    songs.forEach((song, index) => {
        const li = document.createElement("li");
        li.draggable = true;
        li.dataset.index = index;
        li.dataset.filename = song.name;
        
        const songInfo = document.createElement("span");
        songInfo.textContent = `${index + 1}. ${song.name}`;
        songInfo.classList.add("song-name");
        
        const controls = document.createElement("div");
        controls.classList.add("song-controls");
        
        // Botón subir
        const upBtn = document.createElement("button");
        upBtn.textContent = "↑";
        upBtn.classList.add("moveBtn");
        upBtn.title = "Mover arriba";
        if (index === 0) {
            upBtn.disabled = true;
        }
        upBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            console.log(`Moviendo ${song.name} de posición ${index} a ${index - 1}`);
            if (index > 0) {
                const success = await moveSong(song.name, index - 1);
                if (success) {
                    console.log('Canción movida exitosamente');
                }
            }
        });
        
        // Botón bajar
        const downBtn = document.createElement("button");
        downBtn.textContent = "↓";
        downBtn.classList.add("moveBtn");
        downBtn.title = "Mover abajo";
        if (index === songs.length - 1) {
            downBtn.disabled = true;
        }
        downBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            console.log(`Moviendo ${song.name} de posición ${index} a ${index + 1}`);
            if (index < songs.length - 1) {
                const success = await moveSong(song.name, index + 1);
                if (success) {
                    console.log('Canción movida exitosamente');
                }
            }
        });
        
        // Input para posición específica
        const posInput = document.createElement("input");
        posInput.type = "number";
        posInput.min = "1";
        posInput.max = songs.length;
        posInput.value = index + 1;
        posInput.classList.add("position-input");
        posInput.title = "Ir a posición (presiona Enter)";
        
        posInput.addEventListener("keypress", async (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                const newPos = parseInt(posInput.value) - 1;
                console.log(`Cambiando posición de ${song.name}: de ${index} a ${newPos}`);
                
                if (isNaN(newPos)) {
                    alert('Por favor ingresa un número válido');
                    posInput.value = index + 1;
                    return;
                }
                
                if (newPos < 0 || newPos >= songs.length) {
                    alert(`La posición debe estar entre 1 y ${songs.length}`);
                    posInput.value = index + 1;
                    return;
                }
                
                if (newPos !== index) {
                    const success = await moveSong(song.name, newPos);
                    if (success) {
                        console.log('Canción movida exitosamente');
                    } else {
                        posInput.value = index + 1;
                    }
                } else {
                    console.log('La canción ya está en esa posición');
                }
            }
        });
        
        posInput.addEventListener("blur", () => {
            // Restaurar valor original si no se presionó Enter
            posInput.value = index + 1;
        });
        
        posInput.addEventListener("click", (e) => {
            e.stopPropagation();
            posInput.select();
        });
        
        // Botón play
        const playBtn = document.createElement("button");
        playBtn.textContent = "▶";
        playBtn.classList.add("playBtn");
        playBtn.title = "Reproducir";
        playBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            loadSong(index);
        });
        
        // Botón eliminar
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "❌";
        deleteBtn.classList.add("deleteBtn");
        deleteBtn.title = "Eliminar";
        deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (confirm(`¿Eliminar "${song.name}"?`)) {
                deleteSong(song.name);
            }
        });
        
        controls.appendChild(upBtn);
        controls.appendChild(downBtn);
        controls.appendChild(posInput);
        controls.appendChild(playBtn);
        controls.appendChild(deleteBtn);
        
        li.appendChild(songInfo);
        li.appendChild(controls);
        
        // Eventos drag & drop
        li.addEventListener("dragstart", handleDragStart);
        li.addEventListener("dragover", handleDragOver);
        li.addEventListener("drop", handleDrop);
        li.addEventListener("dragend", handleDragEnd);
        
        playlist.appendChild(li);
    });
}

// Drag and Drop handlers
let draggedElement = null;

function handleDragStart(e) {
    draggedElement = this;
    this.style.opacity = '0.4';
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    this.style.borderTop = '3px solid #d4af37';
    return false;
}

async function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    if (draggedElement !== this) {
        const draggedIndex = parseInt(draggedElement.dataset.index);
        const targetIndex = parseInt(this.dataset.index);
        const filename = draggedElement.dataset.filename;
        
        console.log(`Drag & Drop: Moviendo ${filename} de ${draggedIndex} a ${targetIndex}`);
        await moveSong(filename, targetIndex);
    }
    
    this.style.borderTop = '';
    return false;
}

function handleDragEnd(e) {
    this.style.opacity = '1';
    document.querySelectorAll('#playlist li').forEach(item => {
        item.style.borderTop = '';
    });
}

// Cargar playlist al iniciar
loadPlaylist();

// Reproducción automática de siguiente canción
audio.addEventListener('ended', () => {
    nextBtn.click();
});