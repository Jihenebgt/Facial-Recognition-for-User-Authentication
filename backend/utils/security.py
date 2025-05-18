"""
Utilitaires de sécurité pour le système d'authentification faciale.
"""

import jwt
import datetime
import os
from dotenv import load_dotenv
from functools import wraps


# Charger les variables d'environnement
load_dotenv()

# Clé secrète pour JWT (à stocker dans un fichier .env en production)
SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'default_secret_key_for_development')

def generate_token(user_id, expiration_minutes=60):
    """
    Génère un token JWT pour l'authentification.
    
    Args:
        user_id (str): ID de l'utilisateur.
        expiration_minutes (int): Durée de validité du token en minutes.
        
    Returns:
        str: Token JWT.
    """
    payload = {
        'user_id': user_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=expiration_minutes),
        'iat': datetime.datetime.utcnow()
    }
    
    token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
    
    return token

def verify_token(token):
    """
    Vérifie la validité d'un token JWT.
    
    Args:
        token (str): Token JWT à vérifier.
        
    Returns:
        dict/None: Payload du token si valide, None sinon.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        # Token expiré
        return None
    except jwt.InvalidTokenError:
        # Token invalide
        return None

def token_required(f):
    """
    Décorateur pour protéger les routes avec authentification JWT.
    
    Args:
        f (function): Fonction à décorer.
        
    Returns:
        function: Fonction décorée.
    """
    @wraps(f)  # Add this line
    def decorated(*args, **kwargs):
        from flask import request, jsonify
        
        token = None
        
        # Vérifier si le token est présent dans l'en-tête Authorization
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'message': 'Token manquant!'}), 401
        
        # Vérifier la validité du token
        payload = verify_token(token)
        if not payload:
            return jsonify({'message': 'Token invalide ou expiré!'}), 401
        
        # Ajouter l'ID utilisateur aux arguments de la fonction
        kwargs['user_id'] = payload['user_id']
        
        return f(*args, **kwargs)
    
    return decorated
