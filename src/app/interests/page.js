'use client';

import { useEffect, useState } from 'react';

export default function InterestsPage() {
  const [pets, setPets] = useState([]);
  const [interested, setInterested] = useState([]);

  useEffect(() => {
    fetch('/api/pets')
      .then(res => res.json())
      .then(data => setPets(data));

    const saved = JSON.parse(localStorage.getItem('interestedPets')) || [];
    setInterested(saved);
  }, []);

  const removeInterest = (id) => {
    const updated = interested.filter(petId => petId !== id);
    setInterested(updated);
    localStorage.setItem('interestedPets', JSON.stringify(updated));
  };

  const interestedPets = pets.filter(p => interested.includes(p._id));

  return (
    <div>
      <h1>Interested Pets</h1>
      {interestedPets.map(pet => (
        <div key={pet._id}>
          <h2>{pet.name}</h2>
          <p>Type: {pet.type}</p>
          <p>Age: {pet.age}</p>
          <p>Breed: {pet.breed}</p>
          <button onClick={() => removeInterest(pet._id)}>❌</button>
        </div>
      ))}
    </div>
  );
}
