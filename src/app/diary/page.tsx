'use client';

import { Metadata } from 'next';
import { DiaryEntry } from '@/components/diary/DiaryEntry';
import { PastEntries } from '@/components/diary/PastEntries';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export const metadata: Metadata = {
  title: 'My Diary - AI Diary',
  description: 'Write and manage your diary entries',
};

export default function DiaryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'write' | 'past'>('write');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen p-4 md:p-8">
      <ThemeToggle />
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Diary
          </h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('write')}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                activeTab === 'write'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Write
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                activeTab === 'past'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Past Entries
            </button>
          </div>
        </div>

        {activeTab === 'write' ? <DiaryEntry /> : <PastEntries />}
      </div>
    </main>
  );
}
