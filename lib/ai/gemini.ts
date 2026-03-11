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

// ============================================
// Q&A
// ============================================

function getTextModel(): GenerativeModel {
  return getGemini().getGenerativeModel({
    model: 'gemini-2.5-flash',
  });
}

export async function answerQuestion(
  moduleTitle: string,
  moduleDescription: string,
  lessonTitles: string[],
  question: string
): Promise<string> {
  const model = getTextModel();

  const prompt = `You are a helpful tutor. The student is learning about:

Module: ${moduleTitle}
Description: ${moduleDescription}
Lessons covered: ${lessonTitles.join(', ')}

The student asks: "${question}"

Provide a clear, concise answer (2-4 sentences). If the question relates to the module topic, give specific, educational information. If it's off-topic, gently redirect while still being helpful.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

// ============================================
// LYRICS ANALYSIS
// ============================================

export interface LyricsAnalysis {
  title: string;
  description: string;
  detectedLanguage: string;
  lessons: {
    title: string;
    focus: string;
    words: string[];
  }[];
}

export async function analyzeLyrics(
  lyrics: string,
  language?: string,
  songTitle?: string
): Promise<LyricsAnalysis> {
  const model = getModel();

  const prompt = `Analyze these song lyrics for vocabulary learning.

${songTitle ? `Song: ${songTitle}` : ''}
${language ? `Language: ${language}` : 'Detect the language.'}

Lyrics:
${lyrics}

Create a vocabulary learning module. Group interesting/useful words into themed lessons (3-5 words per lesson). Focus on:
- Common words a learner should know
- Slang or colloquial expressions
- Emotionally significant words
- Words that appear multiple times

Return JSON:
{
  "title": "Vocabulary from [song name or 'Song Lyrics']",
  "description": "Learn X words and phrases from this song",
  "detectedLanguage": "language code (e.g., 'th', 'ja', 'ko', 'es')",
  "lessons": [
    {
      "title": "Theme name (e.g., 'Emotions', 'Actions', 'Time & Place')",
      "focus": "What these words have in common",
      "words": ["word1", "word2", "word3"]
    }
  ]
}

Create 4-6 lessons covering the most valuable vocabulary.`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  return JSON.parse(cleanJsonResponse(response)) as LyricsAnalysis;
}

export async function generateModuleFromQA(
  question: string,
  answer: string,
  parentModuleTitle: string
): Promise<GeneratedOutline> {
  const model = getModel();

  const prompt = `Based on this Q&A from a learning session about "${parentModuleTitle}", create a focused micro-learning module outline.

Question: ${question}
Answer: ${answer}

Create a module that dives deeper into this topic. Return JSON:
{
  "title": "short title (3-5 words)",
  "description": "one sentence description",
  "lessons": [
    { "title": "lesson title", "focus": "specific focus of this lesson" }
  ],
  "tags": ["tag1", "tag2"],
  "difficulty": "beginner" | "intermediate" | "advanced",
  "estimatedMinutes": number (total for all lessons, usually 5-15)
}

Create 3-5 focused lessons that explore this topic in depth.`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  return JSON.parse(cleanJsonResponse(response)) as GeneratedOutline;
}
