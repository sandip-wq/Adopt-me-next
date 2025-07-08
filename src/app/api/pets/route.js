import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { Pet } from '@/lib/models/Pet';

export async function GET() {
  await dbConnect();
  const pets = await Pet.find({});
  return NextResponse.json(pets);
}

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();

    const newPet = new Pet({
      name: body.name,
      type: body.type,
      age: body.age,
      breed: body.breed,
      isAdopted: body.isAdopted ?? false,
    });

    const savedPet = await newPet.save();
    return NextResponse.json(savedPet, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to create pet', error: error.message },
      { status: 500 }
    );
  }
}
