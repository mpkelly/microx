'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, BookOpen, Clock, Layers } from 'lucide-react';
import Link from 'next/link';
import { getAllModules, getProgress } from '@/lib/db';
import type { Module, UserProgress } from '@/types';
import { cn, formatDuration } from '@/lib/utils';

export default function ModulesPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [progress, setProgress] = useState<Record<string, UserProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModules();
  }, []);

  async function loadModules() {
    const mods = await getAllModules();
    setModules(mods);

    const prog: Record<string, UserProgress> = {};
    for (const mod of mods) {
      const p = await getProgress(mod.id);
      if (p) prog[mod.id] = p;
    }
    setProgress(prog);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Modules</h1>
          <p className="text-muted-foreground mt-1">
            {modules.length} module{modules.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/modules/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          New
        </Link>
      </motion.div>

      {/* Module Grid */}
      {modules.length === 0 ? (
        <EmptyModules />
      ) : (
        <div className="grid gap-4">
          {modules.map((module, index) => (
            <ModuleCard
              key={module.id}
              module={module}
              progress={progress[module.id]}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ModuleCard({
  module,
  progress,
  index,
}: {
  module: Module;
  progress?: UserProgress;
  index: number;
}) {
  const completedCount = progress?.lessonsCompleted.length ?? 0;
  const progressPercent = progress?.masteryScore ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={`/modules/${module.id}`}
        className="block rounded-2xl border bg-card p-5 card-hover"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-medium',
                  module.type === 'outline'
                    ? 'bg-purple-500/10 text-purple-500'
                    : 'bg-blue-500/10 text-blue-500'
                )}
              >
                {module.type === 'outline' ? 'AI Generated' : 'Manual'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                {module.metadata.difficulty}
              </span>
            </div>

            <h3 className="text-lg font-semibold truncate">{module.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {module.description}
            </p>

            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDuration(module.metadata.estimatedMinutes)}
              </span>
              <span className="flex items-center gap-1">
                <Layers className="w-4 h-4" />
                {module.metadata.category}
              </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {module.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md bg-muted text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
              {module.tags.length > 4 && (
                <span className="px-2 py-0.5 text-xs text-muted-foreground">
                  +{module.tags.length - 4}
                </span>
              )}
            </div>
          </div>

          {/* Progress Circle */}
          <div className="relative w-14 h-14 flex-shrink-0">
            <svg className="w-14 h-14 -rotate-90">
              <circle
                cx="28"
                cy="28"
                r="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-muted"
              />
              <circle
                cx="28"
                cy="28"
                r="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={`${progressPercent * 1.5} 150`}
                className="text-primary transition-all duration-500"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
              {progressPercent}%
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function EmptyModules() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <BookOpen className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-xl font-semibold">No modules yet</h2>
      <p className="text-muted-foreground mt-1 max-w-sm">
        Create your first learning module to get started.
      </p>
      <Link
        href="/modules/create"
        className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium"
      >
        <Plus className="w-4 h-4" />
        Create Module
      </Link>
    </motion.div>
  );
}
