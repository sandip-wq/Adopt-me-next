'use client';

import { useEffect, useState } from 'react';

export default function BrowsePage() {
  const [pets, setPets] = useState([]);
  const [interested, setInterested] = useState([]);

  useEffect(() => {
    fetch('/api/pets')
      .then(res => res.json())
      .then(data => setPets(data));

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
        <div key={pet._id}>
          <h2>{pet.name}</h2>
          <p>Type: {pet.type}</p>
          <p>Age: {pet.age}</p>
          <p>Breed: {pet.breed}</p>
          <p>Status: {interested.includes(pet._id) ? 'Interested' : 'Available'}</p>
          <button
            disabled={interested.includes(pet._id)}
            onClick={() => toggleInterest(pet._id)}
          >
            {interested.includes(pet._id) ? 'Interested ✅' : "I'm Interested"}
          </button>
        </div>
      ))}
    </div>
  );
}
