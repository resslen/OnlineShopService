var mongoose = require('mongoose');
var ProductSchema = new mongoose.Schema({
    productName: String,
    productCode: String,
    releaseDate: String,
    price: Number,
    description: String,
    starRating: Number,
    imageUrl: String,
    amount: Number
});
mongoose.model('Product', ProductSchema);

module.exports = mongoose.model('Product');