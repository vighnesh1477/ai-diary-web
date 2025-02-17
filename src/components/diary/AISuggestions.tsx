'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, X } from 'lucide-react';

interface Suggestion {
  type: 'grammar' | 'style' | 'emotion';
  original: string;
  suggestion: string;
  explanation: string;
}

interface AISuggestionsProps {
  text: string;
  onApplySuggestion: (original: string, suggestion: string) => void;
}

export function AISuggestions({ text, onApplySuggestion }: AISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Simulate AI suggestions (replace this with actual AI API calls)
  useEffect(() => {
    if (!text.trim()) {
      setSuggestions([]);
      return;
    }

    // Example suggestions based on simple patterns
    const newSuggestions: Suggestion[] = [];

    // Check for common grammar issues
    if (text.includes("your") && !text.includes("you're")) {
      newSuggestions.push({
        type: 'grammar',
        original: "your",
        suggestion: "you're",
        explanation: "Consider if you meant 'you are' instead of the possessive 'your'."
      });
    }

    // Check for style improvements
    if (text.includes("very")) {
      newSuggestions.push({
        type: 'style',
        original: "very",
        suggestion: "",
        explanation: "Consider using a stronger word instead of 'very'."
      });
    }

    // Emotion detection
    if (text.toLowerCase().includes("sad") || text.toLowerCase().includes("unhappy")) {
      newSuggestions.push({
        type: 'emotion',
        original: text,
        suggestion: "",
        explanation: "I notice you're expressing sadness. Would you like to explore what's causing these feelings?"
      });
    }

    setSuggestions(newSuggestions);
  }, [text]);

  if (suggestions.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!showSuggestions ? (
        <button
          onClick={() => setShowSuggestions(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors duration-200 relative"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full text-sm flex items-center justify-center">
            {suggestions.length}
          </span>
        </button>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 w-80">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Suggestions
            </h3>
            <button
              onClick={() => setShowSuggestions(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <span className="inline-block px-2 py-1 text-xs rounded-full mb-2"
                    style={{
                      backgroundColor: suggestion.type === 'grammar' ? '#e0f2fe' :
                                     suggestion.type === 'style' ? '#fef3c7' : '#fee2e2',
                      color: suggestion.type === 'grammar' ? '#0369a1' :
                             suggestion.type === 'style' ? '#92400e' : '#b91c1c'
                    }}
                  >
                    {suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {suggestion.explanation}
                </p>
                
                {suggestion.suggestion && (
                  <button
                    onClick={() => onApplySuggestion(suggestion.original, suggestion.suggestion)}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Apply suggestion
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
