from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import sqlite3
import uuid

app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['DATABASE'] = 'projects.db'

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

def get_db():
    db = sqlite3.connect(app.config['DATABASE'])
    db.row_factory = sqlite3.Row
    return db

def init_db():
    with app.app_context():
        db = get_db()
        with app.open_resource('schema.sql', mode='r') as f:
            db.cursor().executescript(f.read())
        db.commit()

# init_db()
# print('Initialized the database.')

@app.route('/api/upload', methods=['POST'])
def upload_files():
    if 'files[]' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    files = request.files.getlist('files[]')
    captions = request.form.getlist('captions[]')
    
    if len(files) < 2:
        return jsonify({'error': 'At least 2 images are required'}), 400
    
    project_id = str(uuid.uuid4())
    db = get_db()
    
    try:
        db.execute('INSERT INTO projects (id) VALUES (?)', (project_id,))
        
        for index, file in enumerate(files):
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                caption = captions[index] if index < len(captions) else ''
                
                db.execute('INSERT INTO images (project_id, filename, caption, order_index) VALUES (?, ?, ?, ?)',
                           (project_id, filename, caption, index))
        
        db.commit()
        return jsonify({'project_id': project_id}), 201
    
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg', 'gif'}

@app.route('/api/project/<project_id>', methods=['GET'])
def get_project(project_id):
    db = get_db()
    images = db.execute('SELECT filename, caption FROM images WHERE project_id = ? ORDER BY order_index', (project_id,)).fetchall()
    db.close()
    
    if not images:
        return jsonify({'error': 'Project not found'}), 404
    
    return jsonify([
        {'url': f'/uploads/{image["filename"]}', 'caption': image['caption']} for image in images
    ])

@app.route('/project/<project_id>')
def show_project(project_id):
    return render_template('index.html', project_id=project_id)

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/assets/<path:path>')
def serve_assets(path):
    return send_from_directory('static/assets', path)

@app.route('/upload')
def upload_page():
    return render_template('upload.html')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8765, debug=True)