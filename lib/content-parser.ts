// Parser for language tags in text content
// Format: [[lang:term:pronunciation:translation]]
// Example: [[th:เผ็ด:phèt:spicy]]

export interface ParsedSegment {
  type: 'text' | 'lang';
  content?: string;
  lang?: string;
  text?: string;
  pronunciation?: string;
  translation?: string;
}

const LANG_TAG_REGEX = /\[\[(\w{2,3}):([^:\]]+)(?::([^:\]]+))?(?::([^\]]+))?\]\]/g;

export function parseTextContent(raw: string): ParsedSegment[] {
  const segments: ParsedSegment[] = [];
  let lastIndex = 0;
  let match;

  // Reset regex state
  LANG_TAG_REGEX.lastIndex = 0;

  while ((match = LANG_TAG_REGEX.exec(raw)) !== null) {
    // Add text before this match
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: raw.slice(lastIndex, match.index),
      });
    }

    // Add language span
    segments.push({
      type: 'lang',
      lang: match[1],
      text: match[2],
      pronunciation: match[3] || undefined,
      translation: match[4] || undefined,
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < raw.length) {
    segments.push({
      type: 'text',
      content: raw.slice(lastIndex),
    });
  }

  return segments;
}

// Language display names
export const LANG_NAMES: Record<string, string> = {
  th: 'Thai',
  el: 'Greek',
  ja: 'Japanese',
  zh: 'Chinese',
  ko: 'Korean',
  vi: 'Vietnamese',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ru: 'Russian',
  ar: 'Arabic',
  hi: 'Hindi',
  en: 'English',
};

// Language-specific styling
export const LANG_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  th: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-600 dark:text-amber-400' },
  el: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-600 dark:text-blue-400' },
  ja: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-600 dark:text-red-400' },
  zh: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-600 dark:text-rose-400' },
  ko: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-600 dark:text-purple-400' },
  vi: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-600 dark:text-green-400' },
  es: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-600 dark:text-orange-400' },
  fr: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-600 dark:text-indigo-400' },
  de: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-600 dark:text-yellow-400' },
};

export function getLangStyle(lang: string) {
  return LANG_STYLES[lang] || { bg: 'bg-gray-500/10', border: 'border-gray-500/30', text: 'text-gray-600 dark:text-gray-400' };
}
