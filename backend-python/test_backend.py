from parser.ast_parser import RepositoryASTParser
from graphrag.engine import GraphRAGEngine

def test_ast_parser():
    parser = RepositoryASTParser("https://github.com/mphasis/devex-platform-core")
    result = parser.parse_repository()
    assert result["repository"] == "devex-platform-core"
    assert len(result["nodes"]) > 0
    assert len(result["edges"]) > 0

def test_graphrag_guide_zero_hallucination():
    parser = RepositoryASTParser("https://github.com/mphasis/devex-platform-core")
    ast_data = parser.parse_repository()
    engine = GraphRAGEngine(ast_data)
    guide = engine.generate_zero_hallucination_guide()

    assert len(guide) >= 3
    for step in guide:
        assert "step" in step
        assert "targetNodeId" in step
        assert "commands" in step
        assert "verifiedAgainst" in step

def test_subgraph_retrieval():
    parser = RepositoryASTParser("https://github.com/mphasis/devex-platform-core")
    ast_data = parser.parse_repository()
    engine = GraphRAGEngine(ast_data)
    subgraph = engine.get_localized_subgraph("node-root-pkg", depth=1)
    
    assert "nodes" in subgraph
    assert any(n["id"] == "node-root-pkg" for n in subgraph["nodes"])

def test_git_blame_endpoint():
    from main import get_git_blame
    res = get_git_blame()
    assert res["success"] is True
    assert "package.json" in res["blame"]
    assert "isAbandoned" in res["blame"]["backend-java/TreeSitterASTParser.java"]
    assert res["blame"]["backend-java/TreeSitterASTParser.java"]["isAbandoned"] is True

def test_ast_history_endpoint():
    from main import get_ast_history
    res = get_ast_history()
    assert res["success"] is True
    assert len(res["commits"]) == 5
    assert res["commits"][0]["hash"] == "c01a9f1"

def test_pr_analyze_endpoint():
    from main import analyze_pr, V1PRAnalyzeRequest
    req = V1PRAnalyzeRequest(prUrl="https://github.com/mphasis/devex-platform-core/pull/42")
    res = analyze_pr(req)
    assert res["success"] is True
    assert res["prNumber"] == "42"
    assert len(res["changedFiles"]) > 0

def test_graph_pruning_and_ranking():
    from graphrag.engine import prune_graph_and_rank
    
    mock_nodes = [
        {"id": "node-core", "data": {"label": "main.py", "file": "src/main.py"}},
        {"id": "node-util", "data": {"label": "utils.py", "file": "src/utils.py"}},
        {"id": "node-legacy", "data": {"label": "old_module.py", "file": "legacy/old_module.py"}},
        {"id": "node-test", "data": {"label": "test_main.py", "file": "tests/test_main.py"}},
        {"id": "node-vendor", "data": {"label": "vendor.js", "file": "vendor/third_party.js"}},
    ]
    mock_edges = [
        {"id": "e1", "source": "node-core", "target": "node-util"},
        {"id": "e2", "source": "node-core", "target": "node-core"},
        {"id": "e3", "source": "node-core", "target": "node-legacy"},
        {"id": "e4", "source": "node-test", "target": "node-core"},
    ]
    
    result = prune_graph_and_rank(mock_nodes, mock_edges, max_nodes=2)
    
    node_ids = [n["id"] for n in result["nodes"]]
    assert "node-test" not in node_ids
    assert "node-vendor" not in node_ids
    
    for e in result["edges"]:
        assert e["source"] != e["target"]
    
    for n in result["nodes"]:
        assert "importance" in n["data"]
        assert "degree" in n["data"]
        assert "community" in n["data"]
    
    assert len(result["nodes"]) == 2
    assert result["hidden_count"] == 1
    assert result["total_nodes"] == 3

def test_rule_based_node_classifier():
    from parser.ast_parser import classify_node_category

    assert classify_node_category(".github/workflows/builds.yml") == "CI"
    assert classify_node_category("README.md") == "Docs"
    assert classify_node_category("docs/api.md") == "Docs"
    assert classify_node_category("tests/test_parser.py") == "Tests"
    assert classify_node_category("src/utils.spec.ts") == "Tests"
    assert classify_node_category("legacy/old_debugger.c") == "Legacy/External"
    assert classify_node_category("vendor/third_party.js") == "Legacy/External"
    assert classify_node_category("main.py") == "Entry"
    assert classify_node_category("index.ts") == "Entry"
    assert classify_node_category("config.toml") == "Config"
    assert classify_node_category("package.json") == "Config"
    assert classify_node_category("src/core/engine.py") == "Core"
    assert classify_node_category("lib/parser.c") == "Core"

def test_lazy_file_facts_and_skeleton():
    from main import get_file_facts, skeleton_explain, SkeletonExplainRequest
    facts = get_file_facts("src/store/useDevExStore.ts")
    assert facts["success"] is True
    assert "filePath" in facts
    assert len(facts["function_signatures"]) > 0

    req = SkeletonExplainRequest(filePath="src/store/useDevExStore.ts")
    res = skeleton_explain(req)
    assert res["success"] is True
    assert res["token_count"] <= 1500
    assert len(res["summary"]) > 0

    doc_req = SkeletonExplainRequest(filePath="README.md")
    doc_res = skeleton_explain(doc_req)
    assert doc_res["can_override"] is True

def test_sqlite_cache_and_ast_grounding():
    from cache.sqlite_cache import SQLiteExplanationCache
    from main import verify_ast_grounding

    cache = SQLiteExplanationCache()
    key = cache.generate_cache_key("test_content_xyz", "qwen2.5-coder:7b", "v1.0")
    cache.set(key, "src/test.ts", {"purpose": "Test explanation"})

    retrieved = cache.get(key)
    assert retrieved is not None
    assert retrieved["purpose"] == "Test explanation"

    explanation = {
        "key_symbols": [
            {"name": "initialize", "role": "Init fn"},
            {"name": "x_symbol", "role": "Valid sym"}
        ]
    }
    facts = {
        "classes": [],
        "function_signatures": [{"name": "initialize", "params": ""}],
        "imports": [],
        "imported_by": []
    }
    grounded = verify_ast_grounding(explanation, facts)
    assert grounded["grounded"] is True
    assert any(s["name"] == "initialize" for s in grounded["key_symbols"])

if __name__ == "__main__":
    test_ast_parser()
    test_graphrag_guide_zero_hallucination()
    test_subgraph_retrieval()
    test_git_blame_endpoint()
    test_ast_history_endpoint()
    test_pr_analyze_endpoint()
    test_graph_pruning_and_ranking()
    test_rule_based_node_classifier()
    test_lazy_file_facts_and_skeleton()
    test_sqlite_cache_and_ast_grounding()
    print("All Python GraphRAG microservice tests passed successfully!")



