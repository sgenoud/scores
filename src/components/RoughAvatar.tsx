import { CSSProperties, useEffect, useRef } from 'react';
import rough from 'roughjs/bin/rough';
import styles from './RoughAvatar.module.css';

export const RoughAvatar = ({
  initials,
  color,
  seed,
  size = 'normal',
}: {
  initials: string;
  color: string;
  seed: number;
  size?: 'normal' | 'small';
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    svg.replaceChildren();
    const roughSvg = rough.svg(svg);
    const hachure = roughSvg.rectangle(8, 8, 84, 84, {
      bowing: 1.1,
      fill: color,
      fillStyle: 'hachure',
      hachureAngle: -28,
      hachureGap: 5,
      fillWeight: 2.7,
      roughness: 2,
      seed,
      stroke: 'transparent',
      strokeWidth: 0,
    });
    svg.appendChild(hachure);
  }, [color, seed]);

  return (
    <span
      className={`${styles.avatar} ${size === 'small' ? styles.small : ''}`}
      style={{ '--rough-avatar-color': color } as CSSProperties}
    >
      <svg ref={svgRef} className={styles.svg} viewBox="0 0 100 100" preserveAspectRatio="none" />
      <span className={styles.label}>{initials}</span>
    </span>
  );
};
