import { jest } from '@jest/globals';
import { PetService } from '@/lib/services/PetService';
import { Pet } from '@/lib/models/Pet';
import * as dbConnect from '@/lib/dbConnect';

// Mock the dbConnect function
jest.mock('@/lib/dbConnect', () => ({
  dbConnect: jest.fn(),
}));

describe('PetService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (dbConnect.dbConnect as jest.MockedFunction<typeof dbConnect.dbConnect>).mockResolvedValue(undefined as any);
  });

  describe('getAllPets', () => {
    it('should call Pet.find and return all pets', async () => {
      const mockPets = [
        { name: 'Shadow', type: 'Cat', age: 3, breed: 'Persian', isAdopted: false },
        { name: 'Buddy', type: 'Dog', age: 5, breed: 'Golden Retriever', isAdopted: true }
      ];

      const findSpy = jest.spyOn(Pet, 'find').mockResolvedValue(mockPets as any);

      const result = await PetService.getAllPets();

      expect(dbConnect.dbConnect).toHaveBeenCalled();
      expect(findSpy).toHaveBeenCalledWith({});
      expect(result).toEqual(mockPets);
      expect(result).toHaveLength(2);

      findSpy.mockRestore();
    });
  });

  describe('getPetById', () => {
    it('should call Pet.findById with correct id', async () => {
      const mockPet = { _id: '507f1f77bcf86cd799439011', name: 'Fluffy', type: 'Cat' };
      const findByIdSpy = jest.spyOn(Pet, 'findById').mockResolvedValue(mockPet as any);

      const result = await PetService.getPetById('507f1f77bcf86cd799439011');

      expect(dbConnect.dbConnect).toHaveBeenCalled();
      expect(findByIdSpy).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockPet);

      findByIdSpy.mockRestore();
    });

    it('should return null when pet not found', async () => {
      const findByIdSpy = jest.spyOn(Pet, 'findById').mockResolvedValue(null);

      const result = await PetService.getPetById('nonexistent');

      expect(findByIdSpy).toHaveBeenCalledWith('nonexistent');
      expect(result).toBeNull();

      findByIdSpy.mockRestore();
    });
  });

  describe('createPet', () => {
    it('should create a new pet and call save', async () => {
      const petData = {
        name: 'Rex',
        type: 'Dog',
        age: 4,
        breed: 'German Shepherd',
        isAdopted: false
      };

      const mockSavedPet = { ...petData, _id: '507f1f77bcf86cd799439012' };
      
      // Mock the save method on Pet prototype
      const saveSpy = jest.spyOn(Pet.prototype, 'save').mockResolvedValue(mockSavedPet as any);

      const result = await PetService.createPet(petData);

      expect(dbConnect.dbConnect).toHaveBeenCalled();
      expect(saveSpy).toHaveBeenCalled();
      expect(result).toEqual(mockSavedPet);

      saveSpy.mockRestore();
    });
  });

  describe('updatePet', () => {
    it('should call Pet.findByIdAndUpdate with correct parameters', async () => {
      const mockUpdatedPet = { _id: '507f1f77bcf86cd799439011', name: 'Updated Name', age: 6 };
      const updateData = { name: 'Updated Name', age: 6 };

      const updateSpy = jest.spyOn(Pet, 'findByIdAndUpdate').mockResolvedValue(mockUpdatedPet as any);

      const result = await PetService.updatePet('507f1f77bcf86cd799439011', updateData);

      expect(dbConnect.dbConnect).toHaveBeenCalled();
      expect(updateSpy).toHaveBeenCalledWith('507f1f77bcf86cd799439011', updateData, { new: true });
      expect(result).toEqual(mockUpdatedPet);

      updateSpy.mockRestore();
    });
  });

  describe('deletePet', () => {
    it('should call Pet.findByIdAndDelete with correct id', async () => {
      const mockDeletedPet = { _id: '507f1f77bcf86cd799439011', name: 'Deleted Pet' };
      const deleteSpy = jest.spyOn(Pet, 'findByIdAndDelete').mockResolvedValue(mockDeletedPet as any);

      const result = await PetService.deletePet('507f1f77bcf86cd799439011');

      expect(dbConnect.dbConnect).toHaveBeenCalled();
      expect(deleteSpy).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockDeletedPet);

      deleteSpy.mockRestore();
    });
  });

  describe('adoptPet', () => {
    it('should call Pet.findByIdAndUpdate to set isAdopted to true', async () => {
      const mockAdoptedPet = { _id: '507f1f77bcf86cd799439011', name: 'Adopted Pet', isAdopted: true };
      const adoptSpy = jest.spyOn(Pet, 'findByIdAndUpdate').mockResolvedValue(mockAdoptedPet as any);

      const result = await PetService.adoptPet('507f1f77bcf86cd799439011');

      expect(dbConnect.dbConnect).toHaveBeenCalled();
      expect(adoptSpy).toHaveBeenCalledWith('507f1f77bcf86cd799439011', { isAdopted: true }, { new: true });
      expect(result).toEqual(mockAdoptedPet);

      adoptSpy.mockRestore();
    });
  });

  describe('getAvailablePets', () => {
    it('should call Pet.find with isAdopted false filter', async () => {
      const mockAvailablePets = [
        { name: 'Available Pet 1', isAdopted: false },
        { name: 'Available Pet 2', isAdopted: false }
      ];

      const findSpy = jest.spyOn(Pet, 'find').mockResolvedValue(mockAvailablePets as any);

      const result = await PetService.getAvailablePets();

      expect(dbConnect.dbConnect).toHaveBeenCalled();
      expect(findSpy).toHaveBeenCalledWith({ isAdopted: false });
      expect(result).toEqual(mockAvailablePets);
      expect(result).toHaveLength(2);

      findSpy.mockRestore();
    });
  });
});
