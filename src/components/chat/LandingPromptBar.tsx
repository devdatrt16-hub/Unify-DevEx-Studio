'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDevExStore } from '@/store/useDevExStore';
import {
  Sparkles,
  ArrowRight,
  Github,
  Code2,
  FileText,
  Terminal,
  ShieldCheck,
  Layers,
  Cpu,
  GitPullRequest,
} from 'lucide-react';

export default function LandingPromptBar() {
  const {
    isChatDocked,
    submitLandingChat,
    setPastedCodeSnippet,
    setCustomInputMode,
    setRepoUrl,
  } = useDevExStore();

  const [inputMode, setInputMode] = useState<'git' | 'code' | 'doc' | 'pr'>('git');
  const [input, setInput] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (isChatDocked) return null;

  const validateInput = (text: string, mode: 'git' | 'code' | 'doc' | 'pr'): { isValid: boolean; error?: string } => {
    const trimmed = text.trim();
    if (!trimmed) {
      return { isValid: false, error: 'Input is false: Content cannot be empty. Please enter your input.' };
    }

    const isGithubUrl = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+/i.test(trimmed) || /^github\.com\/[\w-]+\/[\w.-]+/i.test(trimmed);
    const isPrUrl = /\/pull\/\d+/i.test(trimmed);

    if (mode === 'pr') {
      if (!isPrUrl) {
        return {
          isValid: false,
          error: 'Input is false: Invalid GitHub Pull Request URL. Expected format: https://github.com/owner/repo/pull/123',
        };
      }
    } else if (mode === 'git') {
      if (!isGithubUrl) {
        // Check if user accidentally pasted code snippet
        const containsCodeConstructs = /\b(function|const|let|var|class|import|export|def|return|public|private|static|void|interface|type|struct|package|fn)\b|[{}[\]();=]/i.test(trimmed);
        if (containsCodeConstructs) {
          return {
            isValid: false,
            error: 'Input is false: You pasted source code instead of a GitHub repository link. Please select "Paste Code Snippet" mode.',
          };
        }
        return {
          isValid: false,
          error: 'Input is false: Invalid GitHub repository URL. Expected format: https://github.com/org/repo',
        };
      }
    } else if (mode === 'code') {
      if (isGithubUrl) {
        return {
          isValid: false,
          error: 'Input is false: You entered a GitHub URL in Code Snippet mode. Please select "GitHub Repo URL" mode.',
        };
      }
      const codeKeywords = /\b(function|const|let|var|class|import|export|from|def|return|public|private|static|void|interface|type|async|await|val|if|for|while|struct|package|use|fn|console|print|println|System|module|require|include|using|namespace)\b/;
      const codeSymbols = /[{}()[\];=<>&|!+*\/]/;
      const isMultiLineCode = trimmed.includes('\n') && (codeKeywords.test(trimmed) || codeSymbols.test(trimmed));
      const hasCodeConstructs = codeKeywords.test(trimmed) || (codeSymbols.test(trimmed) && trimmed.length > 8);

      if (!hasCodeConstructs && !isMultiLineCode) {
        return {
          isValid: false,
          error: 'Input is false: The pasted text is not valid source code. Please enter valid code (TSX, Python, Java, C++, etc.).',
        };
      }
    } else if (mode === 'doc') {
      if (isGithubUrl) {
        return {
          isValid: false,
          error: 'Input is false: You entered a GitHub URL in Code Doc mode. Please select "GitHub Repo URL" mode.',
        };
      }
      const words = trimmed.split(/\s+/).filter(Boolean);
      if (words.length < 2 && trimmed.length < 8) {
        return {
          isValid: false,
          error: 'Input is false: Please enter a valid code doc or architecture query (at least 2-3 words).',
        };
      }
    }

    return { isValid: true };
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const check = validateInput(input, inputMode);
    if (!check.isValid) {
      setValidationError(check.error || 'Input is false');
      return;
    }

    setValidationError(null);
    setCustomInputMode(inputMode);

    if (inputMode === 'code') {
      setPastedCodeSnippet(input);
    } else if (inputMode === 'git' || inputMode === 'pr') {
      const cleanUrl = input.trim().startsWith('http') ? input.trim() : `https://${input.trim()}`;
      setRepoUrl(cleanUrl);
      setPastedCodeSnippet(null);
    } else {
      setPastedCodeSnippet(null);
    }

    submitLandingChat(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isGithubUrlDetected = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+/i.test(input.trim());

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.3 } }}
      className="fixed inset-0 z-40 flex flex-col items-center justify-center p-4 md:p-8 bg-[#050507]/40 text-zinc-100 overflow-y-auto backdrop-blur-[2px] font-sans"
    >
      <div className="relative w-full max-w-3xl flex flex-col items-center space-y-7 z-10">
        {/* Main Title */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-2.5"
        >
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Understand Any Codebase in Seconds
          </h1>
          <p className="text-sm md:text-base text-zinc-400 max-w-xl mx-auto font-normal leading-relaxed">
            Enter a GitHub repository URL, paste a raw source code snippet, or ask a code doc question to inspect interactive architecture maps and student breakdowns.
          </p>
        </motion.div>

        {/* Input Mode Selector Bar */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#0e0e12]/90 border border-zinc-800 backdrop-blur-xl shadow-lg flex-wrap justify-center"
        >
          <button
            type="button"
            onClick={() => {
              setInputMode('git');
              setValidationError(null);
            }}
            className={`px-4 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all ${
              inputMode === 'git'
                ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub Repo URL</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setInputMode('code');
              setValidationError(null);
            }}
            className={`px-4 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all ${
              inputMode === 'code'
                ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Paste Code Snippet</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setInputMode('pr');
              setValidationError(null);
            }}
            className={`px-4 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all ${
              inputMode === 'pr'
                ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            <GitPullRequest className="w-3.5 h-3.5 text-indigo-400" />
            <span>🔄 Pull Request Walkthrough</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setInputMode('doc');
              setValidationError(null);
            }}
            className={`px-4 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all ${
              inputMode === 'doc'
                ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Code Doc Query</span>
          </button>
        </motion.div>

        {/* Validation Error Alert Box */}
        <AnimatePresence>
          {validationError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="w-full px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/40 text-red-300 text-xs font-mono flex items-center justify-between shadow-lg"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>{validationError}</span>
              </div>
              <button
                type="button"
                onClick={() => setValidationError(null)}
                className="text-red-400 hover:text-red-200 font-bold px-1"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Prompt Bar Container */}
        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSubmit}
          className="w-full relative group"
        >
          <div className="relative rounded-3xl bg-[#0e0e12]/95 border border-zinc-800 shadow-[0_10px_40px_rgba(0,0,0,0.8)] focus-within:border-zinc-500/80 focus-within:shadow-[0_0_30px_rgba(255,255,255,0.08)] transition-all duration-300 overflow-hidden backdrop-blur-xl">
            {/* Detected URL Indicator Bar */}
            {isGithubUrlDetected && (
              <div className="px-4 py-1.5 bg-zinc-800/40 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-300 font-mono">
                <span className="flex items-center gap-1.5">
                  <Github className="w-3.5 h-3.5 text-zinc-200" />
                  Detected GitHub Repository URL — Ready for AST Parsing
                </span>
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 text-[10px] uppercase font-bold tracking-wider border border-zinc-700/60">
                  Git Link
                </span>
              </div>
            )}

            {/* Input Textarea */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (validationError) setValidationError(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder={
                inputMode === 'git'
                  ? 'Paste GitHub repository URL...'
                  : inputMode === 'code'
                  ? 'Paste raw source code snippet (TSX, Python, Java, C++)...'
                  : inputMode === 'pr'
                  ? 'Paste GitHub Pull Request URL (e.g. https://github.com/mphasis/devex-platform-core/pull/42)...'
                  : 'Ask a code doc or architecture explanation question...'
              }
              rows={inputMode === 'code' || input.includes('\n') ? 5 : 3}
              className="w-full px-5 py-4 bg-transparent text-zinc-100 placeholder:text-zinc-500 focus:outline-none resize-none text-sm md:text-base leading-relaxed font-mono"
            />

            {/* Bottom Action Toolbar */}
            <div className="px-4 py-3 bg-[#08080b]/90 border-t border-zinc-800/80 flex items-center justify-between">
              <div className="text-xs text-zinc-500 font-mono">
                Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-sans text-[10px]">Enter</kbd> to analyze
              </div>

              <button
                type="submit"
                disabled={!input.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-300 hover:from-white hover:to-zinc-100 disabled:opacity-30 text-zinc-950 font-semibold text-sm transition-all duration-200 shadow-[0_0_20px_rgba(255,255,255,0.12)] cursor-pointer"
              >
                <span>Analyze & Explain Code</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.form>
      </div>
    </motion.div>
  );
}
