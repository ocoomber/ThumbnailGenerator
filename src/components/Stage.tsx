import { useEffect, useRef, type ReactNode } from 'react';

// Scales the true 1280×720 render node down to the container width.
export default function Stage({
  baseWidth,
  baseHeight,
  className,
  children,
}: {
  baseWidth: number;
  baseHeight: number;
  className?: string;
  children: ReactNode;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const scalerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current!;
    const scaler = scalerRef.current!;
    const fit = () => {
      const s = stage.clientWidth / baseWidth;
      scaler.style.transform = `scale(${s})`;
      stage.style.height = `${baseHeight * s}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [baseWidth, baseHeight]);

  return (
    <div ref={stageRef} className={className}>
      <div ref={scalerRef} style={{ transformOrigin: 'top left' }}>
        {children}
      </div>
    </div>
  );
}
