"""
Service de détection de visage utilisant OpenCV.
"""

import cv2
import numpy as np

class FaceDetector:
    """
    Classe pour la détection de visages dans les images.
    Utilise les cascades de Haar d'OpenCV pour la détection.
    """
    
    def __init__(self):
        """
        Initialise le détecteur de visage avec le classificateur en cascade de Haar.
        """
        # Charger le classificateur en cascade pré-entraîné pour la détection de visage
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        
    def detect(self, image):
        """
        Détecte les visages dans une image.
        
        Args:
            image (numpy.ndarray): Image à analyser (format BGR d'OpenCV).
            
        Returns:
            list: Liste des coordonnées des visages détectés [(x, y, w, h), ...].
        """
        # Convertir l'image en niveaux de gris
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Détecter les visages
        faces = self.face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30),
            flags=cv2.CASCADE_SCALE_IMAGE
        )
        
        return faces
    
    def extract_face(self, image, face_coords):
        """
        Extrait la région du visage de l'image.
        
        Args:
            image (numpy.ndarray): Image source.
            face_coords (tuple): Coordonnées du visage (x, y, w, h).
            
        Returns:
            numpy.ndarray: Image du visage extrait.
        """
        x, y, w, h = face_coords
        face_img = image[y:y+h, x:x+w]
        return face_img
    
    def preprocess_face(self, face_img, target_size=(96, 96)):
        """
        Prétraite l'image du visage pour la reconnaissance.
        
        Args:
            face_img (numpy.ndarray): Image du visage.
            target_size (tuple): Taille cible pour le redimensionnement.
            
        Returns:
            numpy.ndarray: Image du visage prétraitée.
        """
        # Redimensionner l'image
        face_resized = cv2.resize(face_img, target_size)
        
        # Convertir en niveaux de gris si ce n'est pas déjà fait
        if len(face_resized.shape) == 3:
            face_gray = cv2.cvtColor(face_resized, cv2.COLOR_BGR2GRAY)
        else:
            face_gray = face_resized
        
        # Normaliser les valeurs de pixels
        face_normalized = face_gray / 255.0
        
        return face_normalized
