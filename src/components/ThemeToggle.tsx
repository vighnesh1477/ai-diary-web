'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <motion.button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors relative"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{
          scale: theme === 'dark' ? 0 : 1,
          rotate: theme === 'dark' ? -90 : 0,
        }}
        transition={{ duration: 0.2 }}
      >
        <Sun className="h-5 w-5" />
      </motion.div>
      
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={false}
        animate={{
          scale: theme === 'dark' ? 1 : 0,
          rotate: theme === 'dark' ? 0 : 90,
        }}
        transition={{ duration: 0.2 }}
      >
        <Moon className="h-5 w-5" />
      </motion.div>
    </motion.button>
  );
}
