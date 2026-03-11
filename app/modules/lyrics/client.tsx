'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { analyzeLyrics } from '@/lib/ai/gemini';
import { createModule } from '@/lib/db';
import { generateId } from '@/lib/utils';
import type { Module } from '@/types';

export function LyricsClient() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [lyrics, setLyrics] = useState('');
  const [language, setLanguage] = useState('');
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'preview'>('idle');
  const [isCreating, setIsCreating] = useState(false);
  const [outline, setOutline] = useState<{
    title: string;
    description: string;
    detectedLanguage: string;
    lessons: { title: string; focus: string; words: string[] }[];
  } | null>(null);

  const handleAnalyze = async () => {
    if (!lyrics.trim()) return;
    setStatus('analyzing');

    try {
      const result = await analyzeLyrics(lyrics, language || undefined, title || undefined);
      setOutline(result);
      setStatus('preview');
    } catch (e) {
      console.error(e);
      setStatus('idle');
    }
  };

  const handleCreate = async () => {
    if (!outline || isCreating) return;
    setIsCreating(true);

    const moduleId = generateId();
    const module: Module = {
      id: moduleId,
      title: outline.title,
      description: outline.description,
      type: 'outline',
      outline: {
        framework: 'lyrics-vocab',
        context: lyrics.slice(0, 500),
        generationPrompt: `Vocabulary from: ${title || 'song lyrics'}`,
        parameters: {
          lessons: outline.lessons,
          sourceLanguage: outline.detectedLanguage,
          originalLyrics: lyrics,
        },
      },
      tags: ['vocabulary', outline.detectedLanguage, 'lyrics'],
      createdAt: new Date(),
      updatedAt: new Date(),
      isTopLevel: true,
      metadata: {
        difficulty: 'intermediate',
        estimatedMinutes: outline.lessons.length * 3,
        category: 'language',
      },
    };

    await createModule(module);
    router.push(`/modules/view?id=${moduleId}`);
  };

  if (status === 'analyzing') {
    return (
      <div className="min-h-[70vh] flex items-center">
        <p className="text-white/70 mono text-sm">
          analyzing lyrics<span className="text-cyan-400 animate-pulse">...</span>
        </p>
      </div>
    );
  }

  if (status === 'preview' && outline) {
    return (
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <Link href="/modules/create" className="text-xs text-white/70 hover:text-white/90">
            ← back
          </Link>
          <p className="text-xs mono text-white/60">preview</p>
          <h1 className="text-xl text-white/90">{outline.title}</h1>
          <p className="text-white/70 text-sm">{outline.description}</p>
          <p className="text-xs text-white/50 mono">language: {outline.detectedLanguage}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <p className="text-xs mono text-white/60">{outline.lessons.length} lessons</p>
          {outline.lessons.map((lesson, i) => (
            <div key={i} className="space-y-1">
              <p className="text-white/90 text-sm">
                <span className="mono text-white/50 mr-3">{i + 1}</span>
                {lesson.title}
              </p>
              <p className="text-white/50 text-xs ml-6">
                {lesson.words.join(' · ')}
              </p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-6 text-sm"
        >
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="text-white/90 hover:text-white transition-colors disabled:opacity-50"
          >
            {isCreating ? 'creating...' : 'create module →'}
          </button>
          <button
            onClick={() => {
              setOutline(null);
              setStatus('idle');
            }}
            className="text-white/50 hover:text-white/70 transition-colors"
          >
            start over
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
        <Link href="/modules/create" className="text-xs text-white/70 hover:text-white/90">
          ← back
        </Link>
        <p className="text-white/70 text-sm">paste song lyrics to learn vocabulary</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="song title (optional)"
          className="w-full bg-transparent border-b border-white/10 pb-2 text-white/90 text-sm focus:outline-none focus:border-white/30 placeholder:text-white/30"
        />

        <input
          type="text"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          placeholder="language (auto-detect if empty)"
          className="w-full bg-transparent border-b border-white/10 pb-2 text-white/90 text-sm focus:outline-none focus:border-white/30 placeholder:text-white/30"
        />

        <textarea
          ref={textareaRef}
          value={lyrics}
          onChange={(e) => setLyrics(e.target.value)}
          placeholder="paste lyrics here..."
          rows={12}
          className="w-full bg-transparent border border-white/10 p-3 text-white/90 text-sm focus:outline-none focus:border-white/30 placeholder:text-white/30 resize-none"
        />

        {lyrics && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleAnalyze}
            className="text-white/70 text-sm hover:text-white/90 transition-colors"
          >
            analyze →
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
