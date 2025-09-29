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

# --- Funciones auxiliares ---
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# --- Rutas principales ---
@app.route("/")
def index():
    return render_template("index.html")


@app.route("/list")
def list_files():
    files = [f for f in os.listdir(app.config["UPLOAD_FOLDER"]) if allowed_file(f)]
    files.sort()
    return jsonify(files)


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
        return jsonify({"ok": True})
    return jsonify({"error": "file not found"}), 404


@app.route("/uploads/<path:filename>")
def uploaded_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename, as_attachment=False)


# --- Rutas de control de playlist ---
@app.route("/current")
def current_song():
    return jsonify({"current": playlist.get_current()})


@app.route("/next")
def next_song():
    return jsonify({"next": playlist.next_song()})


@app.route("/prev")
def prev_song():
    return jsonify({"prev": playlist.prev_song()})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
