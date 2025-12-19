const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const entrySchema = new Schema({
    userId: String,
    text: String,
    moodScore: Number,
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Entry', entrySchema);      //E capital letter because it represents a model