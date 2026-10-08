<div align="center">

# ⚡ Unify DevEx Studio

### **Interactive Dual-Pane Code Base Onboarding & Deterministic Architecture Mapping**

[![Next.js](https://img.shields.io/badge/Next.js-14.2-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Ollama](https://img.shields.io/badge/Ollama-qwen2.5--coder:7b-black?style=for-the-badge&logo=ollama&logoColor=white)](https://ollama.ai)
[![React Flow](https://img.shields.io/badge/React_Flow-v12-FF007A?style=for-the-badge&logo=react&logoColor=white)](https://reactflow.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

*Built for senior engineering teams, hackathon judges, and developers onboarding into legacy or complex codebases.*

</div>

---

## 📖 What is Unify DevEx Studio?

Joining a new engineering team or analyzing a multi-thousand-line codebase for the first time is daunting. Traditional onboarding relies on **outdated documentation**, stale Confluence pages, or endless manual code-tracing sessions that consume senior engineering hours.

**Unify DevEx Studio** solves this bottleneck with an **interactive, synchronized dual-pane workspace**. It connects high-level domain breakdowns directly to underlying source code files, line-by-line inspection drawers, and ELK-layouted architectural graphs.

> 🔒 **100% Local & Deterministic**: Onboarding should not depend on probabilistic cloud LLM guesses. Unify DevEx Studio uses a **deterministic Tree-sitter AST & NetworkX DAG engine** to extract real code structure with **zero cloud hallucinations**.

---

## ✨ Latest Features & Architecture Enhancements

### 1. 📁 Exact Git Folder Structure Explorer
- **Interactive Directory Drill-Down**: Browse repository files through an authentic Git folder structure with dynamic breadcrumb navigation (`root / src / components / macro`).
- **Parent Directory Navigation**: Seamlessly navigate back up with `..` (Parent directory) rows.
- **Git Commit Metadata**: Displays author initials, commit message summaries, commit hashes (`b6d8c33f`), and relative timestamps (`18 hours ago`).

### 2. ⚡ Tiered Lazy Walkthrough Engine (Qwen 2.5 Local LLM)
- **Tier 0 Instant Facts (0ms Latency)**: Tree-sitter AST parser extracts language, line count, entrypoint status, imported symbols, and function signature ranges deterministically.
- **Tier 1 Streamed Architectural Explanations**: Local **Ollama (`qwen2.5-coder:7b`)** delivers Purpose, How It Works, Key AST Symbols, and Junior Developer Tips via SSE streaming.
- **SQLite Disk Caching**: Explanations are cached in SQLite keyed by `sha256(file_content + model + prompt_version)` for instant replay.

### 3. 🌐 ELK Hierarchical Graph Layout (`@xyflow/react`)
- Uses the **Eclipse Layout Kernel (ELK)** hierarchical algorithm for zero node collisions.
- Features expandable folder group nodes, 60fps pan/zoom controls, PageRank importance scaling, and 1-hop connected edge highlighting.

### 4. ⏱️ Centered Git Time-Travel Timeline
- Centered slider control (`Commit 1/5`) positioned cleanly at the bottom middle of the canvas (`bottom-3 left-1/2 -translate-x-1/2`) to scrub through commit history without overlapping viewport controls or node inspector drawers.

### 5. 📖 Repository README.md Viewer in Overview Tab
- Features a formatted line-by-line markdown documentation reader (`ReadmeMarkdownViewer`) in the Overview tab that dynamically loads and displays the analyzed Git repository's `README.md` file.

### 6. 🎨 Premium Silver & Obsidian Theme with San Francisco Font
- Styled with a monochromatic obsidian black palette (`#050507`, `#0e0e12`) and sleek silver accents.
- Global **San Francisco** font family applied across all text, inputs, buttons, and badges.

### 7. 🚀 Blazing Fast 1-Second Loading Transition
- Analysis pipeline step delays optimized to 200ms per phase (1.0 second total transition time).

---

## 🏛️ System Architecture

```
                    ┌─────────────────────────────────────────┐
                    │        Next.js 14 Frontend UI           │
                    │   • Zustand 60fps Store State           │
                    │   • @xyflow/react + ELK Layout Engine   │
                    │   • Exact Git Folder Tree Explorer      │
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

## 🚀 Quickstart Installation & Local Execution

### Prerequisites
- **Node.js**: v18.x or higher
- **Python**: 3.10+
- **Ollama**: Installed locally ([ollama.ai](https://ollama.ai))

### 1. Clone the Repository
```bash
git clone https://github.com/devdatrt16-hub/Unify-DevEx-Studio.git
cd Unify-DevEx-Studio
```

### 2. Configure Local Ollama Model
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

# Start FastAPI microservice on port 8000
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
| **File Navigation** | Exact Git Folder Structure with Breadcrumbs | Plain file dropdowns |
| **Privacy & Security** | 100% Local (Ollama + Local AST) | Sends proprietary code to cloud |
| **Graph Algorithm** | ELK Hierarchical Layouting | Manual positioning or basic force |
| **Walkthrough Engine** | Tiered Lazy SSE Streamed + SQLite Cache | Full repo dump / context truncation |

---

## 🤝 Contributing

Contributions are welcome! Please review our [CONTRIBUTING.md](CONTRIBUTING.md) guide for details on PR submission standards and acceptance criteria.

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).
