import { Metadata } from 'next';
import { Navigation } from '@/components/Navigation';
import { DiaryEntry } from '@/components/diary/DiaryEntry';
import { PastEntries } from '@/components/diary/PastEntries';
import { ExportImport } from '@/components/diary/ExportImport';
import { WeeklyMoodTrend } from '@/components/diary/WeeklyMoodTrend';

export const metadata: Metadata = {
  title: 'My Diary - AI Diary',
  description: 'Write and manage your diary entries',
};

export default function DiaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          <DiaryEntry />
          <WeeklyMoodTrend />
          <PastEntries />
          <ExportImport />
          {children}
        </div>
      </main>
    </div>
  );
}
