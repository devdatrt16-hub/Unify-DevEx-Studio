'use client';

import React, { useMemo, useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Search,
  Filter,
  X,
  Code2,
  Plus,
  Minus,
  Maximize2,
  CheckCircle2,
  Bot,
  Sparkles,
  FolderTree,
} from 'lucide-react';
import { useDevExStore } from '@/store/useDevExStore';
import { layoutGraph } from '@/lib/elkLayout';
import {
  ComponentNode,
  ApiRouteNode,
  StateStoreNode,
  ConfigNode,
  JavaClassNode,
  FolderGroupNode,
} from './nodes/CustomNodes';

export const CATEGORY_COLORS: Record<string, string> = {
  CI: '#ec4899',           // Pink
  Docs: '#06b6d4',         // Cyan
  Tests: '#f59e0b',        // Amber
  Core: '#3b82f6',         // Blue
  Config: '#8b5cf6',       // Purple
  'Legacy/External': '#64748b', // Slate
  Entry: '#10b981',        // Emerald
};

export function getCategoryColor(category?: string): string {
  if (!category) return '#3b82f6';
  return CATEGORY_COLORS[category] || '#3b82f6';
}

const nodeTypes = {
  componentNode: ComponentNode,
  apiRouteNode: ApiRouteNode,
  stateStoreNode: StateStoreNode,
  configNode: ConfigNode,
  javaClassNode: JavaClassNode,
  folderGroupNode: FolderGroupNode,
};

function deduplicateAndFilterEdges(inputEdges: Edge[]): Edge[] {
  if (!inputEdges) return [];

  const nonSelfLoops = inputEdges.filter((edge) => edge.source !== edge.target);

  const edgeMap = new Map<string, { edge: Edge; count: number }>();

  for (const edge of nonSelfLoops) {
    const key = `${edge.source}->${edge.target}`;
    if (edgeMap.has(key)) {
      const existing = edgeMap.get(key)!;
      existing.count += 1;
    } else {
      edgeMap.set(key, { edge: { ...edge }, count: 1 });
    }
  }

  return Array.from(edgeMap.values()).map(({ edge, count }) => {
    return {
      ...edge,
      data: {
        ...edge.data,
        count,
      },
    };
  });
}

function MacroViewCanvasContent() {
  const {
    nodes: storeNodes,
    edges: storeEdges,
    selectedNodeId,
    hoveredNodeId,
    searchQuery,
    filterCategory,
    focusRequestTime,
    focusTargetNodeId,
    commitHistory,
    selectedCommitIndex,
    setCommitIndex,
    setSelectedNodeId,
    setSearchQuery,
    setFilterCategory,
  } = useDevExStore();

  const reactFlowInstance = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState(storeNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(storeEdges);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const [layoutDirection, setLayoutDirection] = useState<'RIGHT' | 'DOWN'>('RIGHT');

  useEffect(() => {
    let isCancelled = false;

    async function computeLayout() {
      if (!storeNodes || storeNodes.length === 0) return;

      const processedEdges = deduplicateAndFilterEdges(storeEdges);
      const layoutedNodes = await layoutGraph(storeNodes, processedEdges, layoutDirection);

      if (!isCancelled) {
        setNodes(layoutedNodes);
        setEdges(processedEdges);

        setTimeout(() => {
          if (reactFlowInstance) {
            reactFlowInstance.fitView({ padding: 0.3, maxZoom: 0.9, duration: 400 });
          }
        }, 50);
      }
    }

    computeLayout();

    return () => {
      isCancelled = true;
    };
  }, [storeNodes, storeEdges, layoutDirection, setNodes, setEdges, reactFlowInstance]);

  useEffect(() => {
    if (focusTargetNodeId && reactFlowInstance && focusRequestTime > 0) {
      const targetNode =
        nodes.find((n) => n.id === focusTargetNodeId || n.data?.file === focusTargetNodeId || n.data?.label === focusTargetNodeId) ||
        storeNodes.find((n) => n.id === focusTargetNodeId || n.data?.file === focusTargetNodeId || n.data?.label === focusTargetNodeId);

      if (!targetNode) return;

      setSelectedNodeId(targetNode.id);

      const parentsToExpand = new Set<string>();
      let pId = targetNode.parentId;
      while (pId) {
        parentsToExpand.add(pId);
        const pNode = nodes.find((n) => n.id === pId) || storeNodes.find((n) => n.id === pId);
        pId = pNode?.parentId;
      }

      if (parentsToExpand.size > 0) {
        (async () => {
          const updatedNodes = nodes.map((n) => {
            if (parentsToExpand.has(n.id) && n.type === 'folderGroupNode') {
              return { ...n, data: { ...n.data, isExpanded: true } };
            }
            return n;
          });
          const processedEdges = deduplicateAndFilterEdges(edges);
          const relayouted = await layoutGraph(updatedNodes, processedEdges, layoutDirection);
          setNodes(relayouted);

          setTimeout(() => {
            reactFlowInstance.fitView({ nodes: [{ id: targetNode.id }], padding: 0.8, maxZoom: 0.85, duration: 600 });
          }, 100);
        })();
      } else {
        reactFlowInstance.fitView({ nodes: [{ id: targetNode.id }], padding: 0.8, maxZoom: 0.85, duration: 600 });
      }
    }
  }, [focusRequestTime, focusTargetNodeId, storeNodes, nodes, edges, layoutDirection, setNodes, setSelectedNodeId, reactFlowInstance]);

  const toggleLayoutDirection = useCallback(async () => {
    const nextDir = layoutDirection === 'RIGHT' ? 'DOWN' : 'RIGHT';
    setLayoutDirection(nextDir);
    const processedEdges = deduplicateAndFilterEdges(edges);
    const relayouted = await layoutGraph(nodes, processedEdges, nextDir);
    setNodes(relayouted);
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.3, maxZoom: 0.9, duration: 500 });
    }
  }, [layoutDirection, nodes, edges, setNodes, reactFlowInstance]);

  const onNodeDoubleClick = useCallback(
    async (_: React.MouseEvent, node: Node) => {
      if (node.type === 'folderGroupNode') {
        const updatedNodes = nodes.map((n) => {
          if (n.id === node.id) {
            return {
              ...n,
              data: {
                ...n.data,
                isExpanded: !Boolean(n.data?.isExpanded),
              },
            };
          }
          return n;
        });
        const processedEdges = deduplicateAndFilterEdges(edges);
        const relayouted = await layoutGraph(updatedNodes, processedEdges, layoutDirection);
        setNodes(relayouted);
      }
    },
    [nodes, edges, layoutDirection, setNodes]
  );

  const handleCollapseAll = useCallback(async () => {
    const resetNodes = nodes.map((n) => {
      if (n.type === 'folderGroupNode') {
        return {
          ...n,
          data: {
            ...n.data,
            isExpanded: false,
          },
        };
      }
      return n;
    });
    const processedEdges = deduplicateAndFilterEdges(edges);
    const relayouted = await layoutGraph(resetNodes, processedEdges, layoutDirection);
    setNodes(relayouted);
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.3, maxZoom: 0.9, duration: 400 });
    }
  }, [nodes, edges, layoutDirection, setNodes, reactFlowInstance]);

  const activeFocusNodeId = hoveredNodeId || selectedNodeId;

  const connectedNodeIds = useMemo(() => {
    if (!activeFocusNodeId) return new Set<string>();
    const neighbors = new Set<string>([activeFocusNodeId]);
    edges.forEach((edge) => {
      if (edge.source === activeFocusNodeId) neighbors.add(edge.target);
      if (edge.target === activeFocusNodeId) neighbors.add(edge.source);
    });
    return neighbors;
  }, [activeFocusNodeId, edges]);

  const selectedBreadcrumbs = useMemo(() => {
    if (!selectedNodeId) return null;
    const selectedNode = nodes.find((n) => n.id === selectedNodeId);
    if (!selectedNode) return null;

    const pathParts: string[] = [(selectedNode.data?.label as string) || selectedNode.id];
    let parentId = selectedNode.parentId;
    while (parentId) {
      const parentNode = nodes.find((n) => n.id === parentId);
      if (parentNode) {
        pathParts.unshift((parentNode.data?.label as string) || parentNode.id);
        parentId = parentNode.parentId;
      } else {
        break;
      }
    }
    pathParts.unshift('Root');
    return pathParts.join(' / ');
  }, [selectedNodeId, nodes]);

  const styledEdges = useMemo(() => {
    return edges.map((edge) => {
      const count = (edge.data?.count as number) || 1;
      const isConnectedToFocus = activeFocusNodeId
        ? edge.source === activeFocusNodeId || edge.target === activeFocusNodeId
        : false;

      const isConnectedToNeighbor = activeFocusNodeId
        ? connectedNodeIds.has(edge.source) && connectedNodeIds.has(edge.target)
        : false;

      const isHighlighted = isConnectedToFocus || edge.id === hoveredEdgeId;
      const isDimmed = activeFocusNodeId && !isConnectedToFocus && !isConnectedToNeighbor;

      const displayLabel = isHighlighted || isConnectedToNeighbor
        ? count > 1
          ? `x${count}`
          : (edge.label as string) || (edge.data?.label as string) || undefined
        : undefined;

      return {
        ...edge,
        type: 'smoothstep',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isHighlighted ? '#22d3ee' : isDimmed ? '#27272a' : '#52525b',
          width: 14,
          height: 14,
        },
        label: displayLabel,
        labelShowBg: false,
        labelStyle: {
          fill: '#e4e4e7',
          fontSize: 10,
          fontFamily: 'monospace',
          fontWeight: 600,
        },
        style: {
          stroke: isHighlighted ? '#22d3ee' : isDimmed ? '#27272a' : '#52525b',
          strokeWidth: isHighlighted ? 2 : 1,
          opacity: isDimmed ? 0.1 : isHighlighted ? 1 : 0.4,
        },
      };
    });
  }, [edges, activeFocusNodeId, connectedNodeIds, hoveredEdgeId]);

  const availableCategories = useMemo(() => {
    const catsSet = new Set<string>();
    nodes.forEach((n) => {
      const cat = ((n as any).category as string) || (n.data?.category as string);
      if (cat) catsSet.add(cat);
    });
    return Array.from(catsSet).sort();
  }, [nodes]);

  const filterOptions = useMemo(() => {
    return ['All', ...availableCategories];
  }, [availableCategories]);

  const filteredNodes = useMemo(() => {
    return nodes
      .filter((node) => {
        const cat = ((node as any).category as string) || (node.data?.category as string) || 'Core';

        const matchesSearch =
          searchQuery === '' ||
          (node.data?.label as string)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (node.data?.details as string)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (node.data?.file as string)?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCat =
          filterCategory === 'All' ||
          filterCategory === 'all' ||
          cat.toLowerCase() === filterCategory.toLowerCase();

        return matchesSearch && matchesCat;
      })
      .map((node) => {
        const isDimmed = activeFocusNodeId && !connectedNodeIds.has(node.id);
        return {
          ...node,
          style: {
            ...node.style,
            opacity: isDimmed ? 0.2 : 1,
            filter: isDimmed ? 'grayscale(40%)' : 'none',
            transition: 'opacity 0.2s ease, filter 0.2s ease',
          },
        };
      });
  }, [nodes, searchQuery, filterCategory, activeFocusNodeId, connectedNodeIds]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id);
      if (reactFlowInstance) {
        reactFlowInstance.fitView({ nodes: [{ id: node.id }], padding: 0.8, maxZoom: 0.85, duration: 600 });
      }
    },
    [setSelectedNodeId, reactFlowInstance]
  );

  return (
    <div className="relative w-full h-full bg-[#09090b] overflow-hidden flex flex-col font-sans select-none">
      {/* Minimalist Search & Filter Toolbar */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2">
        <div className="relative bg-[#121215] rounded-lg px-2.5 py-1.5 flex items-center gap-2 border border-zinc-800">
          <Search className="w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search AST nodes, files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-zinc-200 focus:outline-none w-48 placeholder-zinc-600 font-mono"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-zinc-500 hover:text-zinc-300">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Dynamic Category Filters */}
        <div className="bg-[#121215] rounded-lg p-1 flex items-center gap-1 border border-zinc-800 text-xs">
          <Filter className="w-3 h-3 text-zinc-500 ml-1" />
          {filterOptions.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                filterCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-zinc-800 text-zinc-100 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Layout Direction Toggle Button */}
        <button
          onClick={toggleLayoutDirection}
          className="px-2.5 py-1.5 rounded-lg bg-[#121215] border border-zinc-800 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 hover:bg-zinc-800 transition flex items-center gap-1 cursor-pointer"
          title="Toggle layout direction between Left-to-Right and Top-to-Bottom"
        >
          <span>Layout: {layoutDirection === 'RIGHT' ? 'L → R' : 'T ↓ B'}</span>
        </button>

        {/* Collapse All Folders Button */}
        <button
          onClick={handleCollapseAll}
          className="px-2.5 py-1.5 rounded-lg bg-[#121215] border border-zinc-800 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 hover:bg-zinc-800 transition flex items-center gap-1.5 cursor-pointer"
          title="Collapse all expanded folders back to overview"
        >
          <FolderTree className="w-3.5 h-3.5 text-cyan-400" />
          <span>Collapse All</span>
        </button>

        {/* Selected Scope Breadcrumb */}
        {selectedBreadcrumbs && (
          <div className="px-2.5 py-1.5 rounded-lg bg-[#121215]/90 border border-cyan-900/60 text-[11px] font-mono text-cyan-300 backdrop-blur-md flex items-center gap-1">
            <span className="text-zinc-500">Scope:</span>
            <span className="font-semibold">{selectedBreadcrumbs}</span>
          </div>
        )}
      </div>

      {/* Category Legend Overlay */}
      {availableCategories.length > 0 && (
        <div className="absolute top-14 left-3 z-20 bg-[#121215]/95 border border-zinc-800/90 rounded-lg px-3 py-1.5 shadow-xl backdrop-blur-md flex items-center gap-3 text-xs font-mono select-none">
          <span className="text-zinc-500 font-semibold text-[10px] uppercase">Legend:</span>
          {availableCategories.map((cat) => (
            <div key={cat} className="flex items-center gap-1.5 text-[11px] text-zinc-300">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: getCategoryColor(cat) }}
              />
              <span>{cat}</span>
            </div>
          ))}
        </div>
      )}

      {/* React Flow Viewport */}
      <div className="w-full h-full flex-1">
        <ReactFlow
          nodes={filteredNodes}
          edges={styledEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onNodeDoubleClick={onNodeDoubleClick}
          onEdgeMouseEnter={(_e, edge) => setHoveredEdgeId(edge.id)}
          onEdgeMouseLeave={() => setHoveredEdgeId(null)}
          nodeTypes={nodeTypes}
          onlyRenderVisibleElements={true}
          proOptions={{ hideAttribution: true }}
          className="bg-[#09090b]"
        >
          <Background variant={BackgroundVariant.Dots} gap={24} color="#27272a" size={1} />
          <Controls className="!bg-[#121215] !border !border-zinc-800 !rounded-lg overflow-hidden !fill-zinc-400" />
        </ReactFlow>
      </div>

      {/* Git Time-Travel Timeline Slider (Positioned cleanly in bottom middle) */}
      {commitHistory.length > 0 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 w-80 sm:w-96 max-w-md bg-[#121215]/95 border border-zinc-800/90 rounded-2xl px-4 py-2 shadow-2xl backdrop-blur-md flex flex-col gap-1 font-sans">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-1.5 text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-semibold text-zinc-100 text-[11px]">Git Time-Travel</span>
              <span className="px-1.5 py-0.2 rounded bg-zinc-900 text-cyan-300 border border-zinc-800 text-[10px]">
                Commit {selectedCommitIndex + 1}/{commitHistory.length}
              </span>
            </div>
            <div className="text-[10px] text-zinc-400 truncate max-w-[180px]">
              <span className="text-zinc-200 font-semibold">{commitHistory[selectedCommitIndex]?.hash}</span>: {commitHistory[selectedCommitIndex]?.message}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-zinc-500 shrink-0">Older</span>
            <input
              type="range"
              min={0}
              max={commitHistory.length - 1}
              step={1}
              value={selectedCommitIndex}
              onChange={(e) => setCommitIndex(Number(e.target.value))}
              className="w-full accent-cyan-400 bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] font-mono text-cyan-400 shrink-0 font-semibold">Latest</span>
          </div>
        </div>
      )}

      {/* Bottom Bar Zoom Controls */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2">
        <div className="bg-[#121215] rounded-lg p-1 flex items-center gap-1 border border-zinc-800 text-xs font-mono">
          <button
            onClick={() => reactFlowInstance?.zoomIn()}
            className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition cursor-pointer"
            title="Zoom In"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => reactFlowInstance?.zoomOut()}
            className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition cursor-pointer"
            title="Zoom Out"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => reactFlowInstance?.fitView({ padding: 0.3, maxZoom: 0.9, duration: 500 })}
            className="px-2 py-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition flex items-center gap-1 text-[11px] cursor-pointer"
            title="Fit to Screen"
          >
            <Maximize2 className="w-3 h-3" />
            <span>Fit View</span>
          </button>
        </div>
      </div>

      {/* Floating Half-Sized Chatbox Drawer (Positioned at Bottom Right with AST Details on Top) */}
      {selectedNodeId && (
        <NodeInspectorSlideOver
          selectedNodeId={selectedNodeId}
          nodes={nodes}
          edges={edges}
          onClose={() => setSelectedNodeId(null)}
        />
      )}
    </div>
  );
}

function NodeInspectorSlideOver({
  selectedNodeId,
  nodes,
  edges,
  onClose,
}: {
  selectedNodeId: string;
  nodes: Node[];
  edges: any[];
  onClose: () => void;
}) {
  const { fetchLLMCompletion, llmCache } = useDevExStore();
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const selectedNodeData = selectedNode?.data;

  const incomingEdges = edges.filter((e) => e.target === selectedNodeId);
  const outgoingEdges = edges.filter((e) => e.source === selectedNodeId);

  const cacheKey = `node_inspector:${selectedNodeId}`;
  const cachedSummary = llmCache[cacheKey];

  const [summaryText, setSummaryText] = useState<string>(cachedSummary || '');
  const [isLoading, setIsLoading] = useState<boolean>(!cachedSummary);

  useEffect(() => {
    if (cachedSummary) {
      setSummaryText(cachedSummary);
      setIsLoading(false);
      return;
    }

    let isSubscribed = true;
    setIsLoading(true);

    fetchLLMCompletion({
      task: 'node_inspector',
      symbolId: selectedNodeId,
      input: {
        nodeTitle: (selectedNodeData?.label as string) || selectedNodeId,
        nodeFile: (selectedNodeData?.file as string) || 'source file',
        incomingEdgesCount: incomingEdges.length,
        outgoingEdgesCount: outgoingEdges.length,
      },
    }).then((resText) => {
      if (isSubscribed) {
        setSummaryText(resText);
        setIsLoading(false);
      }
    });

    return () => {
      isSubscribed = false;
    };
  }, [selectedNodeId, selectedNodeData, incomingEdges.length, outgoingEdges.length, cachedSummary, fetchLLMCompletion]);

  if (!selectedNodeData) return null;

  return (
    <div className="absolute bottom-3 right-3 top-auto z-30 w-72 sm:w-80 max-w-[285px] max-h-[52%] bg-[#0e0e12]/95 backdrop-blur-2xl border border-zinc-800 rounded-2xl p-3.5 font-sans flex flex-col justify-between shadow-2xl overflow-y-auto animate-slideInRight select-none">
      <div className="space-y-3">
        {/* Header Title & Close Button */}
        <div className="flex items-start justify-between border-b border-zinc-800/80 pb-2">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="truncate">
              <h4 className="text-xs font-semibold text-zinc-100 truncate">
                {selectedNodeData.label as string}
              </h4>
              <p className="text-[10px] text-zinc-400 font-mono truncate max-w-[190px]">
                {selectedNodeData.file as string}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
            title="Close Drawer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* AST DETAILS BOX (MOVED TO TOP RIGHT UNDER HEADER) */}
        <div className="space-y-1">
          <span className="text-[9px] text-zinc-500 font-mono uppercase font-semibold">AST Details</span>
          <p className="text-[11px] text-zinc-300 leading-relaxed bg-[#050507] p-2.5 rounded-lg border border-zinc-800 font-mono">
            {selectedNodeData.details as string}
          </p>
        </div>

        {/* Dependency Edge Metric Counts */}
        <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
          <div className="p-2 rounded-lg bg-[#050507] border border-zinc-800 flex items-center justify-between">
            <span className="text-zinc-500 text-[9px]">Incoming Edges</span>
            <span className="text-cyan-400 font-bold">{incomingEdges.length}</span>
          </div>
          <div className="p-2 rounded-lg bg-[#050507] border border-zinc-800 flex items-center justify-between">
            <span className="text-zinc-500 text-[9px]">Outgoing Edges</span>
            <span className="text-emerald-400 font-bold">{outgoingEdges.length}</span>
          </div>
        </div>

        {/* Ollama Streamed Architectural Summary */}
        <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono text-cyan-400 font-semibold flex items-center gap-1">
              <Bot className="w-3 h-3 text-cyan-400" />
              <span>Architectural Summary</span>
            </span>
            <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              Cached
            </span>
          </div>

          {isLoading ? (
            <div className="p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-900/40 space-y-1.5">
              <div className="flex items-center gap-1.5 text-zinc-500 font-mono text-[10px] animate-pulse">
                <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" />
                <span>Evaluating role...</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded w-5/6 animate-pulse" />
              <div className="h-2 bg-zinc-800 rounded w-3/4 animate-pulse" />
            </div>
          ) : (
            <div className="p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-900/40 text-[11px] text-cyan-100 font-mono leading-relaxed">
              {summaryText}
            </div>
          )}
        </div>

        {/* Configured Env Vars */}
        {Array.isArray(selectedNodeData.envVars) && selectedNodeData.envVars.length > 0 && (
          <div className="space-y-1">
            <span className="text-[9px] text-zinc-500 font-mono">Configured Env Vars:</span>
            <div className="flex flex-wrap gap-1">
              {(selectedNodeData.envVars as string[]).map((v) => (
                <span
                  key={v}
                  className="px-1.5 py-0.5 rounded bg-[#050507] text-[9px] text-zinc-300 font-mono border border-zinc-800 flex items-center gap-1"
                >
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                  {v}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-500 mt-2">
        <span className="truncate max-w-[160px]">ID: {selectedNodeId}</span>
        <button
          onClick={onClose}
          className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition text-[11px] font-semibold cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function MacroViewCanvas() {
  return (
    <ReactFlowProvider>
      <MacroViewCanvasContent />
    </ReactFlowProvider>
  );
}
