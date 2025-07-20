import mongoose from 'mongoose';

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

const Product = mongoose.model('Product', productSchema);
export default Product;
