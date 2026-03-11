import { db } from './db';

export interface ExportData {
  version: 1;
  exportedAt: string;
  modules: any[];
  lessons: any[];
  activities: any[];
  topicLinks: any[];
  progress: any[];
}

export async function exportAllData(): Promise<ExportData> {
  const [modules, lessons, activities, topicLinks, progress] = await Promise.all([
    db.modules.toArray(),
    db.lessons.toArray(),
    db.activities.toArray(),
    db.topicLinks.toArray(),
    db.progress.toArray(),
  ]);

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    modules,
    lessons,
    activities,
    topicLinks,
    progress,
  };
}

export async function importData(data: ExportData): Promise<{ modules: number; lessons: number }> {
  // Validate format
  if (!data.version || !data.modules) {
    throw new Error('Invalid export file format');
  }

  let modulesImported = 0;
  let lessonsImported = 0;

  // Import modules
  for (const module of data.modules) {
    const existing = await db.modules.get(module.id);
    if (!existing) {
      await db.modules.add({
        ...module,
        createdAt: new Date(module.createdAt),
        updatedAt: new Date(module.updatedAt),
      });
      modulesImported++;
    }
  }

  // Import lessons
  for (const lesson of data.lessons) {
    const existing = await db.lessons.get(lesson.id);
    if (!existing) {
      await db.lessons.add({
        ...lesson,
        createdAt: new Date(lesson.createdAt),
      });
      lessonsImported++;
    }
  }

  // Import topic links
  for (const link of data.topicLinks || []) {
    const existing = await db.topicLinks.get(link.id);
    if (!existing) {
      await db.topicLinks.add(link);
    }
  }

  // Import progress
  for (const prog of data.progress || []) {
    const existing = await db.progress.get(prog.moduleId);
    if (!existing) {
      await db.progress.add({
        ...prog,
        lastAccessedAt: new Date(prog.lastAccessedAt),
      });
    }
  }

  // Import activities
  for (const activity of data.activities || []) {
    const existing = await db.activities.get(activity.id);
    if (!existing) {
      await db.activities.add(activity);
    }
  }

  return { modules: modulesImported, lessons: lessonsImported };
}

export function downloadJson(data: any, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
