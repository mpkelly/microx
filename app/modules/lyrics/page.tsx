import { Suspense } from 'react';
import { LyricsClient } from './client';

export default function LyricsPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center"><span className="text-white/70 mono">...</span></div>}>
      <LyricsClient />
    </Suspense>
  );
}
