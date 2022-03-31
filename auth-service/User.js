const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({ name: String, email: String, password: String , date: { type: Date, default: Date.now } });

module.exports = mongoose.model('User', userSchema);

