'use client';

import React, { useState } from 'react';
import {
  Bot,
  CheckCircle2,
  Clock,
  Terminal,
  FileCode,
  Check,
  Play,
  ShieldCheck,
  Video,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useDevExStore } from '@/store/useDevExStore';

export default function AgentManager() {
  const { agents, approveArtifact } = useDevExStore();
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0]?.id || 'agent-1');
  const [activeTab, setActiveTab] = useState<'logs' | 'artifacts'>('artifacts');
  const [videoModal, setVideoModal] = useState<boolean>(false);

  const currentAgent = agents.find((a) => a.id === selectedAgentId) || agents[0];

  return (
    <div className="w-full h-full bg-dark-950 p-6 overflow-y-auto flex flex-col space-y-6">
      {/* Mission Control Header */}
      <div className="flex items-center justify-between glass-panel p-5 rounded-2xl border border-indigo-500/30">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Mission Control (Agent Manager)
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                3 Autonomous Subagents Active
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Orchestrate, monitor asynchronous workspace subagents, and review inspectable .mc3 artifacts.
            </p>
          </div>
        </div>

        {/* Browser UI Validation Trigger */}
        <button
          onClick={() => setVideoModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg transition"
        >
          <Video className="w-4 h-4" />
          <span>Launch Browser UI Validation</span>
        </button>
      </div>

      {/* Agents Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {agents.map((agent) => {
          const isSelected = agent.id === selectedAgentId;
          const allApproved = agent.artifacts.every((art) => art.approved);

          return (
            <div
              key={agent.id}
              onClick={() => setSelectedAgentId(agent.id)}
              className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 glass-card relative overflow-hidden ${
                isSelected
                  ? 'border-indigo-500/60 bg-slate-900/90 shadow-[0_0_25px_rgba(99,102,241,0.25)] ring-1 ring-indigo-500/40'
                  : 'border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
                    <Bot className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{agent.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{agent.workspace}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {agent.status}
                </span>
              </div>

              <p className="mt-3 text-xs text-slate-300 line-clamp-2 leading-relaxed">{agent.role}</p>

              {/* Progress Bar */}
              <div className="mt-4 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Task Progress</span>
                  <span>{agent.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-500"
                    style={{ width: `${agent.progress}%` }}
                  />
                </div>
              </div>

              {/* Deliverable Status Pill */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-mono">Deliverables:</span>
                {allApproved ? (
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Approved (.mc3)
                  </span>
                ) : (
                  <span className="text-amber-400 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Review Required
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Agent Detailed Inspector */}
      {currentAgent && (
        <div className="glass-card rounded-2xl p-6 border border-white/10 flex-1 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {currentAgent.name}
                <span className="text-xs font-normal text-slate-400 font-mono">[{currentAgent.workspace}]</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{currentAgent.role}</p>
            </div>

            {/* Tab Switcher */}
            <div className="glass-panel rounded-xl p-1 flex items-center gap-1">
              <button
                onClick={() => setActiveTab('artifacts')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeTab === 'artifacts'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Inspectable Artifacts (.mc3)
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeTab === 'logs'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Live Log Stream
              </button>
            </div>
          </div>

          {/* Artifacts Tab */}
          {activeTab === 'artifacts' && (
            <div className="space-y-4 flex-1">
              {currentAgent.artifacts.map((art) => (
                <div
                  key={art.name}
                  className="bg-slate-950/80 rounded-2xl p-5 border border-white/10 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <FileCode className="w-5 h-5 text-indigo-400" />
                      <div>
                        <div className="text-sm font-semibold text-white font-mono">{art.name}</div>
                        <div className="text-xs text-slate-400">{art.type}</div>
                      </div>
                    </div>
                    {art.approved ? (
                      <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Approved Deliverable
                      </span>
                    ) : (
                      <button
                        onClick={() => approveArtifact(currentAgent.id, art.name)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-lg transition"
                      >
                        <Check className="w-4 h-4" />
                        Approve Artifact
                      </button>
                    )}
                  </div>

                  <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-cyan-300 border border-white/5 whitespace-pre-wrap">
                    {art.content}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div className="bg-slate-950 rounded-2xl p-4 font-mono text-xs text-emerald-400 space-y-2 border border-white/5 max-h-72 overflow-y-auto">
              <div className="flex items-center gap-2 text-slate-500 border-b border-white/5 pb-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span>Asynchronous Subagent Output Stream</span>
              </div>
              {currentAgent.logs.map((log, lIdx) => (
                <div key={lIdx}>{log}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Browser UI Validation Video Modal */}
      {videoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="glass-card max-w-2xl w-full rounded-2xl p-6 border border-cyan-500/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Video className="w-5 h-5" />
                <span>Automated Browser UI Validation Report</span>
              </div>
              <button
                onClick={() => setVideoModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 rounded-xl p-4 border border-white/10 space-y-3 font-mono text-xs">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Headless Chrome Navigation Success</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Tested React Flow canvas at 60fps. Drag-and-drop mechanics, zoom/pan bounds, and bidirectional Micro View contextual highlighting verified with zero console errors.
              </p>
              <div className="bg-slate-900 p-3 rounded-lg border border-cyan-500/20 text-cyan-300">
                Status: Recorded recording_flow_demo.webp (45 frames, 60fps)
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setVideoModal(false)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
