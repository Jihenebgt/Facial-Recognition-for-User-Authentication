/**
 * ui.js - Gestion de l'interface utilisateur pour le système d'authentification faciale
 */

// Éléments DOM globaux
const statusMessage = document.getElementById('status-message');
const userInfo = document.getElementById('user-info');
const noRecognition = document.getElementById('no-recognition');
const userPhoto = document.getElementById('user-photo');
const userName = document.getElementById('user-name');
const userAge = document.getElementById('user-age');
const userProfession = document.getElementById('user-profession');
const userConfidence = document.getElementById('confidence');
const captureButton = document.getElementById('capture');
const adminSection = document.getElementById('admin-section');
const toggleAdminButton = document.getElementById('toggle-admin');
const addUserButton = document.getElementById('add-user');
const viewLogsButton = document.getElementById('view-logs');
const addUserForm = document.getElementById('add-user-form');
const userForm = document.getElementById('user-form');
const cancelAddUserButton = document.getElementById('cancel-add-user');
const logsContainer = document.getElementById('logs-container');
const logsTable = document.getElementById('logs-table');
const logsBody = document.getElementById('logs-body');
const closeLogsButton = document.getElementById('close-logs');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalOkButton = document.getElementById('modal-ok');
const closeModalButton = document.querySelector('.close-modal');

// Variables d'état
let isAdminMode = false;
let isRecognizing = false;
let adminWebcamManager = null;

/**
 * Met à jour le message de statut
 * @param {string} message - Message à afficher
 * @param {string} type - Type de message (info, success, error, warning)
 */
function updateStatus(message, type = 'info') {
    statusMessage.textContent = message;
    
    // Supprimer toutes les classes de statut
    statusMessage.classList.remove('status-info', 'status-success', 'status-error', 'status-warning');
    
    // Ajouter la classe correspondante au type
    statusMessage.classList.add(`status-${type}`);
}

/**
 * Affiche une boîte de dialogue modale
 * @param {string} title - Titre de la boîte de dialogue
 * @param {string} message - Message à afficher
 */
function showModal(title, message) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modal.classList.remove('hidden');
}

/**
 * Ferme la boîte de dialogue modale
 */
function closeModal() {
    modal.classList.add('hidden');
}

/**
 * Affiche les informations de l'utilisateur reconnu
 * @param {object} user - Informations de l'utilisateur
 * @param {number} confidence - Niveau de confiance (0-100)
 * @param {string} photoUrl - URL de la photo annotée
 */
function displayUserInfo(user, confidence, photoUrl) {
    // Masquer le message "Aucune reconnaissance"
    noRecognition.classList.add('hidden');
    
    // Afficher les informations de l'utilisateur
    userInfo.classList.remove('hidden');
    
    // Mettre à jour les informations
    userName.textContent = user.name;
    userAge.textContent = `Âge: ${user.age} ans`;
    userProfession.textContent = `Profession: ${user.profession}`;
    userConfidence.textContent = `Confiance: ${confidence.toFixed(2)}%`;
    
    // Mettre à jour la photo
    userPhoto.src = photoUrl;
    
    // Mettre à jour le statut
    updateStatus(`Utilisateur reconnu: ${user.name}`, 'success');
}

/**
 * Réinitialise l'affichage des informations utilisateur
 */
function resetUserInfo() {
    // Masquer les informations de l'utilisateur
    userInfo.classList.add('hidden');
    
    // Afficher le message "Aucune reconnaissance"
    noRecognition.classList.remove('hidden');
    
    // Réinitialiser les informations
    userName.textContent = '-';
    userAge.textContent = '-';
    userProfession.textContent = '-';
    userConfidence.textContent = '-';
    userPhoto.src = '';
}

/**
 * Initialise le gestionnaire de webcam pour l'administration
 */
function initAdminWebcam() {
    if (adminWebcamManager) return;
    
    const adminWebcamElement = document.getElementById('admin-webcam');
    const adminCanvasElement = document.getElementById('admin-canvas');
    const adminCaptureButton = document.getElementById('admin-capture');
    
    // Créer un gestionnaire de webcam pour l'administration
    adminWebcamManager = {
        webcamElement: adminWebcamElement,
        canvasElement: adminCanvasElement,
        canvasContext: adminCanvasElement.getContext('2d'),
        stream: null,
        isRunning: false,
        
        async start() {
            try {
                // Demander l'accès à la webcam
                this.stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 320 },
                        height: { ideal: 240 },
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
            } catch (error) {
                console.error('Erreur lors de l\'accès à la webcam admin:', error);
                showModal('Erreur', 'Impossible d\'accéder à la webcam pour l\'ajout d\'utilisateur. Veuillez vérifier les permissions.');
            }
        },
        
        stop() {
            if (this.stream) {
                // Arrêter tous les tracks de la webcam
                this.stream.getTracks().forEach(track => track.stop());
                this.stream = null;
                
                // Effacer la vidéo
                this.webcamElement.srcObject = null;
                
                // Mettre à jour l'état
                this.isRunning = false;
            }
        },
        
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
            return this.canvasElement.toDataURL('image/jpeg');
        }
    };
    
    // Ajouter l'écouteur d'événement pour la capture
    adminCaptureButton.addEventListener('click', () => {
        if (!adminWebcamManager.isRunning) {
            showModal('Erreur', 'La webcam n\'est pas active. Veuillez réessayer.');
            return;
        }
        
        // Capturer l'image
        const imageData = adminWebcamManager.captureImage();
        
        // Afficher l'image capturée
        adminCanvasElement.classList.remove('hidden');
        adminWebcamElement.classList.add('hidden');
        
        // Stocker l'image dans un champ caché pour l'envoi du formulaire
        const imageInput = document.createElement('input');
        imageInput.type = 'hidden';
        imageInput.name = 'image_data';
        imageInput.value = imageData;
        
        // Remplacer l'ancien champ s'il existe
        const oldImageInput = userForm.querySelector('input[name="image_data"]');
        if (oldImageInput) {
            userForm.removeChild(oldImageInput);
        }
        
        userForm.appendChild(imageInput);
    });
}

/**
 * Initialise les écouteurs d'événements pour l'interface utilisateur
 */
function initEventListeners() {
    // Capture d'image
    captureButton.addEventListener('click', async () => {
        if (isRecognizing) return;
        
        try {
            isRecognizing = true;
            
            // Capturer l'image
            const imageData = webcamManager.captureImage();
            if (!imageData) {
                updateStatus('Erreur: Impossible de capturer l\'image.', 'error');
                isRecognizing = false;
                return;
            }
            
            // Détecter les visages
            const detectionResult = await apiService.detectFace(imageData);
            
            if (detectionResult.faces_detected === 0) {
                updateStatus('Aucun visage détecté. Veuillez vous positionner face à la caméra.', 'warning');
                resetUserInfo();
                isRecognizing = false;
                return;
            }
            
            updateStatus(`${detectionResult.faces_detected} visage(s) détecté(s). Reconnaissance en cours...`, 'info');
            
            // Reconnaître le visage
            const recognitionResult = await apiService.recognizeFace(imageData);
            
            if (recognitionResult.recognized) {
                // Afficher les informations de l'utilisateur
                displayUserInfo(
                    recognitionResult.user,
                    recognitionResult.confidence,
                    recognitionResult.annotated_image
                );
            } else {
                // Réinitialiser l'affichage
                resetUserInfo();
                updateStatus('Visage non reconnu.', 'warning');
                
                // Afficher l'image annotée si disponible
                if (recognitionResult.annotated_image) {
                    userPhoto.src = recognitionResult.annotated_image;
                    userInfo.classList.remove('hidden');
                    noRecognition.classList.add('hidden');
                    userName.textContent = 'Inconnu';
                    userAge.textContent = '-';
                    userProfession.textContent = '-';
                    userConfidence.textContent = '-';
                }
            }
        } catch (error) {
            console.error('Erreur lors de la reconnaissance:', error);
            updateStatus(`Erreur: ${error.message}`, 'error');
            resetUserInfo();
        } finally {
            isRecognizing = false;
        }
    });
    
    // Basculer en mode admin
    toggleAdminButton.addEventListener('click', () => {
        isAdminMode = !isAdminMode;
        
        if (isAdminMode) {
            adminSection.classList.remove('hidden');
            toggleAdminButton.textContent = 'Mode Utilisateur';
        } else {
            adminSection.classList.add('hidden');
            toggleAdminButton.textContent = 'Mode Admin';
            
            // Masquer les sous-sections
            addUserForm.classList.add('hidden');
            logsContainer.classList.add('hidden');
            
            // Arrêter la webcam admin si active
            if (adminWebcamManager && adminWebcamManager.isRunning) {
                adminWebcamManager.stop();
            }
        }
    });
    
    // Afficher le formulaire d'ajout d'utilisateur
    addUserButton.addEventListener('click', async () => {
        addUserForm.classList.remove('hidden');
        logsContainer.classList.add('hidden');
        
        // Initialiser la webcam admin
        initAdminWebcam();
        
        // Démarrer la webcam admin
        if (adminWebcamManager && !adminWebcamManager.isRunning) {
            await adminWebcamManager.start();
        }
        
        // Réinitialiser le formulaire
        userForm.reset();
        
        // Afficher la vidéo et masquer le canvas
        document.getElementById('admin-webcam').classList.remove('hidden');
        document.getElementById('admin-canvas').classList.add('hidden');
    });
    
    // Annuler l'ajout d'utilisateur
    cancelAddUserButton.addEventListener('click', () => {
        addUserForm.classList.add('hidden');
        
        // Arrêter la webcam admin
        if (adminWebcamManager && adminWebcamManager.isRunning) {
            adminWebcamManager.stop();
        }
    });
    
    // Soumettre le formulaire d'ajout d'utilisateur
    userForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        // Récupérer les données du formulaire
        const name = document.getElementById('name').value;
        const age = parseInt(document.getElementById('age').value);
        const profession = document.getElementById('profession').value;
        const imageData = userForm.querySelector('input[name="image_data"]')?.value;
        
        if (!imageData) {
            showModal('Erreur', 'Veuillez capturer une photo avant de soumettre le formulaire.');
            return;
        }
        
        try {
            // Ajouter l'utilisateur
            const result = await apiService.addUser(name, age, profession, imageData);
            
            if (result.success) {
                showModal('Succès', `L'utilisateur ${name} a été ajouté avec succès.`);
                
                // Masquer le formulaire
                addUserForm.classList.add('hidden');
                
                // Arrêter la webcam admin
                if (adminWebcamManager && adminWebcamManager.isRunning) {
                    adminWebcamManager.stop();
                }
            } else {
                showModal('Erreur', result.error || 'Une erreur est survenue lors de l\'ajout de l\'utilisateur.');
            }
        } catch (error) {
            console.error('Erreur lors de l\'ajout de l\'utilisateur:', error);
            showModal('Erreur', `Une erreur est survenue: ${error.message}`);
        }
    });
    
    // Afficher les journaux
    viewLogsButton.addEventListener('click', async () => {
        logsContainer.classList.remove('hidden');
        addUserForm.classList.add('hidden');
        
        // Arrêter la webcam admin si active
        if (adminWebcamManager && adminWebcamManager.isRunning) {
            adminWebcamManager.stop();
        }
        
        try {
            // Récupérer les journaux
            const result = await apiService.getLogs();
            
            // Vider le tableau
            logsBody.innerHTML = '';
            
            if (result.logs && result.logs.length > 0) {
                // Trier les journaux par date (du plus récent au plus ancien)
                const sortedLogs = result.logs.sort((a, b) => {
                    return new Date(b.timestamp) - new Date(a.timestamp);
                });
                
                // Ajouter les entrées au tableau
                sortedLogs.forEach(log => {
                    const row = document.createElement('tr');
                    
                    // Formater la date
                    const date = new Date(log.timestamp);
                    const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
                    
                    // Créer les cellules
                    const dateCell = document.createElement('td');
                    dateCell.textContent = formattedDate;
                    
                    const actionCell = document.createElement('td');
                    actionCell.textContent = log.action;
                    
                    const userCell = document.createElement('td');
                    userCell.textContent = log.user_id || '-';
                    
                    const resultCell = document.createElement('td');
                    resultCell.textContent = log.result || '-';
                    
                    // Ajouter les cellules à la ligne
                    row.appendChild(dateCell);
                    row.appendChild(actionCell);
                    row.appendChild(userCell);
                    row.appendChild(resultCell);
                    
                    // Ajouter la ligne au tableau
                    logsBody.appendChild(row);
                });
            } else {
                // Aucun journal
                const row = document.createElement('tr');
                const cell = document.createElement('td');
                cell.colSpan = 4;
                cell.textContent = 'Aucun journal disponible.';
                cell.style.textAlign = 'center';
                row.appendChild(cell);
                logsBody.appendChild(row);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des journaux:', error);
            
            // Afficher un message d'erreur
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 4;
            cell.textContent = `Erreur: ${error.message}`;
            cell.style.textAlign = 'center';
            cell.style.color = 'red';
            row.appendChild(cell);
            logsBody.appendChild(row);
        }
    });
    
    // Fermer les journaux
    closeLogsButton.addEventListener('click', () => {
        logsContainer.classList.add('hidden');
    });
    
    // Fermer la boîte de dialogue modale
    modalOkButton.addEventListener('click', closeModal);
    closeModalButton.addEventListener('click', closeModal);
    
    // Fermer la boîte de dialogue modale en cliquant en dehors
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
}

/**
 * Initialise l'application
 */
async function initApp() {
    try {
        // Vérifier l'état de l'API
        const healthCheck = await apiService.checkHealth();
        console.log('API status:', healthCheck);
        
        // Initialiser les écouteurs d'événements
        initEventListeners();
        
        // Mettre à jour le statut
        updateStatus('Prêt. Cliquez sur "Démarrer la Webcam" pour commencer.', 'info');
    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
        updateStatus('Erreur: Impossible de se connecter à l\'API. Veuillez vérifier que le serveur est en cours d\'exécution.', 'error');
        
        // Afficher une alerte
        showModal('Erreur de connexion', 'Impossible de se connecter à l\'API. Veuillez vérifier que le serveur backend est en cours d\'exécution sur http://localhost:5000.');
    }
}

// Initialiser l'application au chargement de la page
document.addEventListener('DOMContentLoaded', initApp);
