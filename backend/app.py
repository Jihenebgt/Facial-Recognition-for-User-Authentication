"""
Point d'entrée principal de l'application Flask pour le système d'authentification faciale.
"""

import os
import uuid
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2

# Importer les services et utilitaires
from services.face_detector import FaceDetector
from services.face_recognizer import FaceRecognizer
from services.database import Database
from models.user import User
from utils.security import token_required
from utils.image_processing import base64_to_image, image_to_base64, draw_face_rectangle

# Initialiser l'application Flask
app = Flask(__name__)
CORS(app)  # Activer CORS pour permettre les requêtes cross-origin

# Initialiser les services
face_detector = FaceDetector()
face_recognizer = FaceRecognizer(threshold=0.6)
database = Database(db_dir='../database')

# Créer le répertoire de la base de données s'il n'existe pas
os.makedirs('../database', exist_ok=True)

# Charger les visages connus depuis la base de données
def load_known_faces():
    """
    Charge les visages connus depuis la base de données.
    """
    users = database.get_all_users()
    for user in users:
        if user.face_embedding is not None:
            face_recognizer.known_faces[user.user_id] = user.face_embedding

# Charger les visages au démarrage
load_known_faces()

@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Endpoint de vérification de l'état de l'API.
    """
    return jsonify({'status': 'ok', 'message': 'API opérationnelle'})

@app.route('/api/detect', methods=['POST'])
def detect_face():
    """
    Endpoint pour détecter les visages dans une image.
    """
    # Vérifier si l'image est présente dans la requête
    if 'image' not in request.json:
        return jsonify({'error': 'Image manquante'}), 400
    
    try:
        # Convertir l'image base64 en image OpenCV
        image_data = request.json['image']
        image = base64_to_image(image_data)
        
        # Détecter les visages
        faces = face_detector.detect(image)
        
        # Préparer la réponse
        result = {
            'faces_detected': len(faces),
            'faces': [{'x': int(x), 'y': int(y), 'width': int(w), 'height': int(h)} for (x, y, w, h) in faces]
        }
        
        # Si des visages sont détectés, ajouter une image annotée
        if len(faces) > 0:
            # Dessiner des rectangles autour des visages
            for face_coords in faces:
                image = draw_face_rectangle(image, face_coords)
            
            # Convertir l'image annotée en base64
            result['annotated_image'] = image_to_base64(image)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/recognize', methods=['POST'])
def recognize_face():
    """
    Endpoint pour reconnaître un visage.
    """
    # Vérifier si l'image est présente dans la requête
    if 'image' not in request.json:
        return jsonify({'error': 'Image manquante'}), 400
    
    try:
        # Convertir l'image base64 en image OpenCV
        image_data = request.json['image']
        image = base64_to_image(image_data)
        
        # Détecter les visages
        faces = face_detector.detect(image)
        
        # Si aucun visage n'est détecté
        if len(faces) == 0:
            return jsonify({'recognized': False, 'message': 'Aucun visage détecté'})
        
        # Prendre le premier visage détecté (le plus grand)
        face_coords = max(faces, key=lambda rect: rect[2] * rect[3])
        
        # Extraire et prétraiter le visage
        face_img = face_detector.extract_face(image, face_coords)
        processed_face = face_detector.preprocess_face(face_img)
        
        # Reconnaître le visage
        user_id, confidence = face_recognizer.recognize(processed_face)
        
        # Préparer la réponse
        if user_id:
            # Récupérer les informations de l'utilisateur
            user = database.get_user(user_id)
            
            # Dessiner un rectangle autour du visage avec le nom
            label = f"{user.name}, {user.age} ans, {user.profession}" if user else "Inconnu"
            annotated_image = draw_face_rectangle(image, face_coords, label)
            
            result = {
                'recognized': True,
                'user': user.to_dict() if user else None,
                'confidence': float(confidence),
                'annotated_image': image_to_base64(annotated_image)
            }
            
            # Ajouter une entrée de journal
            database.add_log({
                'timestamp': str(np.datetime64('now')),
                'action': 'recognition',
                'user_id': user_id,
                'result': 'success',
                'confidence': float(confidence)
            })
        else:
            # Dessiner un rectangle autour du visage avec "Inconnu"
            annotated_image = draw_face_rectangle(image, face_coords, "Inconnu", color=(0, 0, 255))
            
            result = {
                'recognized': False,
                'message': 'Visage non reconnu',
                'annotated_image': image_to_base64(annotated_image)
            }
            
            # Ajouter une entrée de journal
            database.add_log({
                'timestamp': str(np.datetime64('now')),
                'action': 'recognition',
                'result': 'failure',
                'message': 'Visage non reconnu'
            })
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/users', methods=['POST'])
def add_user():
    """
    Endpoint pour ajouter un nouvel utilisateur.
    """
    # Vérifier si les données sont présentes dans la requête
    required_fields = ['name', 'age', 'profession', 'image']
    for field in required_fields:
        if field not in request.json:
            return jsonify({'error': f'Champ manquant: {field}'}), 400
    
    try:
        # Extraire les données
        name = request.json['name']
        age = request.json['age']
        profession = request.json['profession']
        image_data = request.json['image']
        
        # Convertir l'image base64 en image OpenCV
        image = base64_to_image(image_data)
        
        # Détecter les visages
        faces = face_detector.detect(image)
        
        # Si aucun visage n'est détecté
        if len(faces) == 0:
            return jsonify({'error': 'Aucun visage détecté dans l\'image'}), 400
        
        # Prendre le premier visage détecté (le plus grand)
        face_coords = max(faces, key=lambda rect: rect[2] * rect[3])
        
        # Extraire et prétraiter le visage
        face_img = face_detector.extract_face(image, face_coords)
        processed_face = face_detector.preprocess_face(face_img)
        
        # Générer un ID utilisateur unique
        user_id = str(uuid.uuid4())
        
        # Créer un nouvel utilisateur
        user = User(
            user_id=user_id,
            name=name,
            age=age,
            profession=profession
        )
        
        # Extraire les caractéristiques du visage
        face_embedding = face_recognizer.extract_features(processed_face)
        user.face_embedding = face_embedding
        
        # Ajouter l'utilisateur à la base de données
        if database.add_user(user):
            # Ajouter le visage au reconnaisseur
            face_recognizer.add_face(user_id, processed_face)
            
            # Ajouter une entrée de journal
            database.add_log({
                'timestamp': str(np.datetime64('now')),
                'action': 'user_added',
                'user_id': user_id,
                'name': name
            })
            
            return jsonify({'success': True, 'user_id': user_id, 'message': 'Utilisateur ajouté avec succès'})
        else:
            return jsonify({'error': 'Erreur lors de l\'ajout de l\'utilisateur'}), 500
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/users/<user_id>', methods=['DELETE'])
@token_required
def delete_user(user_id, **kwargs):
    """
    Endpoint pour supprimer un utilisateur.
    """
    try:
        # Vérifier si l'utilisateur existe
        user = database.get_user(user_id)
        if not user:
            return jsonify({'error': 'Utilisateur non trouvé'}), 404
        
        # Supprimer l'utilisateur de la base de données
        if database.delete_user(user_id):
            # Supprimer le visage du reconnaisseur
            if user_id in face_recognizer.known_faces:
                del face_recognizer.known_faces[user_id]
            
            # Ajouter une entrée de journal
            database.add_log({
                'timestamp': str(np.datetime64('now')),
                'action': 'user_deleted',
                'user_id': user_id
            })
            
            return jsonify({'success': True, 'message': 'Utilisateur supprimé avec succès'})
        else:
            return jsonify({'error': 'Erreur lors de la suppression de l\'utilisateur'}), 500
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/users', methods=['GET'], endpoint='get_all_users')
@token_required
def get_users(**kwargs):
    """
    Endpoint pour récupérer tous les utilisateurs.
    """
    try:
        # Récupérer tous les utilisateurs
        users = database.get_all_users()
        
        # Convertir les utilisateurs en dictionnaires
        users_dict = [user.to_dict() for user in users]
        
        return jsonify({'users': users_dict})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/logs', methods=['GET'])
@token_required
def get_logs(**kwargs):
    """
    Endpoint pour récupérer les journaux.
    """
    try:
        # Récupérer le nombre d'entrées à récupérer
        limit = request.args.get('limit', default=100, type=int)
        
        # Récupérer les journaux
        logs = database.get_logs(limit=limit)
        
        return jsonify({'logs': logs})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
