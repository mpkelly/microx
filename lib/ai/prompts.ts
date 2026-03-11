import type { ModuleOutline, GenerationContext, ContentBlock } from '@/types';

const LESSON_SYSTEM_PROMPT = `You are a micro-learning content generator. Output valid JSON only.

Response format:
{
  "title": "Lesson title",
  "summary": "2-3 sentence summary for review later",
  "blocks": [ContentBlock array]
}

Content block types available:

1. text: { "type": "text", "content": "markdown text with [[lang:term:pronunciation:translation]] for foreign words" }
   Example: "The word [[th:เผ็ด:phèt:spicy]] means spicy in Thai."

2. timeline: { "type": "timeline", "title": "optional", "events": [{ "date": "399 BCE", "label": "Event name", "description": "optional details", "importance": "high|medium|low" }] }

3. bar-chart: { "type": "bar-chart", "title": "optional", "data": [{ "label": "Category", "value": 75 }], "unit": "%" }

4. comparison: { "type": "comparison", "title": "optional", "columns": ["A", "B"], "rows": [{ "attribute": "Feature", "values": ["Value A", "Value B"] }] }

5. vocab-card: { "type": "vocab-card", "term": "foreign word", "lang": "ISO code (th/el/ja/zh/ko/etc)", "pronunciation": "phonetic", "romanization": "optional", "translation": "English meaning", "partOfSpeech": "noun|verb|adj|adv|phrase", "example": { "text": "example sentence", "lang": "th", "translation": "English translation" } }

6. callout: { "type": "callout", "style": "tip|definition|key-point|warning|quote", "content": "important information", "attribution": "for quotes only" }

7. scale: { "type": "scale", "title": "optional", "leftLabel": "Low", "rightLabel": "High", "markers": [{ "position": 25, "label": "Item" }] }
   Position is 0-100 along the scale.

8. pie-chart: { "type": "pie-chart", "title": "optional", "data": [{ "label": "Segment", "value": 30 }], "showPercentages": true }

9. quiz: { "type": "quiz", "question": "Question text?", "options": ["A", "B", "C", "D"], "correctIndex": 0, "explanation": "Why this is correct" }

10. flashcard: { "type": "flashcard", "cards": [{ "front": "Question/Term", "back": "Answer/Definition", "hint": "optional" }] }

CRITICAL RULES:
1. Output ONLY valid JSON - no markdown, no explanation, no code fences
2. Maximum 5-6 blocks per micro-lesson (keep it SHORT)
3. Never more than 2 consecutive text blocks - break up with visuals
4. Include at least 1 visual/interactive block (chart, comparison, scale, vocab-card)
5. End with a quiz or flashcard block for retention
6. For language learning, ALWAYS use [[lang:term:pronunciation:translation]] format in text blocks
7. For vocab-cards, include the "lang" field with ISO 639-1 code
8. Keep individual text blocks concise - under 80 words each
9. STAY FOCUSED: Cover ONLY the specific topic given. Do NOT introduce related topics or "bonus" content. One concept per lesson.
10. If the lesson is about "salty", do not mention "spicy". If it's about "verbs", do not cover "nouns". Stay strictly on topic.`;

export function buildLessonPrompt(outline: ModuleOutline, context: GenerationContext): string {
  const previousContext = context.previousLessons.length
    ? `\nPrevious lessons already covered: ${context.previousLessons.join(', ')}\nDo NOT repeat this content.`
    : '';

  // Special handling for lyrics vocabulary modules
  if (outline.framework === 'lyrics-vocab') {
    const params = outline.parameters as {
      sourceLanguage: string;
      originalLyrics: string;
      lessons: { title: string; focus: string; words: string[] }[];
    };
    const currentLesson = params.lessons.find(l => context.lessonTopic.includes(l.title));
    const words = currentLesson?.words || [];

    return `${LESSON_SYSTEM_PROMPT}

LYRICS VOCABULARY LESSON

Source language: ${params.sourceLanguage}
Words to teach: ${words.join(', ')}
Theme: ${context.lessonTopic}

Original lyrics (for context and examples):
${params.originalLyrics.slice(0, 1500)}

Create a vocabulary lesson with these requirements:
1. Start with a brief text block introducing the theme (1-2 sentences)
2. Create a vocab-card for EACH word (${words.length} cards total)
   - Include pronunciation and romanization
   - Use lines from the lyrics as example sentences
   - Add the English translation of the example
3. Add a callout with a cultural note or usage tip
4. End with a quiz testing 2-3 of the words

Make each vocab-card thorough - these are the main content. Include part of speech and good examples from the actual lyrics.

Generate as JSON.`;
  }

  return `${LESSON_SYSTEM_PROMPT}

MODULE CONTEXT:
- Topic: ${outline.context}
- Framework: ${outline.framework}
- Current lesson focus: ${context.lessonTopic}
- Target duration: ${context.targetMinutes} minutes (micro-lesson)
- Difficulty: ${context.difficulty}
${previousContext}

Generate a focused micro-lesson on "${context.lessonTopic}" as JSON.`;
}

const OUTLINE_SYSTEM_PROMPT = `You are a learning curriculum designer. Create a module outline from the user's request.

Output valid JSON only in this format:
{
  "title": "Module title",
  "description": "2-3 sentence module description",
  "lessons": [
    { "title": "Lesson 1 title", "focus": "specific focus area" },
    { "title": "Lesson 2 title", "focus": "specific focus area" }
  ],
  "tags": ["tag1", "tag2", "tag3"],
  "difficulty": "beginner|intermediate|advanced",
  "estimatedMinutes": 15
}

RULES:
1. Create 5-8 micro-lessons per module
2. Each lesson should be completable in 2-3 minutes
3. Order lessons from foundational to advanced
4. Tags should include: topic category, language (if applicable), specific themes
5. Make lesson titles specific and SINGLE-TOPIC - never combine concepts like "X & Y"
6. Each lesson covers ONE concept only. "Salty words" and "Spicy words" should be separate lessons, not combined.
7. The focus field should describe exactly ONE thing to learn
8. Break broad topics into small, focused pieces`;

export function buildOutlinePrompt(userPrompt: string): string {
  return `${OUTLINE_SYSTEM_PROMPT}

USER REQUEST: "${userPrompt}"

Generate the module outline as JSON.`;
}

export function buildSummaryPrompt(blocks: ContentBlock[]): string {
  const contentSummary = blocks
    .map((block) => {
      if (block.type === 'text') return block.content;
      if (block.type === 'vocab-card') return `Vocabulary: ${block.term} (${block.translation})`;
      if (block.type === 'callout') return block.content;
      return '';
    })
    .filter(Boolean)
    .join('\n');

  return `Summarize this lesson content in 2-3 sentences for later review. Focus on the key takeaways.

Content:
${contentSummary}

Summary:`;
}
