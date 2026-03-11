'use client';

import { useCallback, useEffect, useState } from 'react';

interface TTSOptions {
  lang: string;
  rate?: number;
  pitch?: number;
}

// ISO 639-1 to BCP 47 mapping for TTS
const TTS_LANG_MAP: Record<string, string> = {
  th: 'th-TH',
  el: 'el-GR',
  ja: 'ja-JP',
  zh: 'zh-CN',
  ko: 'ko-KR',
  vi: 'vi-VN',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  it: 'it-IT',
  pt: 'pt-BR',
  ru: 'ru-RU',
  ar: 'ar-SA',
  hi: 'hi-IN',
  en: 'en-US',
};

export function useTTS() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    setSupported(true);

    const loadVoices = () => {
      const available = speechSynthesis.getVoices();
      setVoices(available);
    };

    loadVoices();

    // Chrome loads voices asynchronously
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      speechSynthesis.cancel();
    };
  }, []);

  const findVoice = useCallback(
    (lang: string): SpeechSynthesisVoice | null => {
      const ttsLang = TTS_LANG_MAP[lang] || lang;

      // Try exact match first
      let voice = voices.find((v) => v.lang === ttsLang);
      if (voice) return voice;

      // Try language prefix match
      voice = voices.find((v) => v.lang.startsWith(lang));
      if (voice) return voice;

      // Fallback to any voice containing the language code
      voice = voices.find((v) => v.lang.toLowerCase().includes(lang.toLowerCase()));
      return voice || null;
    },
    [voices]
  );

  const speak = useCallback(
    (text: string, options: TTSOptions) => {
      if (!supported || typeof window === 'undefined') return;

      // Cancel any ongoing speech
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const voice = findVoice(options.lang);

      if (voice) {
        utterance.voice = voice;
      }

      utterance.lang = TTS_LANG_MAP[options.lang] || options.lang;
      utterance.rate = options.rate ?? 0.85; // Slightly slower for learning
      utterance.pitch = options.pitch ?? 1;

      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      speechSynthesis.speak(utterance);
    },
    [supported, findVoice]
  );

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesis.cancel();
      setSpeaking(false);
    }
  }, []);

  return { speak, stop, speaking, supported, voices };
}
