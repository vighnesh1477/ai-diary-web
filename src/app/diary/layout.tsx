import { Metadata } from 'next';

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
      {children}
    </div>
  );
}
