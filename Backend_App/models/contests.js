const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
    name: String,
    date: Date,
    platform: String,
    link:{
        type: String,
        required: false,
        default: null
    },
    solutionLink:{
        type: String,
        required: false,
        default: null
    }
});

const Contest = mongoose.model('Contest', contestSchema);

module.exports = Contest;

