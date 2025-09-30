# app.py
import os
from flask import Flask, request, jsonify, send_from_directory, render_template
from werkzeug.utils import secure_filename
from doubleLinkList import DoublyLinkedList

# --- Configuración de carpetas ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
ALLOWED_EXTENSIONS = {"mp3"}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# --- Configuración de la app Flask ---
app = Flask(__name__, static_folder="static", template_folder="templates")
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 200 * 1024 * 1024  # 200 MB

# --- Inicializar la playlist como lista doble ---
playlist = DoublyLinkedList()

# Cargar canciones existentes al iniciar
def load_existing_songs():
    files = [f for f in os.listdir(UPLOAD_FOLDER) if allowed_file(f)]
    files.sort()
    for file in files:
        playlist.append(file)

# --- Funciones auxiliares ---
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# --- Rutas principales ---
@app.route("/")
def index():
    return render_template("index.html")


@app.route("/list")
def list_files():
    # Devolver las canciones en el orden de la lista doble
    songs = playlist.get_all_songs()
    print(f"[LIST] Canciones en orden: {songs}")
    return jsonify(songs)


@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "no file part"}), 400
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "no selected file"}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        save_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(save_path)
        playlist.append(filename)  # Agregar a la lista doble
        print(f"[UPLOAD] Archivo subido: {filename}")
        return jsonify({"ok": True, "filename": filename})
    return jsonify({"error": "file not allowed"}), 400


@app.route("/delete", methods=["POST"])
def delete_file():
    data = request.json
    filename = data.get("filename")
    if not filename:
        return jsonify({"error": "missing filename"}), 400
    safe = secure_filename(filename)
    target = os.path.join(app.config["UPLOAD_FOLDER"], safe)
    if os.path.exists(target):
        os.remove(target)
        playlist.delete(safe)
        print(f"[DELETE] Archivo eliminado: {safe}")
        return jsonify({"ok": True})
    return jsonify({"error": "file not found"}), 404


@app.route("/uploads/<path:filename>")
def uploaded_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename, as_attachment=False)


# --- Rutas de control de playlist ---
@app.route("/current")
def current_song():
    current = playlist.get_current()
    print(f"[CURRENT] Canción actual: {current}")
    return jsonify({"current": current})


@app.route("/next")
def next_song():
    next_s = playlist.next_song()
    print(f"[NEXT] Siguiente canción: {next_s}")
    return jsonify({"next": next_s})


@app.route("/prev")
def prev_song():
    prev_s = playlist.prev_song()
    print(f"[PREV] Canción anterior: {prev_s}")
    return jsonify({"prev": prev_s})


# --- NUEVA RUTA: Mover canción a una posición ---
@app.route("/move", methods=["POST"])
def move_song():
    data = request.json
    filename = data.get("filename")
    new_position = data.get("position")
    
    print(f"[MOVE] Solicitud recibida: {filename} -> posición {new_position}")
    
    if not filename or new_position is None:
        print("[MOVE] Error: falta filename o position")
        return jsonify({"error": "missing filename or position"}), 400
    
    try:
        new_position = int(new_position)
    except ValueError:
        print("[MOVE] Error: position no es un número válido")
        return jsonify({"error": "position must be a number"}), 400
    
    # Verificar que la canción existe
    all_songs = playlist.get_all_songs()
    if filename not in all_songs:
        print(f"[MOVE] Error: {filename} no existe en la playlist")
        return jsonify({"error": "song not found in playlist"}), 404
    
    success = playlist.move_to_position(filename, new_position)
    
    if success:
        updated_songs = playlist.get_all_songs()
        print(f"[MOVE] Éxito! Nuevo orden: {updated_songs}")
        return jsonify({"ok": True, "songs": updated_songs})
    
    print("[MOVE] Error: no se pudo mover la canción")
    return jsonify({"error": "could not move song"}), 400


# --- NUEVA RUTA: Obtener todas las canciones ---
@app.route("/playlist")
def get_playlist():
    songs = playlist.get_all_songs()
    print(f"[PLAYLIST] Canciones actuales: {songs}")
    return jsonify({"songs": songs})


if __name__ == "__main__":
    load_existing_songs()
    print(f"[INICIO] Servidor iniciado. Canciones cargadas: {playlist.get_all_songs()}")
    app.run(debug=True, port=5000)