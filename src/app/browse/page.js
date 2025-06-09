'use client';

import { useEffect, useState } from 'react';
import pets from '../../../data/pets.js';

export default function BrowsePage() {
  const [interested, setInterested] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('interestedPets')) || [];
    setInterested(saved);
  }, []);

  const toggleInterest = (id) => {
    let updated;
    if (interested.includes(id)) {
      updated = interested.filter(petId => petId !== id);
    } else {
      updated = [...interested, id];
    }
    setInterested(updated);
    localStorage.setItem('interestedPets', JSON.stringify(updated));
  };

  return (
    <div>
      <h1>Browse Pets</h1>
      {pets.map(pet => (
        <div key={pet.id}>
          <h2>{pet.name}</h2>
          <p>Type: {pet.type}</p>
          <p>Age: {pet.age}</p>
          <p>Status: {interested.includes(pet.id) ? 'Interested' : 'Available'}</p>
          <button
            disabled={interested.includes(pet.id)}
            onClick={() => toggleInterest(pet.id)}
          >
            {interested.includes(pet.id) ? 'Interested ✅' : "I'm Interested"}
          </button>
        </div>
      ))}
    </div>
  );
}
