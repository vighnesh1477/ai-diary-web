'use client';

import { useState, useCallback } from 'react';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { VoiceInput } from './VoiceInput';
import { EncryptionService } from '@/lib/encryption';
import { AnimatedButton } from '../ui/animated-button';
import { Save, Mic, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { TextProcessor } from '@/lib/textProcessing';

export function DiaryEntry() {
  const [content, setContent] = useState('');
  const [isEncrypted, setIsEncrypted] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const analyzeSentiment = (text: string): number => {
    // Simple sentiment analysis (replace with more sophisticated solution later)
    const positiveWords = ['happy', 'good', 'great', 'excellent', 'wonderful', 'love', 'joy'];
    const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'hate', 'angry', 'upset'];
    
    const words = text.toLowerCase().split(/\s+/);
    let score = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) score += 1;
      if (negativeWords.includes(word)) score -= 1;
    });
    
    return Math.max(-1, Math.min(1, score / 5)); // Normalize between -1 and 1
  };

  const handleSave = useCallback(async () => {
    if (!content.trim()) return;
    
    setIsSaving(true);
    try {
      const processedEntry = await TextProcessor.processEntry(content);
      
      const entryData = {
        content: processedEntry.structuredContent,
        summary: processedEntry.summary,
        topics: processedEntry.topics,
        mood: processedEntry.mood,
        timestamp: new Date().toISOString(),
        userId: auth.currentUser?.uid,
        isEncrypted,
      };

      if (isEncrypted) {
        entryData.content = await EncryptionService.getInstance().encrypt(processedEntry.structuredContent);
      }

      const entriesRef = collection(db, `users/${auth.currentUser?.uid}/entries`);
      await addDoc(entriesRef, entryData);
      
      setContent('');
    } catch (error) {
      console.error('Error saving entry:', error);
    } finally {
      setIsSaving(false);
    }
  }, [content, isEncrypted]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
    >
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">New Entry</h2>
        <button
          onClick={() => setIsEncrypted(!isEncrypted)}
          className={`p-2 rounded-lg transition-colors ${
            isEncrypted
              ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
              : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'
          }`}
        >
          <Lock className="w-5 h-5" />
        </button>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your thoughts..."
        className="w-full h-48 p-4 mb-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
      />

      <div className="flex justify-between items-center">
        <VoiceInput onTranscript={(text) => setContent(prev => prev + ' ' + text)} />
        
        <AnimatedButton
          onClick={handleSave}
          disabled={!content.trim() || isSaving}
          icon={<Save className="w-5 h-5" />}
        >
          {isSaving ? 'Saving...' : 'Save Entry'}
        </AnimatedButton>
      </div>
    </motion.div>
  );
}
