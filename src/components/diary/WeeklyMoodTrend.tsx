import { useEffect, useState } from 'react';
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
  Filler
} from 'chart.js';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { startOfWeek, endOfWeek, eachDayOfInterval, format } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function WeeklyMoodTrend() {
  const [weeklyData, setWeeklyData] = useState<{
    labels: string[];
    values: number[];
  }>({ labels: [], values: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeeklyMood = async () => {
      if (!auth.currentUser) return;

      try {
        setLoading(true);
        setError(null);

        // Get date range for current week
        const start = startOfWeek(new Date());
        const end = endOfWeek(new Date());

        // Create array of all days in the week
        const daysInWeek = eachDayOfInterval({ start, end });
        const labels = daysInWeek.map(day => format(day, 'EEE'));

        // Query entries for the week
        const entriesRef = collection(db, `users/${auth.currentUser.uid}/entries`);
        const q = query(
          entriesRef,
          where('timestamp', '>=', start.toISOString()),
          where('timestamp', '<=', end.toISOString()),
          orderBy('timestamp')
        );

        const querySnapshot = await getDocs(q);
        
        // Initialize mood values for each day
        const moodByDay = new Map(daysInWeek.map(day => [
          format(day, 'yyyy-MM-dd'),
          [] as number[]
        ]));

        // Collect mood scores for each day
        querySnapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.mood?.score !== undefined) {
            const day = format(new Date(data.timestamp), 'yyyy-MM-dd');
            const scores = moodByDay.get(day) || [];
            scores.push(data.mood.score);
            moodByDay.set(day, scores);
          }
        });

        // Calculate average mood for each day
        const values = daysInWeek.map(day => {
          const scores = moodByDay.get(format(day, 'yyyy-MM-dd')) || [];
          return scores.length > 0
            ? scores.reduce((sum, score) => sum + score, 0) / scores.length
            : 0;
        });

        setWeeklyData({ labels, values });
      } catch (err) {
        console.error('Error fetching weekly mood:', err);
        setError('Failed to load mood data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyMood();
  }, []);

  if (loading) {
    return (
      <div className="h-[300px] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex items-center justify-center">
        <div className="animate-pulse">Loading mood trends...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[300px] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  const chartData = {
    labels: weeklyData.labels,
    datasets: [
      {
        label: 'Weekly Mood',
        data: weeklyData.values,
        fill: true,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: -1,
        max: 1,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: (value: number) => {
            if (value === 1) return 'Very Happy';
            if (value === 0) return 'Neutral';
            if (value === -1) return 'Very Sad';
            return '';
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.parsed.y;
            if (value > 0.7) return 'Very Happy';
            if (value > 0.3) return 'Happy';
            if (value > -0.3) return 'Neutral';
            if (value > -0.7) return 'Sad';
            return 'Very Sad';
          },
        },
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Weekly Mood Trend</h3>
      <div className="h-[300px]">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
