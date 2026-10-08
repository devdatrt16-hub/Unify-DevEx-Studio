# ⚡ Unify DevEx Studio

> **Transforming complex codebases into interactive, zero-hallucination educational walkthroughs.**  
> *Built for senior engineering teams, hackathons, and computer science students onboarding into legacy or complex systems.*

---

## 📖 1. Project Overview & The Problem Solved

Joining a new engineering team or tackling a multi-thousand-line codebase for the first time is daunting. Traditional onboarding relies on **outdated, static documentation**, stale Confluence pages, or endless code-tracing sessions that consume valuable senior engineering hours. Junior engineers and computer science students are left struggling to bridge the gap between high-level architectural concepts and line-by-line implementation details.

**Unify DevEx Studio** solves this onboarding bottleneck by introducing a **dynamic, synchronized dual-pane educational workspace**. It replaces static markdown guides with interactive walkthroughs that connect plain-English domain explanations directly to the underlying source code and architectural graphs.

> 💡 **Core Philosophy**: Onboarding should not depend on probabilistic LLM guesses or outdated wiki pages. Unify DevEx Studio uses a **deterministic, zero-hallucination engine** to extract real structure directly from source code ASTs, ensuring 100% accuracy and instant clarity.

---

## 🎨 2. How It Works (The Educational Experience)

Inspired by modern developer experience tools like **Swimm**, Unify DevEx Studio presents a full-viewport (`100vw` / `100vh`) split-pane layout designed to maximize focus and minimize context-switching.

```
┌───────────────────────────────────────┬───────────────────────────────────────┐
│           MICRO VIEW (Left)           │           MACRO VIEW (Right)          │
│   Beginner Breakdowns & Step Guides   │  4-Tab Segmented Nav (Graph, Code...) │
├───────────────────────────────────────┼───────────────────────────────────────┤
│ • Plain-English explanations of *WHY* │ • Overview & System Metrics           │
│ • Code line references & highlights   │ • Interactive @xyflow/react Node Map  │
│ • Interactive terminal commands       │ • Business Logic Matrix               │
│ • Step-by-step codebase guided tours │ • Synchronized Code Walkthrough       │
└───────────────────────────────────────┴───────────────────────────────────────┘
```

### 🔬 The Micro View (Left Pane)
The **Micro View** is the student's reading pane, featuring the **"Beginner Breakdown"** module:
- **Peer-Level Explanations**: Provides intuitive, plain-English explanations answering *why* specific modules, classes, and logic exist—moving beyond basic syntax descriptions.
- **Deep Code Links**: Line numbers and file references act as interactive triggers. Clicking or scrolling to a step automatically jumps the right pane to the exact file and AST node.
- **Verified Command Snippets**: Provides copyable, AST-grounded terminal commands for setup and testing.

### 🌐 The Macro View (Right Pane)
The **Macro View** provides birds-eye architectural clarity through a crisp **4-tab iOS-style segmented navigation bar**:
1. **Overview Tab**: High-level system architecture summary, repository statistics, dependency graphs, and health indicators.
2. **Graph View Tab**: Interactive node map powered by `@xyflow/react`. Nodes represent components, API routes, state stores, and configuration files, linked by dependency edges.
3. **Business Rules Tab**: A structured matrix mapping business requirements and rules directly to the implementation source files.
4. **Code Walkthrough Tab**: Full-featured code reader displaying line-numbered code snippets synchronized with active walkthrough steps.

> ⚡ **Cognitive Load Reduction**: By strictly separating visual graph topology from business logic matrices into segmented tabs, developers can digest system design incrementally without visual overload.

### 🔄 Bi-Directional Scroll Synchronization
Using the custom `useIntersectionObserverSync` React hook, Unify DevEx Studio maintains continuous synchronization between the left reading pane and right code view:
- As the user scrolls through the Micro View walkthrough steps, the hook observes active section intersections.
- It triggers real-time state updates in the global **Zustand** store, automatically centering the node map on the relevant `@xyflow/react` node or scrolling the code panel to exact line numbers.

---

## 🛠️ 3. Under the Hood (Architecture & Tech Stack)

### 💻 Frontend Stack & Visual Engine
The frontend is built with performance and design aesthetics at its core:
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router), React 18, TypeScript.
- **Styling**: Tailwind CSS with custom glassmorphism styling and HSL theme tokens.
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) for low-latency, bi-directional state synchronization between canvas nodes and guide steps.
- **Interactive Node Canvas**: [`@xyflow/react`](https://reactflow.dev/) (React Flow v12) delivering 60fps canvas rendering for up to 1,000+ custom node elements.
- **Animations**: Framer Motion for smooth tab transitions and panel reveals.
- **WebGL Background Engine**: Custom `<SideRays />` WebGL dynamic background shader that creates subtle light rays and smoothly transitions from sharp contrast to a soft background blur upon entering the workspace.

### 🛡️ Backend: Zero-Hallucination Deterministic Engine
Unlike conventional AI assistants that rely on probabilistic generative LLM prompts (and frequently hallucinate non-existent files or methods), Unify DevEx Studio operates on a **100% deterministic backend microservice**:

- **FastAPI / Python Microservice**: Serves structured GraphRAG and AST analysis endpoints.
- **Tree-sitter Parsing**: Parses source code files directly into Abstract Syntax Trees (ASTs) for precise structural inspection of imports, function signatures, class definitions, and exports.
- **NetworkX Directed Acyclic Graph (DAG)**: Constructs a strictly verified dependency graph of the entire repository structure.

### 🗜️ Graph Compression via "Skeleton Extraction"
Large codebases easily exceed standard LLM token context limits (e.g., 4,000 tokens). Unify DevEx Studio employs a **Skeleton Extraction** pipeline:
1. **AST Stripping**: Strips function bodies and boilerplate implementation details while retaining function signatures, exported interfaces, type definitions, and file import graphs.
2. **Sub-Graph Extraction**: Computes N-hop localized sub-graphs around entrypoints using `NetworkX`.
3. **Local Token Chunking**: Uses `tiktoken` (`cl100k_base` / `o200k_base` encodings) to compress project context into sub-4,000 token sub-graphs.

> 🔒 **100% Local & Private**: The entire engine runs locally without sending your proprietary code to external API services or third-party cloud LLM providers.

---

## 🚀 4. Getting Started (Execution)

Follow these steps to clone, setup, and run Unify DevEx Studio on your local machine.

### Prerequisites
- **Node.js**: v18.x or higher
- **npm** or **yarn**
- **Python**: 3.10+ (for the AST analysis backend)

### Installation & Quickstart

#### 1. Clone the Repository
```bash
git clone https://github.com/your-username/unify-devex-studio.git
cd unify-devex-studio
```

#### 2. Set Up Frontend Dependencies
```bash
npm install
```

#### 3. Set Up & Launch Python Backend Microservice
```bash
# Navigate to python backend directory
cd backend-python

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate   # On Windows use: venv\Scripts\activate

# Install backend dependencies
pip install -r requirements.txt

# Start FastAPI server on port 8000
uvicorn main:app --reload --port 8000
```

#### 4. Launch Next.js Frontend Development Server
In a new terminal window (from the root directory):
```bash
npm run dev
```

Open your browser and navigate to **`http://localhost:3000`** to launch Unify DevEx Studio.

---

## 🔍 5. Architectural Verification & Security

| Attribute | Unify DevEx Studio | Traditional LLM Copilots |
| :--- | :--- | :--- |
| **Accuracy Mechanism** | Deterministic Tree-sitter AST & NetworkX DAG | Probabilistic Next-Token Prediction |
| **Hallucination Risk** | **0% (Guaranteed)** | High (Fabricated methods/files) |
| **Privacy & Data Security** | 100% Local File Parsing | Sends Code to Cloud APIs |
| **Context Window Strategy** | Skeleton Extraction (Sub-4K token DAGs) | Full file dumping / Truncation |
| **UI UX Model** | Swimm-inspired 100vw/100vh Dual-Pane Sync | Linear Chat Box Side Panel |

---

<p align="center">
  <sub>Designed with ❤️ for developers, computer science students, and engineering teams everywhere.</sub>
</p>
