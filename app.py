#!/usr/bin/env python3
"""
Web interface for Vitruvian Man Analyzer
A Flask web application for uploading and analyzing human poses.
"""

from flask import Flask, render_template, request, jsonify, send_file
import os
import json
import uuid
from werkzeug.utils import secure_filename
from vitruvian_analyzer import VitruvianAnalyzer
import cv2
import numpy as np

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Create upload directory if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/analyze', methods=['POST'])
def analyze_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type. Please upload an image.'}), 400
    
    try:
        # Save uploaded file
        filename = str(uuid.uuid4()) + '_' + secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Analyze image
        analyzer = VitruvianAnalyzer()
        result = analyzer.analyze_image(filepath)
        
        # Clean up uploaded file
        os.remove(filepath)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health')
def health_check():
    return jsonify({'status': 'healthy', 'service': 'Vitruvian Man Analyzer'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)