"""
Module de modèle utilisateur pour le système d'authentification faciale.
Définit la structure des données utilisateur et les méthodes associées.
"""

class User:
    """
    Classe représentant un utilisateur dans le système d'authentification faciale.
    Stocke les informations personnelles et les embeddings faciaux.
    """
    
    def __init__(self, user_id=None, name=None, age=None, profession=None, face_embedding=None):
        """
        Initialise un nouvel utilisateur.
        
        Args:
            user_id (str, optional): Identifiant unique de l'utilisateur.
            name (str, optional): Nom de l'utilisateur.
            age (int, optional): Âge de l'utilisateur.
            profession (str, optional): Profession de l'utilisateur.
            face_embedding (list, optional): Vecteur d'embedding facial.
        """
        self.user_id = user_id
        self.name = name
        self.age = age
        self.profession = profession
        self.face_embedding = face_embedding
    
    def to_dict(self):
        """
        Convertit l'objet utilisateur en dictionnaire.
        
        Returns:
            dict: Représentation dictionnaire de l'utilisateur.
        """
        return {
            'user_id': self.user_id,
            'name': self.name,
            'age': self.age,
            'profession': self.profession,
            # Ne pas inclure l'embedding facial pour des raisons de sécurité
        }
    
    @classmethod
    def from_dict(cls, data):
        """
        Crée un objet utilisateur à partir d'un dictionnaire.
        
        Args:
            data (dict): Dictionnaire contenant les données utilisateur.
            
        Returns:
            User: Nouvel objet utilisateur.
        """
        return cls(
            user_id=data.get('user_id'),
            name=data.get('name'),
            age=data.get('age'),
            profession=data.get('profession'),
            face_embedding=data.get('face_embedding')
        )
