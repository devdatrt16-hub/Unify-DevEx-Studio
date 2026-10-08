'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useDevExStore, MacroTab } from '@/store/useDevExStore';
import {
  BookOpen,
  Network,
  TableProperties,
  Code2,
  GitBranch,
  ArrowLeft,
} from 'lucide-react';

interface TabItem {
  id: MacroTab;
  label: string;
  icon: React.ElementType;
}

const TABS: TabItem[] = [
  { id: 'overview', label: 'Overview', icon: BookOpen },
  { id: 'graph', label: 'Graph View', icon: Network },
  { id: 'business_rules', label: 'Business Rules', icon: TableProperties },
  { id: 'walkthrough', label: 'Code Walkthrough', icon: Code2 },
];

export default function SegmentedNav() {
  const {
    activeMacroTab,
    setActiveMacroTab,
    repoUrl,
    selectedBranch,
    setSelectedBranch,
    setIsChatDocked,
  } = useDevExStore();

  const repoName = repoUrl.replace('https://github.com/', '').split('#')[0] || 'mphasis/devex-platform-core';

  return (
    <header className="w-full bg-[#09090b] border-b border-zinc-800/80 px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 z-30 font-sans select-none">
      {/* Brand & Repository Identifier */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsChatDocked(false)}
          className="p-1 rounded-md bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          title="Return to Entry Prompt"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-2">
          <h1 className="text-xs font-medium text-zinc-200 font-mono tracking-tight">
            {repoName}
          </h1>
          <div className="h-3 w-px bg-zinc-800 mx-0.5" />
          <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-400">
            <GitBranch className="w-3 h-3 text-zinc-400" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-transparent text-[11px] font-normal text-zinc-300 focus:outline-none cursor-pointer"
            >
              <option value="main" className="bg-zinc-900 text-zinc-200">main</option>
              <option value="develop" className="bg-zinc-900 text-zinc-200">develop</option>
            </select>
          </div>
        </div>
      </div>

      {/* Monochromatic Segmented Control with Framer Motion Sliding Pill */}
      <div className="relative p-0.5 rounded-lg bg-zinc-900/90 border border-zinc-800/80 flex items-center gap-0.5">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeMacroTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveMacroTab(tab.id)}
              className={`relative px-3 py-1.2 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors duration-150 z-10 ${
                isActive ? 'text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeSegmentPill"
                  className="absolute inset-0 bg-zinc-800/90 rounded-md -z-10 border border-zinc-700/50"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-zinc-100' : 'text-zinc-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
