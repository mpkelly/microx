'use client';

import { useState } from 'react';
import type { FlashcardBlock as FlashcardBlockType } from '@/types';
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

export function FlashcardBlock({ cards }: FlashcardBlockType) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = cards[index];

  const next = () => {
    if (index < cards.length - 1) {
      setIndex(index + 1);
      setFlipped(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-white/20 mono">{index + 1}/{cards.length}</p>

      <div
        onClick={() => setFlipped(!flipped)}
        className="cursor-pointer min-h-[100px] flex items-center"
      >
        <p className={`text-lg ${flipped ? 'text-white/80' : 'text-white/95'}`}>
          <RenderText text={flipped ? card.back : card.front} />
        </p>
      </div>

      <div className="flex gap-6 text-sm">
        {!flipped && (
          <button onClick={() => setFlipped(true)} className="text-white/70 hover:text-white">
            reveal
          </button>
        )}
        {flipped && index < cards.length - 1 && (
          <button onClick={next} className="text-white/70 hover:text-white">
            next →
          </button>
        )}
      </div>
    </div>
  );
}
