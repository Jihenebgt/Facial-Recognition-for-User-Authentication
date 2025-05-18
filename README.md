# Guide d'utilisation du Système d'Authentification Faciale

## Vue d'ensemble

Ce système d'authentification faciale utilise OpenCV et Python pour la détection et la reconnaissance faciale, avec une interface web en HTML, CSS et JavaScript. Il permet de détecter et reconnaître des visages en temps réel via une webcam.

## Architecture du système

Le système est composé de deux parties principales :

1. **Backend** : Serveur Python Flask avec OpenCV qui gère la détection et la reconnaissance faciale
2. **Frontend** : Interface web qui permet l'interaction avec l'utilisateur et la capture vidéo

## Prérequis

- Python 3.x avec les dépendances listées dans `requirements.txt`
- Navigateur web moderne avec support de l'API MediaDevices
- Webcam fonctionnelle
- Connexion internet pour le chargement des ressources

## Installation

1. Clonez le dépôt ou décompressez l'archive dans un dossier de votre choix
2. Installez les dépendances Python :
   ```
   cd facial-auth-system/backend
   pip install -r requirements.txt
   ```

## Démarrage du système

1. Lancez le serveur backend :
   ```
   cd facial-auth-system/backend
   python app.py
   ```
   Le serveur démarrera sur `http://localhost:5000`

2. Servez les fichiers frontend (plusieurs options) :
   - Utilisez un serveur HTTP simple :
     ```
     cd facial-auth-system
     python -m http.server 8000
     ```
     L'interface sera accessible sur `http://localhost:8000/frontend`
   
   - Ou ouvrez directement le fichier `frontend/index.html` dans votre navigateur

## Utilisation

### Mode Utilisateur

1. Accédez à l'interface web
2. Cliquez sur "Démarrer la Webcam" pour activer la caméra
3. Positionnez votre visage devant la caméra
4. Cliquez sur "Capturer" pour lancer la détection et la reconnaissance
5. Le système affichera :
   - "Visage détecté" si un visage est présent
   - Les informations de l'utilisateur reconnu (nom, âge, profession)
   - "Visage non reconnu" si le visage n'est pas dans la base de données

### Mode Administrateur

1. Cliquez sur "Mode Admin" en bas de page pour accéder aux fonctionnalités d'administration
2. Fonctionnalités disponibles :
   - **Ajouter un Utilisateur** : Enregistrer un nouveau visage avec des informations
   - **Voir les Journaux** : Consulter l'historique des accès et tentatives

#### Ajouter un Utilisateur

1. Cliquez sur "Ajouter un Utilisateur"
2. Remplissez le formulaire avec les informations requises :
   - Nom
   - Âge
   - Profession
3. Utilisez la webcam pour capturer une photo du visage
4. Cliquez sur "Enregistrer" pour ajouter l'utilisateur à la base de données

#### Consulter les Journaux

1. Cliquez sur "Voir les Journaux"
2. Le système affichera un tableau avec l'historique des accès :
   - Date/Heure
   - Action (reconnaissance, ajout d'utilisateur, etc.)
   - Utilisateur concerné
   - Résultat de l'action

## Sécurité

- Les communications entre le frontend et le backend sont sécurisées
- Seuls les embeddings faciaux sont stockés, pas les images brutes
- L'accès aux fonctionnalités d'administration est contrôlé
- Les journaux d'accès permettent de suivre toutes les tentatives

## Dépannage

### La webcam ne démarre pas

- Vérifiez que vous avez accordé les permissions d'accès à la caméra dans votre navigateur
- Assurez-vous qu'aucune autre application n'utilise la webcam
- Essayez de rafraîchir la page ou de redémarrer le navigateur

### Le visage n'est pas détecté

- Assurez-vous d'être bien éclairé et face à la caméra
- Évitez les arrière-plans trop chargés
- Vérifiez que votre visage est entièrement visible dans le cadre

### Le backend ne répond pas

- Vérifiez que le serveur backend est bien en cours d'exécution
- Assurez-vous que le port 5000 n'est pas bloqué par un pare-feu
- Vérifiez les logs du serveur pour d'éventuelles erreurs

## Personnalisation

Le système peut être personnalisé de plusieurs façons :

- Modifier les styles CSS pour changer l'apparence
- Ajuster les paramètres de détection dans le backend pour plus de précision
- Ajouter de nouvelles fonctionnalités comme la détection de vivacité

## Limitations connues

- La reconnaissance faciale simple peut être sensible aux conditions d'éclairage
- Le système ne dispose pas de détection de vivacité avancée (anti-spoofing)
- La base de données utilise un stockage fichier simple (non adapté à la production à grande échelle)

## Support

Pour toute question ou problème, veuillez contacter l'équipe de support.
"# Facial-Recognition-for-User-Authentication" 
