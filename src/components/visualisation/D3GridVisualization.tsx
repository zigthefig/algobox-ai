import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface D3GridVisualizationProps {
  step: any;
}

export function D3GridVisualization({ step }: D3GridVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !step?.state?.grid) return;

    const { grid, start, end, openSet, closedSet, path, current, adding } = step.state;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    svg.selectAll("*").remove();

    const rows = grid.length;
    const cols = grid[0].length;

    const margin = { top: 60, right: 40, bottom: 40, left: 40 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const cellSize = Math.min(
      chartWidth / cols - 2,
      chartHeight / rows - 2,
      50
    );

    const gridWidth = cols * (cellSize + 2);
    const gridHeight = rows * (cellSize + 2);
    const startX = (chartWidth - gridWidth) / 2;
    const startY = (chartHeight - gridHeight) / 2;

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left + startX},${margin.top + startY})`);

    g.append("text")
      .attr("x", gridWidth / 2)
      .attr("y", -25)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .style("fill", "#e2e8f0")
      .text("A* Pathfinding");

    const getCellColor = (x: number, y: number) => {
      if (grid[y][x] === 1) return "#64748b";
      if (path?.some((p: any) => p.x === x && p.y === y)) return "#6366f1";
      if (current?.x === x && current?.y === y) return "#eab308";
      if (adding?.x === x && adding?.y === y) return "#3b82f6";
      if (x === start?.x && y === start?.y) return "#22c55e";
      if (x === end?.x && y === end?.y) return "#ef4444";
      if (openSet?.some((n: any) => n.x === x && n.y === y)) return "#60a5fa";
      if (closedSet?.some((n: any) => n.x === x && n.y === y)) return "#334155";
      return "#1e293b";
    };

    const getCellIcon = (x: number, y: number) => {
      if (x === start?.x && y === start?.y) return "S";
      if (x === end?.x && y === end?.y) return "E";
      if (path?.some((p: any) => p.x === x && p.y === y)) return "•";
      return null;
    };

    grid.forEach((row: number[], y: number) => {
      row.forEach((cell: number, x: number) => {
        const cellG = g.append("g")
          .attr("transform", `translate(${x * (cellSize + 2)}, ${y * (cellSize + 2)})`);

        cellG.append("rect")
          .attr("width", cellSize)
          .attr("height", cellSize)
          .attr("rx", 4)
          .style("fill", getCellColor(x, y))
          .style("stroke", "#0f172a")
          .style("stroke-width", 1.5)
          .style("opacity", 0)
          .transition()
          .duration(200)
          .delay((y * cols + x) * 2)
          .style("opacity", 1);

        const icon = getCellIcon(x, y);
        if (icon) {
          cellG.append("text")
            .attr("x", cellSize / 2)
            .attr("y", cellSize / 2)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .style("font-size", icon === "•" ? "24px" : "16px")
            .style("font-weight", "700")
            .style("fill", "#ffffff")
            .text(icon)
            .style("opacity", 0)
            .transition()
            .duration(300)
            .delay((y * cols + x) * 2 + 100)
            .style("opacity", 1);
        }

        if (current?.x === x && current?.y === y) {
          cellG.append("circle")
            .attr("cx", cellSize / 2)
            .attr("cy", cellSize / 2)
            .attr("r", cellSize / 2 - 4)
            .style("fill", "none")
            .style("stroke", "#ffffff")
            .style("stroke-width", 2)
            .style("opacity", 0)
            .transition()
            .duration(400)
            .style("opacity", 1);
        }
      });
    });

    const legend = g.append("g")
      .attr("transform", `translate(0, ${gridHeight + 20})`);

    const legendData = [
      { label: "Start", color: "#22c55e" },
      { label: "End", color: "#ef4444" },
      { label: "Path", color: "#6366f1" },
      { label: "Current", color: "#eab308" },
      { label: "Open", color: "#60a5fa" },
      { label: "Closed", color: "#334155" },
      { label: "Wall", color: "#64748b" },
    ];

    const legendSpacing = Math.min(90, gridWidth / legendData.length);

    legendData.forEach((item, i) => {
      const legendItem = legend.append("g")
        .attr("transform", `translate(${i * legendSpacing}, 0)`);

      legendItem.append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("rx", 2)
        .style("fill", item.color);

      legendItem.append("text")
        .attr("x", 18)
        .attr("y", 10)
        .style("fill", "#94a3b8")
        .style("font-size", "10px")
        .text(item.label);
    });

  }, [step]);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full"
      style={{ minHeight: "450px" }}
    />
  );
}
