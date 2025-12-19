const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    studentName: { type: String, required: true },
    studentEmail: { type: String }, // Optional, for contact
    counselorName: { type: String, default: 'Dr. Smith' }, // Hardcoded for this demo
    topic: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Accepted', 'Declined'], default: 'Pending' },
    date: { type: String, default: new Date().toLocaleDateString() },
    time: { type: String, default: new Date().toLocaleTimeString() },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Appointment', AppointmentSchema);

