'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useDevExStore } from '@/store/useDevExStore';
import { GitHubRepoCollector } from '@/services/repoCollector';
import {
  FileCode2,
  Folder,
  Copy,
  Check,
  Code2,
  FolderTree,
  Sliders,
  Layers,
  Cpu,
  Database,
  FileText,
  Sparkles,
  Bot,
  GitPullRequest,
  History,
  Search,
} from 'lucide-react';

interface FileData {
  language: string;
  lines: string[];
}

interface GitRowItem {
  id: string;
  file: string;
  label: string;
  category: string;
  isFolder: boolean;
  commitMsg: string;
  timeAgo: string;
}

export default function CodeWalkthroughTab() {
  const {
    nodes,
    highlightedLineRange,
    activeWalkthroughStep,
    pastedCodeSnippet,
    repoUrl,
    customInputMode,
    customRepoFiles,
    setSelectedNodeId,
    setHighlightedLineRange,
  } = useDevExStore();

  const [selectedFile, setSelectedFile] = useState<string>('package.json');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const activeLineRef = useRef<HTMLDivElement>(null);

  // Enhanced dynamic file store with structured nested paths
  const dynamicFiles = useMemo<Record<string, FileData>>(() => {
    if (customRepoFiles && Object.keys(customRepoFiles).length > 0) {
      return customRepoFiles;
    }
    const files: Record<string, FileData> = {};

    if (pastedCodeSnippet && pastedCodeSnippet.trim()) {
      let filename = 'pasted_snippet.tsx';
      let lang = 'typescript';

      if (/\bdef\b|\bimport\s+math|\bprint\(/i.test(pastedCodeSnippet)) {
        filename = 'pasted_script.py';
        lang = 'python';
      } else if (/\bpublic\s+class\b|\bSystem\.out\.println\b/i.test(pastedCodeSnippet)) {
        filename = 'PastedMain.java';
        lang = 'java';
      } else if (/\bversion:\s*['"]?\d/i.test(pastedCodeSnippet)) {
        filename = 'pasted_config.yml';
        lang = 'yaml';
      }

      files[filename] = {
        language: lang,
        lines: pastedCodeSnippet.split('\n'),
      };
      return files;
    }

    files['README.md'] = {
      language: 'markdown',
      lines: [
        '# EpicGames/raddebugger',
        '',
        'A fast lightweight native debugger for C/C++ applications.',
        '',
        '## Architecture Overview',
        '- `dwarf_parse`: Parses DWARF debugging info from ELF executables.',
        '- `dwarf_dump`: Dumps DWARF sections into inspectable text output.',
        '- `dwarf_unwind`: Handles stack frame unwinding for crash tracebacks.',
        '',
        '## Build Instructions',
        '```bash',
        './build.sh',
        '```',
      ],
    };

    files['package.json'] = {
      language: 'json',
      lines: [
        '{',
        '  "name": "epicgames-raddebugger",',
        '  "version": "1.0.0",',
        '  "private": true,',
        '  "scripts": {',
        '    "dev": "next dev",',
        '    "build": "next build"',
        '  },',
        '  "dependencies": {',
        '    "@xyflow/react": "^12.3.2",',
        '    "framer-motion": "^11.11.9",',
        '    "lucide-react": "^0.453.0",',
        '    "zustand": "^4.5.5"',
        '  }',
        '}',
      ],
    };

    files['docker-compose.yml'] = {
      language: 'yaml',
      lines: [
        'version: "3.8"',
        'services:',
        '  postgres:',
        '    image: postgres:15-alpine',
        '    container_name: devex_postgres',
        '    ports:',
        '      - "5432:5432"',
        '  redis:',
        '    image: redis:7-alpine',
        '    container_name: devex_redis',
        '    ports:',
        '      - "6379:6379"',
        '  ollama:',
        '    image: ollama/ollama:latest',
        '    container_name: devex_ollama',
        '    ports:',
        '      - "11434:11434"',
      ],
    };

    files['src/app/api/analyze/route.ts'] = {
      language: 'typescript',
      lines: [
        "import { NextResponse } from 'next/server';",
        "",
        "export async function POST(req: Request) {",
        "  const body = await req.json();",
        "  const { repoUrl } = body;",
        "",
        "  // Trigger Tree-sitter AST & GraphRAG pipeline",
        "  return NextResponse.json({ success: true, repoUrl });",
        "}",
      ],
    };

    files['src/components/macro/MacroViewCanvas.tsx'] = {
      language: 'typescript',
      lines: [
        "'use client';",
        "import React from 'react';",
        "import { ReactFlow } from '@xyflow/react';",
        "",
        "export default function MacroViewCanvas() {",
        "  return <ReactFlow nodes={[]} edges={[]} />;",
        "}",
      ],
    };

    files['src/components/micro/MicroViewGuide.tsx'] = {
      language: 'typescript',
      lines: [
        "'use client';",
        "import React from 'react';",
        "import { useDevExStore } from '@/store/useDevExStore';",
        "",
        "export default function MicroViewGuide() {",
        "  return <div className=\"p-4\">Code Walkthrough Reader</div>;",
        "}",
      ],
    };

    files['backend-python/main.py'] = {
      language: 'python',
      lines: [
        "from fastapi import FastAPI, HTTPException",
        "from pydantic import BaseModel",
        "",
        "app = FastAPI(title='DevEx AST GraphRAG Backend')",
        "",
        "@app.get('/api/health')",
        "def health_check():",
        "    return {'status': 'healthy', 'engine': 'Tree-sitter NetworkX'}",
      ],
    };

    files['.github/workflows/ci.yml'] = {
      language: 'yaml',
      lines: [
        "name: CI Pipeline",
        "on: [push, pull_request]",
        "jobs:",
        "  build:",
        "    runs-on: ubuntu-latest",
        "    steps:",
        "      - uses: actions/checkout@v3",
        "      - name: Run Tests",
        "        run: npm test",
      ],
    };

    return files;
  }, [pastedCodeSnippet, repoUrl, customRepoFiles]);

  // Current active folder path state for Git directory drill-down
  const [currentFolderPath, setCurrentFolderPath] = useState<string>('');

  // Commit messages mapping for Git Explorer
  const commitMessages: Record<string, string> = {
    '.github': 'ci: update github workflows',
    'backend-python': 'ast: initialize FastAPI Tree-sitter endpoint',
    'src': 'dwarf_parse: fix incorrect expectation of max_ops_per_inst',
    'src/app': 'app: add next.js api routing',
    'src/components': 'ui: modular macro and micro view components',
    'README.md': 'docs: repository architecture overview',
    'package.json': 'build: update dependencies',
    'docker-compose.yml': 'docker: configure postgres and redis services',
  };

  const commitTimes: Record<string, string> = {
    '.github': 'last week',
    'backend-python': '2 days ago',
    'src': '18 hours ago',
    'src/app': '18 hours ago',
    'src/components': '18 hours ago',
    'README.md': 'last week',
    'package.json': '18 hours ago',
    'docker-compose.yml': '5 months ago',
  };

  // Resolve folders and files inside currentFolderPath
  const { currentFolders, currentFiles } = useMemo(() => {
    const foldersSet = new Set<string>();
    const filesList: { path: string; name: string }[] = [];
    const prefix = currentFolderPath ? `${currentFolderPath}/` : '';

    Object.keys(dynamicFiles).forEach((filePath) => {
      if (currentFolderPath === '') {
        if (filePath.includes('/')) {
          const topFolder = filePath.split('/')[0];
          foldersSet.add(topFolder);
        } else {
          filesList.push({ path: filePath, name: filePath });
        }
      } else if (filePath.startsWith(prefix)) {
        const relative = filePath.slice(prefix.length);
        if (relative.includes('/')) {
          const nextFolder = relative.split('/')[0];
          foldersSet.add(nextFolder);
        } else {
          filesList.push({ path: filePath, name: relative });
        }
      }
    });

    return {
      currentFolders: Array.from(foldersSet).sort(),
      currentFiles: filesList.sort((a, b) => a.name.localeCompare(b.name)),
    };
  }, [currentFolderPath, dynamicFiles]);

  const filteredFolders = useMemo(() => {
    if (!searchQuery.trim()) return currentFolders;
    const q = searchQuery.toLowerCase();
    return currentFolders.filter((f) => f.toLowerCase().includes(q));
  }, [currentFolders, searchQuery]);

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return currentFiles;
    const q = searchQuery.toLowerCase();
    return currentFiles.filter((f) => f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q));
  }, [currentFiles, searchQuery]);

  useEffect(() => {
    const fileKeys = Object.keys(dynamicFiles);
    if (pastedCodeSnippet && dynamicFiles['pasted_snippet.tsx']) {
      setSelectedFile('pasted_snippet.tsx');
    } else if (fileKeys.length > 0 && !fileKeys.includes(selectedFile)) {
      setSelectedFile(fileKeys[0]);
    }
  }, [dynamicFiles, pastedCodeSnippet]);

  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedFile, highlightedLineRange]);

  const fallbackFileKey = Object.keys(dynamicFiles)[0] || 'package.json';
  const currentFileData = dynamicFiles[selectedFile] || dynamicFiles[fallbackFileKey];

  const handleCopy = () => {
    if (!currentFileData) return;
    navigator.clipboard.writeText(currentFileData.lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [selectedLineNumber, setSelectedLineNumber] = useState<number | null>(null);

  const getLineExplanation = (lineText: string, lineNum: number) => {
    const trimmed = lineText.trim();
    if (!trimmed) return 'Blank formatting line; separates logical code blocks for readability.';
    if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*')) {
      return 'Inline developer documentation describing architectural intent.';
    }
    if (trimmed.startsWith('import ') || trimmed.startsWith('from ')) {
      return 'Module import declaration; connects component dependencies.';
    }
    if (trimmed.startsWith('export ') || trimmed.startsWith('function ')) {
      return 'Public API function signature declaration.';
    }
    return `Executes line ${lineNum} execution step within component scope.`;
  };

  // Navigation handlers
  const handleNavigateFolder = (folderName: string) => {
    const newPath = currentFolderPath ? `${currentFolderPath}/${folderName}` : folderName;
    setCurrentFolderPath(newPath);
  };

  const handleNavigateUp = () => {
    if (!currentFolderPath) return;
    const parts = currentFolderPath.split('/');
    parts.pop();
    setCurrentFolderPath(parts.join('/'));
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      setCurrentFolderPath('');
      return;
    }
    const parts = currentFolderPath.split('/');
    setCurrentFolderPath(parts.slice(0, index + 1).join('/'));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
      className="w-full h-full flex bg-[#050507] text-zinc-100 font-mono text-xs overflow-hidden relative select-none"
    >
      {/* Left Sidebar: Exact Git Folder Explorer View Mode */}
      <div className="w-80 md:w-96 bg-[#08080b] border-r border-zinc-800/80 flex flex-col shrink-0 overflow-hidden font-sans p-3 space-y-2">
        {/* Git Author & Commit Summary Header Bar */}
        <div className="p-2.5 rounded-lg bg-[#0e0e12] border border-zinc-800/90 flex items-center justify-between text-xs font-mono shrink-0 shadow-md">
          <div className="flex items-center gap-2 truncate mr-2">
            <div className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-200 font-bold flex items-center justify-center text-[10px] shrink-0 border border-zinc-700">
              RF
            </div>
            <span className="text-zinc-100 font-semibold shrink-0">ryanfleury</span>
            <span className="text-zinc-400 truncate text-[11px]">
              dwarf_parse: fix incorrect expectation of max_ops_per_inst in p...
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0 text-[10px] text-zinc-400">
            <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
              b6d8c33f
            </span>
            <span>18 hours ago</span>
            <span className="flex items-center gap-1 text-zinc-300 font-semibold">
              <History className="w-3 h-3 text-zinc-400" />
              <span>4,686 Commits</span>
            </span>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="relative flex items-center bg-[#121216] rounded-lg px-2.5 py-1 border border-zinc-800">
          <Search className="w-3.5 h-3.5 text-zinc-500 mr-2" />
          <input
            type="text"
            placeholder="Search repository files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-zinc-200 focus:outline-none w-full placeholder-zinc-600 font-mono"
          />
        </div>

        {/* Git Path Breadcrumbs Navigation */}
        <div className="px-2 py-1.5 rounded-md bg-[#0e0e12] border border-zinc-800/80 text-[11px] font-mono text-zinc-400 flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => handleBreadcrumbClick(-1)}
            className={`hover:text-zinc-200 transition cursor-pointer ${currentFolderPath === '' ? 'text-zinc-100 font-semibold' : ''}`}
          >
            root
          </button>
          {currentFolderPath &&
            currentFolderPath.split('/').map((part, idx) => (
              <React.Fragment key={idx}>
                <span className="text-zinc-600">/</span>
                <button
                  onClick={() => handleBreadcrumbClick(idx)}
                  className={`hover:text-zinc-200 transition cursor-pointer ${
                    idx === currentFolderPath.split('/').length - 1 ? 'text-zinc-100 font-semibold' : ''
                  }`}
                >
                  {part}
                </button>
              </React.Fragment>
            ))}
        </div>

        {/* Git-Style File & Folder Tree Table */}
        <div className="flex-1 overflow-y-auto rounded-lg border border-zinc-800/80 divide-y divide-zinc-800/60 font-mono text-xs bg-[#050507]">
          {/* Parent Directory Drill-Up Row */}
          {currentFolderPath !== '' && (
            <div
              onClick={handleNavigateUp}
              className="p-2.5 flex items-center gap-2 text-zinc-400 hover:bg-zinc-900/80 transition-colors cursor-pointer text-[11px]"
            >
              <Folder className="w-4 h-4 text-amber-400/80 shrink-0 fill-amber-950" />
              <span className="font-semibold text-zinc-300">..</span>
              <span className="text-[10px] text-zinc-500 ml-auto">Parent directory</span>
            </div>
          )}

          {/* Subfolders in Current Directory */}
          {filteredFolders.map((folderName) => {
            const folderFullPath = currentFolderPath ? `${currentFolderPath}/${folderName}` : folderName;
            return (
              <div
                key={`folder-${folderName}`}
                onClick={() => handleNavigateFolder(folderName)}
                className="p-2.5 flex items-center justify-between transition-colors cursor-pointer text-zinc-300 hover:bg-zinc-900/80"
              >
                <div className="flex items-center gap-2 min-w-[130px] max-w-[170px] truncate">
                  <Folder className="w-4 h-4 text-zinc-400 shrink-0 fill-zinc-800" />
                  <span className="truncate text-[11px] font-semibold text-zinc-200">{folderName}</span>
                </div>
                <div className="flex-1 px-2 text-[10px] text-zinc-400 truncate hidden sm:block">
                  {commitMessages[folderFullPath] || 'update folder dependencies'}
                </div>
                <div className="text-[10px] text-zinc-500 shrink-0 font-mono">
                  {commitTimes[folderFullPath] || 'last week'}
                </div>
              </div>
            );
          })}

          {/* Files in Current Directory */}
          {filteredFiles.map((fileObj) => {
            const isSelected = selectedFile === fileObj.path;
            return (
              <div
                key={`file-${fileObj.path}`}
                onClick={() => {
                  setSelectedFile(fileObj.path);
                  setSelectedLineNumber(null);
                  setHighlightedLineRange({
                    file: fileObj.path,
                    startLine: 1,
                    endLine: Math.min(25, dynamicFiles[fileObj.path]?.lines.length || 25),
                  });
                  const matchingNode = nodes.find((n) => n.data?.file === fileObj.path || n.id === fileObj.path);
                  if (matchingNode) {
                    setSelectedNodeId(matchingNode.id);
                  } else {
                    setSelectedNodeId(fileObj.path);
                  }
                }}
                className={`p-2.5 flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-800/80 text-zinc-100 font-semibold border-l-2 border-zinc-300'
                    : 'text-zinc-300 hover:bg-zinc-900/80'
                }`}
              >
                <div className="flex items-center gap-2 min-w-[130px] max-w-[170px] truncate">
                  <FileCode2 className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span className="truncate text-[11px]">{fileObj.name}</span>
                </div>
                <div className="flex-1 px-2 text-[10px] text-zinc-400 truncate hidden sm:block">
                  {commitMessages[fileObj.path] || `dwarf_parse: update declarations for ${fileObj.name}`}
                </div>
                <div className="text-[10px] text-zinc-500 shrink-0 font-mono">
                  {commitTimes[fileObj.path] || '18 hours ago'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Content Area: Code Viewer Viewport */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#050507]">
        {/* Top File Bar & Copy Button */}
        <div className="px-4 py-2.5 bg-[#0e0e12] border-b border-zinc-800 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-zinc-300" />
            <span className="text-xs font-semibold text-zinc-100 font-mono">{selectedFile}</span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
              {currentFileData?.language || 'code'}
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono">
            {/* Live Sync Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Synced (Step {activeWalkthroughStep + 1})</span>
            </div>

            <button
              onClick={handleCopy}
              className="p-1.5 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition text-xs flex items-center gap-1 cursor-pointer"
              title="Copy Code"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Code Viewer Viewport with Line Numbers */}
        <div className="flex-1 overflow-y-auto p-4 space-y-0.5 bg-[#050507] font-mono leading-relaxed text-zinc-300">
          {currentFileData?.lines.map((lineText, idx) => {
            const lineNumber = idx + 1;
            const isSelectedLine = selectedLineNumber === lineNumber;
            const isHighlighted =
              highlightedLineRange?.file === selectedFile &&
              lineNumber >= (highlightedLineRange.startLine || 1) &&
              lineNumber <= (highlightedLineRange.endLine || 100);

            const isFirstHighlightedLine =
              isHighlighted && lineNumber === (highlightedLineRange?.startLine || 1);

            return (
              <div
                key={lineNumber}
                ref={isFirstHighlightedLine ? activeLineRef : null}
                onClick={() => setSelectedLineNumber(lineNumber)}
                className={`flex items-start px-2 py-0.5 rounded cursor-pointer transition-colors duration-150 ${
                  isSelectedLine
                    ? 'bg-blue-950/60 border border-blue-600/60 text-blue-100 font-medium'
                    : isHighlighted
                    ? 'bg-cyan-950/40 border border-cyan-800/50 text-cyan-100'
                    : 'hover:bg-zinc-900/60 text-zinc-300'
                }`}
              >
                <span className="w-10 text-right pr-4 text-zinc-600 select-none font-mono text-[11px] shrink-0">
                  {lineNumber}
                </span>
                <pre className="flex-1 whitespace-pre-wrap break-all font-mono text-xs">
                  {lineText}
                </pre>
              </div>
            );
          })}
        </div>

        {/* Line-by-Line Inspection Drawer */}
        {selectedLineNumber !== null && (
          <div className="p-3 bg-[#0e0e12] border-t border-zinc-800 flex items-center justify-between font-mono text-xs shrink-0">
            <div className="flex items-center gap-2 truncate">
              <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold text-[11px]">
                L{selectedLineNumber}
              </span>
              <span className="text-zinc-300 truncate">
                {getLineExplanation(currentFileData?.lines[selectedLineNumber - 1] || '', selectedLineNumber)}
              </span>
            </div>
            <button
              onClick={() => setSelectedLineNumber(null)}
              className="text-zinc-500 hover:text-zinc-300 text-xs ml-2 cursor-pointer"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
