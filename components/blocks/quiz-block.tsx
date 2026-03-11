'use client';

import { useState } from 'react';
import type { QuizBlock as QuizBlockType } from '@/types';
import { parseTextContent } from '@/lib/content-parser';
import { LanguageSpan } from './language-span';

function RenderText({ text }: { text: string }) {
  const segments = parseTextContent(text);
  return (
    <>
      {segments.map((segment, index) => {
        if (segment.type === 'lang' && segment.text && segment.lang) {
          return (
            <LanguageSpan
              key={index}
              text={segment.text}
              lang={segment.lang}
              pronunciation={segment.pronunciation}
              translation={segment.translation}
            />
          );
        }
        return <span key={index}>{segment.content}</span>;
      })}
    </>
  );
}

export function QuizBlock({ question, options, correctIndex, explanation }: QuizBlockType) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (index: number) => {
    if (revealed) return;
    setSelected(index);
    setRevealed(true);
  };

  return (
    <div className="space-y-4">
      <p className="text-white/95">
        <RenderText text={question} />
      </p>

      <div className="space-y-2">
        {options.map((option, i) => {
          const isCorrect = i === correctIndex;
          const isSelected = i === selected;

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={revealed}
              className={`block w-full text-left py-2 text-sm transition-colors ${
                revealed
                  ? isCorrect
                    ? 'text-green-400'
                    : isSelected
                    ? 'text-red-400'
                    : 'text-white/70'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              <span className="mono text-white/60 mr-3">{String.fromCharCode(97 + i)}</span>
              <RenderText text={option} />
            </button>
          );
        })}
      </div>

      {revealed && explanation && (
        <p className="text-white/70 text-sm">
          <RenderText text={explanation} />
        </p>
      )}
    </div>
  );
}
