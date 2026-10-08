'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useDevExStore } from '@/store/useDevExStore';
import OverviewTab from './OverviewTab';
import MacroViewCanvas from './MacroViewCanvas';
import BusinessRulesTab from './BusinessRulesTab';
import CodeWalkthroughTab from './CodeWalkthroughTab';

export default function MacroViewContainer() {
  const { activeMacroTab } = useDevExStore();

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-950">
      <AnimatePresence mode="wait">
        {activeMacroTab === 'overview' && (
          <motion.div
            key="tab-overview"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full"
          >
            <OverviewTab />
          </motion.div>
        )}

        {activeMacroTab === 'graph' && (
          <motion.div
            key="tab-graph"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full relative"
          >
            <MacroViewCanvas />
          </motion.div>
        )}

        {activeMacroTab === 'business_rules' && (
          <motion.div
            key="tab-business-rules"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full"
          >
            <BusinessRulesTab />
          </motion.div>
        )}

        {activeMacroTab === 'walkthrough' && (
          <motion.div
            key="tab-walkthrough"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full"
          >
            <CodeWalkthroughTab />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
