'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { validateApiKey, saveApiKey, clearApiKey, isGeminiConfigured } from '@/lib/ai/gemini';
import { exportAllData, importData, downloadJson } from '@/lib/export';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsConfigured(isGeminiConfigured());
    // Load theme preference
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('light', savedTheme === 'light');
    }
  }, []);

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    setStatus('saving');

    const valid = await validateApiKey(apiKey);
    if (valid) {
      saveApiKey(apiKey);
      setIsConfigured(true);
      setApiKey('');
      setStatus('saved');
    } else {
      setStatus('error');
    }
  };

  const handleClear = () => {
    clearApiKey();
    setIsConfigured(false);
    setStatus('idle');
  };

  const handleExport = async () => {
    setExportStatus('exporting...');
    const data = await exportAllData();
    const filename = `microx-backup-${new Date().toISOString().split('T')[0]}.json`;
    downloadJson(data, filename);
    setExportStatus('exported');
    setTimeout(() => setExportStatus(null), 2000);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExportStatus('importing...');
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const result = await importData(data);
      setExportStatus(`imported ${result.modules} modules`);
      setTimeout(() => setExportStatus(null), 3000);
    } catch (err) {
      setExportStatus('import failed');
      setTimeout(() => setExportStatus(null), 3000);
    }
    e.target.value = '';
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('light', newTheme === 'light');
  };

  return (
    <div className="space-y-12">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <p className="text-xs mono text-dim mb-4">settings</p>
      </motion.div>

      {/* API Key */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <p className="text-medium text-sm">gemini api key</p>

        {isConfigured ? (
          <div className="space-y-4">
            <p className="text-dim mono text-sm">configured ✓</p>
            <button
              onClick={handleClear}
              className="text-dim text-sm hover:text-medium transition-colors"
            >
              clear
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setStatus('idle');
              }}
              placeholder="AIza..."
              className="w-full bg-transparent border-b border-current/20 pb-2 text-medium mono text-sm focus:outline-none focus:border-current/40 placeholder:text-dim"
            />

            <div className="flex items-center gap-4">
              <button
                onClick={handleSave}
                disabled={!apiKey.trim() || status === 'saving'}
                className="text-medium text-sm hover:text-bright transition-colors disabled:text-dim"
              >
                {status === 'saving' ? 'saving...' : 'save'}
              </button>

              {status === 'error' && (
                <span className="text-red-400 text-sm">invalid key</span>
              )}
              {status === 'saved' && (
                <span className="text-green-400 text-sm">saved</span>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Theme */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="space-y-4"
      >
        <p className="text-medium text-sm">theme</p>
        <button
          onClick={toggleTheme}
          className="text-dim text-sm hover:text-medium transition-colors"
        >
          {theme === 'dark' ? 'switch to light →' : 'switch to dark →'}
        </button>
      </motion.div>

      {/* Export/Import */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <p className="text-medium text-sm">data</p>

        <div className="flex gap-6 text-sm">
          <button
            onClick={handleExport}
            className="text-dim hover:text-medium transition-colors"
          >
            export
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-dim hover:text-medium transition-colors"
          >
            import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>

        {exportStatus && (
          <p className="text-dim text-xs mono">{exportStatus}</p>
        )}
      </motion.div>

      {/* Links */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        <a
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="text-dim text-xs hover:text-medium transition-colors"
        >
          get api key from google ai studio →
        </a>
      </motion.div>
    </div>
  );
}
