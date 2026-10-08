'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDevExStore } from '@/store/useDevExStore';
import {
  Sparkles,
  Send,
  Github,
  Code2,
  Terminal,
  Zap,
  Bot,
  User,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  RotateCcw,
} from 'lucide-react';

const SAMPLE_PROMPTS = [
  {
    icon: Github,
    label: 'Analyze React Core Repo',
    text: 'https://github.com/facebook/react',
    type: 'repo',
    badge: 'GitHub AST',
  },
  {
    icon: Github,
    label: 'Analyze Next.js App Repo',
    text: 'https://github.com/vercel/next.js',
    type: 'repo',
    badge: 'GitHub AST',
  },
  {
    icon: Code2,
    label: 'Paste Setup Snippet',
    text: `git clone https://github.com/mphasis/devex-platform-core.git\ncd devex-platform-core\nnpm install\ndocker-compose up -d --build\nnpm run dev`,
    type: 'code',
    badge: 'Multi-line Code',
  },
  {
    icon: Cpu,
    label: 'GraphRAG Macro Map Query',
    text: 'Generate visual architecture map and zero-hallucination setup guide for microservice dependencies.',
    type: 'query',
    badge: 'Natural Language',
  },
];

export default function GeminiLandingChat() {
  const {
    isChatDocked,
    isChatExpanded,
    toggleChatExpanded,
    chatMessages,
    submitLandingChat,
    addChatMessage,
    isAnalyzing,
    analysisProgress,
    setIsChatDocked,
  } = useDevExStore();

  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat in docked mode
  useEffect(() => {
    if (isChatDocked) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatDocked]);

  // Handle submit action
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    submitLandingChat(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSampleClick = (text: string) => {
    setInput(text);
    submitLandingChat(text);
    setInput('');
  };

  // Check if input contains a GitHub URL
  const isGithubUrlDetected = /https:\/\/github\.com\/[\w-]+\/[\w.-]+/i.test(input);

  return (
    <AnimatePresence>
      {!isChatDocked ? (
        /* ========================================================================= */
        /* PHASE 1: CENTERED GEMINI LANDING CHAT VIEW                               */
        /* ========================================================================= */
        <motion.div
          key="centered-landing-chat"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{
            opacity: 0.9,
            scale: 0.35,
            x: '38vw',
            y: '38vh',
            transition: { type: 'spring', stiffness: 220, damping: 24 },
          }}
          className="fixed inset-0 z-40 flex flex-col items-center justify-center p-4 md:p-8 bg-slate-950/20 text-slate-100 overflow-y-auto"
        >
          {/* Subtle Ambient Background Glowing Blobs */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative w-full max-w-3xl flex flex-col items-center space-y-8 z-10">
            {/* Logo Badge Header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide uppercase shadow-[0_0_20px_rgba(59,130,246,0.2)]"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Unify DevEx AI • AST & GraphRAG Engine</span>
            </motion.div>

            {/* Main Gemini Title */}
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center space-y-3"
            >
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-blue-300 bg-clip-text text-transparent">
                Hello, Engineer
              </h1>
              <p className="text-base md:text-lg text-slate-400 max-w-xl mx-auto font-normal">
                Map complex repository architecture in seconds. Paste a GitHub repository link, code snippet, or natural language query to begin.
              </p>
            </motion.div>

            {/* Prominent Gemini Chat Input Box */}
            <motion.form
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              onSubmit={handleSubmit}
              className="w-full relative group"
            >
              <div className="relative rounded-3xl bg-slate-900/90 border border-slate-700/80 shadow-[0_10px_40px_rgba(0,0,0,0.5)] focus-within:border-blue-500/80 focus-within:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all duration-300 overflow-hidden backdrop-blur-xl">
                {/* Detected URL Indicator Bar */}
                {isGithubUrlDetected && (
                  <div className="px-4 py-1.5 bg-blue-600/20 border-b border-blue-500/30 flex items-center justify-between text-xs text-blue-300 font-mono">
                    <span className="flex items-center gap-1.5">
                      <Github className="w-3.5 h-3.5" />
                      Detected GitHub Repository URL — JGit & Tree-sitter Ready
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-500/30 text-[10px] uppercase font-bold tracking-wider">
                      AST Ready
                    </span>
                  </div>
                )}

                {/* Input Textarea */}
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Paste GitHub URL (e.g. https://github.com/user/repo), paste multi-line setup commands, or ask a question..."
                  rows={input.includes('\n') ? 5 : 3}
                  className="w-full px-5 py-4 bg-transparent text-slate-100 placeholder:text-slate-500 focus:outline-none resize-none text-sm md:text-base leading-relaxed font-mono"
                />

                {/* Input Bottom Action Toolbar */}
                <div className="px-4 py-3 bg-slate-950/60 border-t border-slate-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800/60 text-slate-300 font-mono text-[11px]">
                      <Terminal className="w-3 h-3" />
                      Multi-line Code
                    </span>
                    <span className="hidden sm:inline-block text-slate-500 text-[11px]">
                      Press <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 font-sans text-[10px]">Enter</kbd> to launch
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 disabled:hover:from-blue-600 disabled:hover:to-indigo-600 text-white font-medium text-sm transition-all duration-200 shadow-md shadow-blue-900/30"
                  >
                    <span>Generate Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.form>

            {/* Quick Prompt Chips */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              {SAMPLE_PROMPTS.map((sample, idx) => {
                const Icon = sample.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSampleClick(sample.text)}
                    className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-left transition-all duration-200 group shadow-sm"
                  >
                    <div className="p-2 rounded-xl bg-slate-800/80 group-hover:bg-blue-600/20 group-hover:text-blue-400 text-slate-400 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                          {sample.label}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50 shrink-0">
                          {sample.badge}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 truncate mt-1">
                        {sample.text.split('\n')[0]}
                      </p>
                    </div>
                  </button>
                );
              })}
            </motion.div>

            {/* Trust Footer Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-6 text-xs text-slate-500 pt-2"
            >
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Zero Hallucinations (GraphRAG)
              </span>
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                60fps Dual-Pane View
              </span>
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                Tree-sitter AST Parser
              </span>
            </motion.div>
          </div>
        </motion.div>
      ) : (
        /* ========================================================================= */
        /* PHASE 2: DOCKED FLOATING CHAT WIDGET (PERSISTENT ASSISTANT)               */
        /* ========================================================================= */
        <motion.div
          key="docked-floating-chat"
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className={`fixed bottom-5 right-5 z-40 flex flex-col bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl overflow-hidden transition-all duration-300 ${
            isChatExpanded ? 'w-[380px] md:w-[420px] h-[520px]' : 'w-[320px] h-[52px]'
          }`}
        >
          {/* Header Bar */}
          <div
            onClick={toggleChatExpanded}
            className="px-4 py-3 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between cursor-pointer hover:bg-slate-900 transition-colors select-none"
          >
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-900/40">
                  <Bot className="w-4 h-4" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  DevEx Assistant
                  <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 text-[10px] font-mono">
                    GraphRAG
                  </span>
                </h3>
                {isAnalyzing && (
                  <p className="text-[10px] text-blue-400 font-mono animate-pulse truncate max-w-[180px]">
                    {analysisProgress}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsChatDocked(false);
                }}
                title="Expand to Fullscreen Chat"
                className="p-1 hover:text-white rounded hover:bg-slate-800 transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleChatExpanded();
                }}
                className="p-1 hover:text-white rounded hover:bg-slate-800 transition-colors"
              >
                {isChatExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Messages Scrollable Container */}
          {isChatExpanded && (
            <>
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs font-sans">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${
                      msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                        msg.sender === 'user'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-blue-600/30 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>

                    <div
                      className={`max-w-[82%] p-3 rounded-2xl ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-slate-800/80 text-slate-200 border border-slate-700/60 rounded-tl-none'
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      {msg.codeSnippet && (
                        <div className="mt-2 p-2 rounded bg-slate-950 font-mono text-[11px] text-emerald-400 border border-slate-800 overflow-x-auto">
                          <pre>{msg.codeSnippet}</pre>
                        </div>
                      )}
                      <span className="block mt-1 text-[9px] text-slate-400 text-right opacity-75">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))}

                {isAnalyzing && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-900/20 border border-blue-500/30 text-blue-300 text-xs">
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing repository graph & updating canvas nodes...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Field in Docked Mode */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!input.trim()) return;
                  addChatMessage({ sender: 'user', text: input });
                  const currentInput = input;
                  setInput('');

                  // Respond with AI feedback
                  setTimeout(() => {
                    addChatMessage({
                      sender: 'assistant',
                      text: `Query received: "${currentInput}". Filtered AST nodes & GraphRAG index synchronized with canvas.`,
                    });
                  }, 800);
                }}
                className="p-2.5 bg-slate-950/90 border-t border-slate-800 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask DevEx Assistant..."
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
