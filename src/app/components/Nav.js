'use client';
import Link from 'next/link';

export default function Nav() {
  return (
    <nav className="bg-gray-100 p-4 flex gap-4">
      <Link href="/browse">Browse Pets</Link>
      <Link href="/interests">Manage Interests</Link>
    </nav>
  );
}
