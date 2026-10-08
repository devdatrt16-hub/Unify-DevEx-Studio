'use client';

import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Box, Globe, Database, FileCode, Coffee, FileText, Terminal, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useDevExStore } from '@/store/useDevExStore';

export const CATEGORY_BORDER_COLORS: Record<string, string> = {
  CI: 'border-l-pink-500',
  Docs: 'border-l-cyan-500',
  Tests: 'border-l-amber-500',
  Core: 'border-l-blue-500',
  Config: 'border-l-purple-500',
  'Legacy/External': 'border-l-slate-500',
  Entry: 'border-l-emerald-500',
};

export function getCategoryBorderClass(category?: string): string {
  if (!category) return 'border-l-blue-500';
  return CATEGORY_BORDER_COLORS[category] || 'border-l-blue-500';
}

// Common Ultra-Minimalist Custom Node Wrapper
const BaseNode = memo(({
  id,
  data,
  selected,
  icon: Icon,
  typeBadge,
  badgeColor = 'border-zinc-700 text-zinc-400 bg-zinc-800/80',
}: {
  id: string;
  data: any;
  selected?: boolean;
  icon: React.ElementType;
  typeBadge: string;
  badgeColor?: string;
}) => {
  const selectedNodeId = useDevExStore((s) => s.selectedNodeId);
  const setHoveredNodeId = useDevExStore((s) => s.setHoveredNodeId);
  const riskOverlayActive = useDevExStore((s) => s.riskOverlayActive);
  const blameData = useDevExStore((s) => s.blameData);
  const [isHoveredLocal, setIsHoveredLocal] = useState(false);

  const isSelected = selectedNodeId === id || selected;
  const filePath = (data.file as string) || '';
  const fileBlame = blameData[filePath] || blameData[filePath.split('/').pop() || ''];
  const category = (data.category as string) || typeBadge;
  const isLegacy = Boolean(data.legacy) || category === 'Legacy/External';
  const isAbandoned = riskOverlayActive && (fileBlame?.isAbandoned || fileBlame?.author === 'unknown' || data.isAbandoned || isLegacy);

  const importance = Number(data.importance) || 0.5;
  const scaleFactor = Math.min(Math.max(0.9 + importance * 0.35, 0.9), 1.25);
  const dynamicWidth = Math.round(208 * scaleFactor);

  const leftBorderClass = getCategoryBorderClass(category);

  let borderClasses = 'border-zinc-800/90 text-zinc-300 hover:border-zinc-500 hover:bg-[#121216]';
  if (isSelected) {
    borderClasses = 'border-cyan-400 bg-[#141419] text-zinc-100 shadow-xl shadow-cyan-950/40 ring-2 ring-cyan-500/50';
  } else if (isAbandoned) {
    borderClasses = 'border-amber-500/80 bg-amber-950/20 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.3)] ring-1 ring-amber-500/50';
  }

  return (
    <div
      onMouseEnter={() => {
        setIsHoveredLocal(true);
        setHoveredNodeId(id);
      }}
      onMouseLeave={() => {
        setIsHoveredLocal(false);
        setHoveredNodeId(null);
      }}
      style={{ width: `${dynamicWidth}px` }}
      className={`relative px-3 py-2.5 rounded-xl border border-l-4 transition-all duration-200 font-sans text-xs bg-[#0d0d11]/95 backdrop-blur-sm cursor-pointer select-none ${leftBorderClass} ${borderClasses} ${
        isLegacy ? 'opacity-70 grayscale-[25%]' : ''
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-cyan-500 !w-2 !h-2 !border-0"
      />

      <div className="flex items-center justify-between gap-1.5 mb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <Icon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span className="font-semibold text-zinc-100 truncate text-xs">
            {data.label as string}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {isAbandoned && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="High Risk / Legacy Node" />
          )}
          <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-semibold ${badgeColor}`}>
            {category}
          </span>
        </div>
      </div>

      {isAbandoned && riskOverlayActive && (
        <div className="mt-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-mono flex items-center justify-between">
          <span className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>Risk File</span>
          </span>
          <span>{fileBlame?.lastEditDate || '>1yr'}</span>
        </div>
      )}

      <div className="mt-1.5 pt-1.5 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
        <span className="truncate max-w-[130px] text-zinc-400">{data.file as string}</span>
        {Boolean(data.lineCount) && <span className="text-zinc-400 font-semibold">{data.lineCount}L</span>}
      </div>

      {/* Hover Tooltip Popover */}
      {isHoveredLocal && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2.5 w-64 p-3 rounded-xl bg-[#09090d]/98 border border-zinc-700/80 shadow-2xl text-zinc-200 z-50 pointer-events-none animate-fadeIn backdrop-blur-xl">
          <div className="flex items-center justify-between mb-1.5 text-[10px] font-mono text-zinc-400 border-b border-zinc-800 pb-1">
            <span className="font-semibold text-cyan-400 truncate max-w-[150px]">{data.label as string}</span>
            <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
              Rank: {(importance * 100).toFixed(0)}%
            </span>
          </div>
          <p className="text-[11px] font-mono text-zinc-300 leading-relaxed line-clamp-3">
            {(data.details as string) || (data.description as string) || 'AST component symbol node.'}
          </p>
          <div className="mt-2 pt-1 border-t border-zinc-800/80 flex items-center justify-between text-[9px] font-mono text-zinc-500">
            <span>Category: {category}</span>
            {Boolean(data.lineCount) && <span>{data.lineCount} Lines</span>}
          </div>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-cyan-500 !w-2 !h-2 !border-0"
      />
    </div>
  );
});
BaseNode.displayName = 'BaseNode';

export const ComponentNode = memo((props: NodeProps) => (
  <BaseNode {...props} icon={Box} typeBadge="UI" badgeColor="border-purple-500/30 text-purple-300 bg-purple-500/10" />
));
ComponentNode.displayName = 'ComponentNode';

export const ApiRouteNode = memo((props: NodeProps) => (
  <BaseNode {...props} icon={Globe} typeBadge={(props.data.method as string) || 'API'} badgeColor="border-cyan-500/30 text-cyan-300 bg-cyan-500/10" />
));
ApiRouteNode.displayName = 'ApiRouteNode';

export const StateStoreNode = memo((props: NodeProps) => (
  <BaseNode {...props} icon={Database} typeBadge="Store" badgeColor="border-emerald-500/30 text-emerald-300 bg-emerald-500/10" />
));
StateStoreNode.displayName = 'StateStoreNode';

export const ConfigNode = memo((props: NodeProps) => (
  <BaseNode {...props} icon={FileCode} typeBadge="Config" badgeColor="border-amber-500/30 text-amber-300 bg-amber-500/10" />
));
ConfigNode.displayName = 'ConfigNode';

export const JavaClassNode = memo((props: NodeProps) => (
  <BaseNode {...props} icon={Coffee} typeBadge="AST" badgeColor="border-blue-500/30 text-blue-300 bg-blue-500/10" />
));
JavaClassNode.displayName = 'JavaClassNode';

export const FolderGroupNode = memo((props: NodeProps) => {
  const { id, data, selected } = props;
  const setHoveredNodeId = useDevExStore((s) => s.setHoveredNodeId);
  const selectedNodeId = useDevExStore((s) => s.selectedNodeId);

  const isSelected = selectedNodeId === id || selected;
  const isExpanded = Boolean(data.isExpanded);
  const childCount = (data.childCount as number) || 0;

  return (
    <div
      onMouseEnter={() => setHoveredNodeId(id)}
      onMouseLeave={() => setHoveredNodeId(null)}
      className={`relative w-full h-full rounded-2xl border border-l-4 transition-all duration-200 font-sans text-xs select-none backdrop-blur-md cursor-pointer ${
        isExpanded
          ? 'bg-[#0b0b0f]/60 border-cyan-900/60 border-l-cyan-400 shadow-2xl ring-1 ring-cyan-500/20'
          : isSelected
          ? 'bg-[#121217] border-cyan-400/80 border-l-cyan-400 shadow-lg text-white'
          : 'bg-[#0f0f13]/90 border-zinc-800 border-l-cyan-500/80 text-zinc-200 hover:border-zinc-700 hover:bg-[#14141a]'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-cyan-500 !w-2.5 !h-2.5 !border-0"
      />
      {/* Group Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-zinc-800/80 bg-[#0e0e12]/80 rounded-t-2xl">
        <div className="flex items-center gap-2 min-w-0">
          <Box className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="font-bold text-zinc-100 text-xs font-mono truncate">
            {data.label as string}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold">
            {childCount} items
          </span>
        </div>
      </div>

      {!isExpanded && (
        <div className="p-3 text-[11px] text-zinc-400 font-mono space-y-1">
          <p className="truncate text-zinc-300">{(data.details as string) || 'Double-click to expand folder contents'}</p>
          <div className="flex items-center justify-between text-[10px] text-zinc-500">
            <span>{(data.file as string) || (data.path as string)}</span>
            <span className="text-cyan-400/80 font-semibold">Double-click ↵</span>
          </div>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-cyan-500 !w-2.5 !h-2.5 !border-0"
      />
    </div>
  );
});
FolderGroupNode.displayName = 'FolderGroupNode';

