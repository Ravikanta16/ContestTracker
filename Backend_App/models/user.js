const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    type:{
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    bookmarkedContests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contest'
    }]
});

const User = mongoose.model('User', userSchema);

module.exports = User;