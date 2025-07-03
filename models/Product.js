const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: String,
    category: String,
    price: Number,
    stock: Number,
    listedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
