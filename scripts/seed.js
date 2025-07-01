// scripts/seed.js
import mongoose from 'mongoose';
import { Pet } from '../src/lib/models/Pet.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/adoptme';

const seedPets = [
  { name: 'Bella', type: 'Dog', age: 3, breed: 'Labrador' },
  { name: 'Milo', type: 'Cat', age: 2, breed: 'Siamese' },
  { name: 'Charlie', type: 'Rabbit', age: 1, breed: 'Dwarf' },
];

async function seedDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    await Pet.deleteMany(); // Clear previous data
    await Pet.insertMany(seedPets);
    console.log('✅ Database seeded successfully');
    mongoose.connection.close();
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seedDB();
