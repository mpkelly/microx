import { LessonClient } from './client';

export async function generateStaticParams() {
  // Return a placeholder - actual routing handled client-side via IndexedDB
  return [{ moduleId: '_', lessonIndex: '0' }];
}

export default function LessonPage() {
  return <LessonClient />;
}
