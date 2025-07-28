import { jest } from '@jest/globals';
import { Pet } from '@/lib/models/Pet';

describe('Pet model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new pet', async () => {
    const petData = {
      name: 'Shadow',
      type: 'Cat',
      age: 3,
      breed: 'Persian',
      isAdopted: false
    };

    const pet = new Pet(petData);
    const savedPet = await pet.save();

    expect(savedPet.name).toBe('Shadow');
    expect(savedPet.type).toBe('Cat');
    expect(savedPet.age).toBe(3);
    expect(savedPet.breed).toBe('Persian');
    expect(savedPet.isAdopted).toBe(false);
  });

  it('should spy on Pet.find and return mocked data', async () => {
    const mockPets = [
      { name: 'Shadow', type: 'Cat', age: 3, breed: 'Persian' },
      { name: 'Buddy', type: 'Dog', age: 5, breed: 'Golden Retriever' }
    ];

    const spy = jest.spyOn(Pet, 'find').mockResolvedValue(mockPets as any);

    const pets = await Pet.find({});
    
    expect(spy).toHaveBeenCalledWith({});
    expect(pets).toEqual(mockPets);
    expect(pets).toHaveLength(2);
    expect(pets[0].name).toBe('Shadow');

    spy.mockRestore();
  });

  it('should spy on Pet.findById', async () => {
    const mockPet = { 
      _id: '507f1f77bcf86cd799439011',
      name: 'Fluffy', 
      type: 'Cat', 
      age: 2, 
      breed: 'Maine Coon' 
    };

    const spy = jest.spyOn(Pet, 'findById').mockResolvedValue(mockPet as any);

    const pet = await Pet.findById('507f1f77bcf86cd799439011');
    
    expect(spy).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    expect(pet).toEqual(mockPet);
    expect(pet.name).toBe('Fluffy');

    spy.mockRestore();
  });

  it('should spy on Pet.create', async () => {
    const petData = {
      name: 'Rex',
      type: 'Dog',
      age: 4,
      breed: 'German Shepherd'
    };

    const mockCreatedPet = { ...petData, _id: '507f1f77bcf86cd799439012' };
    const spy = jest.spyOn(Pet, 'create').mockResolvedValue(mockCreatedPet as any);

    const result = await Pet.create(petData);
    
    expect(spy).toHaveBeenCalledWith(petData);
    expect(result).toEqual(mockCreatedPet);
    expect(result.name).toBe('Rex');

    spy.mockRestore();
  });
});
