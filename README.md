# 🧠 Facial Recognition for User Authentication

## 🧾 Overview

This facial authentication system uses **Python (OpenCV + Flask)** for real-time face detection and recognition, and a **web-based interface** built with HTML, CSS, and JavaScript. Users can interact with the system via a webcam for authentication, registration, and access log viewing.

---

## 🧩 System Architecture

The system is composed of two main components:

* 🔙 **Backend**:
  Python Flask server with OpenCV for face detection, recognition, and user management.

* 🌐 **Frontend**:
  Web interface for video capture, user interaction, and administration.

---

## 🧱 Prerequisites

* Python 3.x
* A working webcam
* A modern browser supporting the **MediaDevices API**
* Internet connection (for loading resources, if required)
* Install Python dependencies via:

  ```bash
  pip install -r requirements.txt
  ```

---

## ⚙️ Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Jihenebgt/Facial-Recognition-for-User-Authentication.git
   ```

2. **Install backend dependencies**:

   ```bash
   cd facial-auth-system/backend
   pip install -r requirements.txt
   ```

---

## 🚀 Starting the System

### 1. Start the Flask Backend

```bash
cd facial-auth-system/backend
python app.py
```

Server runs at: [http://localhost:5000](http://localhost:5000)

### 2. Serve the Frontend

#### Option A: Use a simple Python HTTP server

```bash
cd facial-auth-system
python -m http.server 8000
```

Then open: [http://localhost:8000/frontend](http://localhost:8000/frontend)

#### Option B: Open HTML directly

* Open `frontend/index.html` in your browser.

---

## 🧑‍💻 Usage Guide

### 👤 User Mode

1. Open the web interface.
2. Click **"Start Webcam"**.
3. Face the webcam directly and click **"Capture"**.
4. System Response:

   * ✅ `"Face detected"` if a face is recognized.
   * ✅ Displays **name, age, profession** if user is known.
   * ❌ `"Face not recognized"` if unknown.

---

### 🔐 Admin Mode

Access by clicking **"Admin Mode"** at the bottom of the page.

#### ➕ Add User

1. Click **"Add User"**.
2. Fill in:

   * Name
   * Age
   * Profession
3. Capture face via webcam.
4. Click **"Save"**.

#### 📄 View Logs

* Click **"View Logs"** to see a table of system activity:

  * Date/Time
  * Action type (e.g., recognition, user added)
  * User info
  * Result

---

## 🔐 Security

* Only **facial embeddings** are stored (no raw images).
* Admin functionality is protected.
* All backend communication is secured.
* Access logs track every system interaction.

---

## 🧰 Troubleshooting

| Problem                | Solution                                           |
| ---------------------- | -------------------------------------------------- |
| Webcam doesn’t start   | Allow camera in browser, close other apps, refresh |
| Face not detected      | Ensure good lighting and full face visibility      |
| Backend not responding | Check if Flask server is running and port is open  |

---

## ⚠️ Known Limitations

* May struggle under low lighting or side-angle faces
* No spoof detection (e.g., photos or videos)
* Uses basic file-based database (not suitable for large-scale deployment)

---

## 📬 Support

📬 Support
For help, questions, or to report issues, feel free to contact the team:

📧 fhaallyosseer@gmail.com

📧 teyebdouaa.3.math@gmail.com

📧 bgt.jihane@gmail.com

📧 islem.smiai@gmail.com

📧 yazidiyassmine38@gmail.com


