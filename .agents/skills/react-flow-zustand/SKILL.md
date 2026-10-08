---
name: react-flow-zustand
description: Best practices and rules for linking Zustand stores with React Flow canvas nodes, custom node definitions, 60fps rendering, and bidirectional state synchronization.
---

# React Flow & Zustand Canvas Skill

## Core Rules for Canvas Performance & Architecture

1. **State Ownership**:
   - Store node positions, selection states, custom data payloads, and edge connections inside a unified Zustand store (`useDevExStore`).
   - Use selectors (`useDevExStore((state) => state.nodes)`) to prevent unnecessary re-renders.

2. **Custom Node Types**:
   - Define custom memoized nodes: `ComponentNode`, `ApiRouteNode`, `StateStoreNode`, `ConfigNode`, `JavaClassNode`.
   - Ensure nodes render crisp glassmorphism cards with distinct color accents per type:
     - Component Nodes: Cyan / Indigo (`border-cyan-500/40`, `bg-cyan-950/30`)
     - API Route Nodes: Emerald (`border-emerald-500/40`, `bg-emerald-950/30`)
     - State Store Nodes: Amber / Purple (`border-purple-500/40`, `bg-purple-950/30`)
     - Configuration Nodes: Orange (`border-orange-500/40`, `bg-orange-950/30`)
     - Java Class Nodes: Rose (`border-rose-500/40`, `bg-rose-950/30`)

3. **60fps Performance (up to 1,000 nodes)**:
   - Use `onlyRenderVisibleElements={true}` on React Flow canvas.
   - Use CSS transitions for node hover and selection glows instead of heavy inline state recalculations.
   - Batch node drag position updates.

4. **Bidirectional Context Linking**:
   - When a user clicks a graph node, set `selectedNodeId` in Zustand.
   - When a user clicks "Focus in Map" on a Micro View setup step, update `selectedNodeId`, center the canvas view on the node position via `fitView({ nodes: [{ id }] })`, and trigger an energetic highlight ring.
