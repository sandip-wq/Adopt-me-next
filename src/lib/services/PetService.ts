import { Pet } from '@/lib/models/Pet';
import { dbConnect } from '@/lib/dbConnect';

export interface IPet {
  _id?: string;
  name: string;
  type: string;
  age: number;
  breed: string;
  isAdopted?: boolean;
}

export class PetService {
  static async getAllPets(): Promise<IPet[]> {
    await dbConnect();
    return await Pet.find({});
  }

  static async getPetById(id: string): Promise<IPet | null> {
    await dbConnect();
    return await Pet.findById(id);
  }

  static async createPet(petData: Omit<IPet, '_id'>): Promise<IPet> {
    await dbConnect();
    const pet = new Pet(petData);
    return await pet.save();
  }

  static async updatePet(id: string, updateData: Partial<IPet>): Promise<IPet | null> {
    await dbConnect();
    return await Pet.findByIdAndUpdate(id, updateData, { new: true });
  }

  static async deletePet(id: string): Promise<IPet | null> {
    await dbConnect();
    return await Pet.findByIdAndDelete(id);
  }

  static async adoptPet(id: string): Promise<IPet | null> {
    await dbConnect();
    return await Pet.findByIdAndUpdate(id, { isAdopted: true }, { new: true });
  }

  static async getAvailablePets(): Promise<IPet[]> {
    await dbConnect();
    return await Pet.find({ isAdopted: false });
  }
}
