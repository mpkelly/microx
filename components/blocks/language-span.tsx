'use client';

import { Volume2 } from 'lucide-react';
import { useTTS } from '@/hooks/use-tts';

interface LanguageSpanProps {
  text: string;
  lang: string;
  pronunciation?: string;
  translation?: string;
}

export function LanguageSpan({ text, lang, pronunciation, translation }: LanguageSpanProps) {
  const { speak, speaking } = useTTS();

  const handleSpeak = (e: React.MouseEvent) => {
    e.preventDefault();
    speak(text, { lang });
  };

  return (
    <span
      onClick={handleSpeak}
      className="inline-flex items-center gap-2 mx-1 px-2 py-0.5 text-cyan-400 cursor-pointer hover:text-cyan-300 transition-colors mono text-sm"
      title={translation}
    >
      <span lang={lang}>{text}</span>
      {pronunciation && <span className="text-white/60 text-xs">/{pronunciation}/</span>}
      <Volume2 className={`w-3 h-3 ${speaking ? 'opacity-100' : 'opacity-30'}`} />
    </span>
  );
}
