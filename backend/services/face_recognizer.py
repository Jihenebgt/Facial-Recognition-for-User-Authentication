"""
Service de reconnaissance faciale utilisant OpenCV.
"""

import cv2
import numpy as np
import os

class FaceRecognizer:
    """
    Classe pour la reconnaissance de visages.
    Utilise OpenCV DNN pour l'extraction de caractéristiques et la comparaison.
    """
    
    def __init__(self, model_path=None, threshold=0.6):
        """
        Initialise le reconnaisseur de visage.
        
        Args:
            model_path (str, optional): Chemin vers le modèle pré-entraîné.
            threshold (float, optional): Seuil de similarité pour la reconnaissance.
        """
        self.threshold = threshold
        self.known_faces = {}  # Dictionnaire {user_id: embedding}
        
        # Utiliser le modèle DNN d'OpenCV pour la reconnaissance faciale
        if model_path and os.path.exists(model_path):
            self.model = cv2.dnn.readNetFromTorch(model_path)
        else:
            # Utiliser une approche plus simple basée sur LBPH si le modèle n'est pas disponible
            print("OpenCV face module not available, using simplified recognition approach")
            self.model = None
    
    def extract_features(self, face_img):
        """
        Extrait les caractéristiques faciales (embeddings) d'une image de visage.
        
        Args:
            face_img (numpy.ndarray): Image du visage prétraitée.
            
        Returns:
            numpy.ndarray: Vecteur d'embedding facial.
        """
        # Pour une approche simplifiée, nous utilisons une version normalisée de l'image
        # Dans une implémentation réelle, nous utiliserions un modèle DNN pour extraire les embeddings
        
        # Redimensionner l'image à une taille standard
        face_resized = cv2.resize(face_img, (100, 100))
        
        # Aplatir l'image en un vecteur
        face_vector = face_resized.flatten()
        
        # Normaliser le vecteur
        face_vector = face_vector / np.linalg.norm(face_vector)
        
        return face_vector
    
    def add_face(self, user_id, face_img):
        """
        Ajoute un visage à la base de données des visages connus.
        
        Args:
            user_id (str): Identifiant de l'utilisateur.
            face_img (numpy.ndarray): Image du visage.
            
        Returns:
            bool: True si l'ajout a réussi, False sinon.
        """
        try:
            # Extraire les caractéristiques du visage
            embedding = self.extract_features(face_img)
            
            # Stocker l'embedding
            self.known_faces[user_id] = embedding
            
            return True
        except Exception as e:
            print(f"Erreur lors de l'ajout du visage: {e}")
            return False
    
    def recognize(self, face_img):
        """
        Reconnaît un visage en le comparant aux visages connus.
        
        Args:
            face_img (numpy.ndarray): Image du visage à reconnaître.
            
        Returns:
            tuple: (user_id, confidence) si reconnu, (None, None) sinon.
        """
        # Extraire les caractéristiques du visage
        embedding = self.extract_features(face_img)
        
        best_match = None
        best_distance = float('inf')
        
        # Comparer avec tous les visages connus
        for user_id, known_embedding in self.known_faces.items():
            # Calculer la distance euclidienne
            distance = np.linalg.norm(embedding - known_embedding)
            
            # Mettre à jour le meilleur match si la distance est plus petite
            if distance < best_distance:
                best_distance = distance
                best_match = user_id
        
        # Vérifier si la distance est inférieure au seuil
        if best_match and best_distance < self.threshold:
            # Convertir la distance en score de confiance (0-100%)
            confidence = max(0, min(100, 100 * (1 - best_distance / self.threshold)))
            return best_match, confidence
        
        return None, None
