import { useEffect, useRef } from 'react';
import rough from 'roughjs/bin/rough';
import styles from './RoughSeparator.module.css';

export const RoughSeparator = ({ seed }: { seed: number }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    svg.replaceChildren();
    const roughSvg = rough.svg(svg);
    const line = roughSvg.line(1, 4, 99, 4, {
      bowing: 0.9,
      roughness: 2.4,
      seed,
      stroke: 'rgba(229, 231, 235, 0.58)',
      strokeWidth: 1.35,
    });
    svg.appendChild(line);
  }, [seed]);

  return (
    <svg ref={svgRef} className={styles.roughSeparator} viewBox="0 0 100 8" preserveAspectRatio="none" />
  );
};
