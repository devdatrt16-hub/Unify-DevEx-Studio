'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useDevExStore } from '@/store/useDevExStore';
import {
  BookOpen,
  CheckCircle2,
  Cpu,
  Database,
  Layers,
  Terminal,
  ArrowRight,
  ShieldCheck,
  Code2,
  FileCode2,
  Sparkles,
} from 'lucide-react';

export default function OverviewTab() {
  const { setActiveMacroTab, currentOverview } = useDevExStore();

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'cpu':
        return <Cpu className="w-4 h-4 text-zinc-200" />;
      case 'database':
        return <Database className="w-4 h-4 text-zinc-200" />;
      default:
        return <Layers className="w-4 h-4 text-zinc-200" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
      className="w-full h-full p-6 md:p-8 overflow-y-auto bg-[#050507] text-zinc-100 font-sans space-y-6 select-none"
    >
      {/* Overview Hero Header */}
      <div className="p-6 rounded-2xl bg-[#0e0e12] border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium font-mono text-zinc-300 uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5 text-zinc-300" />
            <span>Codebase Architecture Overview</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
            {currentOverview?.repoUrl || 'GitHub Repository'}
          </span>
        </div>

        <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-white">
          {currentOverview?.title || 'Repository Overview'}
        </h2>
        <p className="text-xs md:text-sm text-zinc-400 leading-relaxed max-w-3xl">
          {currentOverview?.description ||
            'An educational onboarding workspace designed for computer science students and developers.'}
        </p>

        <div className="pt-1 flex items-center gap-3">
          <button
            onClick={() => setActiveMacroTab('graph')}
            className="px-3.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-zinc-950" />
            <span>Interactive Graph View</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          <button
            onClick={() => setActiveMacroTab('walkthrough')}
            className="px-3.5 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition-colors border border-zinc-700/80 cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5 text-zinc-300" />
            <span>Code Walkthrough</span>
          </button>
        </div>
      </div>

      {/* 3-Column Core System Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {currentOverview?.modules?.map((mod, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-[#0e0e12] border border-zinc-800 space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700/60">
                {getModuleIcon(mod.iconType)}
              </div>
              <div>
                <h3 className="text-xs font-semibold text-zinc-100">{mod.title}</h3>
                <p className="text-[10px] font-mono text-zinc-400">{mod.subtitle}</p>
              </div>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">{mod.description}</p>
          </div>
        ))}
      </div>

      {/* Environment Prerequisites (Horizontal Metric Row) */}
      <div className="p-5 rounded-xl bg-[#0e0e12] border border-zinc-800 space-y-3">
        <h3 className="text-xs font-semibold text-zinc-200 flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-zinc-300" />
          Environment Prerequisites
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
          {currentOverview?.prerequisites?.map((prereq, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-[#050507] border border-zinc-800 space-y-1 flex flex-col justify-between">
              <span className="text-[10px] text-zinc-500 font-mono uppercase">{prereq.label}</span>
              <span className="text-xs text-zinc-100 font-semibold truncate">{prereq.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Repository README.md Viewer from Git Link */}
      <ReadmeMarkdownViewer />

      {/* Recommended Learning & Developer Onboarding Steps (Brief & Stacked Horizontally) */}
      <div className="space-y-5 flex flex-col">
        {/* Recommended Learning Prerequisites (Brief Format) */}
        <PrerequisiteStackCard />

        {/* Developer Onboarding Steps */}
        <div className="p-5 rounded-xl bg-[#0e0e12] border border-zinc-800 space-y-3">
          <h3 className="text-xs font-semibold text-zinc-200 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-300" />
            Developer Onboarding Steps
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-zinc-300 font-mono">
            {currentOverview?.onboardingSteps?.map((stepText, idx) => (
              <li key={idx} className="p-3 rounded-lg bg-[#050507] border border-zinc-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{stepText}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

function PrerequisiteStackCard() {
  const briefPrereqs = [
    { title: 'React Flow Canvas & ELK Layout', detail: 'Interactive diagramming, parent folder grouping & 60fps graph layouting.' },
    { title: 'FastAPI & Tree-sitter AST Parser', detail: 'High-performance Python backend for multi-language AST code parsing.' },
    { title: 'Docker Compose & Microservices', detail: 'Containerized orchestration for Postgres database & Redis caching.' },
    { title: 'Zustand Store & Dual-Pane Sync', detail: 'Centralized state management connecting walkthrough steps to canvas nodes.' },
  ];

  return (
    <div className="p-5 rounded-xl bg-[#0e0e12] border border-zinc-800 space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-zinc-100 flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-zinc-300" />
          Recommended Learning Prerequisites (Brief)
        </h3>
        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 font-semibold">
          Qwen 2.5
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
        {briefPrereqs.map((item, idx) => (
          <div key={idx} className="p-3 rounded-lg bg-[#050507] border border-zinc-800 space-y-1.5 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-zinc-100 font-semibold text-[11px]">
              <Sparkles className="w-3 h-3 text-zinc-400 shrink-0" />
              <span className="truncate">{item.title}</span>
            </div>
            <p className="text-[10px] text-zinc-400 leading-relaxed font-sans">
              {item.detail}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReadmeMarkdownViewer() {
  const { currentOverview, customRepoFiles, repoUrl } = useDevExStore();

  const projectName = useMemo(() => {
    if (!repoUrl) return 'EpicGames/raddebugger';
    const clean = repoUrl.replace(/\/$/, '').replace('https://github.com/', '');
    return clean || 'EpicGames/raddebugger';
  }, [repoUrl]);

  const readmeLines = useMemo(() => {
    if (customRepoFiles && (customRepoFiles['README.md'] || customRepoFiles['readme.md'])) {
      const file = customRepoFiles['README.md'] || customRepoFiles['readme.md'];
      return file.lines;
    }
    return [
      `# ${projectName}`,
      '',
      `> ${currentOverview?.description || 'A fast lightweight native debugger for C/C++ applications with Tree-sitter AST parsing and GraphRAG visualization.'}`,
      '',
      '## 📖 1. Project Overview & System Philosophy',
      'Traditional developer onboarding relies on static markdown guides and manual code tracing.',
      'Unify DevEx Studio solves this onboarding bottleneck by introducing an interactive, synchronized dual-pane educational workspace connecting AST declarations directly to graph visualizations.',
      '',
      '## 🛠️ 2. Core Modules & System Architecture',
      '- `dwarf_parse`: Parses DWARF debugging information from ELF and PE/COFF binaries.',
      '- `dwarf_dump`: Dumps DWARF sections into structured inspectable text output.',
      '- `dwarf_unwind`: Handles stack frame unwinding for crash tracebacks.',
      '- `GraphRAG Engine`: Tiktoken chunker, NetworkX DAG indexer, and local Ollama (qwen2.5-coder:7b).',
      '',
      '## 🚀 3. Quickstart Installation & Execution',
      '```bash',
      `git clone ${repoUrl || 'https://github.com/EpicGames/raddebugger.git'}`,
      'cd raddebugger',
      'npm install',
      'npm run dev',
      '```',
      '',
      '## 🔒 4. Zero-Hallucination AST Engine',
      'Operates on a 100% deterministic Tree-sitter parser, ensuring zero LLM hallucination when mapping repository architecture.',
    ];
  }, [customRepoFiles, repoUrl, currentOverview, projectName]);

  return (
    <div className="p-6 rounded-2xl bg-[#0e0e12] border border-zinc-800 space-y-4 font-sans shadow-lg">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-zinc-300" />
          <h3 className="text-xs font-semibold text-zinc-100 font-mono uppercase tracking-wider">
            README.md — {projectName}
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
          Git Master Branch
        </span>
      </div>

      <div className="bg-[#050507] rounded-xl p-5 border border-zinc-800/80 space-y-2 text-xs font-sans text-zinc-300 leading-relaxed max-h-[500px] overflow-y-auto">
        <div className="flex items-center gap-2 text-zinc-300 font-mono text-[11px] font-semibold border-b border-zinc-800 pb-2 mb-3">
          <FileCode2 className="w-4 h-4 text-zinc-400" />
          <span>{projectName} / README.md</span>
        </div>

        {readmeLines.map((line, idx) => {
          if (line.startsWith('# ')) {
            return (
              <h1 key={idx} className="text-lg font-bold text-white pt-2 pb-1 border-b border-zinc-800">
                {line.slice(2)}
              </h1>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h2 key={idx} className="text-xs font-semibold text-zinc-200 font-mono uppercase tracking-wide pt-3 pb-1">
                {line.slice(3)}
              </h2>
            );
          }
          if (line.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-xs font-semibold text-zinc-200 pt-2 pb-1">
                {line.slice(4)}
              </h3>
            );
          }
          if (line.startsWith('```')) {
            return (
              <div key={idx} className="text-[10px] font-mono text-zinc-500 py-0.5">
                {line}
              </div>
            );
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2 text-zinc-300 font-mono text-[11px]">
                <span className="text-zinc-400">•</span>
                <span>{line.slice(2)}</span>
              </div>
            );
          }
          if (!line.trim()) {
            return <div key={idx} className="h-2" />;
          }
          return (
            <p key={idx} className="text-zinc-300 text-xs leading-relaxed font-sans">
              {line}
            </p>
          );
        })}
      </div>
    </div>
  );
}
