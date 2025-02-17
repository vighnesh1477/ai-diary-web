'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp, DocumentData } from 'firebase/firestore';
import { Download, Upload, FileText } from 'lucide-react';

interface DiaryEntryData {
  content: string;
  createdAt: string;
  updatedAt: string;
}

export function ExportImport() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const exportToPDF = async () => {
    setLoading(true);
    try {
      const entriesRef = collection(db, `users/${user?.uid}/entries`);
      const snapshot = await getDocs(entriesRef);
      const entries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      }));

      // Create PDF content
      let pdfContent = `AI Diary - Export Date: ${new Date().toLocaleDateString()}\n\n`;
      entries.sort((a: DocumentData, b: DocumentData) => b.createdAt - a.createdAt)
        .forEach((entry: DocumentData) => {
          pdfContent += `Date: ${entry.createdAt.toLocaleDateString()}\n`;
          pdfContent += `${entry.content}\n\n`;
          pdfContent += "-------------------\n\n";
        });

      // Create and download file
      const blob = new Blob([pdfContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-diary-export-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting diary:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToJSON = async () => {
    setLoading(true);
    try {
      const entriesRef = collection(db, `users/${user?.uid}/entries`);
      const snapshot = await getDocs(entriesRef);
      const entries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate().toISOString()
      }));

      const jsonContent = JSON.stringify(entries, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-diary-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting diary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setLoading(true);
    try {
      const text = await file.text();
      const entries = JSON.parse(text) as DiaryEntryData[];
      
      const entriesRef = collection(db, `users/${user.uid}/entries`);
      for (const entry of entries) {
        await addDoc(entriesRef, {
          content: entry.content,
          createdAt: new Date(entry.createdAt),
          updatedAt: serverTimestamp(),
        });
      }

      alert('Import successful!');
    } catch (error) {
      console.error('Error importing diary:', error);
      alert('Error importing diary. Please make sure the file is a valid JSON export.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex space-x-4">
        <button
          onClick={exportToPDF}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors duration-200"
        >
          <FileText className="w-5 h-5" />
          <span>Export as Text</span>
        </button>

        <button
          onClick={exportToJSON}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors duration-200"
        >
          <Download className="w-5 h-5" />
          <span>Export as JSON</span>
        </button>
      </div>

      <div className="relative">
        <input
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
          id="import-input"
          disabled={loading}
        />
        <label
          htmlFor="import-input"
          className={`flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg transition-colors duration-200 cursor-pointer ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Upload className="w-5 h-5" />
          <span>Import from JSON</span>
        </label>
      </div>
    </div>
  );
}
