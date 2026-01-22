import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface D3NQueenVisualizationProps {
    step: any;
    n?: number;
}

export function D3NQueenVisualization({ step, n = 8 }: D3NQueenVisualizationProps) {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || !step?.state?.board) return;

        const { board, current, phase, conflicts } = step.state;
        const size = board.length;

        const svg = d3.select(svgRef.current);
        const width = svgRef.current.clientWidth;
        const height = svgRef.current.clientHeight;

        svg.selectAll("*").remove();

        const margin = { top: 40, right: 40, bottom: 40, left: 40 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        const cellSize = Math.min(chartWidth, chartHeight) / size;
        const boardSize = cellSize * size;

        const startX = (chartWidth - boardSize) / 2 + margin.left;
        const startY = (chartHeight - boardSize) / 2 + margin.top;

        const g = svg.append("g")
            .attr("transform", `translate(${startX},${startY})`);

        // Title
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", 30)
            .attr("text-anchor", "middle")
            .style("font-size", "18px")
            .style("font-weight", "600")
            .style("fill", "#e2e8f0")
            .text(`${size}-Queens Backtracking`);

        // Draw Board
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const isBlack = (row + col) % 2 === 1;
                const cellGroup = g.append("g")
                    .attr("transform", `translate(${col * cellSize},${row * cellSize})`);

                // Cell Background
                let fill = isBlack ? "#334155" : "#cbd5e1"; // Slate-700 vs Slate-300

                // Highlight logic
                if (current?.row === row && current?.col === col) {
                    fill = "#eab308"; // Yellow for processing
                } else if (conflicts?.some((c: any) => c.row === row && c.col === col)) {
                    fill = "#ef4444"; // Red for conflict
                }

                cellGroup.append("rect")
                    .attr("width", cellSize)
                    .attr("height", cellSize)
                    .style("fill", fill)
                    .style("stroke", "#0f172a")
                    .style("stroke-width", 1);

                // Draw Queen if present
                if (board[row][col] === 1) {
                    cellGroup.append("text")
                        .attr("x", cellSize / 2)
                        .attr("y", cellSize / 2)
                        .attr("text-anchor", "middle")
                        .attr("dominant-baseline", "central")
                        .style("font-size", `${cellSize * 0.7}px`)
                        .style("fill", isBlack ? "#ffffff" : "#000000") // Correct contrast
                        .text("♛");
                }
            }
        }

        // Legend
        const legendData = [
            { label: "Queen", color: "#22c55e" }, // Using text color context or just logic
            { label: "Empty (Light)", color: "#cbd5e1" },
            { label: "Empty (Dark)", color: "#334155" },
            { label: "Checking", color: "#eab308" },
            { label: "Conflict", color: "#ef4444" },
        ];

        // ... skipping complex legend for now, simple is better ...

    }, [step, n]);

    return (
        <svg
            ref={svgRef}
            className="w-full h-full"
            style={{ minHeight: "450px" }}
        />
    );
}
