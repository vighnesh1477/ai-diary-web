'use client';

import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import { Book, Info, Code, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { AnimatedLink } from './ui/animated-link';
import { AnimatedButton } from './ui/animated-button';
import { motion } from 'framer-motion';

export function Navigation() {
  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.nav 
      className="bg-white dark:bg-gray-800 shadow-lg"
      initial="hidden"
      animate="visible"
      variants={navVariants}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <motion.div 
            className="flex"
            variants={itemVariants}
          >
            <AnimatedLink
              href="/diary"
              className="flex items-center px-2 py-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <Book className="w-6 h-6" />
              <span className="ml-2 font-semibold">AI Diary</span>
            </AnimatedLink>
          </motion.div>

          <motion.div 
            className="flex items-center space-x-4"
            variants={itemVariants}
          >
            <AnimatedLink
              href="/about"
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
              activeClassName="text-blue-600 dark:text-blue-400"
              isActive={pathname === '/about'}
            >
              <Info className="w-5 h-5 mr-1" />
              <span>About</span>
            </AnimatedLink>

            <AnimatedLink
              href="/developer"
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
              activeClassName="text-blue-600 dark:text-blue-400"
              isActive={pathname === '/developer'}
            >
              <Code className="w-5 h-5 mr-1" />
              <span>Developer</span>
            </AnimatedLink>

            <ThemeToggle />

            <AnimatedButton
              onClick={handleSignOut}
              variant="danger"
              size="sm"
              icon={<LogOut className="w-5 h-5" />}
              className="flex items-center gap-2"
            >
              Sign Out
            </AnimatedButton>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
}
