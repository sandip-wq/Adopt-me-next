import { jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Pet } from '../lib/models/Pet';
import next from 'next';
import { createServer } from 'http';

// System tests - testing the whole stack
describe('Pet API System Tests', () => {
  let mongod: MongoMemoryServer;
  let app: any;
  let server: any;

  beforeAll(async () => {
    // Start MongoDB Memory Server
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    
    // Set environment variable BEFORE creating Next.js app
    process.env.MONGODB_URI = uri;
    
    // Clear any existing mongoose connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    // Clear the global mongoose cache
    if (global.mongoose) {
      global.mongoose = { conn: null, promise: null, uri: null };
    }
    
    // Connect mongoose to the in-memory database
    await mongoose.connect(uri);
    
    // Prepare Next.js app in production mode for testing
    app = next({ dev: false, dir: process.cwd() });
    await app.prepare();
    
    const handle = app.getRequestHandler();
    server = createServer((req, res) => handle(req, res));
    
    // Start server on a random port
    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        resolve();
      });
    });
  }, 60000);

  afterAll(async () => {
    // Close server
    if (server) {
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
      });
    }
    
    // Close Next.js app
    if (app) {
      await app.close();
    }
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    
    // Stop MongoDB Memory Server
    if (mongod) {
      await mongod.stop();
    }
  }, 30000);

  beforeEach(async () => {
    // Clear all collections before each test
    await Pet.deleteMany({});
  });

  describe('Full Stack Pet CRUD Operations', () => {
    test('should create, read, update, and delete pets through API', async () => {
      const baseURL = `http://localhost:${server.address().port}`;
      
      // 1. Create a pet
      const newPet = {
        name: 'System Test Pet',
        type: 'Dog',
        age: 3,
        breed: 'Golden Retriever',
        isAdopted: false
      };

      const createResponse = await request(baseURL)
        .post('/api/pets')
        .send(newPet)
        .expect(201);

      expect(createResponse.body.name).toBe(newPet.name);
      expect(createResponse.body.type).toBe(newPet.type);
      expect(createResponse.body._id).toBeDefined();

      const petId = createResponse.body._id;

      // 2. Read all pets
      const getAllResponse = await request(baseURL)
        .get('/api/pets')
        .expect(200);

      expect(getAllResponse.body).toHaveLength(1);
      expect(getAllResponse.body[0].name).toBe(newPet.name);

      // 3. Read specific pet
      const getOneResponse = await request(baseURL)
        .get(`/api/pets/${petId}`)
        .expect(200);

      expect(getOneResponse.body.name).toBe(newPet.name);
      expect(getOneResponse.body._id).toBe(petId);

      // 4. Update the pet
      const updatedData = {
        name: 'Updated System Test Pet',
        age: 4,
        isAdopted: true
      };

      const updateResponse = await request(baseURL)
        .patch(`/api/pets/${petId}`)
        .send(updatedData)
        .expect(200);

      expect(updateResponse.body.name).toBe(updatedData.name);
      expect(updateResponse.body.age).toBe(updatedData.age);
      expect(updateResponse.body.isAdopted).toBe(true);

      // 5. Verify update persisted
      const getUpdatedResponse = await request(baseURL)
        .get(`/api/pets/${petId}`)
        .expect(200);

      expect(getUpdatedResponse.body.name).toBe(updatedData.name);
      expect(getUpdatedResponse.body.age).toBe(updatedData.age);

      // 6. Delete the pet
      await request(baseURL)
        .delete(`/api/pets/${petId}`)
        .expect(200);

      // 7. Verify deletion
      const deletedPet = await Pet.findById(petId);
      expect(deletedPet).toBeNull();

      // 8. Verify API also returns 404
      await request(baseURL)
        .get(`/api/pets/${petId}`)
        .expect(404);
    });

    test('should handle multiple pets with database persistence', async () => {
      const baseURL = `http://localhost:${server.address().port}`;
      
      const pets = [
        { name: 'Pet 1', type: 'Dog', age: 2, breed: 'Labrador', isAdopted: false },
        { name: 'Pet 2', type: 'Cat', age: 1, breed: 'Persian', isAdopted: true },
        { name: 'Pet 3', type: 'Dog', age: 5, breed: 'Bulldog', isAdopted: false }
      ];

      const createdPets: any[] = [];
      for (const pet of pets) {
        const response = await request(baseURL)
          .post('/api/pets')
          .send(pet)
          .expect(201);
        createdPets.push(response.body);
      }

      // Verify all pets were created
      const getAllResponse = await request(baseURL)
        .get('/api/pets')
        .expect(200);

      expect(getAllResponse.body).toHaveLength(3);
      
      // Verify database persistence by checking directly with Mongoose
      const dbPets = await Pet.find({});
      expect(dbPets).toHaveLength(3);
      
      // Verify we can filter/search (if implemented)
      const dogPets = dbPets.filter(pet => pet.type === 'Dog');
      expect(dogPets).toHaveLength(2);
    });

    test('should handle error cases with database validation', async () => {
      const baseURL = `http://localhost:${server.address().port}`;
      
      // Test getting non-existent pet
      await request(baseURL)
        .get('/api/pets/507f1f77bcf86cd799439011') // Valid ObjectId that doesn't exist
        .expect(404);

      // Test creating pet with invalid data (since our model doesn't have strict validation,
      // we'll test with an invalid ObjectId format instead)
      await request(baseURL)
        .get('/api/pets/invalid-id-format')
        .expect(500); // This will cause a CastError

      // Test updating non-existent pet
      await request(baseURL)
        .patch('/api/pets/507f1f77bcf86cd799439011')
        .send({ name: 'Updated Name' })
        .expect(404);

      // Test deleting non-existent pet
      await request(baseURL)
        .delete('/api/pets/507f1f77bcf86cd799439011')
        .expect(404);
    });
  });

  describe('Database Integration Tests', () => {
    test('should maintain data integrity across operations', async () => {
      // Test that database operations work correctly
      const testPet = {
        name: 'Integrity Test Pet',
        type: 'Cat',
        age: 2,
        breed: 'Siamese',
        isAdopted: false
      };

      // Create directly in database
      const createdPet = await Pet.create(testPet);
      expect(createdPet._id).toBeDefined();

      // Verify via API
      const baseURL = `http://localhost:${server.address().port}`;
      const getResponse = await request(baseURL)
        .get(`/api/pets/${createdPet._id}`)
        .expect(200);

      expect(getResponse.body.name).toBe(testPet.name);
      expect(getResponse.body.type).toBe(testPet.type);
    });

    test('should handle concurrent operations correctly', async () => {
      const baseURL = `http://localhost:${server.address().port}`;
      
      // Create multiple pets concurrently
      const petPromises = Array.from({ length: 5 }, (_, i) => 
        request(baseURL)
          .post('/api/pets')
          .send({
            name: `Concurrent Pet ${i}`,
            type: 'Dog',
            age: i + 1,
            breed: 'Mixed',
            isAdopted: false
          })
          .expect(201)
      );

      const responses = await Promise.all(petPromises);
      
      // Verify all pets were created
      expect(responses).toHaveLength(5);
      responses.forEach((response, i) => {
        expect(response.body.name).toBe(`Concurrent Pet ${i}`);
        expect(response.body.age).toBe(i + 1);
      });

      // Verify in database
      const dbPets = await Pet.find({});
      expect(dbPets).toHaveLength(5);
    });
  });
});
