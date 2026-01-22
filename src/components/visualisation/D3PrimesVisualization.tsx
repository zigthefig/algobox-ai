import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface D3PrimesVisualizationProps {
    step: any;
}

export function D3PrimesVisualization({ step }: D3PrimesVisualizationProps) {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || !step?.state?.limit) return;

        const { limit, primes, eliminated, current, checking } = step.state;
        // limit is max number (e.g. 100)

        const svg = d3.select(svgRef.current);
        const width = svgRef.current.clientWidth;
        const height = svgRef.current.clientHeight;

        svg.selectAll("*").remove();

        const margin = { top: 60, right: 20, bottom: 20, left: 20 };
        const chartWidth = width - margin.left - margin.right;

        // Calculate Grid Dimensions
        // Try to make it somewhat square or fit width
        const cols = 10;
        const rows = Math.ceil(limit / cols);

        const cellSize = Math.min(
            (chartWidth) / cols,
            (height - margin.top - margin.bottom) / rows
        );

        const gridWidth = cols * cellSize;
        const startX = (chartWidth - gridWidth) / 2 + margin.left;
        const startY = margin.top;

        const g = svg.append("g")
            .attr("transform", `translate(${startX},${startY})`);

        // Title
        svg.append("text")
            .attr("x", gridWidth / 2)
            .attr("y", -25)
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .style("font-weight", "bold")
            .style("fill", "#e2e8f0")
            .text("Sieve of Eratosthenes");

        for (let i = 1; i <= limit; i++) {
            const col = (i - 1) % cols;
            const row = Math.floor((i - 1) / cols);

            const x = col * cellSize;
            const y = row * cellSize;

            const cellGroup = g.append("g")
                .attr("transform", `translate(${x},${y})`);

            let fill = "#1e293b"; // Default background
            let textFill = "#94a3b8";

            if (i === 1) {
                fill = "#0f172a"; // 1 is special (neither)
                textFill = "#475569";
            } else if (primes?.includes(i)) {
                fill = "#22c55e"; // Prime (Green)
                textFill = "#ffffff";
            } else if (eliminated?.includes(i)) {
                fill = "#ef4444"; // Eliminated (Red)
                textFill = "#fca5a5";
            }

            if (i === current) {
                fill = "#3b82f6"; // Current Prime being processed
                textFill = "#ffffff";
            }
            if (i === checking) {
                fill = "#eab308"; // Currently checking being crossed out
                textFill = "#ffffff";
            }

            cellGroup.append("rect")
                .attr("width", cellSize - 4)
                .attr("height", cellSize - 4)
                .attr("rx", 6)
                .attr("x", 2)
                .attr("y", 2)
                .style("fill", fill)
                .style("stroke", i === current ? "#ffffff" : "none")
                .style("stroke-width", 2)
                .style("transition", "fill 0.3s ease");

            cellGroup.append("text")
                .attr("x", cellSize / 2)
                .attr("y", cellSize / 2)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "central")
                .style("font-size", `${cellSize * 0.4}px`)
                .style("font-weight", "600")
                .style("fill", textFill)
                .text(i);
        }

        // Legend logic (simplified)
        const legendData = [
            { label: "Prime", color: "#22c55e" },
            { label: "Checking", color: "#eab308" },
            { label: "Processing", color: "#3b82f6" },
            { label: "Composite", color: "#ef4444" },
        ];
        // Add legend if needed, but colors are intuitive.

    }, [step]);

    return (
        <svg
            ref={svgRef}
            className="w-full h-full"
            style={{ minHeight: "450px" }}
        />
    );
}
