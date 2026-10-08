'use client';

import React from 'react';
import {
  GitBranch,
  Layers,
  BookOpen,
  Split,
  Bot,
  Zap,
  Play,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
  Download,
  Share2,
  Code2
} from 'lucide-react';
import { useDevExStore, ViewMode } from '@/store/useDevExStore';

export default function HeaderNav() {
  const {
    repoUrl,
    setRepoUrl,
    selectedBranch,
    setSelectedBranch,
    viewMode,
    setViewMode,
    isAnalyzing,
    analysisProgress,
    analysisTimeSeconds,
    tokensProcessed,
    redisCacheHit,
    redisLatencyMs,
    runAnalysis,
    setIsChatDocked,
  } = useDevExStore();

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ repoUrl, branch: selectedBranch, exportDate: new Date().toISOString() }));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `unify_devex_${selectedBranch}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <header className="w-full bg-[#08080b] border-b border-zinc-800 px-4 py-2.5 flex items-center justify-between gap-4 z-30 shadow-xl font-sans">
      {/* Brand & Logo (Unify schematic) */}
      <button
        type="button"
        onClick={() => setIsChatDocked(false)}
        title="Open Gemini Landing Chat"
        className="flex items-center gap-3 hover:opacity-90 transition-opacity text-left cursor-pointer"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-zinc-700 via-zinc-800 to-zinc-500 flex items-center justify-center text-white shadow-md border border-zinc-600">
          <Code2 className="w-4 h-4 font-bold text-zinc-100" />
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-bold text-white tracking-wider uppercase font-mono">
            Unify
          </h1>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-200 border border-zinc-700">
            DevEx Studio
          </span>
        </div>
      </button>

      {/* GitHub Repository URL & Branch Schematic Bar */}
      <div className="flex-1 max-w-2xl flex items-center gap-2">
        {/* Repo URL Pill */}
        <div className="relative flex-1 bg-[#121216] rounded-xl px-3 py-1.5 flex items-center gap-2 border border-zinc-800 focus-within:border-zinc-600 shadow-inner">
          <Share2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="github.com/org/repo-name"
            className="bg-transparent text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none w-full font-mono"
          />
        </div>

        {/* Branch Selector Dropdown */}
        <div className="relative bg-[#121216] rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 border border-zinc-800 text-xs font-mono text-zinc-300">
          <GitBranch className="w-3.5 h-3.5 text-zinc-400" />
          <span>Branch:</span>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer pr-1"
          >
            <option value="main" className="bg-zinc-900 text-white">main ⌄</option>
            <option value="develop" className="bg-zinc-900 text-white">develop ⌄</option>
            <option value="feature/ast-graph" className="bg-zinc-900 text-white">feature/ast-graph ⌄</option>
          </select>
        </div>

        {/* Generate Dashboard Button */}
        <button
          onClick={() => runAnalysis()}
          disabled={isAnalyzing}
          className="px-3.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs flex items-center gap-1.5 shadow-md transition disabled:opacity-50 cursor-pointer"
        >
          {isAnalyzing ? (
            <RotateCcw className="w-3.5 h-3.5 animate-spin text-zinc-950" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
          <span>{isAnalyzing ? 'Analyzing...' : 'Generate Map'}</span>
        </button>
      </div>

      {/* Performance & Metrics Badge */}
      <div className="hidden xl:flex items-center gap-2 font-mono text-[11px] bg-[#121216] px-3 py-1.5 rounded-xl border border-zinc-800">
        {redisCacheHit ? (
          <div className="flex items-center gap-1.5 text-zinc-300 font-bold">
            <Zap className="w-3.5 h-3.5 fill-zinc-300" />
            <span>Redis Cache: {redisLatencyMs}ms (&lt;200ms)</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{analysisTimeSeconds}s (&lt;45s)</span>
          </div>
        )}
      </div>

      {/* Export Button & View Mode Toggles */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleExport}
          className="px-3 py-1.5 rounded-xl bg-[#121216] hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-mono flex items-center gap-1.5 border border-zinc-800 transition cursor-pointer"
          title="Export Architecture JSON"
        >
          <Download className="w-3.5 h-3.5 text-zinc-400" />
          <span>Export</span>
        </button>

        {/* View Mode Toggle Buttons */}
        <div className="bg-[#121216] rounded-xl p-1 flex items-center gap-1 border border-zinc-800">
          {[
            { id: 'split', label: 'Split', icon: Split },
            { id: 'macro', label: 'Macro', icon: Layers },
            { id: 'micro', label: 'Micro', icon: BookOpen },
            { id: 'mission_control', label: 'Agents', icon: Bot },
          ].map((mode) => {
            const Icon = mode.icon;
            const isActive = viewMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id as ViewMode)}
                className={`px-2.5 py-1.2 rounded-lg text-xs font-medium flex items-center gap-1 transition cursor-pointer ${
                  isActive
                    ? 'bg-zinc-800 text-zinc-100 font-semibold border border-zinc-700 shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
