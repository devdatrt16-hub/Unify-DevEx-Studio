<div align="center">

# ⚡ Unify DevEx Studio

### **Interactive Dual-Pane Onboarding & Deterministic Architecture Mapping**

[![Next.js](https://img.shields.io/badge/Next.js-14.2-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Ollama](https://img.shields.io/badge/Ollama-qwen2.5--coder:7b-black?style=for-the-badge&logo=ollama&logoColor=white)](https://ollama.ai)
[![React Flow](https://img.shields.io/badge/React_Flow-v12-FF007A?style=for-the-badge&logo=react&logoColor=white)](https://reactflow.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

*Built for senior engineering teams, hackathons, and computer science students onboarding into complex codebases.*

</div>

---

## 📖 Project Overview

Joining a new engineering team or analyzing a multi-thousand-line codebase for the first time is daunting. Traditional onboarding relies on **outdated, static documentation**, stale wiki pages, or endless manual code-tracing sessions that consume valuable senior engineering hours.

**Unify DevEx Studio** solves this bottleneck by introducing a **dynamic, synchronized dual-pane educational workspace**. It connects high-level domain breakdowns directly to underlying source code files and ELK-layouted architectural graphs.

> 🔒 **100% Local & Deterministic**: Onboarding should not depend on probabilistic cloud LLM guesses or fabrications. Unify DevEx Studio uses a **deterministic Tree-sitter AST & NetworkX DAG engine** to extract real code structure with **zero hallucinations**.

---

## 🎨 Dual-Pane Workspace & Key Features

```
┌───────────────────────────────────────┬───────────────────────────────────────┐
│       MICRO VIEW (Left Pane)          │        MACRO VIEW (Right Pane)        │
│   Lazy File Walkthrough & AST Facts   │  Segmented Nav (Overview, Graph...)   │
├───────────────────────────────────────┼───────────────────────────────────────┤
│ • Tier 0 Deterministic File Facts     │ • System Overview & README Reader     │
│ • Tier 1 Streamed Ollama Explanations │ • ELK Hierarchical @xyflow/react Map  │
│ • Key AST Function Signatures         │ • Business Rules & Logic Matrix       │
│ • Junior Developer Tip Callouts       │ • Exact Git Folder Tree Reader        │
└───────────────────────────────────────┴───────────────────────────────────────┘
```

### ⚡ Tiered Lazy Walkthrough Engine
Instead of processing hundreds of steps for an entire codebase at once, Unify DevEx Studio evaluates files **lazily on demand**:
- **Tier 0 (Instant Facts - 0ms LLM Latency)**: Tree-sitter extracts language, line count, entrypoint status, imported symbols, and AST function signatures deterministically.
- **Tier 1 (Streamed Local LLM)**: Connects to local **Ollama (`qwen2.5-coder:7b`)** via Server-Sent Events (SSE). Results are verified against the AST symbol list and cached in **SQLite** keyed by `sha256(content + model + prompt_version)`.

### 🌐 ELK Hierarchical Graph Layout (`@xyflow/react`)
- Automatically arranges codebase dependency graphs using the **Eclipse Layout Kernel (ELK)** hierarchical algorithm to prevent node collisions and line overlaps.
- Supports expandable parent folder group nodes, 60fps pan/zoom controls, category color accents, and 1-hop connected edge highlighting.

### 📁 Exact Git Folder Structure Explorer
- Interactive folder tree navigation allowing developers to drill inside nested directories (`root / src / components / macro`) with breadcrumbs and parent directory (`..`) traversal.
- Direct file selection bi-directionally syncs node focus and AST walkthrough breakdowns.

---

## 🏛️ System Architecture

```
                    ┌─────────────────────────────────────────┐
                    │        Next.js 14 Frontend UI           │
                    │   • Zustand 60fps Store State           │
                    │   • @xyflow/react + ELK Layout Engine   │
                    └────────────────────┬────────────────────┘
                                         │ REST / SSE API
                    ┌────────────────────▼────────────────────┐
                    │      FastAPI Python Microservice        │
                    │   • Tree-sitter Multi-Lang AST Parser   │
                    │   • NetworkX Sub-Graph Indexer          │
                    └──────────┬───────────────────┬──────────┘
                               │                   │
                     ┌─────────▼─────────┐       ┌─▼─────────────────┐
                     │ Local Ollama LLM  │       │ SQLite Disk Cache │
                     │ (qwen2.5-coder)   │       │ (sha256 hashing)  │
                     └───────────────────┘       └───────────────────┘
```

---

## 🚀 Quickstart Installation

### Prerequisites
- **Node.js**: v18.x or higher
- **Python**: 3.10+
- **Ollama**: Installed locally ([ollama.ai](https://ollama.ai))

### 1. Clone the Repository
```bash
git clone https://github.com/devdatrt16-hub/Unify-DevEx-Studio.git
cd Unify-DevEx-Studio
```

### 2. Configure Local Ollama Instance
```bash
# Pull the required qwen2.5-coder model
ollama pull qwen2.5-coder:7b
```

### 3. Launch Python Backend Microservice
```bash
cd backend-python

# Setup virtual environment
python3 -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Start FastAPI microservice
uvicorn main:app --reload --port 8000
```

### 4. Launch Next.js Frontend Server
In a new terminal window from the root directory:
```bash
npm install
npm run dev
```

Open **`http://localhost:3000`** in your browser to enter the workspace.

---

## 🔍 Architecture Verification Matrix

| Feature | Unify DevEx Studio | Cloud AI Copilots |
| :--- | :--- | :--- |
| **Accuracy Model** | Deterministic Tree-sitter AST & NetworkX DAG | Probabilistic LLM Prompting |
| **Hallucination Risk** | **0% (Verified against AST schema)** | High (Fabricated methods/files) |
| **Privacy & Security** | 100% Local (Ollama + Local AST) | Sends proprietary code to cloud |
| **Graph Algorithm** | ELK Hierarchical Layouting | Manual positioning or basic force |
| **Walkthrough Engine** | Tiered Lazy SSE Streamed + SQLite Cache | Full repo dump / context truncation |

---

## 🤝 Contributing

Contributions are welcome! Please review our [CONTRIBUTING.md](CONTRIBUTING.md) guide for details on PR submission standards and acceptance criteria.

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).
