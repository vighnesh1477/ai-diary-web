'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { Search } from 'lucide-react';
import { SentimentAnalysis } from './SentimentAnalysis';
import { ExportImport } from './ExportImport';

interface DiaryEntry {
  id: string;
  content: string;
  createdAt: Date;
}

export function PastEntries() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchEntries() {
      if (!user) return;

      try {
        const entriesRef = collection(db, `users/${user.uid}/entries`);
        const q = query(entriesRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        const fetchedEntries = snapshot.docs.map(doc => ({
          id: doc.id,
          content: doc.data().content,
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        }));
        
        setEntries(fetchedEntries);
      } catch (error) {
        console.error('Error fetching entries:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEntries();
  }, [user]);

  const filteredEntries = entries.filter(entry =>
    entry.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search entries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 pl-10 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
      </div>

      <div className="space-y-4">
        {filteredEntries.map((entry) => (
          <div
            key={entry.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              {entry.createdAt.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {entry.content}
            </p>
          </div>
        ))}

        {filteredEntries.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            {searchTerm ? 'No entries found matching your search' : 'No entries yet'}
          </div>
        )}
      </div>

      <div className="mt-8">
        <SentimentAnalysis />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Export & Import
        </h2>
        <ExportImport />
      </div>
    </div>
  );
}
