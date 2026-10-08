'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDevExStore } from '@/store/useDevExStore';

interface ResizableSplitPaneProps {
  leftPane: React.ReactNode;
  rightPane: React.ReactNode;
}

export default function ResizableSplitPane({ leftPane, rightPane }: ResizableSplitPaneProps) {
  const { splitWidthPercent, setSplitWidthPercent } = useDevExStore();
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const windowWidth = window.innerWidth;
      const newPercent = (e.clientX / windowWidth) * 100;
      setSplitWidthPercent(newPercent);
    },
    [isDragging, setSplitWidthPercent]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className="w-full h-full flex overflow-hidden select-none relative">
      {/* Left Micro View Pane */}
      <div
        style={{ width: `${splitWidthPercent}%` }}
        className="h-full relative overflow-hidden transition-none"
      >
        {leftPane}
      </div>

      {/* Resizer Split Bar (Section 4.3 UI Spec) */}
      <div
        onMouseDown={handleMouseDown}
        className={`relative z-30 h-full cursor-col-resize flex items-center justify-center transition-all group ${
          isDragging
            ? 'w-2 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)]'
            : 'w-1.5 bg-slate-800 hover:w-2 hover:bg-slate-600'
        }`}
        title="Drag to resize workspace split"
      >
        <div className="w-0.5 h-8 bg-slate-500 rounded-full group-hover:bg-white transition" />
      </div>

      {/* Right Macro View Pane */}
      <div
        style={{ width: `${100 - splitWidthPercent}%` }}
        className="h-full relative overflow-hidden flex-1 transition-none"
      >
        {rightPane}
      </div>
    </div>
  );
}
