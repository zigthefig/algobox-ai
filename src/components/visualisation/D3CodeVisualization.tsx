import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface D3CodeVisualizationProps {
    step: {
        index: number;
        type: string;
        description: string;
        state: {
            array?: number[];
            nums?: number[];
            comparing?: number[];
            highlighted?: number[];
            sorted?: number[];
            found?: number[];
            hashMap?: Record<number, number>;
            variables?: Record<string, any>;
            target?: number;
            result?: number[];
        };
    };
}

export function D3CodeVisualization({ step }: D3CodeVisualizationProps) {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || !step?.state) return;

        const state = step.state;
        const array = state.array || state.nums || [];
        const { comparing = [], highlighted = [], sorted = [], found = [], hashMap = {}, variables = {}, target, result } = state;

        if (!array.length) return;

        const svg = d3.select(svgRef.current);
        const width = svgRef.current.clientWidth || 600;
        const height = svgRef.current.clientHeight || 400;

        svg.selectAll("*").remove();

        // Layout
        const margin = { top: 60, right: 20, bottom: 80, left: 20 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom - 100; // Leave room for hash map

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Title / Target
        if (target !== undefined) {
            svg.append("text")
                .attr("x", width / 2)
                .attr("y", 25)
                .attr("text-anchor", "middle")
                .style("fill", "#e2e8f0")
                .style("font-size", "14px")
                .style("font-weight", "600")
                .text(`Target: ${target}`);
        }

        // Variables display
        const varsArr = Object.entries(variables);
        if (varsArr.length > 0) {
            const varsText = varsArr.map(([k, v]) => `${k}=${JSON.stringify(v)}`).join("  ");
            svg.append("text")
                .attr("x", width / 2)
                .attr("y", 45)
                .attr("text-anchor", "middle")
                .style("fill", "#94a3b8")
                .style("font-size", "12px")
                .style("font-family", "'JetBrains Mono', monospace")
                .text(varsText);
        }

        // Array visualization
        const maxValue = Math.max(...array.map(v => Math.abs(v)), 1);
        const barWidth = Math.min(60, chartWidth / array.length - 8);
        const barSpacing = (chartWidth - barWidth * array.length) / (array.length + 1);

        const xScale = d3.scaleBand<number>()
            .domain(array.map((_, i) => i))
            .range([0, chartWidth])
            .padding(0.15);

        const yScale = d3.scaleLinear()
            .domain([0, maxValue])
            .range([chartHeight, 0]);

        // Color function
        const getColor = (index: number) => {
            if (found.includes(index)) return "#22c55e";
            if (sorted.includes(index)) return "#22c55e";
            if (comparing.includes(index) || highlighted.includes(index)) return "#eab308";
            return "#6366f1";
        };

        // Draw bars
        const bars = g.selectAll(".bar-group")
            .data(array)
            .enter()
            .append("g")
            .attr("class", "bar-group")
            .attr("transform", (_, i) => `translate(${xScale(i)},0)`);

        bars.append("rect")
            .attr("y", chartHeight)
            .attr("height", 0)
            .attr("width", xScale.bandwidth())
            .attr("rx", 6)
            .style("fill", (_, i) => getColor(i))
            .style("filter", (_, i) => (comparing.includes(i) || found.includes(i)) ? "drop-shadow(0 0 8px rgba(234, 179, 8, 0.5))" : "none")
            .transition()
            .duration(350)
            .ease(d3.easeCubicOut)
            .attr("y", d => yScale(Math.abs(d)))
            .attr("height", d => chartHeight - yScale(Math.abs(d)));

        // Value labels on bars
        bars.append("text")
            .attr("x", xScale.bandwidth() / 2)
            .attr("y", chartHeight + 22)
            .attr("text-anchor", "middle")
            .style("fill", "#e2e8f0")
            .style("font-size", "14px")
            .style("font-weight", "700")
            .style("font-family", "'JetBrains Mono', monospace")
            .text(d => d);

        // Index labels
        bars.append("text")
            .attr("x", xScale.bandwidth() / 2)
            .attr("y", chartHeight + 40)
            .attr("text-anchor", "middle")
            .style("fill", "#64748b")
            .style("font-size", "11px")
            .style("font-family", "'JetBrains Mono', monospace")
            .text((_, i) => i);

        // Pointer indicators
        comparing.forEach((idx) => {
            if (idx >= 0 && idx < array.length) {
                g.append("polygon")
                    .attr("points", `${xScale(idx)! + xScale.bandwidth() / 2 - 6},-15 ${xScale(idx)! + xScale.bandwidth() / 2 + 6},-15 ${xScale(idx)! + xScale.bandwidth() / 2},-5`)
                    .style("fill", "#eab308");
            }
        });

        // Hash Map visualization (below the array)
        const hashMapY = chartHeight + 70;
        const hashEntries = Object.entries(hashMap);

        if (hashEntries.length > 0) {
            // Hash Map label
            svg.append("text")
                .attr("x", margin.left)
                .attr("y", margin.top + hashMapY - 10)
                .style("fill", "#94a3b8")
                .style("font-size", "12px")
                .style("font-weight", "600")
                .text("Hash Map:");

            // Draw hash map entries
            const hashG = svg.append("g")
                .attr("transform", `translate(${margin.left + 80}, ${margin.top + hashMapY})`);

            const boxWidth = 45;
            const boxHeight = 28;

            hashEntries.forEach(([key, value], i) => {
                const x = i * (boxWidth + 8);

                // Key box
                hashG.append("rect")
                    .attr("x", x)
                    .attr("y", 0)
                    .attr("width", boxWidth / 2 - 2)
                    .attr("height", boxHeight)
                    .attr("rx", 4)
                    .style("fill", "#334155")
                    .style("stroke", "#475569")
                    .style("stroke-width", 1);

                hashG.append("text")
                    .attr("x", x + boxWidth / 4 - 1)
                    .attr("y", boxHeight / 2 + 4)
                    .attr("text-anchor", "middle")
                    .style("fill", "#e2e8f0")
                    .style("font-size", "11px")
                    .style("font-family", "'JetBrains Mono', monospace")
                    .text(key);

                // Arrow
                hashG.append("text")
                    .attr("x", x + boxWidth / 2 + 2)
                    .attr("y", boxHeight / 2 + 4)
                    .attr("text-anchor", "middle")
                    .style("fill", "#64748b")
                    .style("font-size", "10px")
                    .text("→");

                // Value box
                hashG.append("rect")
                    .attr("x", x + boxWidth / 2 + 8)
                    .attr("y", 0)
                    .attr("width", boxWidth / 2 - 2)
                    .attr("height", boxHeight)
                    .attr("rx", 4)
                    .style("fill", "#1e3a5f")
                    .style("stroke", "#3b82f6")
                    .style("stroke-width", 1);

                hashG.append("text")
                    .attr("x", x + boxWidth / 2 + 8 + boxWidth / 4 - 1)
                    .attr("y", boxHeight / 2 + 4)
                    .attr("text-anchor", "middle")
                    .style("fill", "#60a5fa")
                    .style("font-size", "11px")
                    .style("font-family", "'JetBrains Mono', monospace")
                    .text(String(value));
            });
        }

        // Result display
        if (result && result.length > 0) {
            svg.append("text")
                .attr("x", width / 2)
                .attr("y", height - 20)
                .attr("text-anchor", "middle")
                .style("fill", "#22c55e")
                .style("font-size", "14px")
                .style("font-weight", "700")
                .text(`Result: [${result.join(", ")}]`);
        }

        // Legend
        const legend = svg.append("g")
            .attr("transform", `translate(${width - 200}, 15)`);

        const legendItems = [
            { label: "Active", color: "#6366f1" },
            { label: "Comparing", color: "#eab308" },
            { label: "Found", color: "#22c55e" },
        ];

        legendItems.forEach((item, i) => {
            const lg = legend.append("g")
                .attr("transform", `translate(${i * 65}, 0)`);

            lg.append("rect")
                .attr("width", 10)
                .attr("height", 10)
                .attr("rx", 2)
                .style("fill", item.color);

            lg.append("text")
                .attr("x", 14)
                .attr("y", 9)
                .style("fill", "#94a3b8")
                .style("font-size", "10px")
                .text(item.label);
        });

    }, [step]);

    return (
        <svg
            ref={svgRef}
            className="w-full h-full bg-[#0f172a] rounded-lg"
            style={{ minHeight: "350px" }}
        />
    );
}
