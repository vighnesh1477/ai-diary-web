import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { VoiceInput } from './VoiceInput';
import { AISuggestions } from './AISuggestions';

export function DiaryEntry() {
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  const handleVoiceInput = (transcript: string) => {
    setContent((prev) => prev + ' ' + transcript);
  };

  const handleApplySuggestion = (original: string, suggestion: string) => {
    setContent((prev) => prev.replace(original, suggestion));
  };

  const saveEntry = async () => {
    if (!user || !content.trim()) return;

    setSaving(true);
    try {
      const entriesRef = collection(db, `users/${user.uid}/entries`);
      await addDoc(entriesRef, {
        content,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setContent('');
    } catch (error) {
      console.error('Error saving diary entry:', error);
    } finally {
      setSaving(false);
    }
  };

  // Auto-save every 30 seconds if there's content
  useEffect(() => {
    if (!content.trim()) return;

    const timer = setTimeout(saveEntry, 30000);
    return () => clearTimeout(timer);
  }, [content]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-64 p-4 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Write your thoughts here..."
        />
        <div className="absolute top-2 right-2">
          <VoiceInput onTranscript={handleVoiceInput} />
        </div>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={saveEntry}
          disabled={saving || !content.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          {saving ? 'Saving...' : 'Save Entry'}
        </button>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {saving ? 'Saving...' : 'Auto-saves every 30 seconds'}
        </span>
      </div>
      
      <AISuggestions 
        text={content} 
        onApplySuggestion={handleApplySuggestion} 
      />
    </div>
  );
}
