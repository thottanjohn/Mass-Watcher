const mongoose = require('mongoose');
const { Schema } = mongoose;

const personSchema = new Schema({
    username: {
        type: String,
        unique: true, required: true
    },
    password: {
        type: String,
        required: true
    },
    createdDate: { type: Date, default: Date.now }
});

const User= mongoose.model('User', personSchema);
module.exports = {User};
