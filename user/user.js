var mongoose = require('mongoose');
var UserSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    username: String,
    password: String,
});
mongoose.model('User', UserSchema);

module.exports = mongoose.model('User');