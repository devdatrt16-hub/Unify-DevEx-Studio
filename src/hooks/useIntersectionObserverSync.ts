'use client';

import { useEffect } from 'react';
import { useDevExStore } from '@/store/useDevExStore';

export function useIntersectionObserverSync(containerRef: React.RefObject<HTMLElement>) {
  const { setActiveWalkthroughStep, setHighlightedLineRange, guideSteps } = useDevExStore();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const stepElements = container.querySelectorAll('[data-walkthrough-step]');
    if (stepElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const stepAttr = entry.target.getAttribute('data-walkthrough-step');
            if (stepAttr !== null) {
              const stepIndex = parseInt(stepAttr, 10);
              setActiveWalkthroughStep(stepIndex);

              // Update line range based on step
              const currentStep = guideSteps[stepIndex];
              if (currentStep) {
                if (stepIndex === 0) {
                  setHighlightedLineRange({ file: 'package.json', startLine: 1, endLine: 28, snippet: '{\n  "name": "devex-platform-core",\n  "version": "1.0.0"\n}' });
                } else if (stepIndex === 1) {
                  setHighlightedLineRange({ file: 'docker-compose.yml', startLine: 1, endLine: 35, snippet: 'services:\n  postgres:\n    image: postgres:15\n  redis:\n    image: redis:alpine' });
                } else if (stepIndex === 2) {
                  setHighlightedLineRange({ file: 'src/app/api/analyze/route.ts', startLine: 15, endLine: 45, snippet: 'export async function POST(req: Request) {\n  const { repoUrl } = await req.json();\n  const astDag = await parseAst(repoUrl);\n  return NextResponse.json(astDag);\n}' });
                } else {
                  setHighlightedLineRange({ file: 'src/store/useDevExStore.ts', startLine: 40, endLine: 90 });
                }
              }
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.5, // Trigger when 50% of the step card is visible in left pane
      }
    );

    stepElements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [containerRef, setActiveWalkthroughStep, setHighlightedLineRange, guideSteps]);
}
