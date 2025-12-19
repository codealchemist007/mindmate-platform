# MindMate Platform
> **Your Safe Space for Mental Wellness.**
[![Ask DeepWiki](https://devin.ai/assets/askdeepwiki.png)](https://deepwiki.com/codealchemist007/mindmate-platform)

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=render)](YOUR_RENDER_LINK_HERE) 
[![Tech Stack](https://img.shields.io/badge/Tech-Stack-Node.js%20%7C%20Express%20%7C%20MongoDB-blue?style=for-the-badge)](https://nodejs.org/)

MindMate is a full-stack mental health platform that bridges the gap between students and professional counselors. It features an AI-driven emotional support companion, daily mood tracking, and a seamless video consultation system.

---

## 🚀 Live Demo
**Access the platform here:** [🔗 **https://mindmate-platform.onrender.com**](https://mindmate-platform.onrender.com/)

---

## 🏗️ System Architecture

```mermaid
graph TD
    Client["Client (Browser)"] -->|HTTP Requests| Server[Node.js + Express Server]
    Server -->|Read/Write| DB[(MongoDB Atlas)]
    Server -->|AI Chat| Gemini[Google Gemini API]
    Client -->|Video Call| Jitsi[Jitsi Meet API]
    Server -->|Sentiment Analysis| SentimentLib[Sentiment.js]
```

## Key Features

### 👤 For Students (Student Dashboard)
*   **🤖 AI Companion:** Engage in supportive conversations with an intelligent AI chatbot powered by Google Gemini, available 24/7 for immediate stress relief.
*   **📓 Daily Mood Journal:** Log daily thoughts and feelings. The platform uses sentiment analysis to assign a mood score (0-10) to each entry, helping users quantify their emotional state.
*   **📈 Mood Analytics:** Visualize your mental health journey with a line chart that tracks mood score trends over the last seven entries.
*   **📅 Counselor Booking:** Browse a directory of available counselors, select a professional, and request an appointment to discuss specific topics like anxiety or stress.
*   **💻 Live Video Sessions:** Join secure, one-on-one video calls with counselors directly within the platform, powered by Jitsi Meet.
*   **🧘 Zen Zone:** Access an interactive stress-relief tool featuring the 4-7-8 breathing technique to promote relaxation and mindfulness.
*   **🎭 Anonymous Mode:** Use core features like the AI chat and breathing exercises without needing to create an account, ensuring complete privacy.

### 👨‍⚕️ For Counselors (Pro Portal)
*   **📊 Professional Dashboard:** Get an at-a-glance overview of key metrics, including total active patients, pending appointment requests, and the day's schedule.
*   **📥 Request Management:** View, accept, or decline incoming appointment requests from students in a dedicated requests inbox.
*   **📂 Patient Directory:** Access a clean directory of all active patients you are counseling.
*   **🗓️ Schedule & Video Calls:** Manage your schedule of accepted appointments and launch directly into video sessions with patients.
*   **⚙️ Profile Management:** Update your professional details, including name, specialization, and bio.

## Technology Stack
*   **Frontend:** HTML5, Tailwind CSS, Vanilla JavaScript
*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB with Mongoose
*   **APIs & Services:**
    *   **Google Generative AI (Gemini):** Powers the AI Companion Chat.
    *   **Jitsi Meet:** For integrated video conferencing.
    *   **Dicebear:** For generating placeholder avatars.
    *   **Sentiment.js:** For client-side and server-side mood analysis.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites
*   Node.js and npm installed on your machine.
*   Access to a MongoDB database (local or cloud-based like MongoDB Atlas).
*   A Google Gemini API Key.

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/codealchemist007/mindmate-platform.git
    ```

2.  **Navigate to the project directory:**
    ```sh
    cd mindmate-platform
    ```

3.  **Install backend dependencies:**
    ```sh
    npm install
    ```

4.  **Set up environment variables:**
    *   Create a `.env` file in the root of the project.
    *   Add your Google Gemini API key to this file. The backend server uses this key for the AI chat feature.
    ```
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
    ```

5.  **Configure the Database:**
    The application is configured to connect to a MongoDB database. The connection string is located in `server.js`:
    ```javascript
    const MONGO_URI = "mongodb+srv://user:pass@cluster.mongodb.net/?appName=Cluster0";
    ```
    Update this `MONGO_URI` with your own MongoDB connection string.

6.  **Start the backend server:**
    ```sh
    npm run dev
    ```
    This will start the server using `nodemon`, which automatically restarts on file changes. The server will run on `http://localhost:3000`.

7.  **Launch the application:**
    Open the `index.html` file in your web browser to start using the platform.

## Usage

1.  **Landing Page (`index.html`):** The entry point where you can navigate to the login page.
2.  **Authentication (`login.html`):**
    *   Users can either **Sign Up** for a new account or **Login** to an existing one.
    *   The form allows you to specify your role as either a **Student** or a **Counselor**.
    *   Based on the selected role, you will be redirected to the appropriate dashboard upon successful authentication.
    *   Students also have the option to **"Continue Anonymously"** from the `index.html` page to access the student dashboard with limited functionality and without saving data to the database.
3.  **Student Dashboard (`dashboard.html`):** The central hub for students to access all features.
4.  **Counselor Portal (`counselor.html`):** The professional interface for counselors to manage their patients and schedule.

*Note: The backend server must be running for authentication, data fetching, AI chat, and journaling features to work correctly.*

## API Endpoints

The `server.js` file exposes the following RESTful API endpoints:

| Method | Endpoint                 | Description                                       |
|--------|--------------------------|---------------------------------------------------|
| `POST` | `/api/signup`            | Creates a new user (student or counselor).        |
| `POST` | `/api/login`             | Authenticates a user based on email, pass, & role.|
| `GET`  | `/api/counselors`        | Fetches a list of all registered counselors.      |
| `GET`  | `/api/appointments`      | Fetches appointments. Can be filtered by counselor.|
| `POST` | `/api/appointments`      | Creates a new appointment request.                |
| `PUT`  | `/api/appointments/:id`  | Updates the status of an appointment (e.g., to "Accepted"). |
| `POST` | `/api/journal`           | Creates a new journal entry with mood analysis.   |
| `GET`  | `/api/journal`           | Fetches all journal entries for a user.           |
| `DELETE`| `/api/journal`           | Deletes all journal entries for a user.           |
| `POST` | `/api/chat`              | Sends a message to the Google Gemini AI chatbot.  |

## Login Credentials (Demo)
| Role       | Email                    | Password     |
|--------    |--------------------------|--------------|
| `Student`  | `student@example.com`    | pass.        |
| `Counselor`| `counselor@example.com`  | pass.        |

## Project Structure

The repository is organized as follows:

```
mindmate-platform/
├── assets/
│   ├── css/
│   │   └── style.css         # Custom CSS styles
│   └── js/
│       ├── charts.js         # Chart.js configuration (unused)
│       ├── counselor.js      # Logic for the counselor portal
│       ├── dashboard.js      # Logic for the student dashboard
│       ├── games.js          # Logic for stress-relief games (Zen Zone)
│       └── login.js          # Logic for the old login page
├── models/
│   ├── Appointment.js        # Mongoose schema for appointments
│   ├── User.js               # Mongoose schema for users
│   └── entry.js              # Mongoose schema for journal entries
├── counselor.html            # Counselor portal UI
├── dashboard.html            # Student dashboard UI
├── index.html                # Main landing page
├── login.html                # Login and signup page UI
├── package.json              # Backend dependencies and scripts
└── server.js                 # Express.js backend server and API logic

Made with ❤️ for Mental Health Awareness