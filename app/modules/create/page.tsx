import { Suspense } from 'react';
import { CreateModuleClient } from './client';

export default function CreateModulePage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center"><p className="text-white/70 mono text-sm">loading...</p></div>}>
      <CreateModuleClient />
    </Suspense>
  );
}
