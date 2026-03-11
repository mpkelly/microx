'use client';

import type { TextBlock as TextBlockType } from '@/types';
import { parseTextContent } from '@/lib/content-parser';
import { LanguageSpan } from './language-span';

export function TextBlock({ content }: TextBlockType) {
  const segments = parseTextContent(content);

  return (
    <p className="text-white/95 leading-relaxed">
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
    </p>
  );
}
