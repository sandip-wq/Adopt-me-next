import mongoose from 'mongoose';

const petSchema = new mongoose.Schema({
  name: String,
  type: String,
  age: Number,
  breed: String,
  isAdopted: { type: Boolean, default: false },
});

export const Pet = mongoose.models.Pet || mongoose.model('Pet', petSchema);
