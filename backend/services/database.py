"""
Service de base de données pour le système d'authentification faciale.
"""

import os
import json
import numpy as np
from models.user import User

class Database:
    """
    Classe pour la gestion de la base de données des utilisateurs et des journaux.
    Utilise des fichiers JSON pour le stockage (pour simplifier).
    """
    
    def __init__(self, db_dir='database'):
        """
        Initialise la base de données.
        
        Args:
            db_dir (str): Répertoire de la base de données.
        """
        self.db_dir = db_dir
        self.users_file = os.path.join(db_dir, 'users.json')
        self.logs_file = os.path.join(db_dir, 'logs.json')
        
        # Créer le répertoire de la base de données s'il n'existe pas
        os.makedirs(db_dir, exist_ok=True)
        
        # Initialiser les fichiers s'ils n'existent pas
        if not os.path.exists(self.users_file):
            self._save_data(self.users_file, {})
        
        if not os.path.exists(self.logs_file):
            self._save_data(self.logs_file, [])
    
    def _load_data(self, file_path):
        """
        Charge les données depuis un fichier JSON.
        
        Args:
            file_path (str): Chemin du fichier.
            
        Returns:
            dict/list: Données chargées.
        """
        try:
            with open(file_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Erreur lors du chargement des données: {e}")
            return {} if file_path == self.users_file else []
    
    def _save_data(self, file_path, data):
        """
        Sauvegarde les données dans un fichier JSON.
        
        Args:
            file_path (str): Chemin du fichier.
            data (dict/list): Données à sauvegarder.
            
        Returns:
            bool: True si la sauvegarde a réussi, False sinon.
        """
        try:
            with open(file_path, 'w') as f:
                json.dump(data, f, indent=2)
            return True
        except Exception as e:
            print(f"Erreur lors de la sauvegarde des données: {e}")
            return False
    
    def get_user(self, user_id):
        """
        Récupère un utilisateur par son ID.
        
        Args:
            user_id (str): ID de l'utilisateur.
            
        Returns:
            User: Objet utilisateur ou None si non trouvé.
        """
        users = self._load_data(self.users_file)
        user_data = users.get(user_id)
        
        if user_data:
            # Convertir l'embedding de liste à numpy array
            if 'face_embedding' in user_data and user_data['face_embedding']:
                user_data['face_embedding'] = np.array(user_data['face_embedding'])
            
            return User.from_dict(user_data)
        
        return None
    
    def get_all_users(self):
        """
        Récupère tous les utilisateurs.
        
        Returns:
            list: Liste des objets utilisateur.
        """
        users_data = self._load_data(self.users_file)
        users = []
        
        for user_id, user_data in users_data.items():
            # Convertir l'embedding de liste à numpy array
            if 'face_embedding' in user_data and user_data['face_embedding']:
                user_data['face_embedding'] = np.array(user_data['face_embedding'])
            
            users.append(User.from_dict(user_data))
        
        return users
    
    def add_user(self, user):
        """
        Ajoute ou met à jour un utilisateur.
        
        Args:
            user (User): Objet utilisateur.
            
        Returns:
            bool: True si l'ajout a réussi, False sinon.
        """
        users = self._load_data(self.users_file)
        
        # Créer un dictionnaire à partir de l'objet utilisateur
        user_dict = user.__dict__.copy()
        
        # Convertir l'embedding numpy array en liste pour le stockage JSON
        if user.face_embedding is not None:
            user_dict['face_embedding'] = user.face_embedding.tolist()
        
        # Ajouter l'utilisateur
        users[user.user_id] = user_dict
        
        return self._save_data(self.users_file, users)
    
    def delete_user(self, user_id):
        """
        Supprime un utilisateur.
        
        Args:
            user_id (str): ID de l'utilisateur.
            
        Returns:
            bool: True si la suppression a réussi, False sinon.
        """
        users = self._load_data(self.users_file)
        
        if user_id in users:
            del users[user_id]
            return self._save_data(self.users_file, users)
        
        return False
    
    def add_log(self, log_entry):
        """
        Ajoute une entrée de journal.
        
        Args:
            log_entry (dict): Entrée de journal.
            
        Returns:
            bool: True si l'ajout a réussi, False sinon.
        """
        logs = self._load_data(self.logs_file)
        logs.append(log_entry)
        
        return self._save_data(self.logs_file, logs)
    
    def get_logs(self, limit=100):
        """
        Récupère les entrées de journal.
        
        Args:
            limit (int): Nombre maximum d'entrées à récupérer.
            
        Returns:
            list: Liste des entrées de journal.
        """
        logs = self._load_data(self.logs_file)
        
        # Retourner les dernières entrées
        return logs[-limit:]
