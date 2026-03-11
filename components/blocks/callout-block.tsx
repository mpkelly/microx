'use client';

import type { CalloutBlock as CalloutBlockType } from '@/types';
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

export function CalloutBlock({ style, content, attribution }: CalloutBlockType) {
  if (style === 'quote') {
    return (
      <blockquote className="border-l border-white/10 pl-4 text-white/90 italic">
        <RenderText text={content} />
        {attribution && (
          <p className="text-white/70 text-sm mt-2 not-italic">— {attribution}</p>
        )}
      </blockquote>
    );
  }

  return (
    <p className="text-white/90 text-sm">
      <span className="text-white/70 mono mr-2">
        {style === 'tip' && '→'}
        {style === 'definition' && '≡'}
        {style === 'key-point' && '•'}
        {style === 'warning' && '!'}
      </span>
      <RenderText text={content} />
    </p>
  );
}
