"""
Utilitaires de traitement d'images pour le système d'authentification faciale.
"""

import cv2
import numpy as np
import base64
import io
from PIL import Image

def base64_to_image(base64_string):
    """
    Convertit une chaîne base64 en image OpenCV.
    
    Args:
        base64_string (str): Chaîne base64 de l'image.
        
    Returns:
        numpy.ndarray: Image au format OpenCV (BGR).
    """
    # Supprimer le préfixe data:image/jpeg;base64, si présent
    if ',' in base64_string:
        base64_string = base64_string.split(',')[1]
    
    # Décoder la chaîne base64
    image_bytes = base64.b64decode(base64_string)
    
    # Convertir en tableau numpy
    image = np.array(Image.open(io.BytesIO(image_bytes)))
    
    # Convertir de RGB à BGR (format OpenCV)
    if len(image.shape) == 3 and image.shape[2] == 3:
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    
    return image

def image_to_base64(image):
    """
    Convertit une image OpenCV en chaîne base64.
    
    Args:
        image (numpy.ndarray): Image au format OpenCV (BGR).
        
    Returns:
        str: Chaîne base64 de l'image.
    """
    # Convertir de BGR à RGB
    if len(image.shape) == 3 and image.shape[2] == 3:
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    # Convertir en image PIL
    pil_image = Image.fromarray(image)
    
    # Sauvegarder en mémoire au format JPEG
    buffer = io.BytesIO()
    pil_image.save(buffer, format='JPEG')
    
    # Convertir en base64
    base64_string = base64.b64encode(buffer.getvalue()).decode('utf-8')
    
    return f"data:image/jpeg;base64,{base64_string}"

def draw_face_rectangle(image, face_coords, label=None, color=(0, 255, 0), thickness=2):
    """
    Dessine un rectangle autour du visage détecté et ajoute éventuellement une étiquette.
    
    Args:
        image (numpy.ndarray): Image source.
        face_coords (tuple): Coordonnées du visage (x, y, w, h).
        label (str, optional): Étiquette à afficher.
        color (tuple, optional): Couleur du rectangle (BGR).
        thickness (int, optional): Épaisseur du rectangle.
        
    Returns:
        numpy.ndarray: Image avec rectangle et étiquette.
    """
    # Créer une copie de l'image
    result = image.copy()
    
    # Extraire les coordonnées
    x, y, w, h = face_coords
    
    # Dessiner le rectangle
    cv2.rectangle(result, (x, y), (x + w, y + h), color, thickness)
    
    # Ajouter l'étiquette si fournie
    if label:
        # Définir la position et la taille du texte
        font = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = 0.7
        font_thickness = 2
        
        # Calculer la taille du texte
        (text_width, text_height), baseline = cv2.getTextSize(label, font, font_scale, font_thickness)
        
        # Dessiner un fond pour le texte
        cv2.rectangle(result, (x, y - text_height - 10), (x + text_width, y), color, -1)
        
        # Ajouter le texte
        cv2.putText(result, label, (x, y - 5), font, font_scale, (255, 255, 255), font_thickness)
    
    return result
