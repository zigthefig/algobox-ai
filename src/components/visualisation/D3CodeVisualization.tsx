import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { motion, AnimatePresence } from "framer-motion";

interface D3CodeVisualizationProps {
    step: {
        index: number;
        type: string;
        description: string;
        state: {
            array?: (number | string)[];
            nums?: number[];
            digits?: (number | string)[];
            original?: number | string;
            reversed?: number | string;
            comparing?: number[];
            highlighted?: number[];
            sorted?: number[];
            found?: number[];
            hashMap?: Record<string | number, number>;
            stack?: (string | number)[];
            pointers?: { left?: number | null; right?: number | null; mid?: number | null };
            window?: { start?: number | null; end?: number | null };
            variables?: Record<string, any>;
            target?: number;
            result?: (number | string)[] | number | string | boolean | null;
            comparison?: { left: any; right: any; operator: string; result?: boolean };
        };
    };
}

const COLORS = {
    default: "#5c6bc0",
    comparing: "#ffa726",
    found: "#66bb6a",
    sorted: "#66bb6a",
    highlighted: "#42a5f5",
    selected: "#ab47bc",
    error: "#ef4444",
    text: "#e2e8f0",
    textMuted: "#94a3b8",
    background: "#0f172a",
    cardBg: "#1e293b",
    border: "#334155",
    pointer: "#f472b6",
};

export function D3CodeVisualization({ step }: D3CodeVisualizationProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 600, height: 400 });

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
        const svg = d3.select(svgRef.current);
        const { width, height } = dimensions;

        svg.selectAll("*").remove();

        // Create gradient definitions
        const defs = svg.append("defs");
        ["default", "comparing", "found", "highlighted", "pointer"].forEach((type) => {
            const gradient = defs.append("linearGradient")
                .attr("id", `gradient-${type}`)
                .attr("x1", "0%").attr("y1", "0%")
                .attr("x2", "0%").attr("y2", "100%");
            const color = COLORS[type as keyof typeof COLORS] || COLORS.default;
            gradient.append("stop").attr("offset", "0%").attr("stop-color", d3.color(color)?.brighter(0.3)?.toString() || color);
            gradient.append("stop").attr("offset", "100%").attr("stop-color", color);
        });

        const marginTop = 60;
        const marginBottom = 80;
        const marginLeft = 30;
        const marginRight = 30;

        // Main content group
        const g = svg.append("g").attr("transform", `translate(${marginLeft}, ${marginTop})`);
        const contentWidth = width - marginLeft - marginRight;
        const contentHeight = height - marginTop - marginBottom;

        // === DETECT VISUALIZATION TYPE ===
        const hasArray = (state.array && state.array.length > 0) || (state.nums && state.nums.length > 0);
        const hasDigits = state.digits && state.digits.length > 0;
        const hasComparison = state.comparison || (state.original !== undefined && state.reversed !== undefined);
        const hasStack = state.stack && state.stack.length > 0;
        const hasPointers = state.pointers && (state.pointers.left !== null || state.pointers.right !== null);

        // === RENDER BASED ON TYPE ===

        // 1. NUMBER COMPARISON VIEW
        if (hasComparison || (state.original !== undefined)) {
            renderComparisonView(g, state, contentWidth, contentHeight);
        }
        // 2. DIGITS VIEW (for palindrome, reverse)
        else if (hasDigits) {
            renderDigitsView(g, state, contentWidth, contentHeight);
        }
        // 3. STACK VIEW
        else if (hasStack && !hasArray) {
            renderStackView(g, state, contentWidth, contentHeight);
        }
        // 4. ARRAY VIEW (with pointers support)
        else if (hasArray) {
            renderArrayView(g, state, contentWidth, contentHeight);
        }
        // 5. VARIABLES ONLY VIEW
        else {
            renderVariablesOnlyView(g, state, contentWidth, contentHeight);
        }

        // === VARIABLES PANEL (always shown if variables exist) ===
        if (state.variables && Object.keys(state.variables).length > 0) {
            renderVariablesPanel(svg, state.variables, width, height);
        }

        // === RESULT DISPLAY ===
        if (state.result !== undefined && state.result !== null) {
            renderResult(svg, state.result, width, height);
        }

        // Helper functions
        function renderComparisonView(g: any, state: any, w: number, h: number) {
            const centerY = h / 2 - 20;
            const boxWidth = Math.min(150, w / 3);
            const boxHeight = 60;
            const gap = 60;

            // Title
            g.append("text")
                .attr("x", w / 2)
                .attr("y", 0)
                .attr("text-anchor", "middle")
                .style("fill", COLORS.text)
                .style("font-size", "14px")
                .style("font-weight", "600")
                .text("Number Comparison");

            // Left box (original)
            const leftX = w / 2 - boxWidth - gap / 2;
            g.append("rect")
                .attr("x", leftX)
                .attr("y", centerY)
                .attr("width", boxWidth)
                .attr("height", boxHeight)
                .attr("rx", 8)
                .style("fill", COLORS.cardBg)
                .style("stroke", COLORS.highlighted)
                .style("stroke-width", 2);

            g.append("text")
                .attr("x", leftX + boxWidth / 2)
                .attr("y", centerY - 10)
                .attr("text-anchor", "middle")
                .style("fill", COLORS.textMuted)
                .style("font-size", "11px")
                .text("Original");

            g.append("text")
                .attr("x", leftX + boxWidth / 2)
                .attr("y", centerY + boxHeight / 2 + 8)
                .attr("text-anchor", "middle")
                .style("fill", COLORS.text)
                .style("font-size", "24px")
                .style("font-weight", "700")
                .style("font-family", "'JetBrains Mono', monospace")
                .text(state.original ?? state.comparison?.left ?? "?");

            // Operator
            const operator = state.comparison?.operator || "==";
            g.append("text")
                .attr("x", w / 2)
                .attr("y", centerY + boxHeight / 2 + 8)
                .attr("text-anchor", "middle")
                .style("fill", COLORS.comparing)
                .style("font-size", "28px")
                .style("font-weight", "700")
                .text(operator);

            // Right box (reversed/comparison value)
            const rightX = w / 2 + gap / 2;
            g.append("rect")
                .attr("x", rightX)
                .attr("y", centerY)
                .attr("width", boxWidth)
                .attr("height", boxHeight)
                .attr("rx", 8)
                .style("fill", COLORS.cardBg)
                .style("stroke", COLORS.found)
                .style("stroke-width", 2);

            g.append("text")
                .attr("x", rightX + boxWidth / 2)
                .attr("y", centerY - 10)
                .attr("text-anchor", "middle")
                .style("fill", COLORS.textMuted)
                .style("font-size", "11px")
                .text("Reversed");

            g.append("text")
                .attr("x", rightX + boxWidth / 2)
                .attr("y", centerY + boxHeight / 2 + 8)
                .attr("text-anchor", "middle")
                .style("fill", COLORS.text)
                .style("font-size", "24px")
                .style("font-weight", "700")
                .style("font-family", "'JetBrains Mono', monospace")
                .text(state.reversed ?? state.comparison?.right ?? "?");

            // Result indicator
            if (state.comparison?.result !== undefined || (state.original !== undefined && state.reversed !== undefined)) {
                // Fix: Convert to string for comparison to handle number vs string cases (e.g. 121 vs "121")
                const isEqual = state.comparison?.result ?? (String(state.original) === String(state.reversed));
                const resultY = centerY + boxHeight + 30;

                g.append("text")
                    .attr("x", w / 2)
                    .attr("y", resultY)
                    .attr("text-anchor", "middle")
                    .style("fill", isEqual ? COLORS.found : COLORS.error)
                    .style("font-size", "16px")
                    .style("font-weight", "600")
                    .text(isEqual ? "✓ Equal - Palindrome!" : "✗ Not Equal");
            }
        }

        function renderDigitsView(g: any, state: any, w: number, h: number) {
            const digits = state.digits || [];
            const boxSize = Math.min(50, (w - 40) / Math.max(digits.length, 1));
            const gap = 8;
            const totalWidth = digits.length * (boxSize + gap) - gap;
            const startX = (w - totalWidth) / 2;
            const centerY = h / 2 - 40;

            // Title
            g.append("text")
                .attr("x", w / 2)
                .attr("y", 0)
                .attr("text-anchor", "middle")
                .style("fill", COLORS.text)
                .style("font-size", "14px")
                .style("font-weight", "600")
                .text("Digits");

            digits.forEach((digit: any, i: number) => {
                const x = startX + i * (boxSize + gap);
                const isHighlighted = state.highlighted?.includes(i);
                const isComparing = state.comparing?.includes(i);

                g.append("rect")
                    .attr("x", x)
                    .attr("y", centerY)
                    .attr("width", boxSize)
                    .attr("height", boxSize)
                    .attr("rx", 6)
                    .style("fill", isHighlighted ? COLORS.highlighted : isComparing ? COLORS.comparing : COLORS.cardBg)
                    .style("stroke", COLORS.border)
                    .style("stroke-width", 1)
                    .style("opacity", 0)
                    .transition()
                    .duration(300)
                    .delay(i * 50)
                    .style("opacity", 1);

                g.append("text")
                    .attr("x", x + boxSize / 2)
                    .attr("y", centerY + boxSize / 2 + 6)
                    .attr("text-anchor", "middle")
                    .style("fill", COLORS.text)
                    .style("font-size", "18px")
                    .style("font-weight", "700")
                    .style("font-family", "'JetBrains Mono', monospace")
                    .text(digit);

                // Index label
                g.append("text")
                    .attr("x", x + boxSize / 2)
                    .attr("y", centerY + boxSize + 16)
                    .attr("text-anchor", "middle")
                    .style("fill", COLORS.textMuted)
                    .style("font-size", "10px")
                    .text(i);
            });

            // Pointers for two-pointer algorithms
            if (state.pointers) {
                const { left, right } = state.pointers;
                if (left !== null && left !== undefined && left < digits.length) {
                    const x = startX + left * (boxSize + gap) + boxSize / 2;
                    g.append("path")
                        .attr("d", d3.symbol().type(d3.symbolTriangle).size(100))
                        .attr("transform", `translate(${x}, ${centerY - 15}) rotate(180)`)
                        .style("fill", COLORS.pointer);
                    g.append("text")
                        .attr("x", x)
                        .attr("y", centerY - 25)
                        .attr("text-anchor", "middle")
                        .style("fill", COLORS.pointer)
                        .style("font-size", "10px")
                        .text("L");
                }
                if (right !== null && right !== undefined && right < digits.length) {
                    const x = startX + right * (boxSize + gap) + boxSize / 2;
                    g.append("path")
                        .attr("d", d3.symbol().type(d3.symbolTriangle).size(100))
                        .attr("transform", `translate(${x}, ${centerY - 15}) rotate(180)`)
                        .style("fill", COLORS.found);
                    g.append("text")
                        .attr("x", x)
                        .attr("y", centerY - 25)
                        .attr("text-anchor", "middle")
                        .style("fill", COLORS.found)
                        .style("font-size", "10px")
                        .text("R");
                }
            }
        }

        function renderStackView(g: any, state: any, w: number, h: number) {
            const stack = state.stack || [];
            const boxHeight = 35;
            const boxWidth = Math.min(100, w / 3);
            const gap = 4;
            const startX = (w - boxWidth) / 2;
            const maxVisible = Math.floor((h - 40) / (boxHeight + gap));
            const visibleStack = stack.slice(-maxVisible);

            // Title
            g.append("text")
                .attr("x", w / 2)
                .attr("y", 0)
                .attr("text-anchor", "middle")
                .style("fill", COLORS.text)
                .style("font-size", "14px")
                .style("font-weight", "600")
                .text("Stack");

            // Stack visualization (bottom to top)
            visibleStack.forEach((item: any, i: number) => {
                const y = h - 60 - i * (boxHeight + gap);
                const isTop = i === visibleStack.length - 1;

                g.append("rect")
                    .attr("x", startX)
                    .attr("y", y)
                    .attr("width", boxWidth)
                    .attr("height", boxHeight)
                    .attr("rx", 4)
                    .style("fill", isTop ? COLORS.highlighted : COLORS.cardBg)
                    .style("stroke", isTop ? COLORS.highlighted : COLORS.border)
                    .style("stroke-width", isTop ? 2 : 1);

                g.append("text")
                    .attr("x", startX + boxWidth / 2)
                    .attr("y", y + boxHeight / 2 + 5)
                    .attr("text-anchor", "middle")
                    .style("fill", COLORS.text)
                    .style("font-size", "16px")
                    .style("font-weight", "600")
                    .style("font-family", "'JetBrains Mono', monospace")
                    .text(String(item));
            });

            // Top indicator
            if (visibleStack.length > 0) {
                const topY = h - 60 - (visibleStack.length - 1) * (boxHeight + gap);
                g.append("text")
                    .attr("x", startX - 10)
                    .attr("y", topY + boxHeight / 2 + 5)
                    .attr("text-anchor", "end")
                    .style("fill", COLORS.pointer)
                    .style("font-size", "12px")
                    .text("TOP →");
            }
        }

        function renderArrayView(g: any, state: any, w: number, h: number) {
            const array = state.array || state.nums || [];
            if (!array.length) return;

            const { comparing = [], highlighted = [], sorted = [], found = [], pointers = {}, hashMap = {} } = state;

            // Convert to numbers for visualization
            const numericArray = array.map((v: any) => typeof v === 'number' ? v : (typeof v === 'string' ? v.charCodeAt(0) : 0));
            const maxValue = Math.max(...numericArray.map((v: number) => Math.abs(v)), 1);

            const barPadding = 0.15;
            const chartHeight = h - (Object.keys(hashMap).length > 0 ? 80 : 20);

            const xScale = d3.scaleBand<number>()
                .domain(array.map((_: any, i: number) => i))
                .range([0, w])
                .padding(barPadding);

            const yScale = d3.scaleLinear()
                .domain([0, maxValue * 1.15])
                .range([chartHeight, 0]);

            const getBarType = (index: number): string => {
                if (found.includes(index)) return "found";
                if (sorted.includes(index)) return "found";
                if (comparing.includes(index)) return "comparing";
                if (highlighted.includes(index)) return "highlighted";
                if (pointers.left === index || pointers.right === index) return "pointer";
                return "default";
            };

            // Draw bars
            array.forEach((val: any, i: number) => {
                const barType = getBarType(i);
                const numVal = numericArray[i];
                const barHeight = chartHeight - yScale(Math.abs(numVal));

                g.append("rect")
                    .attr("x", xScale(i))
                    .attr("y", yScale(Math.abs(numVal)))
                    .attr("width", xScale.bandwidth())
                    .attr("height", barHeight)
                    .attr("rx", 4)
                    .style("fill", `url(#gradient-${barType})`)
                    .style("filter", barType !== "default" ? `drop-shadow(0 0 8px ${COLORS[barType as keyof typeof COLORS]})` : "none");

                // Value label
                g.append("text")
                    .attr("x", (xScale(i) || 0) + xScale.bandwidth() / 2)
                    .attr("y", yScale(Math.abs(numVal)) - 6)
                    .attr("text-anchor", "middle")
                    .style("fill", COLORS.text)
                    .style("font-size", "12px")
                    .style("font-weight", "600")
                    .style("font-family", "'JetBrains Mono', monospace")
                    .text(val);

                // Index label
                g.append("text")
                    .attr("x", (xScale(i) || 0) + xScale.bandwidth() / 2)
                    .attr("y", chartHeight + 14)
                    .attr("text-anchor", "middle")
                    .style("fill", COLORS.textMuted)
                    .style("font-size", "10px")
                    .text(i);
            });

            // Pointer arrows
            if (pointers.left !== null && pointers.left !== undefined) {
                const x = (xScale(pointers.left) || 0) + xScale.bandwidth() / 2;
                g.append("path")
                    .attr("d", d3.symbol().type(d3.symbolTriangle).size(80))
                    .attr("transform", `translate(${x}, -10) rotate(180)`)
                    .style("fill", COLORS.pointer);
                g.append("text")
                    .attr("x", x).attr("y", -18)
                    .attr("text-anchor", "middle")
                    .style("fill", COLORS.pointer)
                    .style("font-size", "10px")
                    .text("L");
            }
            if (pointers.right !== null && pointers.right !== undefined) {
                const x = (xScale(pointers.right) || 0) + xScale.bandwidth() / 2;
                g.append("path")
                    .attr("d", d3.symbol().type(d3.symbolTriangle).size(80))
                    .attr("transform", `translate(${x}, -10) rotate(180)`)
                    .style("fill", COLORS.found);
                g.append("text")
                    .attr("x", x).attr("y", -18)
                    .attr("text-anchor", "middle")
                    .style("fill", COLORS.found)
                    .style("font-size", "10px")
                    .text("R");
            }
            if (pointers.mid !== null && pointers.mid !== undefined) {
                const x = (xScale(pointers.mid) || 0) + xScale.bandwidth() / 2;
                g.append("path")
                    .attr("d", d3.symbol().type(d3.symbolTriangle).size(80))
                    .attr("transform", `translate(${x}, -10) rotate(180)`)
                    .style("fill", COLORS.comparing);
                g.append("text")
                    .attr("x", x).attr("y", -18)
                    .attr("text-anchor", "middle")
                    .style("fill", COLORS.comparing)
                    .style("font-size", "10px")
                    .text("M");
            }

            // Hash Map
            if (Object.keys(hashMap).length > 0) {
                const hashY = chartHeight + 30;
                g.append("text")
                    .attr("x", 0).attr("y", hashY)
                    .style("fill", COLORS.textMuted)
                    .style("font-size", "10px")
                    .text("HashMap:");

                const entries = Object.entries(hashMap);
                const entryWidth = 45;
                entries.slice(0, 8).forEach(([key, value], i) => {
                    const x = 60 + i * (entryWidth + 6);
                    g.append("rect")
                        .attr("x", x).attr("y", hashY - 12)
                        .attr("width", entryWidth).attr("height", 22)
                        .attr("rx", 4)
                        .style("fill", COLORS.cardBg)
                        .style("stroke", COLORS.border);
                    g.append("text")
                        .attr("x", x + entryWidth / 2).attr("y", hashY + 2)
                        .attr("text-anchor", "middle")
                        .style("fill", COLORS.text)
                        .style("font-size", "9px")
                        .style("font-family", "'JetBrains Mono', monospace")
                        .text(`${key}→${value}`);
                });
            }
        }

        function renderVariablesOnlyView(g: any, state: any, w: number, h: number) {
            g.append("text")
                .attr("x", w / 2)
                .attr("y", h / 2)
                .attr("text-anchor", "middle")
                .style("fill", COLORS.textMuted)
                .style("font-size", "14px")
                .text("See variables panel below ↓");
        }

        function renderVariablesPanel(svg: any, variables: Record<string, any>, w: number, h: number) {
            const panelY = h - 55;
            const entries = Object.entries(variables);

            // Background
            svg.append("rect")
                .attr("x", 10).attr("y", panelY - 5)
                .attr("width", w - 20).attr("height", 35)
                .attr("rx", 6)
                .style("fill", "rgba(30, 41, 59, 0.8)")
                .style("stroke", COLORS.border);

            // Variables
            const varText = entries.map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join("  │  ");
            svg.append("text")
                .attr("x", 20).attr("y", panelY + 15)
                .style("fill", COLORS.text)
                .style("font-size", "11px")
                .style("font-family", "'JetBrains Mono', monospace")
                .text(varText.length > 80 ? varText.substring(0, 77) + "..." : varText);
        }

        function renderResult(svg: any, result: any, w: number, h: number) {
            const resultStr = typeof result === 'object' ? JSON.stringify(result) : String(result);
            const isSuccess = result === true || (typeof result === 'string' && result.toLowerCase().includes('true'));

            svg.append("text")
                .attr("x", w / 2)
                .attr("y", h - 10)
                .attr("text-anchor", "middle")
                .style("fill", typeof result === 'boolean' ? (result ? COLORS.found : COLORS.error) : COLORS.found)
                .style("font-size", "13px")
                .style("font-weight", "600")
                .style("font-family", "'JetBrains Mono', monospace")
                .text(`Result: ${resultStr}`);
        }

    }, [step, dimensions]);

    return (
        <div ref={containerRef} className="w-full h-full bg-[#0f172a] rounded-lg overflow-hidden relative">
            <svg
                ref={svgRef}
                width={dimensions.width}
                height={dimensions.height}
                className="w-full h-full"
            />
            <AnimatePresence>
                {step?.description && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-2 left-0 right-0 px-4"
                    >
                        <p className="text-center text-sm text-slate-300 font-medium bg-slate-900/80 rounded-lg py-2 px-3">
                            {step.description}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
