import { Suspense } from 'react';
import { LessonViewClient } from './client';

export default function LessonPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center"><span className="text-white/70 mono">...</span></div>}>
      <LessonViewClient />
    </Suspense>
  );
}
