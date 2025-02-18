'use client';

import { useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { Download, FileJson, FileText, FilePdf, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { AnimatedButton } from '../ui/animated-button';
import { motion } from 'framer-motion';
import { EncryptionService } from '@/lib/encryption';
import { jsPDF } from 'jspdf';

interface DiaryEntry {
  content: string;
  createdAt: Date;
  sentiment?: number;
}

export function ExportImport() {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<{
    start: string;
    end: string;
  }>({
    start: '',
    end: '',
  });

  const fetchEntries = async () => {
    if (!auth.currentUser) return [];

    const entriesRef = collection(db, `users/${auth.currentUser.uid}/entries`);
    const q = query(entriesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const encryptionService = EncryptionService.getInstance();
    encryptionService.setEncryptionKey(auth.currentUser.uid);

    return querySnapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          content: data.isEncrypted 
            ? encryptionService.decrypt(data.content)
            : data.content,
          createdAt: data.createdAt.toDate(),
          sentiment: data.sentiment,
        };
      })
      .filter(entry => {
        if (!dateRange.start && !dateRange.end) return true;
        const entryDate = entry.createdAt;
        const start = dateRange.start ? new Date(dateRange.start) : null;
        const end = dateRange.end ? new Date(dateRange.end) : null;
        
        if (start && end) {
          return entryDate >= start && entryDate <= end;
        } else if (start) {
          return entryDate >= start;
        } else if (end) {
          return entryDate <= end;
        }
        return true;
      });
  };

  const exportEntries = async (format: 'json' | 'txt' | 'pdf') => {
    try {
      setLoading(true);
      const entries = await fetchEntries();

      switch (format) {
        case 'json':
          exportJSON(entries);
          break;
        case 'txt':
          exportTXT(entries);
          break;
        case 'pdf':
          exportPDF(entries);
          break;
      }
    } catch (error) {
      console.error('Error exporting entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportJSON = (entries: DiaryEntry[]) => {
    const data = JSON.stringify(entries, null, 2);
    downloadFile(data, 'diary-entries.json', 'application/json');
  };

  const exportTXT = (entries: DiaryEntry[]) => {
    const data = entries
      .map(entry => {
        const date = format(entry.createdAt, 'MMMM d, yyyy h:mm a');
        const mood = entry.sentiment
          ? entry.sentiment > 0
            ? 'Positive'
            : entry.sentiment < 0
            ? 'Negative'
            : 'Neutral'
          : 'No mood data';

        return `Date: ${date}\nMood: ${mood}\n\n${entry.content}\n\n${'='.repeat(50)}\n\n`;
      })
      .join('');

    downloadFile(data, 'diary-entries.txt', 'text/plain');
  };

  const exportPDF = (entries: DiaryEntry[]) => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('My Diary Entries', 20, y);
    y += 15;

    entries.forEach((entry) => {
      // Add new page if needed
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      const date = format(entry.createdAt, 'MMMM d, yyyy h:mm a');
      const mood = entry.sentiment
        ? entry.sentiment > 0
          ? 'Positive'
          : entry.sentiment < 0
          ? 'Negative'
          : 'Neutral'
        : 'No mood data';

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(`Date: ${date}`, 20, y);
      y += 7;
      doc.text(`Mood: ${mood}`, 20, y);
      y += 10;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      
      // Split long text into lines
      const lines = doc.splitTextToSize(entry.content, 170);
      lines.forEach(line => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, 20, y);
        y += 7;
      });

      y += 10;
    });

    doc.save('diary-entries.pdf');
  };

  const downloadFile = (data: string, filename: string, type: string) => {
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Export Diary Entries
        </h2>
        <Calendar className="w-6 h-6 text-gray-400" />
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date (Optional)
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date (Optional)
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <AnimatedButton
            onClick={() => exportEntries('json')}
            disabled={loading}
            variant="secondary"
            icon={<FileJson className="w-5 h-5" />}
          >
            Export as JSON
          </AnimatedButton>

          <AnimatedButton
            onClick={() => exportEntries('txt')}
            disabled={loading}
            variant="secondary"
            icon={<FileText className="w-5 h-5" />}
          >
            Export as Text
          </AnimatedButton>

          <AnimatedButton
            onClick={() => exportEntries('pdf')}
            disabled={loading}
            variant="secondary"
            icon={<FilePdf className="w-5 h-5" />}
          >
            Export as PDF
          </AnimatedButton>
        </div>

        {loading && (
          <div className="text-center text-gray-500 dark:text-gray-400">
            Preparing your diary entries...
          </div>
        )}
      </div>
    </motion.div>
  );
}
