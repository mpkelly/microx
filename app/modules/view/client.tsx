'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { getModule, getLessonsByModule, getProgress, getRelatedModules, getAllModules } from '@/lib/db';
import { ModuleQA } from '@/components/module-qa';
import type { Module, Lesson, UserProgress } from '@/types';

export function ModuleViewClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const moduleId = searchParams.get('id');

  const [module, setModule] = useState<Module | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [relatedModules, setRelatedModules] = useState<Module[]>([]);

  useEffect(() => {
    if (!moduleId) {
      router.push('/');
      return;
    }
    loadModule();
  }, [moduleId]);

  async function loadModule() {
    if (!moduleId) return;
    const mod = await getModule(moduleId);
    if (!mod) {
      router.push('/');
      return;
    }
    setModule(mod);

    const [lessonList, prog, links, allMods] = await Promise.all([
      getLessonsByModule(moduleId),
      getProgress(moduleId),
      getRelatedModules(moduleId),
      getAllModules(),
    ]);
    setLessons(lessonList);
    setProgress(prog ?? null);

    const relatedIds = new Set(links.map(l => l.sourceModuleId === moduleId ? l.targetModuleId : l.sourceModuleId));
    setRelatedModules(allMods.filter(m => relatedIds.has(m.id)));
  }

  if (!module) {
    return (
      <div className="min-h-[70vh] flex items-center">
        <span className="text-white/70 mono">...</span>
      </div>
    );
  }

  const outlineLessons = module.outline?.parameters?.lessons as { title: string; focus: string }[] | undefined;
  const completedIds = new Set(progress?.lessonsCompleted ?? []);

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
        <Link href="/" className="text-xs text-white/70 hover:text-white/90">
          ← back
        </Link>
        <h1 className="text-xl text-white/90">{module.title}</h1>
        <p className="text-white/70 text-sm">{module.description}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-1"
      >
        {(outlineLessons ?? []).map((lesson, i) => {
          const existingLesson = lessons.find((l) => l.order === i);
          const isCompleted = existingLesson && completedIds.has(existingLesson.id);

          return (
            <Link
              key={i}
              href={`/modules/lesson?id=${moduleId}&lesson=${i}`}
              className="block py-3 border-b border-white/5 hover:border-white/20 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <span className="mono text-xs text-white/60 w-6">{i + 1}</span>
                <span className={`text-sm ${isCompleted ? 'text-white/60' : 'text-white/90 group-hover:text-white'}`}>
                  {lesson.title}
                </span>
                {isCompleted && <span className="text-xs text-white/60">✓</span>}
              </div>
            </Link>
          );
        })}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="pt-6 border-t border-white/5"
      >
        <ModuleQA
          module={module}
          lessonTitles={(outlineLessons ?? []).map(l => l.title)}
          onQuestionAdded={loadModule}
        />
      </motion.div>

      {relatedModules.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="pt-6 space-y-2"
        >
          <p className="text-xs text-white/60">related</p>
          {relatedModules.map((rm) => (
            <Link
              key={rm.id}
              href={`/modules/view?id=${rm.id}`}
              className="block text-sm text-white/70 hover:text-white/90 transition-colors"
            >
              → {rm.title}
            </Link>
          ))}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="pt-4"
      >
        <Link
          href={`/modules/create?ref=${moduleId}`}
          className="text-white/60 text-sm hover:text-white/80 transition-colors"
        >
          + create related module
        </Link>
      </motion.div>
    </div>
  );
}
