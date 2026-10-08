---
name: ast-graphrag
description: Rules for AST parsing, GraphRAG localized sub-graph retrieval, tiktoken context chunking, and zero-hallucination setup command extraction.
---

# AST Parsing & GraphRAG Pipeline Skill

## Core Rules for GraphRAG & Setup Guide Synthesis

1. **Deterministic Zero-Hallucination Command Verification**:
   - Every setup command extracted for the Micro View MUST be strictly grounded in actual repository build manifests (`package.json`, `Makefile`, `docker-compose.yml`, `requirements.txt`, `pom.xml`).
   - If a command cannot be verified against the project AST or config files, do NOT output it.

2. **GraphRAG Localized Sub-Graph Extraction**:
   - Instead of sending full raw codebase files to the LLM context window, construct a dependency graph with `networkx`.
   - Pull target sub-graphs (nodes within N hops of root configurations and entrypoints).

3. **Tiktoken Context Window Management**:
   - Use `tiktoken` (encoding `cl100k_base` or `o200k_base`) to split sub-graph data into strict chunk sizes (<4,000 tokens per sub-graph block).
   - Ensure latency for pipeline processing remains <45 seconds for medium-sized repositories.
