##User Guide for the Facial Authentication System

## Overview

This facial authentication system uses OpenCV and Python for face detection and recognition, with a web interface built in HTML, CSS, and JavaScript. It allows real-time face detection and recognition via a webcam.

## System Architecture

The system is composed of two main parts:

1. **Backend** : Python Flask server with OpenCV handling face detection and recognition
2. **Frontend** : Web interface allowing user interaction and video capture

## Prerequisites

- Python 3.x with dependencies listed in requirements.txt
- Modern web browser with MediaDevices API support
- Working webcam
- Internet connection for loading resources

## Installation

1. Clone the repository or unzip the archive into a folder of your choice
2. Install Python dependencies:

   ```
   cd facial-auth-system/backend
   pip install -r requirements.txt
   ```

## Starting the System

1. Start the backend server:
   ```
   cd facial-auth-system/backend
   python app.py
   ```
   The server will start at `http://localhost:5000`

2. Serve the frontend files (several options):
   - Use a simple HTTP server:
     ```
     cd facial-auth-system
     python -m http.server 8000
     ```
     The interface will be available at `http://localhost:8000/frontend`
   
   - Or directly open the `frontend/index.html` file in your browser

## Usage

### User Mode
1. Access the web interface
2. Click "Start Webcam" to activate the camera
3. Position your face in front of the camera
4. Click "Capture" to launch detection and recognition
5. The system will display:
-"Face detected" if a face is present
-Recognized user information (name, age, profession)
-"Face not recognized" if the face is not in the database

### Admin Mode 

1. Click "Admin Mode" at the bottom of the page to access administration features
2. Available features :
   - **Add a User** : Register a new face with user info 
   - **View Logs** : Check access and attempt history 

#### Add User

1. Click "Add User"
2. Fill in the form with required information:
   - Name
   - Age
   - Profession
3. Use the webcam to capture a photo of the face
4. Click "Save" to add the user to the database

#### View Logs

1. Click "View Logs"
2. The system will display a table with access history:
-Date/Time
-Action (recognition, user addition, etc.)
-Related user
-Result of the action1. Cliquez sur "Voir les Journaux"

## Security 

-Communication between frontend and backend is secured
-Only facial embeddings are stored, not raw images
-Access to admin features is controlled
-Access logs track all attempts

## Troubleshooting

### The webcam doesn't start 

-Make sure you’ve granted camera permissions in your browser
-Ensure no other application is using the webcam
-Try refreshing the page or restarting the browser

### The face is not detected

-Ensure you are well-lit and facing the camera
-Avoid overly cluttered backgrounds
-Ensure your face is fully visible in the frame

### The backend is not responding 

-Make sure the backend server is running
-Ensure port 5000 isn’t blocked by a firewall
-Check server logs for any errors

## Customization

The system can be customized in various ways:
-Modify CSS styles to change appearance
-Adjust detection parameters in the backend for better accuracy
-Add new features like liveness detection

## Known Limitations

-Basic face recognition can be sensitive to lighting conditions
-No advanced liveness (anti-spoofing) detection yet
-The database uses simple file-based storage (not suited for large-scale production)

## Support

For any questions or issues, please contact the support team.
"# Facial-Recognition-for-User-Authentication"
