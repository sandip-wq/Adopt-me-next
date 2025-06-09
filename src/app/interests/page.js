'use client';

import { useEffect, useState } from 'react';
import pets from '../../../data/pets.js';

export default function InterestsPage() {
  const [interested, setInterested] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('interestedPets')) || [];
    setInterested(saved);
  }, []);

  const removeInterest = (id) => {
    const updated = interested.filter(petId => petId !== id);
    setInterested(updated);
    localStorage.setItem('interestedPets', JSON.stringify(updated));
  };

  const interestedPets = pets.filter(p => interested.includes(p.id));

  return (
    <div>
      <h1>Interested Users</h1>
      {interestedPets.map(pet => (
        <div key={pet.id}>
          <h2>{pet.name}</h2>
          <p>Type: {pet.type}</p>
          <p>Age: {pet.age}</p>
          <button onClick={() => removeInterest(pet.id)}>❌</button>
        </div>
      ))}
    </div>
  );
}
