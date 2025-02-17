'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SentimentData {
  date: string;
  sentiment: number;
  entries: number;
}

export function SentimentAnalysis() {
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Simple sentiment analysis function
  const analyzeSentiment = (text: string): number => {
    const positiveWords = ['happy', 'joy', 'excited', 'wonderful', 'great', 'amazing', 'love', 'good'];
    const negativeWords = ['sad', 'angry', 'upset', 'terrible', 'bad', 'hate', 'awful', 'disappointed'];
    
    const words = text.toLowerCase().split(/\s+/);
    let score = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) score += 1;
      if (negativeWords.includes(word)) score -= 1;
    });
    
    return score;
  };

  useEffect(() => {
    const fetchSentimentData = async () => {
      if (!user) return;

      try {
        const entriesRef = collection(db, `users/${user.uid}/entries`);
        const q = query(entriesRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);

        const entriesByDate: { [key: string]: { total: number; count: number } } = {};

        snapshot.docs.forEach(doc => {
          const data = doc.data();
          const date = new Date(data.createdAt.toDate()).toISOString().split('T')[0];
          const sentiment = analyzeSentiment(data.content);

          if (!entriesByDate[date]) {
            entriesByDate[date] = { total: 0, count: 0 };
          }

          entriesByDate[date].total += sentiment;
          entriesByDate[date].count += 1;
        });

        const chartData: SentimentData[] = Object.entries(entriesByDate)
          .map(([date, data]) => ({
            date,
            sentiment: data.total / data.count,
            entries: data.count
          }))
          .sort((a, b) => a.date.localeCompare(b.date));

        setSentimentData(chartData);
      } catch (error) {
        console.error('Error fetching sentiment data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSentimentData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Mood Trends
      </h2>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sentimentData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              stroke="#6B7280"
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis stroke="#6B7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '0.5rem',
                color: '#F3F4F6'
              }}
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <Line
              type="monotone"
              dataKey="sentiment"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ fill: '#3B82F6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This chart shows your mood trends over time based on the sentiment analysis of your diary entries.
          Higher values indicate more positive emotions, while lower values indicate more negative emotions.
        </p>
      </div>
    </div>
  );
}
