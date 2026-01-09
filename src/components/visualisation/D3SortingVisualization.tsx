import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface D3SortingVisualizationProps {
  step: any;
  algorithm: string;
}

export function D3SortingVisualization({ step, algorithm }: D3SortingVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !step?.state?.array) return;

    const { array, comparing = [], sorted = [], pivot, i, j, low, high, merging = [] } = step.state;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    svg.selectAll("*").remove();

    const margin = { top: 40, right: 40, bottom: 60, left: 40 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const maxValue = Math.max(...array);
    const barWidth = Math.min(60, chartWidth / array.length - 4);

    const xScale = d3.scaleBand()
      .domain(array.map((_: any, i: number) => i.toString()))
      .range([0, chartWidth])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, maxValue])
      .range([chartHeight, 0]);

    const getBarColor = (index: number) => {
      if (sorted.includes(index)) return "#22c55e";
      if (comparing.includes(index)) return "#eab308";
      if (merging.length > 0 && merging.includes(array[index])) return "#3b82f6";

      if (algorithm === "quick-sort") {
        if (index === pivot) return "#ef4444";
        if (index === i) return "#8b5cf6";
        if (index === j) return "#ec4899";
        if (low !== undefined && high !== undefined && index >= low && index <= high) return "#60a5fa";
      }

      return "#6366f1";
    };

    const bars = g.selectAll(".bar")
      .data(array)
      .enter()
      .append("g")
      .attr("class", "bar")
      .attr("transform", (d: any, i: number) => `translate(${xScale(i.toString())},0)`);

    bars.append("rect")
      .attr("y", chartHeight)
      .attr("height", 0)
      .attr("width", xScale.bandwidth())
      .attr("rx", 4)
      .style("fill", (d: any, i: number) => getBarColor(i))
      .style("opacity", 0.9)
      .transition()
      .duration(300)
      .ease(d3.easeCubicOut)
      .attr("y", (d: number) => yScale(d))
      .attr("height", (d: number) => chartHeight - yScale(d));

    bars.append("text")
      .attr("class", "value-label")
      .attr("x", xScale.bandwidth() / 2)
      .attr("y", chartHeight + 20)
      .attr("text-anchor", "middle")
      .style("fill", "#94a3b8")
      .style("font-size", "12px")
      .style("font-weight", "600")
      .style("font-family", "'JetBrains Mono', monospace")
      .text((d: number) => d)
      .style("opacity", 0)
      .transition()
      .duration(300)
      .delay(200)
      .style("opacity", 1);

    bars.append("text")
      .attr("class", "index-label")
      .attr("x", xScale.bandwidth() / 2)
      .attr("y", chartHeight + 38)
      .attr("text-anchor", "middle")
      .style("fill", "#64748b")
      .style("font-size", "10px")
      .style("font-family", "'JetBrains Mono', monospace")
      .text((d: any, i: number) => i)
      .style("opacity", 0)
      .transition()
      .duration(300)
      .delay(300)
      .style("opacity", 1);

    if (algorithm === "quick-sort" && pivot !== undefined && pivot >= 0) {
      g.append("line")
        .attr("x1", xScale(pivot.toString())! + xScale.bandwidth() / 2)
        .attr("y1", -15)
        .attr("x2", xScale(pivot.toString())! + xScale.bandwidth() / 2)
        .attr("y2", -5)
        .style("stroke", "#ef4444")
        .style("stroke-width", 2)
        .style("marker-end", "url(#arrow)");

      g.append("text")
        .attr("x", xScale(pivot.toString())! + xScale.bandwidth() / 2)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .style("fill", "#ef4444")
        .style("font-size", "12px")
        .style("font-weight", "600")
        .text("pivot");
    }

    const legend = g.append("g")
      .attr("transform", `translate(0, -30)`);

    const legendData = [
      { label: "Sorted", color: "#22c55e", show: sorted.length > 0 },
      { label: "Comparing", color: "#eab308", show: comparing.length > 0 },
      { label: "Active", color: "#6366f1", show: true },
    ];

    legendData.filter(d => d.show).forEach((item, i) => {
      const legendItem = legend.append("g")
        .attr("transform", `translate(${i * 100}, 0)`);

      legendItem.append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("rx", 2)
        .style("fill", item.color);

      legendItem.append("text")
        .attr("x", 18)
        .attr("y", 10)
        .style("fill", "#94a3b8")
        .style("font-size", "11px")
        .text(item.label);
    });

  }, [step, algorithm]);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full"
      style={{ minHeight: "400px" }}
    />
  );
}
