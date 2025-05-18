/**
 * webcam.js - Gestion de la webcam pour le système d'authentification faciale
 */

class WebcamManager {
    constructor() {
        // Éléments DOM
        this.webcamElement = document.getElementById('webcam');
        this.canvasElement = document.getElementById('canvas');
        this.startButton = document.getElementById('start-webcam');
        this.captureButton = document.getElementById('capture');
        this.loadingIndicator = document.getElementById('loading-indicator');
        
        // Contexte du canvas
        this.canvasContext = this.canvasElement.getContext('2d');
        
        // État
        this.stream = null;
        this.isRunning = false;
        this.captureInterval = null;
        this.autoCapture = false;
        this.autoCaptureInterval = 3000; // 3 secondes
        
        // Lier les méthodes au contexte de la classe
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.captureImage = this.captureImage.bind(this);
        this.startAutoCapture = this.startAutoCapture.bind(this);
        this.stopAutoCapture = this.stopAutoCapture.bind(this);
        
        // Initialiser les écouteurs d'événements
        this.initEventListeners();
    }
    
    initEventListeners() {
        this.startButton.addEventListener('click', this.start);
        this.captureButton.addEventListener('click', this.captureImage);
    }
    
    async start() {
        try {
            // Afficher l'indicateur de chargement
            this.loadingIndicator.classList.remove('hidden');
            
            // Demander l'accès à la webcam
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                }
            });
            
            // Configurer la vidéo
            this.webcamElement.srcObject = this.stream;
            
            // Attendre que la vidéo soit chargée
            await new Promise(resolve => {
                this.webcamElement.onloadedmetadata = () => {
                    resolve();
                };
            });
            
            // Configurer le canvas
            this.canvasElement.width = this.webcamElement.videoWidth;
            this.canvasElement.height = this.webcamElement.videoHeight;
            
            // Mettre à jour l'état
            this.isRunning = true;
            
            // Mettre à jour l'interface
            this.startButton.textContent = 'Arrêter la Webcam';
            this.startButton.classList.remove('primary');
            this.startButton.classList.add('secondary');
            this.captureButton.disabled = false;
            
            // Masquer l'indicateur de chargement
            this.loadingIndicator.classList.add('hidden');
            
            // Mettre à jour le statut
            updateStatus('Webcam active. Placez votre visage devant la caméra.', 'info');
            
            // Modifier l'écouteur d'événements pour arrêter la webcam
            this.startButton.removeEventListener('click', this.start);
            this.startButton.addEventListener('click', this.stop);
        } catch (error) {
            console.error('Erreur lors de l\'accès à la webcam:', error);
            updateStatus('Erreur: Impossible d\'accéder à la webcam. Vérifiez les permissions.', 'error');
            this.loadingIndicator.classList.add('hidden');
            
            // Afficher une alerte
            showModal('Erreur', 'Impossible d\'accéder à la webcam. Veuillez vérifier que vous avez accordé les permissions nécessaires et qu\'aucune autre application n\'utilise la caméra.');
        }
    }
    
    stop() {
        if (this.stream) {
            // Arrêter tous les tracks de la webcam
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
            
            // Effacer la vidéo
            this.webcamElement.srcObject = null;
            
            // Effacer le canvas
            this.canvasContext.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
            
            // Mettre à jour l'état
            this.isRunning = false;
            
            // Arrêter la capture automatique si active
            this.stopAutoCapture();
            
            // Mettre à jour l'interface
            this.startButton.textContent = 'Démarrer la Webcam';
            this.startButton.classList.remove('secondary');
            this.startButton.classList.add('primary');
            this.captureButton.disabled = true;
            
            // Mettre à jour le statut
            updateStatus('Webcam arrêtée.', 'info');
            
            // Réinitialiser l'écouteur d'événements
            this.startButton.removeEventListener('click', this.stop);
            this.startButton.addEventListener('click', this.start);
        }
    }
    
    captureImage() {
        if (!this.isRunning) return null;
        
        // Dessiner l'image de la webcam sur le canvas (en miroir)
        this.canvasContext.save();
        this.canvasContext.scale(-1, 1); // Inverser horizontalement
        this.canvasContext.drawImage(
            this.webcamElement,
            -this.canvasElement.width, 0,
            this.canvasElement.width, this.canvasElement.height
        );
        this.canvasContext.restore();
        
        // Obtenir l'image en base64
        const imageData = this.canvasElement.toDataURL('image/jpeg');
        
        // Mettre à jour le statut
        updateStatus('Image capturée. Analyse en cours...', 'info');
        
        return imageData;
    }
    
    startAutoCapture(callback) {
        if (!this.isRunning || this.captureInterval) return;
        
        this.autoCapture = true;
        
        // Capturer une image à intervalles réguliers
        this.captureInterval = setInterval(() => {
            const imageData = this.captureImage();
            if (imageData && callback) {
                callback(imageData);
            }
        }, this.autoCaptureInterval);
    }
    
    stopAutoCapture() {
        if (this.captureInterval) {
            clearInterval(this.captureInterval);
            this.captureInterval = null;
            this.autoCapture = false;
        }
    }
}

// Créer une instance du gestionnaire de webcam
const webcamManager = new WebcamManager();

// Exporter pour utilisation dans d'autres scripts
window.webcamManager = webcamManager;
