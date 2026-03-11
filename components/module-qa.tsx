'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { answerQuestion, generateModuleFromQA } from '@/lib/ai/gemini';
import { addQuestionToModule, createModule, createTopicLink } from '@/lib/db';
import { generateId } from '@/lib/utils';
import type { Module, ModuleQuestion } from '@/types';

interface ModuleQAProps {
  module: Module;
  lessonTitles: string[];
  onQuestionAdded: () => void;
}

export function ModuleQA({ module, lessonTitles, onQuestionAdded }: ModuleQAProps) {
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [pendingAnswer, setPendingAnswer] = useState<{ q: string; a: string } | null>(null);
  const [isCreatingModule, setIsCreatingModule] = useState(false);

  const handleAsk = async () => {
    if (!question.trim() || isAsking) return;

    setIsAsking(true);
    try {
      const answer = await answerQuestion(
        module.title,
        module.description,
        lessonTitles,
        question
      );

      setPendingAnswer({ q: question, a: answer });

      const newQuestion: ModuleQuestion = {
        id: generateId(),
        question: question,
        answer: answer,
        createdAt: new Date(),
      };

      await addQuestionToModule(module.id, newQuestion);
      setQuestion('');
      onQuestionAdded();
    } catch (e) {
      console.error(e);
    } finally {
      setIsAsking(false);
    }
  };

  const handleCreateModule = async () => {
    if (!pendingAnswer || isCreatingModule) return;

    setIsCreatingModule(true);
    try {
      const outline = await generateModuleFromQA(
        pendingAnswer.q,
        pendingAnswer.a,
        module.title
      );

      const newModuleId = generateId();
      const newModule: Module = {
        id: newModuleId,
        title: outline.title,
        description: outline.description,
        type: 'outline',
        outline: {
          framework: 'ai-generated',
          context: `From Q&A: ${pendingAnswer.q}`,
          generationPrompt: pendingAnswer.q,
          parameters: { lessons: outline.lessons },
        },
        tags: outline.tags,
        parentModuleId: module.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        isTopLevel: true,
        metadata: {
          difficulty: outline.difficulty,
          estimatedMinutes: outline.estimatedMinutes,
          category: outline.tags[0] || 'general',
        },
      };

      await createModule(newModule);
      await createTopicLink({
        id: generateId(),
        sourceModuleId: module.id,
        targetModuleId: newModuleId,
        relationshipType: 'deepDive',
        strength: 0.9,
        createdBy: 'ai',
        concepts: outline.tags,
      });

      router.push(`/modules/view?id=${newModuleId}`);
    } catch (e) {
      console.error(e);
      setIsCreatingModule(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-white/60">ask a question</p>

      <div className="space-y-3">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="what about..."
          disabled={isAsking}
          className="w-full bg-transparent border-b border-white/10 pb-2 text-white/90 text-sm focus:outline-none focus:border-white/30 placeholder:text-white/30 disabled:opacity-50"
        />

        {question && !isAsking && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleAsk}
            className="text-white/60 text-sm hover:text-white/90 transition-colors"
          >
            ask →
          </motion.button>
        )}

        {isAsking && (
          <p className="text-white/50 text-sm mono">thinking...</p>
        )}
      </div>

      <AnimatePresence>
        {pendingAnswer && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3 pt-4 border-t border-white/5"
          >
            <p className="text-white/60 text-sm">Q: {pendingAnswer.q}</p>
            <p className="text-white/90 text-sm">{pendingAnswer.a}</p>

            <button
              onClick={handleCreateModule}
              disabled={isCreatingModule}
              className="text-white/60 text-xs hover:text-white/90 transition-colors disabled:opacity-50"
            >
              {isCreatingModule ? 'creating...' : '→ explore this as new module'}
            </button>

            <button
              onClick={() => setPendingAnswer(null)}
              className="text-white/40 text-xs ml-4 hover:text-white/60 transition-colors"
            >
              dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {module.questions && module.questions.length > 0 && !pendingAnswer && (
        <div className="space-y-3 pt-4">
          <p className="text-xs text-white/40">previous questions</p>
          {module.questions.slice(-3).reverse().map((qa) => (
            <div key={qa.id} className="text-sm space-y-1">
              <p className="text-white/50">Q: {qa.question}</p>
              <p className="text-white/70">{qa.answer}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
