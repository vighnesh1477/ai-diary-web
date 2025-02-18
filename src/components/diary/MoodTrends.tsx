'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData
} from 'chart.js';
import { format, subDays } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface MoodData {
  date: string;
  sentiment: number;
}

export function MoodTrends() {
  const [moodData, setMoodData] = useState<MoodData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    const fetchMoodData = async () => {
      if (!auth.currentUser) return;

      try {
        const entriesRef = collection(db, `users/${auth.currentUser.uid}/entries`);
        const q = query(
          entriesRef,
          orderBy('createdAt', 'desc'),
          limit(timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365)
        );
        
        const querySnapshot = await getDocs(q);
        const data: MoodData[] = querySnapshot.docs.map(doc => ({
          date: format(doc.data().createdAt.toDate(), 'MMM dd'),
          sentiment: doc.data().sentiment || 0
        }));

        setMoodData(data.reverse());
      } catch (error) {
        console.error('Error fetching mood data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMoodData();
  }, [timeRange]);

  const chartData: ChartData<'line'> = {
    labels: moodData.map(d => d.date),
    datasets: [
      {
        label: 'Mood Score',
        data: moodData.map(d => d.sentiment),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Your Mood Trends',
      },
    },
    scales: {
      y: {
        min: -1,
        max: 1,
        ticks: {
          callback: (value: number) => {
            if (value === 1) return 'Very Positive';
            if (value === 0) return 'Neutral';
            if (value === -1) return 'Very Negative';
            return '';
          },
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Mood Trends</h2>
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[300px]">
        <Line data={chartData} options={options} />
      </div>
    </motion.div>
  );
}
