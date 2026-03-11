'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { isGeminiConfigured } from '@/lib/ai/gemini';
import { getAllModules } from '@/lib/db';
import type { Module } from '@/types';

export default function HomePage() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lines, setLines] = useState<{ text: string; href?: string; typed: string }[]>([]);
  const [currentLine, setCurrentLine] = useState(0);

  useEffect(() => {
    const check = async () => {
      const conf = isGeminiConfigured();
      setConfigured(conf);
      if (conf) {
        const mods = await getAllModules();
        setModules(mods);
      }
    };
    check();
  }, []);

  useEffect(() => {
    if (configured === null) return;

    const newLines: { text: string; href?: string; typed: string }[] = [];

    if (!configured) {
      newLines.push({ text: 'api key required', typed: '' });
      newLines.push({ text: '→ configure', href: '/settings', typed: '' });
    } else {
      if (modules.length > 0) {
        newLines.push({ text: 'continue learning', typed: '' });
        modules.slice(0, 5).forEach((m) => {
          newLines.push({ text: `→ ${m.title}`, href: `/modules/${m.id}`, typed: '' });
        });
        newLines.push({ text: '', typed: '' });
      }
      newLines.push({ text: 'or start something new', typed: '' });
      newLines.push({ text: '→ create module', href: '/modules/create', typed: '' });
    }

    setLines(newLines);
    setCurrentLine(0);
  }, [configured, modules]);

  // Typewriter effect
  useEffect(() => {
    if (currentLine >= lines.length) return;

    const line = lines[currentLine];
    if (line.typed.length < line.text.length) {
      const timeout = setTimeout(() => {
        setLines((prev) =>
          prev.map((l, i) =>
            i === currentLine ? { ...l, typed: line.text.slice(0, line.typed.length + 1) } : l
          )
        );
      }, 30 + Math.random() * 20);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => setCurrentLine((c) => c + 1), 200);
      return () => clearTimeout(timeout);
    }
  }, [lines, currentLine]);

  if (configured === null) {
    return (
      <div className="min-h-[70vh] flex items-center">
        <span className="text-white/50 mono">_</span>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex flex-col justify-center">
      <div className="space-y-1 mono text-sm">
        {lines.map((line, i) => {
          const isActive = i <= currentLine;
          const isCurrent = i === currentLine && line.typed.length < line.text.length;

          if (!isActive && !line.typed) return null;

          const content = (
            <span className={line.href ? 'hover:text-white transition-colors' : ''}>
              {line.typed || line.text}
              {isCurrent && <span className="text-cyan-400 animate-pulse">▌</span>}
            </span>
          );

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`${line.text === '' ? 'h-4' : ''} ${
                line.href ? 'text-white/90' : 'text-white/70'
              }`}
            >
              {line.href && line.typed.length === line.text.length ? (
                <Link href={line.href}>{content}</Link>
              ) : (
                content
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
