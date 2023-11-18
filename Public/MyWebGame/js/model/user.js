const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
        //unique allows only one user in the database
        username: { type: String, require: true, unique: true},
        password: { type: String, require: true},
        highScore: {type: Number, default: 0}
    },
    {Collection: 'users'}
);

module.exports = mongoose.model('UserSchema', UserSchema);