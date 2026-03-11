import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai';
import type { ModuleOutline, GenerationContext, GeneratedLesson, ContentBlock } from '@/types';
import { buildLessonPrompt, buildOutlinePrompt, buildSummaryPrompt } from './prompts';

// Clean markdown code fences from JSON responses
function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  // Remove ```json or ``` at start
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  // Remove ``` at end
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

let genAI: GoogleGenerativeAI | null = null;

export function initGemini(apiKey: string): void {
  genAI = new GoogleGenerativeAI(apiKey);
}

export function getGemini(): GoogleGenerativeAI {
  if (!genAI) {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('gemini_api_key');
      if (stored) {
        genAI = new GoogleGenerativeAI(stored);
      }
    }
  }
  if (!genAI) {
    throw new Error('Gemini API key not configured. Please add your key in Settings.');
  }
  return genAI;
}

export function isGeminiConfigured(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('gemini_api_key');
}

function getModel(): GenerativeModel {
  return getGemini().getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });
}

function getStreamModel(): GenerativeModel {
  return getGemini().getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });
}

// ============================================
// LESSON GENERATION
// ============================================

export async function generateLesson(
  outline: ModuleOutline,
  context: GenerationContext
): Promise<GeneratedLesson> {
  const model = getModel();
  const prompt = buildLessonPrompt(outline, context);

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  return JSON.parse(cleanJsonResponse(response)) as GeneratedLesson;
}

export async function* generateLessonStream(
  outline: ModuleOutline,
  context: GenerationContext
): AsyncGenerator<string> {
  const model = getStreamModel();
  const prompt = buildLessonPrompt(outline, context);

  const result = await model.generateContentStream(prompt);

  for await (const chunk of result.stream) {
    yield chunk.text();
  }
}

// ============================================
// MODULE OUTLINE GENERATION
// ============================================

export interface GeneratedOutline {
  title: string;
  description: string;
  lessons: { title: string; focus: string }[];
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
}

export async function generateModuleOutline(userPrompt: string): Promise<GeneratedOutline> {
  const model = getModel();
  const prompt = buildOutlinePrompt(userPrompt);

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  return JSON.parse(cleanJsonResponse(response)) as GeneratedOutline;
}

// ============================================
// SUMMARY GENERATION
// ============================================

export async function generateSummary(blocks: ContentBlock[]): Promise<string> {
  const model = getStreamModel();
  const prompt = buildSummaryPrompt(blocks);

  const result = await model.generateContent(prompt);
  return result.response.text();
}

// ============================================
// API KEY VALIDATION
// ============================================

export async function validateApiKey(apiKey: string): Promise<boolean> {
  // Basic format check - Gemini keys start with AIza
  if (!apiKey.startsWith('AIza') || apiKey.length < 30) {
    console.error('Invalid API key format');
    return false;
  }

  // Skip API call validation - just check format
  // Real validation happens on first use
  return true;
}

export function saveApiKey(apiKey: string): void {
  localStorage.setItem('gemini_api_key', apiKey);
  initGemini(apiKey);
}

export function clearApiKey(): void {
  localStorage.removeItem('gemini_api_key');
  genAI = null;
}
