import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PixelSwap from './PixelSwap';
import FadeContent from './FadeContent';
import { Sparkles, Code2, Cpu, FileCheck2, CheckCircle2 } from 'lucide-react';

interface LoadingTransitionOverlayProps {
  isActive: boolean;
  onComplete?: () => void;
}

const STEPS = [
  {
    id: 1,
    title: 'Reading your code...',
    subtitle: 'Extracting source text, imports, and file trees',
    icon: Code2,
  },
  {
    id: 2,
    title: 'Understanding the code...',
    subtitle: 'Parsing Tree-sitter AST symbol DAGs & dependencies',
    icon: Cpu,
  },
  {
    id: 3,
    title: 'Creating the explanation...',
    subtitle: 'Running GraphRAG vector retrieval & CS student callouts',
    icon: Sparkles,
  },
  {
    id: 4,
    title: 'Preparing workspace...',
    subtitle: 'Hydrating 60fps dual-pane walkthrough & canvas state',
    icon: FileCheck2,
  },
  {
    id: 5,
    title: 'Unifying DevEx Platform...',
    subtitle: 'Workspace ready. Entering Swimm educational dashboard',
    icon: CheckCircle2,
  },
];

export default function LoadingTransitionOverlay({
  isActive,
  onComplete,
}: LoadingTransitionOverlayProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [pixelSwapActive, setPixelSwapActive] = useState(false);
  const [stepContent1, setStepContent1] = useState(STEPS[0]);
  const [stepContent2, setStepContent2] = useState(STEPS[1]);

  useEffect(() => {
    if (!isActive) {
      setCurrentStepIndex(0);
      setPixelSwapActive(false);
      setStepContent1(STEPS[0]);
      setStepContent2(STEPS[1]);
      return;
    }

    // Step 1 active (0 - 1000ms) on firstContent (Step 1)
    const t1 = setTimeout(() => {
      setCurrentStepIndex(1);
      setPixelSwapActive(true);
    }, 1000);

    // Pre-stage Step 3 on hidden firstContent layer after swap settles
    const t1_settle = setTimeout(() => {
      setStepContent1(STEPS[2]);
    }, 1700);

    // Step 2 completes at 2000ms -> Swap pixel grid to firstContent (Step 3)
    const t2 = setTimeout(() => {
      setCurrentStepIndex(2);
      setPixelSwapActive(false);
    }, 2000);

    // Pre-stage Step 4 on hidden secondContent layer after swap settles
    const t2_settle = setTimeout(() => {
      setStepContent2(STEPS[3]);
    }, 2700);

    // Step 3 completes at 3000ms -> Swap pixel grid to secondContent (Step 4)
    const t3 = setTimeout(() => {
      setCurrentStepIndex(3);
      setPixelSwapActive(true);
    }, 3000);

    // Pre-stage Step 5 on hidden firstContent layer after swap settles
    const t3_settle = setTimeout(() => {
      setStepContent1(STEPS[4]);
    }, 3700);

    // Step 4 completes at 4000ms -> Swap pixel grid to firstContent (Step 5)
    const t4 = setTimeout(() => {
      setCurrentStepIndex(4);
      setPixelSwapActive(false);
    }, 4000);

    const t5 = setTimeout(() => {
      onComplete?.();
    }, 5000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t1_settle);
      clearTimeout(t2);
      clearTimeout(t2_settle);
      clearTimeout(t3);
      clearTimeout(t3_settle);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [isActive, onComplete]);

  const activeStep = STEPS[currentStepIndex];
  const stepProgressPercent = Math.min(100, Math.round(((currentStepIndex + 1) / 5) * 100));

  const renderStepCard = (stepData: typeof STEPS[0], isAltBg: boolean = false) => {
    const Icon = stepData.icon;
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-6 relative ${
          isAltBg ? 'bg-[#121218]' : 'bg-[#0e0e12]'
        }`}
      >
        <div className="absolute inset-0 bg-radial from-zinc-800/20 via-transparent to-transparent pointer-events-none" />
        <div className="p-4 rounded-2xl bg-zinc-800/90 border border-zinc-700/80 text-zinc-100 shadow-[0_0_25px_rgba(255,255,255,0.08)] relative">
          <Icon className="w-8 h-8 animate-pulse text-zinc-100" />
        </div>
        <div className="h-20 flex flex-col items-center justify-center space-y-1.5">
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            {stepData.title}
          </h2>
          <p className="text-xs md:text-sm text-zinc-400 font-mono">
            {stepData.subtitle}
          </p>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          key="loading-overlay"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            filter: 'blur(16px)',
            scale: 1.03,
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#050507] text-zinc-100 font-sans select-none overflow-hidden"
        >
          <FadeContent blur={true} duration={400} initialOpacity={0} className="w-full max-w-2xl px-6 flex flex-col items-center justify-center space-y-8">
            {/* PixelSwap Box - Physical Pixel Swapping on Every Step Completion */}
            <div className="w-full h-80 rounded-3xl bg-[#0e0e12] border border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden relative">
              <PixelSwap
                pixelSize={36}
                gap={0}
                pixelRadius={0}
                pixelSpin={0}
                pixelScale={0.35}
                duration={700}
                pixelDuration={300}
                pattern="random"
                randomness={0.2}
                fade={true}
                trigger="manual"
                active={pixelSwapActive}
                aspectRatio="auto"
                className="w-full h-full"
                firstContent={renderStepCard(stepContent1, false)}
                secondContent={renderStepCard(stepContent2, true)}
              />
            </div>

            {/* Progress Bar & Status Text */}
            <div className="w-full max-w-md space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <Sparkles className="w-3.5 h-3.5 text-zinc-200 animate-spin" />
                  Step {currentStepIndex + 1} of 5 • {activeStep.title}
                </span>
                <span className="text-zinc-300 font-semibold">{stepProgressPercent}%</span>
              </div>

              {/* 5.0-Second Linear Loading Bar */}
              <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 relative shadow-inner">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 5.0, ease: 'linear' }}
                  className="h-full bg-gradient-to-r from-zinc-500 via-zinc-200 to-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                />
              </div>
            </div>
          </FadeContent>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
