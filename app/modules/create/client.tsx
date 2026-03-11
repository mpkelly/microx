'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { generateModuleOutline, type GeneratedOutline } from '@/lib/ai/gemini';
import { createModule, getModule, createTopicLink } from '@/lib/db';
import { generateId } from '@/lib/utils';
import type { Module } from '@/types';

export function CreateModuleClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refId = searchParams.get('ref');

  const inputRef = useRef<HTMLInputElement>(null);
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<'idle' | 'generating' | 'preview'>('idle');
  const [isCreating, setIsCreating] = useState(false);
  const [outline, setOutline] = useState<GeneratedOutline | null>(null);
  const [displayText, setDisplayText] = useState('');
  const [refModule, setRefModule] = useState<Module | null>(null);

  useEffect(() => {
    if (refId) {
      getModule(refId).then(m => setRefModule(m ?? null));
    }
    inputRef.current?.focus();
  }, [refId]);

  // Typewriter for generating state
  useEffect(() => {
    if (status === 'generating') {
      const text = 'generating outline...';
      let i = 0;
      const interval = setInterval(() => {
        setDisplayText(text.slice(0, i));
        i++;
        if (i > text.length) i = 0;
      }, 100);
      return () => clearInterval(interval);
    }
  }, [status]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setStatus('generating');

    try {
      // Build prompt with reference context
      let fullPrompt = prompt;
      if (refModule) {
        const refLessons = (refModule.outline?.parameters?.lessons as { title: string }[]) || [];
        const lessonTitles = refLessons.map(l => l.title).join(', ');
        fullPrompt = `${prompt}\n\nReference module "${refModule.title}" covers: ${lessonTitles}. Create complementary content that doesn't repeat these topics.`;
      }

      const result = await generateModuleOutline(fullPrompt);
      setOutline(result);
      setStatus('preview');
    } catch (e) {
      console.error(e);
      setStatus('idle');
    }
  };

  const handleCreate = async () => {
    if (!outline) return;
    setIsCreating(true);

    const moduleId = generateId();

    const module: Module = {
      id: moduleId,
      title: outline.title,
      description: outline.description,
      type: 'outline',
      outline: {
        framework: 'ai-generated',
        context: prompt,
        generationPrompt: prompt,
        parameters: { lessons: outline.lessons },
      },
      tags: outline.tags,
      parentModuleId: refModule?.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      isTopLevel: true,
      metadata: {
        difficulty: outline.difficulty,
        estimatedMinutes: outline.estimatedMinutes,
        category: outline.tags[0] || 'general',
      },
    };

    await createModule(module);

    // Create link between modules
    if (refModule) {
      await createTopicLink({
        id: generateId(),
        sourceModuleId: refModule.id,
        targetModuleId: moduleId,
        relationshipType: 'related',
        strength: 0.8,
        createdBy: 'user',
        concepts: outline.tags,
      });
    }

    router.push(`/modules/view?id=${moduleId}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  if (status === 'generating') {
    return (
      <div className="min-h-[70vh] flex items-center">
        <p className="text-white/70 mono text-sm">
          {displayText}<span className="text-cyan-400 animate-pulse">▌</span>
        </p>
      </div>
    );
  }

  if (status === 'preview' && outline) {
    return (
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <p className="text-xs mono text-white/70">preview</p>
          <h1 className="text-xl text-white/90">{outline.title}</h1>
          <p className="text-white/80 text-sm">{outline.description}</p>
          {refModule && (
            <p className="text-xs text-white/80">
              linked to: {refModule.title}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <p className="text-xs mono text-white/70">{outline.lessons.length} lessons</p>
          {outline.lessons.map((lesson, i) => (
            <p key={i} className="text-white/70 text-sm">
              <span className="mono text-white/80 mr-3">{i + 1}</span>
              {lesson.title}
            </p>
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
            className="text-white/80 hover:text-white transition-colors"
          >
            {isCreating ? 'creating...' : 'create →'}
          </button>
          <button
            onClick={() => {
              setOutline(null);
              setStatus('idle');
            }}
            className="text-white/70 hover:text-white/70 transition-colors"
          >
            start over
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex flex-col justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {refModule ? (
          <div className="space-y-2">
            <p className="text-white/70 text-xs">
              creating module related to:
            </p>
            <p className="text-white/70 text-sm">{refModule.title}</p>
            <p className="text-white/70 text-sm mt-4">
              describe the new module (e.g., "harder version", "beginner level", "focus on verbs")
            </p>
          </div>
        ) : (
          <p className="text-white/80 text-sm">what do you want to learn?</p>
        )}

        <input
          ref={inputRef}
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="_"
          className="w-full bg-transparent text-white/90 text-lg focus:outline-none placeholder:text-white/50"
        />

        {prompt && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleGenerate}
            className="text-white/80 text-sm hover:text-white/90 transition-colors"
          >
            generate →
          </motion.button>
        )}

        {!refModule && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="pt-8"
          >
            <Link
              href="/modules/lyrics"
              className="text-white/50 text-xs hover:text-white/70 transition-colors"
            >
              or import from song lyrics →
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
