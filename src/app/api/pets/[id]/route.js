import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { Pet } from '@/lib/models/Pet';

// GET /api/pets/:id
export async function GET(req, { params }) {
  await dbConnect();
  const pet = await Pet.findById(params.id);
  if (!pet) {
    return NextResponse.json({ message: 'Pet not found' }, { status: 404 });
  }
  return NextResponse.json(pet);
}

// PATCH /api/pets/:id
export async function PATCH(req, { params }) {
  await dbConnect();
  try {
    const body = await req.json();
    const pet = await Pet.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });

    if (!pet) {
      return NextResponse.json({ message: 'Pet not found' }, { status: 404 });
    }

    return NextResponse.json(pet);
  } catch (err) {
    return NextResponse.json(
      { message: 'Failed to update pet', error: err.message },
      { status: 400 }
    );
  }
}

// DELETE /api/pets/:id
export async function DELETE(req, { params }) {
  await dbConnect();
  try {
    const deletedPet = await Pet.findByIdAndDelete(params.id);

    if (!deletedPet) {
      return NextResponse.json({ message: 'Pet not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Pet deleted successfully' });
  } catch (err) {
    return NextResponse.json(
      { message: 'Failed to delete pet', error: err.message },
      { status: 500 }
    );
  }
}


