'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="fixed top-6 right-6 z-50">
      <button
        onClick={() => setOpen(!open)}
        className="text-white/50 hover:text-white/90 transition-colors text-sm mono"
      >
        {open ? '×' : 'μ'}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-8 right-0 text-right space-y-3 text-sm"
          >
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className={`block ${pathname === '/' ? 'text-white/95' : 'text-white/70 hover:text-white/95'}`}
            >
              home
            </Link>
            <Link
              href="/modules/create"
              onClick={() => setOpen(false)}
              className={`block ${pathname === '/modules/create' ? 'text-white/95' : 'text-white/70 hover:text-white/95'}`}
            >
              new
            </Link>
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className={`block ${pathname === '/settings' ? 'text-white/95' : 'text-white/70 hover:text-white/95'}`}
            >
              settings
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
