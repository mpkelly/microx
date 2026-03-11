import { Suspense } from 'react';
import { ModuleViewClient } from './client';

export default function ModuleViewPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center"><span className="text-white/70 mono">...</span></div>}>
      <ModuleViewClient />
    </Suspense>
  );
}
