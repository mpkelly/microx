'use client';

import { motion } from 'framer-motion';
import type { ContentBlock } from '@/types';
import { TextBlock } from './text-block';
import { TimelineBlock } from './timeline-block';
import { BarChartBlock } from './bar-chart-block';
import { ComparisonBlock } from './comparison-block';
import { VocabCardBlock } from './vocab-card-block';
import { CalloutBlock } from './callout-block';
import { ScaleBlock } from './scale-block';
import { PieChartBlock } from './pie-chart-block';
import { QuizBlock } from './quiz-block';
import { FlashcardBlock } from './flashcard-block';

const blockComponents: Record<string, React.ComponentType<any>> = {
  text: TextBlock,
  timeline: TimelineBlock,
  'bar-chart': BarChartBlock,
  comparison: ComparisonBlock,
  'vocab-card': VocabCardBlock,
  callout: CalloutBlock,
  scale: ScaleBlock,
  'pie-chart': PieChartBlock,
  quiz: QuizBlock,
  flashcard: FlashcardBlock,
};

export function BlockRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="space-y-10">
      {blocks.map((block, index) => {
        const Component = blockComponents[block.type];
        if (!Component) return null;

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.15, duration: 0.5 }}
          >
            <Component {...block} />
          </motion.div>
        );
      })}
    </div>
  );
}
