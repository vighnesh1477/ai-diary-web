'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">About AI Diary</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Your Personal AI-Powered Journal</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            AI Diary is a modern journaling application that combines the therapeutic benefits of traditional diary writing
            with cutting-edge artificial intelligence technology.
          </p>
          
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mt-6 mb-3">Key Features</h3>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
            <li>Voice-to-text entry for effortless journaling</li>
            <li>AI-powered writing suggestions and improvements</li>
            <li>Mood tracking and sentiment analysis</li>
            <li>Secure Google authentication</li>
            <li>Dark/Light theme support</li>
            <li>Calendar view for past entries</li>
            <li>Export and backup functionality</li>
          </ul>
          
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mt-6 mb-3">Privacy & Security</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Your privacy is our top priority. All diary entries are securely stored and encrypted.
            Only you can access your personal entries through your authenticated account.
          </p>
        </div>
        
        <div className="flex justify-center">
          <Link 
            href="/diary"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
          >
            Start Writing
          </Link>
        </div>
      </div>
    </div>
  );
}
