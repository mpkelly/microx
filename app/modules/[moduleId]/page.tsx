import { ModuleDetailClient } from './client';

export async function generateStaticParams() {
  // Return a placeholder - actual routing handled client-side via IndexedDB
  return [{ moduleId: '_' }];
}

export default function ModuleDetailPage() {
  return <ModuleDetailClient />;
}
