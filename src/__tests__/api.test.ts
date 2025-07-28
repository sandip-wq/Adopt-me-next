import request from 'supertest';
import { Pet } from '@/lib/models/Pet';
import next from 'next';
import { createServer } from 'http';

const app = next({ dev: true });
const handle = app.getRequestHandler();

let server: any;

beforeAll(async () => {
  await app.prepare();
  server = createServer((req, res) => handle(req, res));
  server.listen(3005);
}, 30000);

afterAll((done) => {
  if (server) {
    server.close(done);
  } else {
    done();
  }
});

describe('REST API (E2E)', () => {
  describe('GET /api/pets', () => {
    it('should return all pets', async () => {
      // Seed some test data
      await Pet.create([
        { name: 'Shadow', type: 'Cat', age: 3, breed: 'Persian', isAdopted: false },
        { name: 'Buddy', type: 'Dog', age: 5, breed: 'Golden Retriever', isAdopted: true }
      ]);

      const response = await request('http://localhost:3005').get('/api/pets');
      
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].name).toBe('Shadow');
      expect(response.body[1].name).toBe('Buddy');
    });

    it('should return empty array when no pets exist', async () => {
      const response = await request('http://localhost:3005').get('/api/pets');
      
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });
  });

  describe('POST /api/pets', () => {
    it('should create a new pet with valid data', async () => {
      const petData = {
        name: 'Testy',
        type: 'Dog',
        age: 5,
        breed: 'TestBreed',
      };

      const response = await request('http://localhost:3005')
        .post('/api/pets')
        .send(petData)
        .set('Content-Type', 'application/json');

      expect(response.statusCode).toBe(201);
      expect(response.body.name).toBe('Testy');
      expect(response.body.type).toBe('Dog');
      expect(response.body.age).toBe(5);
      expect(response.body.breed).toBe('TestBreed');
      expect(response.body.isAdopted).toBe(false);
      expect(response.body._id).toBeDefined();
    });

    it('should create a pet with isAdopted true when specified', async () => {
      const petData = {
        name: 'AdoptedPet',
        type: 'Cat',
        age: 2,
        breed: 'Siamese',
        isAdopted: true
      };

      const response = await request('http://localhost:3005')
        .post('/api/pets')
        .send(petData)
        .set('Content-Type', 'application/json');

      expect(response.statusCode).toBe(201);
      expect(response.body.name).toBe('AdoptedPet');
      expect(response.body.isAdopted).toBe(true);
    });

    it('should handle missing fields gracefully', async () => {
      const incompleteData = {
        name: 'IncompletePet'
        // Missing type, age, breed
      };

      const response = await request('http://localhost:3005')
        .post('/api/pets')
        .send(incompleteData)
        .set('Content-Type', 'application/json');

      expect(response.statusCode).toBe(201);
      expect(response.body.name).toBe('IncompletePet');
      expect(response.body.isAdopted).toBe(false);
    });

    it('should handle invalid JSON', async () => {
      const response = await request('http://localhost:3005')
        .post('/api/pets')
        .send('invalid json')
        .set('Content-Type', 'application/json');

      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe('Failed to create pet');
    });
  });

  describe('GET /api/pets/:id', () => {
    it('should return a specific pet by id', async () => {
      const pet = await Pet.create({
        name: 'SinglePet',
        type: 'Cat',
        age: 2,
        breed: 'Persian',
        isAdopted: false
      });

      const response = await request('http://localhost:3005').get(`/api/pets/${pet._id}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body.name).toBe('SinglePet');
      expect(response.body.type).toBe('Cat');
      expect(response.body._id).toBe(pet._id.toString());
    });

    it('should return 404 for non-existent pet', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request('http://localhost:3005').get(`/api/pets/${fakeId}`);
      
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Pet not found');
    });

    it('should return 500 for invalid pet id', async () => {
      const response = await request('http://localhost:3005').get('/api/pets/invalid-id');
      
      expect(response.statusCode).toBe(500);
    });
  });

  describe('PATCH /api/pets/:id', () => {
    it('should update a pet with valid data', async () => {
      const pet = await Pet.create({
        name: 'UpdateMe',
        type: 'Dog',
        age: 3,
        breed: 'Labrador',
        isAdopted: false
      });

      const updateData = {
        name: 'UpdatedName',
        age: 4,
        isAdopted: true
      };

      const response = await request('http://localhost:3005')
        .patch(`/api/pets/${pet._id}`)
        .send(updateData)
        .set('Content-Type', 'application/json');

      expect(response.statusCode).toBe(200);
      expect(response.body.name).toBe('UpdatedName');
      expect(response.body.age).toBe(4);
      expect(response.body.isAdopted).toBe(true);
      expect(response.body.type).toBe('Dog'); // Should remain unchanged
      expect(response.body.breed).toBe('Labrador'); // Should remain unchanged
    });

    it('should return 404 for non-existent pet', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request('http://localhost:3005')
        .patch(`/api/pets/${fakeId}`)
        .send({ name: 'NewName' })
        .set('Content-Type', 'application/json');
      
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Pet not found');
    });
  });

  describe('DELETE /api/pets/:id', () => {
    it('should delete a pet', async () => {
      const pet = await Pet.create({
        name: 'DeleteMe',
        type: 'Cat',
        age: 1,
        breed: 'Siamese',
        isAdopted: false
      });

      const response = await request('http://localhost:3005').delete(`/api/pets/${pet._id}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Pet deleted successfully');

      // Verify pet is actually deleted
      const deletedPet = await Pet.findById(pet._id);
      expect(deletedPet).toBeNull();
    });

    it('should return 404 for non-existent pet', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request('http://localhost:3005').delete(`/api/pets/${fakeId}`);
      
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Pet not found');
    });
  });
});
