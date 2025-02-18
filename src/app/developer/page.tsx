'use client';

import Link from 'next/link';
import { GitHub, Linkedin, Mail } from 'lucide-react';

export default function DeveloperPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Developer</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 mb-4">
              {/* Add your profile image here */}
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Vighnesh S</h2>
            <p className="text-gray-600 dark:text-gray-300">Full Stack Developer</p>
          </div>
          
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              I am a passionate developer with expertise in modern web technologies including React, Next.js, and Firebase.
              AI Diary is one of my projects that combines my interest in AI with practical application development.
            </p>
            
            <div className="flex justify-center space-x-6 py-4">
              <a
                href="https://github.com/vighnesh1477"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <GitHub className="w-6 h-6" />
              </a>
              <a
                href="https://linkedin.com/in/your-linkedin"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <Linkedin className="w-6 h-6" />
              </a>
              <a
                href="mailto:your.email@example.com"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <Mail className="w-6 h-6" />
              </a>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {['React', 'Next.js', 'TypeScript', 'Firebase', 'Tailwind CSS', 'Node.js'].map((skill) => (
                <span
                  key={skill}
                  className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Link 
            href="/diary"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
          >
            Back to Diary
          </Link>
        </div>
      </div>
    </div>
  );
}
