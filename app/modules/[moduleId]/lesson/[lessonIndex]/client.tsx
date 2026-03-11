'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { getModule, getLessonsByModule, createLesson, updateProgress, logActivity } from '@/lib/db';
import { generateLessonStream } from '@/lib/ai/gemini';
import type { Module, Lesson, ContentBlock, GenerationContext } from '@/types';
import { generateId, getDateKey } from '@/lib/utils';
import { BlockRenderer } from '@/components/blocks';

function cleanJson(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
  else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
  if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
  return cleaned.trim();
}

type LessonOutline = { title: string; focus: string };

export function LessonClient() {
  const params = useParams();
  const router = useRouter();
  const moduleId = params.moduleId as string;
  const lessonIndex = parseInt(params.lessonIndex as string, 10);

  const [module, setModule] = useState<Module | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [generating, setGenerating] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    loadLesson();
  }, [moduleId, lessonIndex]);

  async function loadLesson() {
    const mod = await getModule(moduleId);
    if (!mod) {
      router.push('/');
      return;
    }
    setModule(mod);

    const existingLessons = await getLessonsByModule(moduleId);
    const existing = existingLessons.find((l) => l.order === lessonIndex);

    if (existing) {
      setLesson(existing);
      setBlocks(existing.content.blocks);
    } else {
      generateNewLesson(mod, existingLessons);
    }
  }

  async function generateNewLesson(mod: Module, existingLessons: Lesson[]) {
    if (!mod.outline) return;

    const outlineLessons = mod.outline.parameters?.lessons as LessonOutline[] | undefined;
    const currentOutline = outlineLessons?.[lessonIndex];
    if (!currentOutline) return;

    setGenerating(true);

    const context: GenerationContext = {
      lessonTopic: `${currentOutline.title}: ${currentOutline.focus}`,
      previousLessons: existingLessons.map((l) => l.title),
      targetMinutes: 3,
      difficulty: mod.metadata.difficulty,
    };

    try {
      let accumulated = '';
      for await (const chunk of generateLessonStream(mod.outline, context)) {
        accumulated += chunk;
        try {
          const parsed = JSON.parse(cleanJson(accumulated));
          if (parsed.blocks) setBlocks(parsed.blocks);
        } catch {}
      }

      const final = JSON.parse(cleanJson(accumulated));

      const newLesson: Lesson = {
        id: generateId(),
        moduleId: mod.id,
        title: final.title || currentOutline.title,
        order: lessonIndex,
        content: { type: 'micro', blocks: final.blocks },
        summary: final.summary,
        duration: 3,
        createdAt: new Date(),
        isAIGenerated: true,
      };

      await createLesson(newLesson);
      setLesson(newLesson);
      setBlocks(final.blocks);
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  }

  const handleComplete = useCallback(async () => {
    if (!lesson || completed) return;
    setCompleted(true);
    const duration = Math.round((Date.now() - startTime) / 1000);

    await Promise.all([
      updateProgress(moduleId, {
        lessonsCompleted: [lesson.id],
        lastAccessedAt: new Date(),
      }),
      logActivity({
        id: generateId(),
        date: getDateKey(),
        moduleId,
        lessonId: lesson.id,
        topicTags: module?.tags ?? [],
        duration,
        completionType: 'complete',
      }),
    ]);
  }, [lesson, completed, moduleId, module, startTime]);

  const outlineLessons = module?.outline?.parameters?.lessons as LessonOutline[] | undefined;
  const currentOutline = outlineLessons?.[lessonIndex];
  const hasNext = outlineLessons && lessonIndex < outlineLessons.length - 1;

  if (!module) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <span className="text-white/70 text-sm mono">...</span>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Minimal header */}
      <header className="space-y-4">
        <Link href={`/modules/${moduleId}`} className="text-xs text-white/70 hover:text-white/70">
          ← back
        </Link>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-xs mono text-white/60 mb-2">
            {lessonIndex + 1} / {outlineLessons?.length}
          </p>
          <h1 className="text-xl font-light">
            {lesson?.title ?? currentOutline?.title}
          </h1>
        </motion.div>
      </header>

      {/* Generating state */}
      {generating && blocks.length === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          className="text-sm mono"
        >
          generating...
        </motion.p>
      )}

      {/* Content */}
      <BlockRenderer blocks={blocks} />

      {/* Navigation */}
      {!generating && blocks.length > 0 && (
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="pt-12 flex items-center justify-between text-sm"
        >
          {completed ? (
            hasNext ? (
              <Link
                href={`/modules/${moduleId}/lesson/${lessonIndex + 1}`}
                className="text-white/80 hover:text-white"
              >
                next →
              </Link>
            ) : (
              <Link href="/" className="text-white/80 hover:text-white">
                done →
              </Link>
            )
          ) : (
            <button
              onClick={handleComplete}
              className="text-white/70 hover:text-white transition-colors"
            >
              complete →
            </button>
          )}
        </motion.footer>
      )}
    </div>
  );
}
