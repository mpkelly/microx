'use client';

import type { TimelineBlock as TimelineBlockType } from '@/types';
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

export function TimelineBlock({ title, events }: TimelineBlockType) {
  return (
    <div className="space-y-4">
      {title && <p className="text-xs text-white/70 mono">{title}</p>}

      <div className="space-y-4">
        {events.map((event, i) => (
          <div key={i} className="flex gap-4">
            <span className="text-xs text-white/70 mono w-16 shrink-0">{event.date}</span>
            <div>
              <p className="text-white/90"><RenderText text={event.label} /></p>
              {event.description && (
                <p className="text-white/70 text-sm mt-1"><RenderText text={event.description} /></p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
