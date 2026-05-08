import { useEffect, useRef } from "react";
import rough from "roughjs/bin/rough";
import styles from "./ScoreSheet.module.css";

export const RoughBox = ({ color, seed }: { color: string; seed: number }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    svg.replaceChildren();
    const roughSvg = rough.svg(svg);
    const rectangle = roughSvg.rectangle(3, 3, 94, 94, {
      bowing: 1.2,
      roughness: 2.1,
      seed,
      stroke: color,
      strokeWidth: 2.2,
      fill: "transparent",
    });
    svg.appendChild(rectangle);
  }, [color, seed]);

  return (
    <svg
      ref={svgRef}
      className={styles.roughBox}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    />
  );
};
