import Dexie, { type Table } from 'dexie';
import type {
  Module,
  Lesson,
  ActivityEntry,
  TopicLink,
  GenerationLog,
  UserProgress,
} from '@/types';

export class MicroXDatabase extends Dexie {
  modules!: Table<Module>;
  lessons!: Table<Lesson>;
  activities!: Table<ActivityEntry>;
  topicLinks!: Table<TopicLink>;
  generationLogs!: Table<GenerationLog>;
  progress!: Table<UserProgress>;

  constructor() {
    super('microx');

    this.version(1).stores({
      modules: 'id, type, *tags, parentModuleId, isTopLevel, createdAt',
      lessons: 'id, moduleId, order, createdAt',
      activities: 'id, date, moduleId, *topicTags',
      topicLinks: 'id, sourceModuleId, targetModuleId, relationshipType',
      generationLogs: 'id, lessonId, reviewStatus, timestamp',
      progress: 'moduleId, lastAccessedAt',
    });
  }
}

export const db = new MicroXDatabase();

// ============================================
// MODULE OPERATIONS
// ============================================

export async function createModule(module: Module): Promise<string> {
  return db.modules.add(module);
}

export async function getModule(id: string): Promise<Module | undefined> {
  return db.modules.get(id);
}

export async function getAllModules(): Promise<Module[]> {
  return db.modules.toArray();
}

export async function getTopLevelModules(): Promise<Module[]> {
  return db.modules.where('isTopLevel').equals(1).toArray();
}

export async function updateModule(id: string, updates: Partial<Module>): Promise<void> {
  await db.modules.update(id, { ...updates, updatedAt: new Date() });
}

export async function deleteModule(id: string): Promise<void> {
  await db.transaction('rw', [db.modules, db.lessons, db.activities], async () => {
    await db.lessons.where('moduleId').equals(id).delete();
    await db.activities.where('moduleId').equals(id).delete();
    await db.modules.delete(id);
  });
}

// ============================================
// LESSON OPERATIONS
// ============================================

export async function createLesson(lesson: Lesson): Promise<string> {
  return db.lessons.add(lesson);
}

export async function getLesson(id: string): Promise<Lesson | undefined> {
  return db.lessons.get(id);
}

export async function getLessonsByModule(moduleId: string): Promise<Lesson[]> {
  return db.lessons.where('moduleId').equals(moduleId).sortBy('order');
}

export async function updateLesson(id: string, updates: Partial<Lesson>): Promise<void> {
  await db.lessons.update(id, updates);
}

export async function deleteLesson(id: string): Promise<void> {
  await db.lessons.delete(id);
}

// ============================================
// ACTIVITY OPERATIONS
// ============================================

export async function logActivity(entry: ActivityEntry): Promise<string> {
  return db.activities.add(entry);
}

export async function getActivitiesByDate(date: string): Promise<ActivityEntry[]> {
  return db.activities.where('date').equals(date).toArray();
}

export async function getActivitiesInRange(startDate: string, endDate: string): Promise<ActivityEntry[]> {
  return db.activities
    .where('date')
    .between(startDate, endDate, true, true)
    .toArray();
}

export async function getRecentActivities(limit: number = 50): Promise<ActivityEntry[]> {
  return db.activities.orderBy('date').reverse().limit(limit).toArray();
}

// ============================================
// PROGRESS OPERATIONS
// ============================================

export async function getProgress(moduleId: string): Promise<UserProgress | undefined> {
  return db.progress.get(moduleId);
}

export async function updateProgress(moduleId: string, updates: Partial<UserProgress>): Promise<void> {
  const existing = await db.progress.get(moduleId);
  if (existing) {
    await db.progress.update(moduleId, updates);
  } else {
    await db.progress.add({
      moduleId,
      lessonsCompleted: [],
      lastAccessedAt: new Date(),
      masteryScore: 0,
      streakDays: 0,
      ...updates,
    });
  }
}

// ============================================
// TOPIC LINK OPERATIONS
// ============================================

export async function createTopicLink(link: TopicLink): Promise<string> {
  return db.topicLinks.add(link);
}

export async function getRelatedModules(moduleId: string): Promise<TopicLink[]> {
  const asSource = await db.topicLinks.where('sourceModuleId').equals(moduleId).toArray();
  const asTarget = await db.topicLinks.where('targetModuleId').equals(moduleId).toArray();
  return [...asSource, ...asTarget];
}
