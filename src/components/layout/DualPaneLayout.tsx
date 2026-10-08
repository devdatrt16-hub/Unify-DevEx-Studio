'use client';

import React from 'react';
import { motion } from 'framer-motion';
import SegmentedNav from './SegmentedNav';
import ResizableSplitPane from './ResizableSplitPane';
import MacroViewContainer from '../macro/MacroViewContainer';
import MicroViewGuide from '../micro/MicroViewGuide';
import AgentManager from '../mission-control/AgentManager';
import LandingPromptBar from '../chat/LandingPromptBar';
import SideRays from '../effects/SideRays';
import LoadingTransitionOverlay from '../effects/LoadingTransitionOverlay';
import FadeContent from '../effects/FadeContent';
import { useDevExStore } from '@/store/useDevExStore';

export default function DualPaneLayout() {
  const { viewMode, isAnalyzing, isChatDocked, autoFocusFile } = useDevExStore();

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'FOCUS_FILE' && event.data?.file) {
        autoFocusFile(event.data.file);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [autoFocusFile]);

  return (
    <div className="w-screen h-screen flex flex-col bg-[#050507] overflow-hidden text-zinc-100 relative font-sans">
      {/* SideRays WebGL Shader Background (React Bits): Silver & Chrome Metallic Rays */}
      <div
        className={`fixed inset-0 w-full h-full pointer-events-none transition-all duration-700 ease-in-out z-[1] ${
          isChatDocked ? 'blur-3xl opacity-20 scale-105' : 'blur-none opacity-100 scale-100'
        }`}
      >
        <SideRays
          speed={2.2}
          rayColor1="#e4e4e7"
          rayColor2="#71717a"
          intensity={1.8}
          spread={2}
          origin="top-right"
          tilt={0}
          saturation={1.2}
          blend={0.7}
          falloff={1.6}
          opacity={0.85}
        />
      </div>

      {/* Entry Prompt Bar (GitHub Link / Raw Code / Code Doc) */}
      <LandingPromptBar />

      {/* 5-Second PixelSwap & Fade Content Transition Overlay */}
      <LoadingTransitionOverlay isActive={isAnalyzing} />

      {/* Main Swimm Educational Workspace (Reveals with FadeContent Transition after analysis completes) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{
          opacity: isChatDocked && !isAnalyzing ? 1 : 0,
          scale: isChatDocked && !isAnalyzing ? 1 : 0.98,
          pointerEvents: isChatDocked && !isAnalyzing ? 'auto' : 'none',
        }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full h-full flex flex-col overflow-hidden relative z-10"
      >
        <FadeContent blur={true} duration={1000} initialOpacity={0} className="w-full h-full flex flex-col overflow-hidden">
          {/* Top Swimm-Style Header & Segmented Navigation Controls */}
          <SegmentedNav />

          {/* Main Workspace Viewport */}
          <main className="flex-1 relative w-full h-[calc(100vh-53px)] overflow-hidden flex">
            {/* View Mode Switching Logic */}
            {viewMode === 'mission_control' ? (
              <AgentManager />
            ) : (
              /* Resizable Draggable Split View Layout (Default 35% Micro View / 65% Macro View) */
              <ResizableSplitPane
                leftPane={<MicroViewGuide />}
                rightPane={<MacroViewContainer />}
              />
            )}
          </main>
        </FadeContent>
      </motion.div>
    </div>
  );
}
