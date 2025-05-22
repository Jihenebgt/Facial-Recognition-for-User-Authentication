/**
 * ui.js - User interface management for the facial authentification system 
 */

// Global DOM elements 
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

// State Variables 
let isAdminMode = false;
let isRecognizing = false;
let adminWebcamManager = null;

/**
 * Update the status message 
 * @param {string} message - Message to display 
 * @param {string} type - Type of message (info, success, error, warning)
 */
function updateStatus(message, type = 'info') {
    statusMessage.textContent = message;
    
    // Delete all status classes 
    statusMessage.classList.remove('status-info', 'status-success', 'status-error', 'status-warning');
    
    // Add the class that corresponds to the type
    statusMessage.classList.add(`status-${type}`);
}

/**
 * Display a modal dialogue box 
 * @param {string} title - Title of the dialogue box
 * @param {string} message - Message to display 
 */
function showModal(title, message) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modal.classList.remove('hidden');
}

/**
 * Close the modal dialogue box 
 */
function closeModal() {
    modal.classList.add('hidden');
}

/**
 * Display the information of the recognized user
 * @param {object} user - Informations of the user
 * @param {number} confidence - Confiance interval (0-100)
 * @param {string} photoUrl - URL of the annoted photo 
 */
function displayUserInfo(user, confidence, photoUrl) {
    // Hide the message "No recognition"
    noRecognition.classList.add('hidden');
    
    // Display the info of the user 
    userInfo.classList.remove('hidden');
    
    // Update information
    userName.textContent = user.name;
    userAge.textContent = `Âge: ${user.age} ans`;
    userProfession.textContent = `Profession: ${user.profession}`;
    userConfidence.textContent = `Confiance: ${confidence.toFixed(2)}%`;
    
    // Update the photo
    userPhoto.src = photoUrl;
    
    // Update the statut
    updateStatus(`Utilisateur reconnu: ${user.name}`, 'success');
}

/**
 * Réinitialise l'affichage des informations utilisateur
 */
function resetUserInfo() {
    // Hide user information
    userInfo.classList.add('hidden');
    
    // Display the message "No recognition"
    noRecognition.classList.remove('hidden');
    
    // Reinitialise the info
    userName.textContent = '-';
    userAge.textContent = '-';
    userProfession.textContent = '-';
    userConfidence.textContent = '-';
    userPhoto.src = '';
}

/**
 * Initialise the webcam manager for the administration
 */
function initAdminWebcam() {
    if (adminWebcamManager) return;
    
    const adminWebcamElement = document.getElementById('admin-webcam');
    const adminCanvasElement = document.getElementById('admin-canvas');
    const adminCaptureButton = document.getElementById('admin-capture');
    
    // Create the webcam manager for the administration
    adminWebcamManager = {
        webcamElement: adminWebcamElement,
        canvasElement: adminCanvasElement,
        canvasContext: adminCanvasElement.getContext('2d'),
        stream: null,
        isRunning: false,
        
        async start() {
            try {
                // Demand the access to the webcam
                this.stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 320 },
                        height: { ideal: 240 },
                        facingMode: 'user'
                    }
                });
                
                // Configurate the video
                this.webcamElement.srcObject = this.stream;
                
                // Wait for the video to load 
                await new Promise(resolve => {
                    this.webcamElement.onloadedmetadata = () => {
                        resolve();
                    };
                });
                
                // Configurate the canvas
                this.canvasElement.width = this.webcamElement.videoWidth;
                this.canvasElement.height = this.webcamElement.videoHeight;
                
                // Update the state
                this.isRunning = true;
            } catch (error) {
                console.error('Error accessing the admin webcam', error);
                showModal('Error', 'Unable to access the webcam for user addition. Please check the permissions.');
            }
        },
        
        stop() {
            if (this.stream) {
                // Stop all tracks of the webcam
                this.stream.getTracks().forEach(track => track.stop());
                this.stream = null;
                
                // Delete the video
                this.webcamElement.srcObject = null;
                
                // Update the state
                this.isRunning = false;
            }
        },
        
        captureImage() {
            if (!this.isRunning) return null;
            
            // Draw the webcam image on the canvas (mirrored)
            this.canvasContext.save();
            this.canvasContext.scale(-1, 1); // Flip horizontally
            this.canvasContext.drawImage(
                this.webcamElement,
                -this.canvasElement.width, 0,
                this.canvasElement.width, this.canvasElement.height
            );
            this.canvasContext.restore();
            
            // Obtain the image in base64
            return this.canvasElement.toDataURL('image/jpeg');
        }
    };
    
    // Add the event listener for capturing 
    adminCaptureButton.addEventListener('click', () => {
        if (!adminWebcamManager.isRunning) {
            showModal('Error', 'The webcam is not actived. Please try again');
            return;
        }
        
        // Capture the image
        const imageData = adminWebcamManager.captureImage();
        
        // Display the captured image
        adminCanvasElement.classList.remove('hidden');
        adminWebcamElement.classList.add('hidden');
        
        // Store the image in a hidden field for form submission 
        const imageInput = document.createElement('input');
        imageInput.type = 'hidden';
        imageInput.name = 'image_data';
        imageInput.value = imageData;
        
        // Replace the old field if it exists
        const oldImageInput = userForm.querySelector('input[name="image_data"]');
        if (oldImageInput) {
            userForm.removeChild(oldImageInput);
        }
        
        userForm.appendChild(imageInput);
    });
}

/**
 * Initialize the event listeners for the user interface.
 */
function initEventListeners() {
    // Capture the image
    captureButton.addEventListener('click', async () => {
        if (isRecognizing) return;
        
        try {
            isRecognizing = true;
            
            // Capture the image
            const imageData = webcamManager.captureImage();
            if (!imageData) {
                updateStatus('Error: Unable to capture the image.', 'error');
                isRecognizing = false;
                return;
            }
            
            // Detect faces
            const detectionResult = await apiService.detectFace(imageData);
            
            if (detectionResult.faces_detected === 0) {
                updateStatus('No face detected. Please position yourself facing the camera. Unable to capture the image.', 'warning');
                resetUserInfo();
                isRecognizing = false;
                return;
            }
            
            updateStatus(`${detectionResult.faces_detected} face(s) detected. Recognition in progress...`, 'info');
            
            // Recognize the face 
            const recognitionResult = await apiService.recognizeFace(imageData);
            
            if (recognitionResult.recognized) {
                // Display user info
                displayUserInfo(
                    recognitionResult.user,
                    recognitionResult.confidence,
                    recognitionResult.annotated_image
                );
            } else {
                // Reinitialise the display 
                resetUserInfo();
                updateStatus('Visage non reconnu.', 'warning');
                
                // Display the annotated image if available
                if (recognitionResult.annotated_image) {
                    userPhoto.src = recognitionResult.annotated_image;
                    userInfo.classList.remove('hidden');
                    noRecognition.classList.add('hidden');
                    userName.textContent = 'Unknown';
                    userAge.textContent = '-';
                    userProfession.textContent = '-';
                    userConfidence.textContent = '-';
                }
            }
        } catch (error) {
            console.error('Error during recognition:', error);
            updateStatus(`Erreur: ${error.message}`, 'error');
            resetUserInfo();
        } finally {
            isRecognizing = false;
        }
    });
    
    // Switch to admin mode
    toggleAdminButton.addEventListener('click', () => {
        isAdminMode = !isAdminMode;
        
        if (isAdminMode) {
            adminSection.classList.remove('hidden');
            toggleAdminButton.textContent = 'Mode Utilisateur';
        } else {
            adminSection.classList.add('hidden');
            toggleAdminButton.textContent = 'Mode Admin';
            
            // Hide the subsections
            addUserForm.classList.add('hidden');
            logsContainer.classList.add('hidden');
            
            // Stop the admin webcam if active
            if (adminWebcamManager && adminWebcamManager.isRunning) {
                adminWebcamManager.stop();
            }
        }
    });
    
    // Show the user addition form
    addUserButton.addEventListener('click', async () => {
        addUserForm.classList.remove('hidden');
        logsContainer.classList.add('hidden');
        
        // Initialise the admin webcam 
        initAdminWebcam();
        
        // Start the admin webcam 
        if (adminWebcamManager && !adminWebcamManager.isRunning) {
            await adminWebcamManager.start();
        }
        
        // Reinitialise  the form
        userForm.reset();
        
        // Show the video and hide the canvas
        document.getElementById('admin-webcam').classList.remove('hidden');
        document.getElementById('admin-canvas').classList.add('hidden');
    });
    
    // Cancel the user addition
    cancelAddUserButton.addEventListener('click', () => {
        addUserForm.classList.add('hidden');
        
        // Stop the admin webcam 
        if (adminWebcamManager && adminWebcamManager.isRunning) {
            adminWebcamManager.stop();
        }
    });
    
    // Submit the user addition form
    userForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        // Retrieve the form data
        const name = document.getElementById('name').value;
        const age = parseInt(document.getElementById('age').value);
        const profession = document.getElementById('profession').value;
        const imageData = userForm.querySelector('input[name="image_data"]')?.value;
        
        if (!imageData) {
            showModal('Error', 'Please take a photo before submitting the form.');
            return;
        }
        
        try {
            // Add a user
            const result = await apiService.addUser(name, age, profession, imageData);
            
            if (result.success) {
                showModal('Success', `User ${name} has been successfully added.`);
                
                // Hide the form
                addUserForm.classList.add('hidden');
                
                // Stop the admin webcam 
                if (adminWebcamManager && adminWebcamManager.isRunning) {
                    adminWebcamManager.stop();
                }
            } else {
                showModal('Error', result.error || 'An error occurred while adding the user.');
            }
        } catch (error) {
            console.error('Error while adding the user:', error);
            showModal('Error', `An error has occurred: ${error.message}`);
        }
    });
    
    // Show the logs
    viewLogsButton.addEventListener('click', async () => {
        logsContainer.classList.remove('hidden');
        addUserForm.classList.add('hidden');
        
        // Stop the admin webcam if active
        if (adminWebcamManager && adminWebcamManager.isRunning) {
            adminWebcamManager.stop();
        }
        
        try {
            // Retrieve the logs
            const result = await apiService.getLogs();
            
            // Empty the table
            logsBody.innerHTML = '';
            
            if (result.logs && result.logs.length > 0) {
                // Sort the newspapers by date (from the most recent to the oldest)
                const sortedLogs = result.logs.sort((a, b) => {
                    return new Date(b.timestamp) - new Date(a.timestamp);
                });
                
                // Add the entries to the table
                sortedLogs.forEach(log => {
                    const row = document.createElement('tr');
                    
                    // Format the date
                    const date = new Date(log.timestamp);
                    const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
                    
                    // Create cells
                    const dateCell = document.createElement('td');
                    dateCell.textContent = formattedDate;
                    
                    const actionCell = document.createElement('td');
                    actionCell.textContent = log.action;
                    
                    const userCell = document.createElement('td');
                    userCell.textContent = log.user_id || '-';
                    
                    const resultCell = document.createElement('td');
                    resultCell.textContent = log.result || '-';
                    
                    // Add the cells to the row
                    row.appendChild(dateCell);
                    row.appendChild(actionCell);
                    row.appendChild(userCell);
                    row.appendChild(resultCell);
                    
                    // Add the line to the table
                    logsBody.appendChild(row);
                });
            } else {
                // No journal
                const row = document.createElement('tr');
                const cell = document.createElement('td');
                cell.colSpan = 4;
                cell.textContent = 'No journal available.';
                cell.style.textAlign = 'center';
                row.appendChild(cell);
                logsBody.appendChild(row);
            }
        } catch (error) {
            console.error('Error while retrieving the logs:', error);
            
            // Display an error message
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
    
    // Close the journals
    closeLogsButton.addEventListener('click', () => {
        logsContainer.classList.add('hidden');
    });
    
    // Close the modal dialog box
    modalOkButton.addEventListener('click', closeModal);
    closeModalButton.addEventListener('click', closeModal);
    
    // Close the modal dialog by clicking outside
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
}

/**
 * Initialise the app
 */
async function initApp() {
    try {
        // Check the status of the API
        const healthCheck = await apiService.checkHealth();
        console.log('API status:', healthCheck);
        
        // Initialize the event listeners
        initEventListeners();
        
        // Update the statut
        updateStatus('Ready. Click on "Start Webcam" to begin.', 'info');
    } catch (error) {
        console.error('Error during initialization:', error);
        updateStatus('Error: Unable to connect to the API. Please check that the server is running.', 'error');
        
        // Show an alert
        showModal('Connection error' , 'Unable to connect to the API. Please check that the backend server is running on http://localhost:5000.');
    }
}

// Initialize the application on page load
document.addEventListener('DOMContentLoaded', initApp);
