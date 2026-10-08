import { create } from 'zustand';
import { Node, Edge } from '@xyflow/react';
import {
  analyzeRepository,
  analyzeRepositoryAsync,
  OverviewData,
  BusinessRule,
} from '@/services/repoAnalysisEngine';

export type ViewMode = 'split' | 'macro' | 'micro' | 'mission_control';

export interface EnvVariable {
  name: string;
  required: boolean;
  default?: string;
  configured?: boolean;
}

export interface GuideStep {
  step: number;
  title: string;
  description: string;
  targetNodeId: string;
  commands: string[];
  envRequirements: EnvVariable[];
  verifiedAgainst: string;
}

export interface AgentTask {
  id: string;
  name: string;
  workspace: string;
  role: string;
  status: 'idle' | 'running' | 'completed' | 'waiting_approval';
  progress: number;
  logs: string[];
  artifacts: {
    name: string;
    type: string;
    path: string;
    content: string;
    approved?: boolean;
  }[];
}

export type LifecyclePhase =
  | 'idle'
  | 'phase1_request'
  | 'phase2_ingestion'
  | 'phase3_ast_parsing'
  | 'phase4_graph_loading'
  | 'phase5_vectorization'
  | 'phase6_generation'
  | 'phase7_synchronization';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  codeSnippet?: string;
  githubUrl?: string;
}

export type MacroTab = 'overview' | 'graph' | 'business_rules' | 'walkthrough';

interface DevExState {
  // Navigation & Repositories
  repoUrl: string;
  repoId: string;
  selectedBranch: string;
  selectedSample: string;
  isAnalyzing: boolean;
  analysisProgress: string;
  analysisTimeSeconds: number;
  tokensProcessed: number;
  redisCacheHit: boolean;
  redisLatencyMs: number;
  lifecyclePhase: LifecyclePhase;
  sseStreamingActive: boolean;
  viewMode: ViewMode;

  // Swimm Educational Navigation & Synchronized Walkthrough State
  activeMacroTab: MacroTab;
  activeWalkthroughStep: number;
  highlightedLineRange: { file: string; startLine: number; endLine: number; snippet?: string } | null;
  currentOverview: OverviewData;
  businessRules: BusinessRule[];
  customRepoFiles: Record<string, { language: string; lines: string[] }>;

  // Landing Chat & Docking Transition State
  isChatDocked: boolean;
  isChatExpanded: boolean;
  chatMessages: ChatMessage[];
  pastedCodeSnippet: string | null;
  customInputMode: 'git' | 'code' | 'doc' | 'pr';

  // Feature 1: Risk Overlay
  riskOverlayActive: boolean;
  blameData: Record<string, { lastEditDate: string; author: string; isAbandoned: boolean }>;
  toggleRiskOverlay: () => void;

  // Feature 2: Time Travel Timeline
  commitHistory: Array<{ index: number; hash: string; message: string; date: string; author: string; nodes: Node[]; edges: Edge[] }>;
  selectedCommitIndex: number;
  setCommitIndex: (index: number) => void;

  // Feature 3: Executable Sandbox Modal
  sandboxModalCommand: string | null;
  setSandboxModalCommand: (cmd: string | null) => void;

  // Feature 5: VS Code Integration
  autoFocusFile: (filePath: string) => void;

  // Local Ollama Semantic Translation Layer In-Memory Cache (hash: task + ":" + symbolId)
  llmCache: Record<string, string>;
  fetchLLMCompletion: (payload: {
    task: 'policy' | 'failure_mode' | 'prerequisites' | 'node_inspector' | 'pr_storyteller';
    symbolId: string;
    input: any;
  }) => Promise<string>;

  setIsChatDocked: (docked: boolean) => void;
  setIsChatExpanded: (expanded: boolean) => void;
  toggleChatExpanded: () => void;
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setPastedCodeSnippet: (code: string | null) => void;
  setCustomInputMode: (mode: 'git' | 'code' | 'doc' | 'pr') => void;
  submitLandingChat: (input: string) => Promise<void>;

  // Resizable Split-Pane (Default 35% Micro / 65% Macro)
  splitWidthPercent: number;

  // Macro Graph State
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  highlightedNodeId: string | null;
  hoveredNodeId: string | null;
  activeSection: string | null;
  searchQuery: string;
  filterCategory: string;
  depthLimit: number;
  focusRequestTime: number;
  focusTargetNodeId: string | null;

  // Micro View State
  guideSteps: GuideStep[];
  activeStepIndex: number;
  terminalOutput: { command: string; stdout: string[] } | null;
  fileExplanations: Record<string, any>;
  setFileExplanation: (fileId: string, data: any) => void;

  // Mission Control & Subagents
  agents: AgentTask[];

  // Actions
  setActiveMacroTab: (tab: MacroTab) => void;
  setActiveWalkthroughStep: (step: number) => void;
  setHighlightedLineRange: (range: { file: string; startLine: number; endLine: number; snippet?: string } | null) => void;
  setRepoUrl: (url: string) => void;
  setSelectedBranch: (branch: string) => void;
  setViewMode: (mode: ViewMode) => void;
  setSplitWidthPercent: (width: number) => void;
  setSearchQuery: (query: string) => void;
  setFilterCategory: (cat: string) => void;
  setDepthLimit: (depth: number) => void;
  setSelectedNodeId: (id: string | null) => void;
  setHoveredNodeId: (id: string | null) => void;
  setActiveSection: (section: string | null) => void;
  focusNodeFromGuideStep: (nodeId: string, stepIndex: number) => void;
  setTerminalOutput: (output: { command: string; stdout: string[] } | null) => void;
  runAnalysis: (targetUrl?: string) => Promise<void>;
  approveArtifact: (agentId: string, artifactName: string) => void;
}

const DEFAULT_NODES: Node[] = [
  {
    id: 'node-root-pkg',
    type: 'configNode',
    data: {
      label: 'package.json',
      category: 'config',
      file: 'package.json',
      language: 'JSON',
      details: 'Root build manifest & npm dependency declarations.',
      envVars: ['NEXT_PUBLIC_API_URL', 'DATABASE_URL', 'GRAPH_RAG_KEY'],
      setupCommand: 'npm install',
      lineCount: 48,
    },
    position: { x: 80, y: 120 },
  },
  {
    id: 'node-docker-compose',
    type: 'configNode',
    data: {
      label: 'docker-compose.yml',
      category: 'config',
      file: 'docker-compose.yml',
      language: 'YAML',
      details: 'Microservices orchestrator for Postgres DB & Redis Cache.',
      envVars: ['POSTGRES_USER', 'POSTGRES_PASSWORD', 'REDIS_PORT'],
      setupCommand: 'docker-compose up -d',
      lineCount: 35,
    },
    position: { x: 80, y: 320 },
  },
  {
    id: 'node-api-analyze',
    type: 'apiRouteNode',
    data: {
      label: 'POST /api/analyze',
      category: 'api',
      file: 'src/app/api/analyze/route.ts',
      method: 'POST',
      language: 'TypeScript',
      details: 'Handles repository cloning, AST parsing trigger & GraphRAG extraction.',
      lineCount: 112,
    },
    position: { x: 420, y: 100 },
  },
  {
    id: 'node-api-graph',
    type: 'apiRouteNode',
    data: {
      label: 'GET /api/graph/subgraph',
      category: 'api',
      file: 'src/app/api/graph/route.ts',
      method: 'GET',
      language: 'TypeScript',
      details: 'Retrieves localized GraphRAG sub-graph data for zoomed focus.',
      lineCount: 78,
    },
    position: { x: 420, y: 280 },
  },
  {
    id: 'node-store-devex',
    type: 'stateStoreNode',
    data: {
      label: 'useDevExStore (Zustand)',
      category: 'state',
      file: 'src/store/useDevExStore.ts',
      language: 'TypeScript',
      details: 'Centralized 60fps canvas state, selected graph nodes, and micro guide sync.',
      lineCount: 165,
    },
    position: { x: 780, y: 190 },
  },
  {
    id: 'node-comp-canvas',
    type: 'componentNode',
    data: {
      label: '<MacroViewCanvas />',
      category: 'component',
      file: 'src/components/macro/MacroViewCanvas.tsx',
      language: 'TSX',
      details: 'High-performance React Flow viewport rendering AST nodes, edges & pan/zoom.',
      lineCount: 240,
    },
    position: { x: 1120, y: 100 },
  },
  {
    id: 'node-comp-micro',
    type: 'componentNode',
    data: {
      label: '<MicroViewGuide />',
      category: 'component',
      file: 'src/components/micro/MicroViewGuide.tsx',
      language: 'TSX',
      details: 'Markdown setup step guide with bidirectional contextual graph node focus.',
      lineCount: 195,
    },
    position: { x: 1120, y: 320 },
  },
  {
    id: 'node-python-graphrag',
    type: 'componentNode',
    data: {
      label: 'GraphRAG Engine (Python)',
      category: 'microservice',
      file: 'backend-python/graphrag/engine.py',
      language: 'Python',
      details: 'Tiktoken chunker, NetworkX dependency tree, and zero-hallucination command parser.',
      lineCount: 310,
    },
    position: { x: 420, y: 460 },
  },
  {
    id: 'node-java-ast',
    type: 'javaClassNode',
    data: {
      label: 'TreeSitterASTParser.java',
      category: 'java',
      file: 'backend-java/TreeSitterASTParser.java',
      language: 'Java',
      details: 'Native Tree-sitter AST binding parser for enterprise macro architecture.',
      lineCount: 210,
    },
    position: { x: 780, y: 460 },
  },
];

const DEFAULT_EDGES: Edge[] = [
  { id: 'e-pkg-api', source: 'node-root-pkg', target: 'node-api-analyze', animated: true, label: 'imports config' },
  { id: 'e-docker-py', source: 'node-docker-compose', target: 'node-python-graphrag', animated: true, label: 'orchestrates' },
  { id: 'e-api-store', source: 'node-api-analyze', target: 'node-store-devex', animated: false, label: 'populates' },
  { id: 'e-py-store', source: 'node-python-graphrag', target: 'node-store-devex', animated: true, label: 'sub-graph stream' },
  { id: 'e-java-py', source: 'node-java-ast', target: 'node-python-graphrag', animated: false, label: 'AST schema' },
  { id: 'e-store-canvas', source: 'node-store-devex', target: 'node-comp-canvas', animated: true, label: '60fps canvas sync' },
  { id: 'e-store-micro', source: 'node-store-devex', target: 'node-comp-micro', animated: false, label: 'guide step sync' },
  { id: 'e-api-graph', source: 'node-api-graph', target: 'node-comp-canvas', animated: false, label: 'query route' },
];

const DEFAULT_GUIDE_STEPS: GuideStep[] = [
  {
    step: 1,
    title: "Clone Repository & Setup Environment Variables",
    description: "Initialize local environment credentials and verify essential database & LLM service connections.",
    targetNodeId: "node-root-pkg",
    commands: [
      "cp .env.example .env.local",
      "cat .env.example"
    ],
    envRequirements: [
      { name: "NEXT_PUBLIC_API_URL", required: true, default: "http://localhost:3000", configured: true },
      { name: "DATABASE_URL", required: true, default: "postgresql://postgres:pass@localhost:5432/devex", configured: true },
      { name: "GRAPH_RAG_KEY", required: false, default: "sk-devex-graph-key-9912", configured: true }
    ],
    verifiedAgainst: "package.json & .env.example"
  },
  {
    step: 2,
    title: "Spin Up Infrastructure Dependencies (Postgres & Redis)",
    description: "Launch containerized PostgreSQL database and Redis memory store via Docker Compose.",
    targetNodeId: "node-docker-compose",
    commands: [
      "docker-compose up -d postgres redis",
      "docker-compose ps"
    ],
    envRequirements: [
      { name: "POSTGRES_USER", required: true, default: "postgres", configured: true },
      { name: "POSTGRES_PASSWORD", required: true, default: "postgres", configured: true }
    ],
    verifiedAgainst: "docker-compose.yml"
  },
  {
    step: 3,
    title: "Install Node Modules & Python Microservice",
    description: "Install frontend React Flow canvas dependencies and set up the Python FastAPI virtual environment.",
    targetNodeId: "node-python-graphrag",
    commands: [
      "npm install",
      "cd backend-python && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    ],
    envRequirements: [],
    verifiedAgainst: "package.json & backend-python/requirements.txt"
  },
  {
    step: 4,
    title: "Launch Concurrently Next.js Canvas & Python GraphRAG API",
    description: "Start the Next.js development server and the Python GraphRAG API backend to activate the dual-pane dashboard.",
    targetNodeId: "node-api-analyze",
    commands: [
      "npm run dev",
      "uvicorn backend-python.main:app --reload --port 8000"
    ],
    envRequirements: [],
    verifiedAgainst: "package.json scripts.dev"
  },
  {
    step: 5,
    title: "Verify Bidirectional State Sync & Canvas Responsiveness",
    description: "Validate 60fps React Flow canvas pan/zoom performance and verify Zustand state synchronization across panes.",
    targetNodeId: "node-store-devex",
    commands: [
      "npm run build"
    ],
    envRequirements: [],
    verifiedAgainst: "src/store/useDevExStore.ts"
  }
];

const INITIAL_AGENTS: AgentTask[] = [
  {
    id: "agent-1",
    name: "Agent 1: Java AST & Tree-Sitter Parser",
    workspace: "backend-java/",
    role: "Scaffolding Java AST extraction engine & configuring Tree-sitter JNI native bindings",
    status: "completed",
    progress: 100,
    logs: [
      "[14:48:10] Initialized Tree-sitter JNI compiler bindings...",
      "[14:48:15] Configured Java class hierarchy & package scanner.",
      "[14:48:20] Generated TreeSitterASTParser.java structural manifest.",
      "[14:48:22] Artifact deliverable generated: java_ast_config.mc3"
    ],
    artifacts: [
      {
        name: "java_ast_config.mc3",
        type: "Tree-sitter Mapping Configuration",
        path: "backend-java/TreeSitterASTParser.java",
        content: `// Agent 1 MC3 Spec\nparser.language = "java"\nparser.jni_binding = true\nparser.extract_method_call_graph = true`,
        approved: true
      }
    ]
  },
  {
    id: "agent-2",
    name: "Agent 2: Next.js & React Flow Frontend",
    workspace: "frontend/",
    role: "Building 60fps interactive React Flow canvas, custom nodes, and Zustand state sync",
    status: "completed",
    progress: 100,
    logs: [
      "[14:48:30] Scaffolding Next.js App Router & Tailwind CSS layout...",
      "[14:48:35] Created memoized custom node types (Component, API, State, Config).",
      "[14:48:42] Connected Zustand store with React Flow canvas.",
      "[14:48:50] Verified 60fps canvas performance & glassmorphism theme."
    ],
    artifacts: [
      {
        name: "canvas_architecture.mc3",
        type: "React Flow Canvas Spec",
        path: "src/components/macro/MacroViewCanvas.tsx",
        content: `// Agent 2 Canvas Spec\nreact_flow.render_mode = "virtualized"\ncanvas.target_fps = 60\nzustand.sync_bidirectional = true`,
        approved: true
      }
    ]
  },
  {
    id: "agent-3",
    name: "Agent 3: Python FastAPI & GraphRAG Pipeline",
    workspace: "backend-python/",
    role: "Developing GraphRAG engine, tiktoken chunker, and zero-hallucination setup guide generator",
    status: "completed",
    progress: 100,
    logs: [
      "[14:49:00] Initialized NetworkX graph indexer and sub-graph retriever...",
      "[14:49:08] Configured tiktoken encoder for context window management (<4000 tokens).",
      "[14:49:15] Built deterministic command parser against package.json & Docker compose.",
      "[14:49:22] Created REST endpoints /api/analyze and /api/subgraph."
    ],
    artifacts: [
      {
        name: "graphrag_pipeline.mc3",
        type: "GraphRAG & Tiktoken Chunker Spec",
        path: "backend-python/graphrag/engine.py",
        content: `// Agent 3 GraphRAG Spec\ngraphrag.algorithm = "networkx_subgraph_hops"\ntiktoken.encoding = "cl100k_base"\nzero_hallucination_rule = "strict_manifest_match"`,
        approved: true
      }
    ]
  }
];

export const useDevExStore = create<DevExState>((set, get) => ({
  repoUrl: 'https://github.com/mphasis/devex-platform-core',
  repoId: 'uuid-4902-8812',
  selectedBranch: 'main',
  selectedSample: 'sample-devex',
  isAnalyzing: false,
  analysisProgress: '',
  analysisTimeSeconds: 2.4,
  tokensProcessed: 3420,
  redisCacheHit: false,
  redisLatencyMs: 140,
  lifecyclePhase: 'idle',
  sseStreamingActive: false,
  viewMode: 'split',

  // Swimm Educational Navigation & Synchronized Walkthrough State
  activeMacroTab: 'overview',
  activeWalkthroughStep: 0,
  highlightedLineRange: { file: 'package.json', startLine: 1, endLine: 25 },

  setActiveMacroTab: (tab) => set({ activeMacroTab: tab }),
  setActiveWalkthroughStep: (step) => set({ activeWalkthroughStep: step }),
  setHighlightedLineRange: (range) => set({ highlightedLineRange: range }),

  // Initialized Default Analysis Result for devex-platform-core
  currentOverview: analyzeRepository('https://github.com/mphasis/devex-platform-core').overview,
  businessRules: analyzeRepository('https://github.com/mphasis/devex-platform-core').businessRules,
  customRepoFiles: analyzeRepository('https://github.com/mphasis/devex-platform-core').codeFiles,

  // Landing Chat & Docking State
  isChatDocked: false,
  isChatExpanded: true,
  pastedCodeSnippet: null,
  customInputMode: 'git',
  chatMessages: [
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: 'Welcome to Unify DevEx Platform! Paste a GitHub repository URL, natural language prompt, or multi-line code snippet below to extract a deterministic interactive architecture map and zero-hallucination onboarding guide.',
      timestamp: 'Just now',
    },
  ],

  setIsChatDocked: (docked) => set({ isChatDocked: docked }),
  setIsChatExpanded: (expanded) => set({ isChatExpanded: expanded }),
  toggleChatExpanded: () => set((s) => ({ isChatExpanded: !s.isChatExpanded })),
  setPastedCodeSnippet: (code) => set({ pastedCodeSnippet: code }),
  setCustomInputMode: (mode) => set({ customInputMode: mode }),
  addChatMessage: (msg) => {
    const newMsg: ChatMessage = {
      ...msg,
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    set((state) => ({ chatMessages: [...state.chatMessages, newMsg] }));
  },
  submitLandingChat: async (input: string) => {
    if (!input.trim()) return;
    const urlMatch = input.match(/https:\/\/github\.com\/[\w-]+\/[\w.-]+/i);
    const extractedUrl = urlMatch ? urlMatch[0] : null;
    const targetUrl = extractedUrl || (get().customInputMode === 'git' ? input.trim() : 'https://github.com/mphasis/devex-platform-core');

    // Immediately set isAnalyzing and isChatDocked to prevent any premature platform reveal flash
    set({
      isChatDocked: true,
      isAnalyzing: true,
      repoUrl: targetUrl,
      lifecyclePhase: 'phase1_request',
      analysisProgress: 'Step 1: Reading source code & manifest...',
    });

    get().addChatMessage({
      sender: 'user',
      text: input,
      githubUrl: extractedUrl || undefined,
      codeSnippet: input.includes('\n') ? input : undefined,
    });

    get().addChatMessage({
      sender: 'assistant',
      text: `Ingesting AST & GraphRAG pipeline for: ${targetUrl}. Hydrating dual-pane interactive canvas...`,
    });

    await get().runAnalysis(targetUrl);
  },

  splitWidthPercent: 35, // Default 35% Micro View / 65% Macro View layout

  nodes: DEFAULT_NODES,
  edges: DEFAULT_EDGES,
  selectedNodeId: 'node-root-pkg',
  highlightedNodeId: 'node-root-pkg',
  hoveredNodeId: null,
  activeSection: null,
  searchQuery: '',
  filterCategory: 'all',
  depthLimit: 2,
  focusRequestTime: 0,
  focusTargetNodeId: null,

  guideSteps: DEFAULT_GUIDE_STEPS,
  activeStepIndex: 0,
  terminalOutput: null,
  fileExplanations: {},
  setFileExplanation: (fileId, data) =>
    set((s) => ({ fileExplanations: { ...s.fileExplanations, [fileId]: data } })),

  agents: INITIAL_AGENTS,

  setRepoUrl: (url) => set({ repoUrl: url }),
  setSelectedBranch: (branch) => set({ selectedBranch: branch }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setSplitWidthPercent: (width) => set({ splitWidthPercent: Math.max(20, Math.min(70, width)) }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterCategory: (cat) => set({ filterCategory: cat }),
  setDepthLimit: (depth) => set({ depthLimit: depth }),
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setHoveredNodeId: (id) => set({ hoveredNodeId: id }),
  setActiveSection: (section) => set({ activeSection: section }),

  focusNodeFromGuideStep: (nodeId, stepIndex) => {
    set({
      selectedNodeId: nodeId,
      highlightedNodeId: nodeId,
      activeStepIndex: stepIndex,
      activeMacroTab: 'graph',
      focusTargetNodeId: nodeId,
      focusRequestTime: Date.now(),
    });
  },

  // Feature 1: Risk Overlay
  riskOverlayActive: false,
  blameData: {
    'package.json': { lastEditDate: '2026-09-15', author: 'dev-lead', isAbandoned: false },
    'docker-compose.yml': { lastEditDate: '2026-08-20', author: 'ops-team', isAbandoned: false },
    'src/app/api/analyze/route.ts': { lastEditDate: '2026-10-02', author: 'alex-dev', isAbandoned: false },
    'src/app/api/graph/route.ts': { lastEditDate: '2026-09-28', author: 'graph-team', isAbandoned: false },
    'src/store/useDevExStore.ts': { lastEditDate: '2026-10-05', author: 'frontend-lead', isAbandoned: false },
    'src/components/macro/MacroViewCanvas.tsx': { lastEditDate: '2026-10-04', author: 'ui-team', isAbandoned: false },
    'src/components/micro/MicroViewGuide.tsx': { lastEditDate: '2024-03-10', author: 'unknown', isAbandoned: true },
    'backend-python/graphrag/engine.py': { lastEditDate: '2026-09-28', author: 'ml-eng', isAbandoned: false },
    'backend-java/TreeSitterASTParser.java': { lastEditDate: '2023-01-14', author: 'unknown', isAbandoned: true },
  },
  toggleRiskOverlay: () => set((s) => ({ riskOverlayActive: !s.riskOverlayActive })),

  // Feature 2: Time Travel Commit History
  selectedCommitIndex: 0,
  commitHistory: [
    {
      index: 0,
      hash: 'c01a9f1',
      message: 'feat: Current Architecture (PR Walkthrough & Risk Overlay)',
      date: '2026-10-08',
      author: 'Unify DevEx Lead',
      nodes: DEFAULT_NODES,
      edges: DEFAULT_EDGES,
    },
    {
      index: 1,
      hash: 'b8f2d0a',
      message: 'feat: Add Python GraphRAG engine & Tree-sitter Java parser',
      date: '2026-09-20',
      author: 'Backend Team',
      nodes: DEFAULT_NODES.filter((n) => n.id !== 'node-comp-micro'),
      edges: DEFAULT_EDGES.filter((e) => e.target !== 'node-comp-micro'),
    },
    {
      index: 2,
      hash: 'a4d3e21',
      message: 'refactor: Connect Zustand 60fps store & React Flow canvas',
      date: '2026-08-15',
      author: 'Frontend Lead',
      nodes: DEFAULT_NODES.filter((n) =>
        ['node-root-pkg', 'node-docker-compose', 'node-api-analyze', 'node-store-devex', 'node-comp-canvas'].includes(n.id)
      ),
      edges: DEFAULT_EDGES.filter(
        (e) =>
          ['node-root-pkg', 'node-api-analyze', 'node-store-devex'].includes(e.source) &&
          ['node-api-analyze', 'node-store-devex', 'node-comp-canvas'].includes(e.target)
      ),
    },
    {
      index: 3,
      hash: '9e1c4b2',
      message: 'feat: API routes setup & Docker Compose orchestration',
      date: '2026-06-01',
      author: 'Infra Lead',
      nodes: DEFAULT_NODES.filter((n) => ['node-root-pkg', 'node-docker-compose', 'node-api-analyze'].includes(n.id)),
      edges: DEFAULT_EDGES.filter((e) => e.source === 'node-root-pkg' && e.target === 'node-api-analyze'),
    },
    {
      index: 4,
      hash: '8f0a2d4',
      message: 'initial commit: Root manifest & base structure',
      date: '2025-12-01',
      author: 'Repo Creator',
      nodes: DEFAULT_NODES.filter((n) => n.id === 'node-root-pkg'),
      edges: [],
    },
  ],
  setCommitIndex: (index: number) => {
    const history = get().commitHistory;
    const item = history[index];
    if (item) {
      set({
        selectedCommitIndex: index,
        nodes: item.nodes,
        edges: item.edges,
      });
    }
  },

  // Feature 3: Executable Sandboxes WebContainer Modal
  sandboxModalCommand: null,
  setSandboxModalCommand: (cmd) => set({ sandboxModalCommand: cmd }),

  // Feature 5: VS Code Extension Messaging Target
  autoFocusFile: (filePath) => {
    const nodes = get().nodes;
    const targetNode = nodes.find(
      (n) => n.data?.file === filePath || (n.data?.file as string)?.endsWith(filePath)
    );
    if (targetNode) {
      set({
        selectedNodeId: targetNode.id,
        highlightedNodeId: targetNode.id,
        focusTargetNodeId: targetNode.id,
        focusRequestTime: Date.now(),
        activeMacroTab: 'graph',
      });
    }
  },

  // Local Ollama Semantic Translation Layer In-Memory Cache
  llmCache: {},

  fetchLLMCompletion: async (payload) => {
    const cacheKey = `${payload.task}:${payload.symbolId}`;
    const existing = get().llmCache[cacheKey];
    if (existing) {
      return existing;
    }

    try {
      const res = await fetch('/api/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      const resultText = data.content || 'No response generated.';
      set((state) => ({
        llmCache: {
          ...state.llmCache,
          [cacheKey]: resultText,
        },
      }));
      return resultText;
    } catch (err: any) {
      const fallbackText = `Summary generated for ${payload.symbolId}.`;
      set((state) => ({
        llmCache: {
          ...state.llmCache,
          [cacheKey]: fallbackText,
        },
      }));
      return fallbackText;
    }
  },

  setTerminalOutput: (output) => set({ terminalOutput: output }),

  approveArtifact: (agentId, artifactName) => {
    set((state) => ({
      agents: state.agents.map((agent) => {
        if (agent.id === agentId) {
          return {
            ...agent,
            artifacts: agent.artifacts.map((art) =>
              art.name === artifactName ? { ...art, approved: true } : art
            ),
          };
        }
        return agent;
      }),
    }));
  },

  runAnalysis: async (targetUrl) => {
    const url = targetUrl || get().repoUrl;
    const isRepeatQuery = url === 'https://github.com/mphasis/devex-platform-core';

    set({
      isAnalyzing: true,
      repoUrl: url,
      lifecyclePhase: 'phase1_request',
      analysisProgress: 'Step 1: Reading source code & manifest...',
    });

    // Fast 1.0 second total loading transition (200ms per step)
    await new Promise((r) => setTimeout(r, 200));
    set({
      lifecyclePhase: 'phase3_ast_parsing',
      analysisProgress: 'Step 2: Understanding Tree-sitter AST & dependencies...',
    });

    await new Promise((r) => setTimeout(r, 200));
    set({
      lifecyclePhase: 'phase5_vectorization',
      analysisProgress: 'Step 3: Creating GraphRAG explanation & CS student callouts...',
    });

    await new Promise((r) => setTimeout(r, 200));
    set({
      lifecyclePhase: 'phase6_generation',
      sseStreamingActive: true,
      analysisProgress: 'Step 4: Preparing 60fps walkthrough & canvas workspace...',
    });

    await new Promise((r) => setTimeout(r, 200));
    set({
      lifecyclePhase: 'phase7_synchronization',
      analysisProgress: 'Step 5: Unifying DevEx Platform...',
    });

    await new Promise((r) => setTimeout(r, 200));

    // Perform analysis on target repository or pasted snippet
    const analysisResult = await analyzeRepositoryAsync(url, get().customInputMode, get().pastedCodeSnippet);
    const primaryFile = Object.keys(analysisResult.codeFiles)[0] || 'package.json';

    set({
      isAnalyzing: false,
      lifecyclePhase: 'idle',
      sseStreamingActive: false,
      analysisProgress: '',
      nodes: analysisResult.nodes,
      edges: analysisResult.edges,
      guideSteps: analysisResult.guideSteps,
      currentOverview: analysisResult.overview,
      businessRules: analysisResult.businessRules,
      customRepoFiles: analysisResult.codeFiles,
      selectedNodeId: analysisResult.nodes[0]?.id || null,
      highlightedNodeId: analysisResult.nodes[0]?.id || null,
      activeStepIndex: 0,
      highlightedLineRange: { file: primaryFile, startLine: 1, endLine: 25 },
      redisCacheHit: isRepeatQuery,
      redisLatencyMs: isRepeatQuery ? 140 : 340,
      analysisTimeSeconds: 5.4,
      tokensProcessed: 4120,
    });
  },
}));
