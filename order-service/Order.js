const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({ 
    products: [{ product_Id: String }],
    user: String,
    totalPrice: NaN,
    createdAt: { type: Date, default: Date.now }

 });

module.exports = mongoose.model('order', OrderSchema);
