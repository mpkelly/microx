'use client';

import type { ComparisonBlock as ComparisonBlockType } from '@/types';
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

export function ComparisonBlock({ title, columns, rows }: ComparisonBlockType) {
  return (
    <div className="space-y-4">
      {title && <p className="text-xs text-white/70 mono">{title}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-white/60">
              <th className="pb-3 pr-6 font-normal" />
              {columns.map((col, i) => (
                <th key={i} className="pb-3 pr-6 font-normal">
                  <RenderText text={col} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-white/90">
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-white/5">
                <td className="py-3 pr-6 text-white/70">
                  <RenderText text={row.attribute} />
                </td>
                {row.values.map((value, j) => (
                  <td key={j} className="py-3 pr-6">
                    <RenderText text={value} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
