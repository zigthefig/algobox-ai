import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { motion, AnimatePresence } from "framer-motion";

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
            hashMap?: Record<string | number, number>;
            variables?: Record<string, any>;
            target?: number;
            result?: number[] | null;
        };
    };
}

// Color palette inspired by algorithm-visualizer
const COLORS = {
    default: "#5c6bc0",       // Indigo
    comparing: "#ffa726",     // Orange
    found: "#66bb6a",         // Green
    sorted: "#66bb6a",        // Green
    highlighted: "#42a5f5",   // Blue
    selected: "#ab47bc",      // Purple
    text: "#e2e8f0",
    textMuted: "#94a3b8",
    background: "#0f172a",
    cardBg: "#1e293b",
    border: "#334155",
};

export function D3CodeVisualization({ step }: D3CodeVisualizationProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 600, height: 350 });

    // Handle resize
    useEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setDimensions({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height,
                });
            }
        });

        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
        if (!svgRef.current || !step?.state) return;

        const state = step.state;
        const array = state.array || state.nums || [];
        const {
            comparing = [],
            highlighted = [],
            sorted = [],
            found = [],
            hashMap = {},
            variables = {},
            target,
            result
        } = state;

        if (!array.length) return;

        const svg = d3.select(svgRef.current);
        const width = dimensions.width;
        const height = dimensions.height;

        svg.selectAll("*").remove();

        // Layout
        const marginTop = 70;
        const marginBottom = Object.keys(hashMap).length > 0 ? 120 : 50;
        const marginLeft = 30;
        const marginRight = 30;
        const chartHeight = height - marginTop - marginBottom;
        const chartWidth = width - marginLeft - marginRight;

        // Main group
        const g = svg.append("g")
            .attr("transform", `translate(${marginLeft}, ${marginTop})`);

        // Gradient definitions for bars
        const defs = svg.append("defs");

        ["default", "comparing", "found", "highlighted"].forEach((type) => {
            const gradient = defs.append("linearGradient")
                .attr("id", `gradient-${type}`)
                .attr("x1", "0%").attr("y1", "0%")
                .attr("x2", "0%").attr("y2", "100%");

            const color = COLORS[type as keyof typeof COLORS] || COLORS.default;
            gradient.append("stop").attr("offset", "0%").attr("stop-color", d3.color(color)?.brighter(0.3)?.toString() || color);
            gradient.append("stop").attr("offset", "100%").attr("stop-color", color);
        });

        // Header
        const header = svg.append("g")
            .attr("transform", `translate(${width / 2}, 25)`);

        if (target !== undefined) {
            header.append("text")
                .attr("text-anchor", "middle")
                .style("fill", COLORS.text)
                .style("font-size", "16px")
                .style("font-weight", "700")
                .text(`Target: ${target}`);
        }

        // Variables display
        const varsArr = Object.entries(variables);
        if (varsArr.length > 0) {
            const varsText = varsArr.map(([k, v]) => `${k}=${JSON.stringify(v)}`).join("   ");
            svg.append("text")
                .attr("x", width / 2)
                .attr("y", 50)
                .attr("text-anchor", "middle")
                .style("fill", COLORS.textMuted)
                .style("font-size", "12px")
                .style("font-family", "'JetBrains Mono', monospace")
                .text(varsText);
        }

        // Array visualization
        const maxValue = Math.max(...array.map(v => Math.abs(v)), 1);
        const barPadding = 0.2;

        const xScale = d3.scaleBand<number>()
            .domain(array.map((_, i) => i))
            .range([0, chartWidth])
            .padding(barPadding);

        const yScale = d3.scaleLinear()
            .domain([0, maxValue * 1.1])
            .range([chartHeight, 0]);

        // Get bar type
        const getBarType = (index: number): string => {
            if (found.includes(index)) return "found";
            if (sorted.includes(index)) return "found";
            if (comparing.includes(index)) return "comparing";
            if (highlighted.includes(index)) return "highlighted";
            return "default";
        };

        // Draw bars with animation
        const bars = g.selectAll(".bar-group")
            .data(array)
            .enter()
            .append("g")
            .attr("class", "bar-group")
            .attr("transform", (_, i) => `translate(${xScale(i)}, 0)`);

        // Bar rectangles
        bars.append("rect")
            .attr("class", "bar")
            .attr("y", chartHeight)
            .attr("height", 0)
            .attr("width", xScale.bandwidth())
            .attr("rx", 6)
            .attr("ry", 6)
            .style("fill", (_, i) => `url(#gradient-${getBarType(i)})`)
            .style("filter", (_, i) => {
                const type = getBarType(i);
                if (type === "comparing" || type === "found") {
                    return `drop-shadow(0 0 10px ${COLORS[type as keyof typeof COLORS]})`;
                }
                return "none";
            })
            .transition()
            .duration(400)
            .ease(d3.easeCubicOut)
            .attr("y", d => yScale(Math.abs(d)))
            .attr("height", d => chartHeight - yScale(Math.abs(d)));

        // Value labels inside bars
        bars.append("text")
            .attr("class", "value-label")
            .attr("x", xScale.bandwidth() / 2)
            .attr("y", (d) => yScale(Math.abs(d)) - 8)
            .attr("text-anchor", "middle")
            .style("fill", COLORS.text)
            .style("font-size", "14px")
            .style("font-weight", "700")
            .style("font-family", "'JetBrains Mono', monospace")
            .style("opacity", 0)
            .text(d => d)
            .transition()
            .duration(400)
            .delay(200)
            .style("opacity", 1);

        // Index labels
        bars.append("text")
            .attr("class", "index-label")
            .attr("x", xScale.bandwidth() / 2)
            .attr("y", chartHeight + 18)
            .attr("text-anchor", "middle")
            .style("fill", COLORS.textMuted)
            .style("font-size", "11px")
            .style("font-family", "'JetBrains Mono', monospace")
            .text((_, i) => i);

        // Pointer arrows for comparing indices
        comparing.forEach((idx) => {
            if (idx >= 0 && idx < array.length) {
                const x = xScale(idx)! + xScale.bandwidth() / 2;

                g.append("path")
                    .attr("d", d3.symbol().type(d3.symbolTriangle).size(80))
                    .attr("transform", `translate(${x}, -12) rotate(180)`)
                    .style("fill", COLORS.comparing)
                    .style("opacity", 0)
                    .transition()
                    .duration(300)
                    .style("opacity", 1);
            }
        });

        // Hash Map visualization
        const hashEntries = Object.entries(hashMap);

        if (hashEntries.length > 0) {
            const hashY = chartHeight + 45;

            // Hash Map label
            g.append("text")
                .attr("x", 0)
                .attr("y", hashY)
                .style("fill", COLORS.textMuted)
                .style("font-size", "11px")
                .style("font-weight", "600")
                .text("Hash Map:");

            // Draw hash map as key-value boxes
            const hashG = g.append("g")
                .attr("transform", `translate(70, ${hashY - 12})`);

            const boxWidth = 50;
            const boxHeight = 26;
            const spacing = 8;

            hashEntries.forEach(([key, value], i) => {
                const x = i * (boxWidth + spacing);

                // Container
                const entry = hashG.append("g")
                    .attr("transform", `translate(${x}, 0)`)
                    .style("opacity", 0);

                entry.transition()
                    .duration(300)
                    .delay(i * 50)
                    .style("opacity", 1);

                // Key box
                entry.append("rect")
                    .attr("width", boxWidth / 2 - 2)
                    .attr("height", boxHeight)
                    .attr("rx", 4)
                    .style("fill", COLORS.cardBg)
                    .style("stroke", COLORS.border)
                    .style("stroke-width", 1);

                entry.append("text")
                    .attr("x", boxWidth / 4 - 1)
                    .attr("y", boxHeight / 2 + 4)
                    .attr("text-anchor", "middle")
                    .style("fill", COLORS.text)
                    .style("font-size", "11px")
                    .style("font-family", "'JetBrains Mono', monospace")
                    .text(key);

                // Arrow
                entry.append("text")
                    .attr("x", boxWidth / 2 + 1)
                    .attr("y", boxHeight / 2 + 4)
                    .attr("text-anchor", "middle")
                    .style("fill", COLORS.textMuted)
                    .style("font-size", "10px")
                    .text("→");

                // Value box
                entry.append("rect")
                    .attr("x", boxWidth / 2 + 6)
                    .attr("width", boxWidth / 2 - 2)
                    .attr("height", boxHeight)
                    .attr("rx", 4)
                    .style("fill", "#1e3a5f")
                    .style("stroke", "#3b82f6")
                    .style("stroke-width", 1);

                entry.append("text")
                    .attr("x", boxWidth / 2 + 6 + boxWidth / 4 - 1)
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
                .attr("y", height - 15)
                .attr("text-anchor", "middle")
                .style("fill", COLORS.found)
                .style("font-size", "15px")
                .style("font-weight", "700")
                .style("font-family", "'JetBrains Mono', monospace")
                .text(`✓ Result: [${result.join(", ")}]`);
        }

        // Legend
        const legendItems = [
            { label: "Active", color: COLORS.default },
            { label: "Comparing", color: COLORS.comparing },
            { label: "Found", color: COLORS.found },
        ];

        const legend = svg.append("g")
            .attr("transform", `translate(${width - 180}, 20)`);

        legendItems.forEach((item, i) => {
            const lg = legend.append("g")
                .attr("transform", `translate(${i * 60}, 0)`);

            lg.append("rect")
                .attr("width", 12)
                .attr("height", 12)
                .attr("rx", 3)
                .style("fill", item.color);

            lg.append("text")
                .attr("x", 16)
                .attr("y", 10)
                .style("fill", COLORS.textMuted)
                .style("font-size", "10px")
                .text(item.label);
        });

    }, [step, dimensions]);

    return (
        <div ref={containerRef} className="w-full h-full bg-[#0f172a] rounded-lg overflow-hidden">
            <svg
                ref={svgRef}
                width={dimensions.width}
                height={dimensions.height}
                className="w-full h-full"
            />
            {/* Step description overlay */}
            <AnimatePresence>
                {step?.description && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0f172a] to-transparent p-4 pt-8"
                    >
                        <p className="text-center text-sm text-slate-300 font-medium">
                            {step.description}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
