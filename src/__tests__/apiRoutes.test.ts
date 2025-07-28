import { jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/pets/route.js';
import { GET as GETById, PATCH, DELETE } from '@/app/api/pets/[id]/route.js';
import { Pet } from '@/lib/models/Pet';

// Mock the dbConnect function
jest.mock('@/lib/dbConnect', () => ({
  dbConnect: jest.fn(),
}));

describe('API Routes (Direct Function Testing)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/pets', () => {
    it('should return all pets', async () => {
      const mockPets = [
        { name: 'Shadow', type: 'Cat', age: 3, breed: 'Persian', isAdopted: false },
        { name: 'Buddy', type: 'Dog', age: 5, breed: 'Golden Retriever', isAdopted: true }
      ];

      const findSpy = jest.spyOn(Pet, 'find').mockResolvedValue(mockPets as any);

      const response = await GET();
      const responseData = await response.json();

      expect(findSpy).toHaveBeenCalledWith({});
      expect(response.status).toBe(200);
      expect(responseData).toEqual(mockPets);

      findSpy.mockRestore();
    });
  });

  describe('POST /api/pets', () => {
    it('should create a new pet', async () => {
      const petData = {
        name: 'Testy',
        type: 'Dog',
        age: 5,
        breed: 'TestBreed',
      };

      const mockSavedPet = { ...petData, _id: '507f1f77bcf86cd799439012', isAdopted: false };
      const saveSpy = jest.spyOn(Pet.prototype, 'save').mockResolvedValue(mockSavedPet as any);

      // Create a proper mock request
      const mockRequest = {
        json: () => Promise.resolve(petData)
      } as any;

      const response = await POST(mockRequest);
      const responseData = await response.json();

      expect(saveSpy).toHaveBeenCalled();
      expect(response.status).toBe(201);
      expect(responseData.name).toBe('Testy');
      expect(responseData.isAdopted).toBe(false);

      saveSpy.mockRestore();
    });

    it('should handle errors during pet creation', async () => {
      const saveSpy = jest.spyOn(Pet.prototype, 'save').mockRejectedValue(new Error('Database error'));

      const mockRequest = {
        json: () => Promise.resolve({ name: 'Test' })
      } as any;

      const response = await POST(mockRequest);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.message).toBe('Failed to create pet');

      saveSpy.mockRestore();
    });
  });

  describe('GET /api/pets/:id', () => {
    it('should return a specific pet by id', async () => {
      const mockPet = { _id: '507f1f77bcf86cd799439011', name: 'SinglePet', type: 'Cat' };
      const findByIdSpy = jest.spyOn(Pet, 'findById').mockResolvedValue(mockPet as any);

      const response = await GETById({} as NextRequest, { params: { id: '507f1f77bcf86cd799439011' } });
      const responseData = await response.json();

      expect(findByIdSpy).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(response.status).toBe(200);
      expect(responseData).toEqual(mockPet);

      findByIdSpy.mockRestore();
    });

    it('should return 404 for non-existent pet', async () => {
      const findByIdSpy = jest.spyOn(Pet, 'findById').mockResolvedValue(null);

      const response = await GETById({} as NextRequest, { params: { id: 'nonexistent' } });
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData.message).toBe('Pet not found');

      findByIdSpy.mockRestore();
    });
  });

  describe('PATCH /api/pets/:id', () => {
    it('should update a pet', async () => {
      const updateData = { name: 'UpdatedName', age: 4 };
      const mockUpdatedPet = { _id: '507f1f77bcf86cd799439011', ...updateData };
      
      const updateSpy = jest.spyOn(Pet, 'findByIdAndUpdate').mockResolvedValue(mockUpdatedPet as any);

      const mockRequest = {
        json: () => Promise.resolve(updateData)
      } as any;

      const response = await PATCH(mockRequest, { params: { id: '507f1f77bcf86cd799439011' } });
      const responseData = await response.json();

      expect(updateSpy).toHaveBeenCalledWith('507f1f77bcf86cd799439011', updateData, {
        new: true,
        runValidators: true,
      });
      expect(response.status).toBe(200);
      expect(responseData).toEqual(mockUpdatedPet);

      updateSpy.mockRestore();
    });

    it('should return 404 for non-existent pet', async () => {
      const updateSpy = jest.spyOn(Pet, 'findByIdAndUpdate').mockResolvedValue(null);

      const mockRequest = {
        json: () => Promise.resolve({ name: 'NewName' })
      } as any;

      const response = await PATCH(mockRequest, { params: { id: 'nonexistent' } });
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData.message).toBe('Pet not found');

      updateSpy.mockRestore();
    });
  });

  describe('DELETE /api/pets/:id', () => {
    it('should delete a pet', async () => {
      const mockDeletedPet = { _id: '507f1f77bcf86cd799439011', name: 'DeletedPet' };
      const deleteSpy = jest.spyOn(Pet, 'findByIdAndDelete').mockResolvedValue(mockDeletedPet as any);

      const response = await DELETE({} as NextRequest, { params: { id: '507f1f77bcf86cd799439011' } });
      const responseData = await response.json();

      expect(deleteSpy).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(response.status).toBe(200);
      expect(responseData.message).toBe('Pet deleted successfully');

      deleteSpy.mockRestore();
    });

    it('should return 404 for non-existent pet', async () => {
      const deleteSpy = jest.spyOn(Pet, 'findByIdAndDelete').mockResolvedValue(null);

      const response = await DELETE({} as NextRequest, { params: { id: 'nonexistent' } });
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData.message).toBe('Pet not found');

      deleteSpy.mockRestore();
    });
  });
});
