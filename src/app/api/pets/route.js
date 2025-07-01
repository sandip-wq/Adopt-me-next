import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { Pet } from '@/lib/models/Pet';

export async function GET() {
  await dbConnect();
  const pets = await Pet.find({});
  return NextResponse.json(pets);
}
