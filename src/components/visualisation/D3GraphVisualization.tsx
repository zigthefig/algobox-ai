import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface D3GraphVisualizationProps {
  step: any;
}

export function D3GraphVisualization({ step }: D3GraphVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !step?.state?.nodes) return;

    const { nodes, edges, distances, visited, current, updating } = step.state;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    svg.selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const scaleX = chartWidth / 500;
    const scaleY = chartHeight / 300;
    const scale = Math.min(scaleX, scaleY);

    const edgesG = g.append("g").attr("class", "edges");
    const nodesG = g.append("g").attr("class", "nodes");

    edges.forEach((edge: any) => {
      const from = nodes[edge.from];
      const to = nodes[edge.to];

      const edgeG = edgesG.append("g");

      const line = edgeG.append("line")
        .attr("x1", from.x * scale)
        .attr("y1", from.y * scale)
        .attr("x2", to.x * scale)
        .attr("y2", to.y * scale)
        .style("stroke", "#475569")
        .style("stroke-width", 3)
        .style("opacity", 0.6);

      const midX = (from.x + to.x) / 2 * scale;
      const midY = (from.y + to.y) / 2 * scale;

      edgeG.append("circle")
        .attr("cx", midX)
        .attr("cy", midY)
        .attr("r", 16 * scale)
        .style("fill", "#1e293b")
        .style("stroke", "#475569")
        .style("stroke-width", 2);

      edgeG.append("text")
        .attr("x", midX)
        .attr("y", midY)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .style("font-size", `${14 * scale}px`)
        .style("font-weight", "600")
        .style("fill", "#94a3b8")
        .text(edge.weight);
    });

    nodes.forEach((node: any, index: number) => {
      const nodeG = nodesG.append("g")
        .attr("transform", `translate(${node.x * scale}, ${node.y * scale})`);

      const getNodeColor = () => {
        if (node.id === current) return "#6366f1";
        if (node.id === updating) return "#eab308";
        if (visited?.includes(node.id)) return "#22c55e";
        return "#334155";
      };

      nodeG.append("circle")
        .attr("r", 0)
        .style("fill", getNodeColor())
        .style("stroke", "#ffffff")
        .style("stroke-width", 3)
        .style("filter", "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))")
        .transition()
        .duration(400)
        .ease(d3.easeCubicOut)
        .attr("r", 30 * scale);

      nodeG.append("text")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .style("font-size", `${18 * scale}px`)
        .style("font-weight", "700")
        .style("fill", "#ffffff")
        .style("pointer-events", "none")
        .text(node.label)
        .style("opacity", 0)
        .transition()
        .duration(300)
        .delay(200)
        .style("opacity", 1);

      const distance = distances?.[node.id];
      const distText = distance === Infinity ? "∞" : distance;

      nodeG.append("rect")
        .attr("x", -25 * scale)
        .attr("y", 40 * scale)
        .attr("width", 50 * scale)
        .attr("height", 24 * scale)
        .attr("rx", 4 * scale)
        .style("fill", "#1e293b")
        .style("stroke", "#475569")
        .style("stroke-width", 1.5)
        .style("opacity", 0)
        .transition()
        .duration(300)
        .delay(300)
        .style("opacity", 1);

      nodeG.append("text")
        .attr("y", 52 * scale)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .style("font-size", `${12 * scale}px`)
        .style("font-weight", "600")
        .style("font-family", "'JetBrains Mono', monospace")
        .style("fill", distance === Infinity ? "#64748b" : "#3b82f6")
        .text(`d=${distText}`)
        .style("opacity", 0)
        .transition()
        .duration(300)
        .delay(300)
        .style("opacity", 1);
    });

    const legend = g.append("g")
      .attr("transform", `translate(${chartWidth - 150}, 20)`);

    const legendData = [
      { label: "Current", color: "#6366f1" },
      { label: "Visited", color: "#22c55e" },
      { label: "Updating", color: "#eab308" },
      { label: "Unvisited", color: "#334155" },
    ];

    legendData.forEach((item, i) => {
      const legendItem = legend.append("g")
        .attr("transform", `translate(0, ${i * 25})`);

      legendItem.append("circle")
        .attr("r", 8)
        .style("fill", item.color);

      legendItem.append("text")
        .attr("x", 15)
        .attr("y", 0)
        .attr("dominant-baseline", "central")
        .style("fill", "#94a3b8")
        .style("font-size", "12px")
        .text(item.label);
    });

  }, [step]);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full"
      style={{ minHeight: "400px" }}
    />
  );
}
