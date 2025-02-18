import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { format, isSameDay } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { DiaryEntrySkeleton } from '../ui/skeleton';

interface Entry {
  id: string;
  content: string;
  timestamp: string;
  isEncrypted: boolean;
  summary?: string;
  topics?: string[];
  mood?: {
    score: number;
    primaryEmotion: string;
  };
}

export function PastEntries() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [datesWithEntries, setDatesWithEntries] = useState<Date[]>([]);

  useEffect(() => {
    const fetchEntries = async () => {
      if (!auth.currentUser) return;
      
      try {
        const entriesRef = collection(db, `users/${auth.currentUser.uid}/entries`);
        const q = query(
          entriesRef,
          orderBy('timestamp', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const fetchedEntries = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Entry[];
        
        setEntries(fetchedEntries);
        
        // Get unique dates with entries
        const dates = [...new Set(
          fetchedEntries.map(entry => format(new Date(entry.timestamp), 'yyyy-MM-dd'))
        )].map(dateStr => new Date(dateStr));
        setDatesWithEntries(dates);
      } catch (error) {
        console.error('Error fetching entries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  if (loading) {
    return <DiaryEntrySkeleton />;
  }

  const getMoodColor = (score: number) => {
    if (score > 0.3) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (score < -0.3) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const selectedEntries = entries.filter(entry => 
    selectedDate && isSameDay(new Date(entry.timestamp), selectedDate)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Past Entries</h2>
        <div className="flex items-center text-sm text-gray-500">
          <CalendarIcon className="w-4 h-4 mr-2" />
          {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border dark:border-gray-700"
            modifiers={{
              hasEntry: (date) => 
                datesWithEntries.some(entryDate => 
                  isSameDay(entryDate, date)
                )
            }}
            modifiersStyles={{
              hasEntry: { 
                backgroundColor: '#93c5fd',
                color: '#1e3a8a',
                fontWeight: 'bold'
              }
            }}
          />
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {selectedEntries.length > 0 ? (
              <motion.div
                key="entries"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {selectedEntries.map((entry) => (
                  <motion.div
                    key={entry.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">
                          {format(new Date(entry.timestamp), 'h:mm a')}
                        </h3>
                        {entry.summary && (
                          <p className="text-gray-600 dark:text-gray-400 italic">
                            "{entry.summary}"
                          </p>
                        )}
                      </div>
                      {entry.mood && (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMoodColor(entry.mood.score)}`}>
                          {entry.mood.primaryEmotion}
                        </span>
                      )}
                    </div>

                    <div className="prose dark:prose-invert max-w-none">
                      <p>{entry.isEncrypted ? '🔒 Encrypted Entry' : entry.content}</p>
                    </div>

                    {entry.topics && entry.topics.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {entry.topics.map((topic, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {topic}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="no-entries"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full min-h-[200px] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
              >
                <CalendarIcon className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-center">
                  {selectedDate
                    ? `No entries for ${format(selectedDate, 'MMMM d, yyyy')}`
                    : 'Select a date to view entries'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
