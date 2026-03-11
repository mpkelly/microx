'use client';

import { Volume2 } from 'lucide-react';
import type { VocabCardBlock as VocabCardBlockType } from '@/types';
import { useTTS } from '@/hooks/use-tts';

export function VocabCardBlock({
  term,
  lang,
  pronunciation,
  romanization,
  translation,
  example,
}: VocabCardBlockType) {
  const { speak, speaking } = useTTS();

  return (
    <div className="space-y-3">
      <div
        onClick={() => speak(term, { lang })}
        className="cursor-pointer group"
      >
        <p lang={lang} className="text-3xl text-cyan-400 group-hover:text-cyan-300 transition-colors">
          {term}
        </p>
        <p className="text-sm text-white/70 mono mt-1">
          {romanization && <span>{romanization}</span>}
          {romanization && pronunciation && <span> · </span>}
          {pronunciation && <span>/{pronunciation}/</span>}
          <Volume2 className={`inline w-3 h-3 ml-2 ${speaking ? 'opacity-100' : 'opacity-30'}`} />
        </p>
      </div>

      <p className="text-white/95">{translation}</p>

      {example && (
        <div
          onClick={() => speak(example.text, { lang: example.lang })}
          className="text-sm text-white/70 cursor-pointer hover:text-white/95 transition-colors"
        >
          <p lang={example.lang}>{example.text}</p>
          <p className="text-white/60 mt-1">{example.translation}</p>
        </div>
      )}
    </div>
  );
}
