require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Sentiment = require('sentiment'); 

// Initialize Apps
const app = express();
const PORT = 3000;
const sentiment = new Sentiment(); 

// --- CONFIGURATION ---
const MONGO_URI = "mongodb+srv://hklns407_db_user:Hk%402005@cluster0.45omnxt.mongodb.net/?appName=Cluster0";

// Google Gemini Setup (Secure via .env)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '/'))); 

// --- DATABASE CONNECTION ---
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ DB Connection Error:', err));


// ============================================
//              DATABASE MODELS
// ============================================

// 1. APPOINTMENT MODEL
const appointmentSchema = new mongoose.Schema({
    studentName: String,
    counselorName: { type: String, default: 'General Counselor' },
    topic: String,
    status: { type: String, default: 'Pending' }, 
    date: { type: String, default: () => new Date().toLocaleDateString() },
    time: { type: String, default: () => new Date().toLocaleTimeString() }
});

// 2. USER MODEL
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, 
    role: { type: String, default: 'student' } 
});

// 3. JOURNAL ENTRY MODEL
const entrySchema = new mongoose.Schema({
    userName: String, 
    text: String,
    moodScore: Number, 
    createdAt: { type: Date, default: Date.now }
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
const User = mongoose.model('User', userSchema);
const Entry = mongoose.model('Entry', entrySchema); 


// ============================================
//              API ROUTES
// ============================================

// --- 1. AUTHENTICATION ---
app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.json({ status: 'error', error: 'Email already used' });

        const newUser = new User({ name, email, password, role });
        await newUser.save();
        res.json({ status: 'ok', name: newUser.name });
    } catch (err) {
        res.json({ status: 'error', error: err.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const user = await User.findOne({ email, password, role });

        if (user) {
            res.json({ status: 'ok', name: user.name });
        } else {
            res.json({ status: 'error', error: 'Invalid credentials or wrong role' });
        }
    } catch (err) {
        res.json({ status: 'error', error: err.message });
    }
});

// --- 2. DATA FETCHING ---
app.get('/api/counselors', async (req, res) => {
    try {
        const counselors = await User.find({ role: 'counselor' });
        const safeData = counselors.map(c => ({ name: c.name, email: c.email }));
        res.json(safeData);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch counselors' });
    }
});

app.get('/api/appointments', async (req, res) => {
    try {
        const { counselor } = req.query; 
        const query = counselor ? { counselorName: counselor } : {};
        const appointments = await Appointment.find(query).sort({ _id: -1 });
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch' });
    }
});

// --- 3. BOOKING & UPDATING ---
app.post('/api/appointments', async (req, res) => {
    try {
        const { topic, counselorName, studentName } = req.body;
        const newAppointment = new Appointment({
            studentName: studentName || "Anonymous",
            counselorName: counselorName,
            topic: topic,
            status: "Pending"
        });
        await newAppointment.save();
        res.json({ success: true, message: "Appointment booked!" });
    } catch (err) {
        res.status(500).json({ error: "Failed to book appointment" });
    }
});

app.put('/api/appointments/:id', async (req, res) => {
    try {
        const { status } = req.body;
        await Appointment.findByIdAndUpdate(req.params.id, { status: status });
        res.json({ status: 'ok' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update' });
    }
});

// --- 4. JOURNAL API ---
// --- 4. JOURNAL API (Updated for 0-10 Scale) ---
app.post('/api/journal', async (req, res) => {
    try {
        const { text, userName } = req.body;
        
        // 1. Analyze Mood (Default is usually -5 to +5)
        const result = sentiment.analyze(text);
        let rawScore = result.score;

        // 2. CONVERT TO 0-10 SCALE
        // Logic: We add 5 to shift the center to 5.
        // Then we clamp it so it never goes below 0 or above 10.
        let finalScore = rawScore + 5; 

        if (finalScore > 10) finalScore = 10;
        if (finalScore < 0) finalScore = 0;

        // 3. Save to DB
        const newEntry = new Entry({
            userName: userName,
            text: text,
            moodScore: finalScore // Saving the 0-10 score
        });
        await newEntry.save();
        
        res.json({ success: true, score: finalScore });
    } catch (err) {
        console.error("Journal Error:", err);
        res.status(500).json({ error: "Failed to save journal" });
    }
});

app.get('/api/journal', async (req, res) => {
    try {
        const { userName } = req.query;
        const entries = await Entry.find({ userName: userName }).sort({ createdAt: -1 });
        res.json(entries);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch journal" });
    }
});
// --- DELETE JOURNAL HISTORY ---
app.delete('/api/journal', async (req, res) => {
    try {
        const { userName } = req.query;
        // Delete all entries matching this user
        await Entry.deleteMany({ userName: userName });
        res.json({ success: true });
    } catch (err) {
        console.error("Delete Error:", err);
        res.status(500).json({ error: "Failed to delete history" });
    }
});

// --- 5. SMART AI CHAT ---
// --- 5. SMART AI CHAT (Updated for 0-10 Scale) ---
app.post('/api/chat', async (req, res) => {
    try {
        const { message, userName } = req.body; 
        
        // 1. Analyze Sentiment
        const sentimentResult = sentiment.analyze(message);
        let rawScore = sentimentResult.score;

        // 2. Convert to 0-10 Scale
        let finalScore = rawScore + 5;
        if (finalScore > 10) finalScore = 10;
        if (finalScore < 0) finalScore = 0;

        if (userName) {
            const newEntry = new Entry({
                userName: userName,
                text: `(Chat) ${message}`,
                moodScore: finalScore
            });
            await newEntry.save();
        }

        // 3. UPDATED PROMPT (So Gemini understands 0-10)
        const prompt = `
            You are MindMate, a compassionate mental health support companion.
            The user just said: "${message}"
            
            CONTEXT:
            - The user's mood score is: ${finalScore}/10.
            - 0-3 means Sad/Stressed (Be very gentle and empathetic).
            - 4-6 means Neutral (Be friendly and conversational).
            - 7-10 means Happy (Be celebrating and energetic).
            
            Keep your response SHORT (under 2 sentences) and conversational.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        res.json({ reply: text, sentiment: finalScore });

    } catch (error) {
        console.error("AI Error:", error);
        res.json({ reply: "I'm having a little trouble connecting right now." });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});