/**
 * webcam.js - Webcam management for the facial recognition authentication system
 */

class WebcamManager {
    constructor() {
        // DOM Elements
        this.webcamElement = document.getElementById('webcam');
        this.canvasElement = document.getElementById('canvas');
        this.startButton = document.getElementById('start-webcam');
        this.captureButton = document.getElementById('capture');
        this.loadingIndicator = document.getElementById('loading-indicator');
        
        // Canvas context
        this.canvasContext = this.canvasElement.getContext('2d');
        
        // State
        this.stream = null;
        this.isRunning = false;
        this.captureInterval = null;
        this.autoCapture = false;
        this.autoCaptureInterval = 3000; // 3 seconds
        
        // Link the methods to the context of the class
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.captureImage = this.captureImage.bind(this);
        this.startAutoCapture = this.startAutoCapture.bind(this);
        this.stopAutoCapture = this.stopAutoCapture.bind(this);
        
        // Initialize the event listeners
        this.initEventListeners();
    }
    
    initEventListeners() {
        this.startButton.addEventListener('click', this.start);
        this.captureButton.addEventListener('click', this.captureImage);
    }
    
    async start() {
        try {
            // Show the loading indicator
            this.loadingIndicator.classList.remove('hidden');
            
            // Request access to the webcam
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                }
            });
            
            // Set up the video
            this.webcamElement.srcObject = this.stream;
            
            // Wait for the video to load
            await new Promise(resolve => {
                this.webcamElement.onloadedmetadata = () => {
                    resolve();
                };
            });
            
            // Set up the canvas
            this.canvasElement.width = this.webcamElement.videoWidth;
            this.canvasElement.height = this.webcamElement.videoHeight;
            
            // Update the status
            this.isRunning = true;
            
            // Update the interface
            this.startButton.textContent = 'Stop the Webcam';
            this.startButton.classList.remove('primary');
            this.startButton.classList.add('secondary');
            this.captureButton.disabled = false;
            
            // Hide the loading indicator
            this.loadingIndicator.classList.add('hidden');
            
            // Update the status
            updateStatus('Webcam active. Place your face in front of the camera.', 'info');
            
            // Modify the event listener to stop the webcam
            this.startButton.removeEventListener('click', this.start);
            this.startButton.addEventListener('click', this.stop);
        } catch (error) {
            console.error('Error accessing the webcam:', error);
            updateStatus('Error: Unable to access the webcam. Check the permissions.', 'error');
            this.loadingIndicator.classList.add('hidden');
            
            // Show an alert
            showModal('Error', 'Unable to access the webcam. Please check that you have granted the necessary permissions and that no other application is using the camera.');
        }
    }
    
    stop() {
        if (this.stream) {
            // Stop all the webcam tracks
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
            
            // Delete the video
            this.webcamElement.srcObject = null;
            
            // Clear the canvas
            this.canvasContext.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
            
            // Update the status
            this.isRunning = false;
            
            // Stop automatic capture if active
            this.stopAutoCapture();
            
            // Update the interface
            this.startButton.textContent = 'Start the Webcam';
            this.startButton.classList.remove('secondary');
            this.startButton.classList.add('primary');
            this.captureButton.disabled = true;
            
            // Update the status
            updateStatus('Webcam stopped.', 'info');
            
            // Reset the event listener
            this.startButton.removeEventListener('click', this.stop);
            this.startButton.addEventListener('click', this.start);
        }
    }
    
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
        const imageData = this.canvasElement.toDataURL('image/jpeg');
        
        // Update the status
        updateStatus('Captured image. Analysis in progress...', 'info');
        
        return imageData;
    }
    
    startAutoCapture(callback) {
        if (!this.isRunning || this.captureInterval) return;
        
        this.autoCapture = true;
        
        // Capture an image at regular intervals
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

// Create an instance of the webcam manager
const webcamManager = new WebcamManager();

// Export for use in other scripts
window.webcamManager = webcamManager;
