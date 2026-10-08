# 🤝 Contributing to Unify DevEx Studio

First off, thank you for considering contributing to **Unify DevEx Studio**! We welcome contributions from senior engineering teams, hackathon developers, and computer science students building open-source developer tools.

---

## 🏗️ 1. Dual-Pane Architecture Overview

Unify DevEx Studio is structured as a local-first, zero-hallucination code explainer comprising two primary layers:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js 14)                           │
│  • Micro View Guide (Left Reader)  • Macro Canvas (@xyflow/react)      │
│  • Zustand 60fps Store Sync        • ELK Hierarchical Graph Layout     │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ REST / SSE API
┌──────────────────────────────────▼─────────────────────────────────────┐
│                    PYTHON AST BACKEND (FastAPI)                        │
│  • Tree-sitter AST Parser          • NetworkX DAG Sub-Graph Indexer    │
│  • Tier 0 Deterministic Facts      • Tier 1 Ollama (qwen2.5-coder:7b) │
│  • SQLite Explanation Cache        • Grounding Verification Check      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ 2. Development Setup

### Prerequisites
- **Node.js**: v18.x or higher
- **npm** or **yarn**
- **Python**: 3.10+
- **Ollama**: Installed locally ([ollama.ai](https://ollama.ai))

### Quickstart Setup

1. **Fork & Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/Unify-DevEx-Studio.git
   cd Unify-DevEx-Studio
   ```

2. **Install Frontend Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Local Ollama Model**:
   Unify DevEx Studio uses the local `qwen2.5-coder:7b` model for Tier 1 streamed explanations.
   ```bash
   # Pull the required model locally
   ollama pull qwen2.5-coder:7b

   # Verify model availability
   ollama list
   ```

4. **Setup Python Backend Microservice**:
   ```bash
   cd backend-python

   # Create virtual environment
   python3 -m venv venv
   source venv/bin/activate   # On Windows: venv\Scripts\activate

   # Install requirements
   pip install -r requirements.txt

   # Start FastAPI dev server on port 8000
   uvicorn main:app --reload --port 8000
   ```

5. **Start Next.js Frontend**:
   In a separate terminal window from the root directory:
   ```bash
   npm run dev
   ```

---

## ⚡ 3. Tiered Explanation Pipeline Guidelines

When modifying backend endpoints or walkthrough components, adhere to the two-tier architectural rule:

### Tier 0: Deterministic AST Facts (0ms LLM Latency)
- Extracted purely via Tree-sitter AST parsers and NetworkX graph algorithms (`GET /api/file/{file_id}/facts`).
- Must include language, line count, function signatures, classes, imports, and entrypoint flags.
- **Zero LLM calls permitted in Tier 0.**

### Tier 1: Streamed Local LLM Explanation (`qwen2.5-coder:7b`)
- Triggered on file selection via SSE streaming (`POST /api/file/{file_id}/explain`).
- Single-concurrency async queue with automatic client disconnect cancellation (AbortController).
- Results cached in SQLite keyed by `sha256(file_content + model + prompt_version)`.
- Grounding verification: Every symbol in key_symbols MUST exist in the Tree-sitter AST signature list.

---

## 🧪 4. Testing & Pull Request Checklist

Before submitting a Pull Request, make sure your branch satisfies the following criteria:

- [ ] **TypeScript Build**: Run `npm run build` with zero type errors or warnings.
- [ ] **ELK Layout Verification**: Confirm no overlapping nodes or broken edge connections in the graph view.
- [ ] **Grounding Check**: Ensure no LLM hallucinations bypass the AST grounding verification layer.
- [ ] **No Secrets**: Ensure no API keys, credentials, or `.env.local` files are committed.

Thank you for helping build the future of zero-hallucination codebase onboarding!
