import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface D3BinarySearchVisualizationProps {
  step: any;
}

export function D3BinarySearchVisualization({ step }: D3BinarySearchVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !step?.state?.array) return;

    const { array, left, right, mid, target, found } = step.state;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    svg.selectAll("*").remove();

    const margin = { top: 80, right: 40, bottom: 80, left: 40 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("text")
      .attr("x", chartWidth / 2)
      .attr("y", -40)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "600")
      .style("fill", "#e2e8f0")
      .text(`Target: ${target}`);

    const cellSize = Math.min(70, chartWidth / array.length - 10);
    const totalWidth = array.length * (cellSize + 10) - 10;
    const startX = (chartWidth - totalWidth) / 2;

    const cells = g.selectAll(".cell")
      .data(array)
      .enter()
      .append("g")
      .attr("class", "cell")
      .attr("transform", (d: any, i: number) => `translate(${startX + i * (cellSize + 10)}, 50)`);

    cells.append("rect")
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("rx", 8)
      .style("fill", (d: any, i: number) => {
        if (found && i === mid) return "#22c55e";
        if (i === mid) return "#eab308";
        if (i >= left && i <= right) return "#6366f1";
        return "#1e293b";
      })
      .style("stroke", (d: any, i: number) => {
        if (i === mid) return "#ffffff";
        if (i >= left && i <= right) return "#60a5fa";
        return "#334155";
      })
      .style("stroke-width", (d: any, i: number) => i === mid ? 3 : 2)
      .style("opacity", (d: any, i: number) => {
        if (i >= left && i <= right) return 1;
        return 0.3;
      })
      .transition()
      .duration(400)
      .ease(d3.easeCubicOut)
      .style("opacity", (d: any, i: number) => {
        if (i >= left && i <= right) return 1;
        return 0.3;
      });

    cells.append("text")
      .attr("x", cellSize / 2)
      .attr("y", cellSize / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .style("font-size", "20px")
      .style("font-weight", "700")
      .style("font-family", "'JetBrains Mono', monospace")
      .style("fill", (d: any, i: number) => {
        if (found && i === mid) return "#ffffff";
        if (i === mid) return "#000000";
        if (i >= left && i <= right) return "#ffffff";
        return "#64748b";
      })
      .text((d: number) => d);

    cells.append("text")
      .attr("x", cellSize / 2)
      .attr("y", cellSize + 20)
      .attr("text-anchor", "middle")
      .style("font-size", "11px")
      .style("font-family", "'JetBrains Mono', monospace")
      .style("fill", "#64748b")
      .text((d: any, i: number) => `[${i}]`);

    const pointerY = cellSize + 50;
    const pointers = [
      { label: "L", index: left, color: "#3b82f6" },
      { label: "M", index: mid >= 0 ? mid : null, color: "#eab308" },
      { label: "R", index: right, color: "#ec4899" },
    ];

    pointers.forEach(pointer => {
      if (pointer.index !== null && pointer.index >= 0) {
        const pointerG = g.append("g")
          .attr("transform", `translate(${startX + pointer.index * (cellSize + 10) + cellSize / 2}, ${pointerY})`);

        pointerG.append("line")
          .attr("x1", 0)
          .attr("y1", 0)
          .attr("x2", 0)
          .attr("y2", -15)
          .style("stroke", pointer.color)
          .style("stroke-width", 2)
          .style("opacity", 0)
          .transition()
          .duration(300)
          .delay(200)
          .style("opacity", 1);

        pointerG.append("circle")
          .attr("cx", 0)
          .attr("cy", 5)
          .attr("r", 12)
          .style("fill", pointer.color)
          .style("opacity", 0)
          .transition()
          .duration(300)
          .delay(200)
          .style("opacity", 1);

        pointerG.append("text")
          .attr("x", 0)
          .attr("y", 5)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "central")
          .style("font-size", "12px")
          .style("font-weight", "700")
          .style("fill", "#ffffff")
          .text(pointer.label)
          .style("opacity", 0)
          .transition()
          .duration(300)
          .delay(200)
          .style("opacity", 1);
      }
    });

    if (found) {
      g.append("text")
        .attr("x", chartWidth / 2)
        .attr("y", pointerY + 50)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "600")
        .style("fill", "#22c55e")
        .text("✓ Target Found!")
        .style("opacity", 0)
        .transition()
        .duration(500)
        .delay(300)
        .style("opacity", 1);
    }

  }, [step]);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full"
      style={{ minHeight: "400px" }}
    />
  );
}
