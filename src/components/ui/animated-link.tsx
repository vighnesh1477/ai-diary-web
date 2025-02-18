'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  activeClassName?: string;
  isActive?: boolean;
}

export function AnimatedLink({
  href,
  children,
  className = '',
  activeClassName = '',
  isActive = false,
}: AnimatedLinkProps) {
  return (
    <Link href={href} passHref>
      <motion.div
        className={`${className} ${isActive ? activeClassName : ''}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {children}
      </motion.div>
    </Link>
  );
}
