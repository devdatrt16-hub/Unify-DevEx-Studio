'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  TableProperties,
  GitFork,
  Filter,
  Sparkles,
  Bot,
} from 'lucide-react';
import { useDevExStore } from '@/store/useDevExStore';

interface BusinessRule {
  id: string;
  name: string;
  module: string;
  condition: string;
  action: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

function PolicyCell({ rule }: { rule: BusinessRule }) {
  const { fetchLLMCompletion, llmCache } = useDevExStore();
  const cacheKey = `policy:${rule.id}`;
  const cachedPolicy = llmCache[cacheKey];

  const [policyText, setPolicyText] = useState<string>(cachedPolicy || '');
  const [isLoading, setIsLoading] = useState<boolean>(!cachedPolicy);

  useEffect(() => {
    if (cachedPolicy) {
      setPolicyText(cachedPolicy);
      setIsLoading(false);
      return;
    }

    let isSubscribed = true;
    setIsLoading(true);

    fetchLLMCompletion({
      task: 'policy',
      symbolId: rule.id,
      input: {
        condition: rule.condition,
        consequence: rule.action,
      },
    }).then((resText) => {
      if (isSubscribed) {
        setPolicyText(resText);
        setIsLoading(false);
      }
    });

    return () => {
      isSubscribed = false;
    };
  }, [rule.id, rule.condition, rule.action, cachedPolicy, fetchLLMCompletion]);

  return (
    <div className="py-2.5 px-4 bg-[#08080b]/90 border-t border-zinc-800/60 font-sans text-xs">
      <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 font-semibold mb-1">
        <Bot className="w-3.5 h-3.5 text-cyan-400" />
        <span>Active Policy Definition (Qwen 2.5)</span>
      </div>
      {isLoading ? (
        <div className="flex items-center gap-2 text-zinc-500 font-mono text-[11px] animate-pulse">
          <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" />
          <span>Translating AST conditional logic to stakeholder policy...</span>
        </div>
      ) : (
        <p className="text-[11px] text-cyan-100/90 leading-relaxed font-mono bg-cyan-950/20 p-2 rounded border border-cyan-900/40">
          {policyText}
        </p>
      )}
    </div>
  );
}

export default function BusinessRulesTab() {
  const { businessRules } = useDevExStore();
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const rulesList = businessRules || [];
  const filteredRules = rulesList.filter(
    (rule) => filterSeverity === 'ALL' || rule.severity === filterSeverity
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
      className="w-full h-full p-6 md:p-8 overflow-y-auto bg-[#050507] text-zinc-100 font-sans space-y-6 select-none"
    >
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-[#0e0e12] border border-zinc-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
            <span>Extracted Business Rules & Invariants</span>
          </div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">
            Codebase Domain Logic Matrix
          </h2>
          <p className="text-xs text-zinc-400">
            Core logic conditions, validation constraints, and architectural invariants driving the system.
          </p>
        </div>

        {/* Severity Filter Controls */}
        <div className="flex items-center gap-1 bg-[#050507] p-1 rounded-lg border border-zinc-800 self-start md:self-auto">
          <Filter className="w-3 h-3 text-zinc-500 ml-1.5" />
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-colors ${
                filterSeverity === sev
                  ? 'bg-zinc-100 text-zinc-950 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Structured Business Rule Table */}
      <div className="rounded-xl bg-[#0e0e12] border border-zinc-800 overflow-hidden">
        <div className="px-4 py-3 bg-[#08080b] border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-zinc-200 font-mono flex items-center gap-2">
            <TableProperties className="w-3.5 h-3.5 text-zinc-400" />
            Domain Validation Rules ({filteredRules.length})
          </h3>
        </div>
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="bg-[#0e0e12] text-zinc-400 font-mono border-b border-zinc-800 text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-4">Rule ID</th>
                <th className="py-2.5 px-4">Module Target</th>
                <th className="py-2.5 px-4">Condition Trigger</th>
                <th className="py-2.5 px-4">System Action</th>
                <th className="py-2.5 px-4">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {filteredRules.map((rule) => (
                <React.Fragment key={rule.id}>
                  <tr className="hover:bg-zinc-850/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-zinc-200">{rule.id}</td>
                    <td className="py-3 px-4 font-mono text-zinc-400">{rule.module}</td>
                    <td className="py-3 px-4 text-zinc-300 max-w-xs leading-normal">{rule.condition}</td>
                    <td className="py-3 px-4 text-zinc-400 max-w-xs leading-normal">{rule.action}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {rule.severity}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={5} className="p-0">
                      <PolicyCell rule={rule} />
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

      {/* Logic Flowchart Section */}
      <div className="p-5 rounded-xl bg-[#0e0e12] border border-zinc-800 space-y-3">
        <h3 className="text-xs font-bold text-zinc-200 flex items-center gap-2">
          <GitFork className="w-3.5 h-3.5 text-zinc-400" />
          Ingestion & Validation Pipeline Flowchart
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 font-mono text-xs">
          <div className="p-3.5 rounded-lg bg-[#050507] border border-zinc-800 space-y-1">
            <span className="text-[10px] text-zinc-400 font-semibold uppercase">Step 1 • Ingestion</span>
            <h4 className="font-semibold text-zinc-200 text-xs">Verify Repo Link</h4>
            <p className="text-[11px] text-zinc-400 font-sans leading-normal">OAuth scope check & in-memory clone.</p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#050507] border border-zinc-800 space-y-1">
            <span className="text-[10px] text-zinc-400 font-semibold uppercase">Step 2 • AST Parse</span>
            <h4 className="font-semibold text-zinc-200 text-xs">Tree-sitter JNI</h4>
            <p className="text-[11px] text-zinc-400 font-sans leading-normal">Symbol reference & DAG extraction.</p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#050507] border border-zinc-800 space-y-1">
            <span className="text-[10px] text-zinc-400 font-semibold uppercase">Step 3 • Sub-Graph</span>
            <h4 className="font-semibold text-zinc-200 text-xs">Tiktoken Chunker</h4>
            <p className="text-[11px] text-zinc-400 font-sans leading-normal">Context window capped at &lt;4,000 tokens.</p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#050507] border border-zinc-800 space-y-1">
            <span className="text-[10px] text-zinc-400 font-semibold uppercase">Step 4 • Sync</span>
            <h4 className="font-semibold text-zinc-200 text-xs">Dual-Pane Sync</h4>
            <p className="text-[11px] text-zinc-400 font-sans leading-normal">Synchronize canvas & reader walkthrough.</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
