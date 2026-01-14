import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { CyberState, CyberNode, CyberLink, CyberPacket, NodeStatus } from "../types";
import { Server, Database, User, Shield, Zap, Lock, Activity, Router, Flame, Skull } from "lucide-react";
import ReactDOMServer from "react-dom/server";

interface D3CyberVisualizerProps {
    state: CyberState;
    width?: number;
    height?: number;
}

export function D3CyberVisualizer({ state, width = 800, height = 500 }: D3CyberVisualizerProps) {
    const svgRef = useRef<SVGSVGElement>(null);

    // Initial Static Setup (Defs, Gradients) - Runs once
    useEffect(() => {
        if (!svgRef.current) return;
        const svg = d3.select(svgRef.current);

        if (svg.select("defs").empty()) {
            const defs = svg.append("defs");
            // Grid Pattern
            const pattern = defs.append("pattern")
                .attr("id", "grid-pattern-2")
                .attr("width", 40)
                .attr("height", 40)
                .attr("patternUnits", "userSpaceOnUse");
            pattern.append("path")
                .attr("d", "M 40 0 L 0 0 0 40")
                .attr("fill", "none")
                .attr("stroke", "#1e293b")
                .attr("stroke-width", 0.5);

            // Glows
            const glow = defs.append("filter").attr("id", "glow-2");
            glow.append("feGaussianBlur").attr("stdDeviation", "2.5").attr("result", "coloredBlur");
            const merge = glow.append("feMerge");
            merge.append("feMergeNode").attr("in", "coloredBlur");
            merge.append("feMergeNode").attr("in", "SourceGraphic");
        }
    }, []);

    // Active Render Loop (The "Sync" Logic)
    useEffect(() => {
        if (!svgRef.current) return;
        const svg = d3.select(svgRef.current);

        // 1. Scales
        const xScale = d3.scaleLinear().domain([0, 100]).range([50, width - 50]);
        const yScale = d3.scaleLinear().domain([0, 100]).range([50, height - 50]);

        // 2. Layer Groups (Create if not exist to preserve z-index)
        let bgGroup = svg.select<SVGGElement>(".bg-group");
        if (bgGroup.empty()) bgGroup = svg.append("g").attr("class", "bg-group");

        let linkGroup = svg.select<SVGGElement>(".link-group");
        if (linkGroup.empty()) linkGroup = svg.append("g").attr("class", "link-group");

        let nodeGroup = svg.select<SVGGElement>(".node-group");
        if (nodeGroup.empty()) nodeGroup = svg.append("g").attr("class", "node-group");

        let packetGroup = svg.select<SVGGElement>(".packet-group");
        if (packetGroup.empty()) packetGroup = svg.append("g").attr("class", "packet-group");

        // Background Update
        const bgRect = bgGroup.selectAll("rect").data([1]);
        bgRect.enter().append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("fill", "url(#grid-pattern-2)")
            .merge(bgRect as any);

        // --- LINKS SYNC ---
        // We use a key function (source+target) to maintain identity
        const links = linkGroup.selectAll<SVGLineElement, CyberLink>(".link")
            .data(state.links, d => d.source + "-" + d.target);

        // EXIT
        links.exit().transition().duration(500).attr("opacity", 0).remove();

        // UPDATE
        links.transition().duration(500)
            .attr("x1", d => xScale(state.nodes.find(n => n.id === d.source)?.x || 0))
            .attr("y1", d => yScale(state.nodes.find(n => n.id === d.source)?.y || 0))
            .attr("x2", d => xScale(state.nodes.find(n => n.id === d.target)?.x || 0))
            .attr("y2", d => yScale(state.nodes.find(n => n.id === d.target)?.y || 0));

        // ENTER
        const linksEnter = links.enter().append("line")
            .attr("class", "link")
            .attr("stroke", d => d.dashed ? "#475569" : "#334155")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", d => d.dashed ? "5,5" : "none")
            .attr("opacity", 0)
            .attr("x1", d => xScale(state.nodes.find(n => n.id === d.source)?.x || 0))
            .attr("y1", d => yScale(state.nodes.find(n => n.id === d.source)?.y || 0))
            .attr("x2", d => xScale(state.nodes.find(n => n.id === d.target)?.x || 0))
            .attr("y2", d => yScale(state.nodes.find(n => n.id === d.target)?.y || 0));

        linksEnter.transition().duration(500).attr("opacity", 1);


        // --- NODES SYNC ---
        const nodes = nodeGroup.selectAll<SVGGElement, CyberNode>(".node")
            .data(state.nodes, d => d.id);

        // EXIT
        nodes.exit().transition().duration(500).attr("opacity", 0).remove();

        // UPDATE (Move existing nodes if x/y changes)
        nodes.transition().duration(750)
            .attr("transform", d => `translate(${xScale(d.x)}, ${yScale(d.y)})`);

        // Update status colors (using Tweening ideally, but direct attribute set for now is robust)
        nodes.select(".status-ring")
            .transition().duration(500)
            .attr("stroke", d => getNodeColor(d.status));

        nodes.select(".status-label")
            .text(d => d.label);

        // Update Data Bubbles (Content change)
        nodes.each(function (d) {
            const group = d3.select(this);
            const dataBubble = group.select(".data-bubble");

            if (d.data) {
                if (dataBubble.empty()) {
                    // Create if missing
                    const b = group.append("g").attr("class", "data-bubble").attr("transform", "translate(25, -25)");
                    b.append("rect").attr("rx", 4).attr("fill", "#0f172a").attr("stroke", "#475569").attr("height", 20);
                    b.append("text").attr("x", 5).attr("y", 14).attr("fill", "#94a3b8").style("font-size", "10px").style("font-family", "monospace");
                }
                // Update content
                const b = group.select(".data-bubble");
                b.select("text").text(d.data);
                b.select("rect").attr("width", Math.max(60, (d.data.length * 6) + 10));
                b.attr("opacity", 1);
            } else {
                dataBubble.remove();
            }
        });


        // ENTER
        const nodesEnter = nodes.enter().append("g")
            .attr("class", "node")
            .attr("transform", d => `translate(${xScale(d.x)}, ${yScale(d.y)})`)
            .attr("opacity", 0);

        nodesEnter.transition().duration(500).attr("opacity", 1);

        // Enter: Shapes
        nodesEnter.append("circle")
            .attr("r", 24)
            .attr("fill", "#0f172a")
            .attr("stroke", "#1e293b")
            .attr("stroke-width", 2);

        nodesEnter.append("circle")
            .attr("class", "status-ring")
            .attr("r", 28)
            .attr("fill", "none")
            .attr("stroke", d => getNodeColor(d.status))
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "4,2")
            .style("filter", "url(#glow-2)");

        // Enter: Icons
        nodesEnter.each(function (d) {
            const g = d3.select(this);
            const Icon = getIconForType(d.type);
            g.append("foreignObject")
                .attr("x", -12).attr("y", -12).attr("width", 24).attr("height", 24)
                .html(ReactDOMServer.renderToString(<Icon size={24} color="#e2e8f0" />));
        });

        // Enter: Label
        nodesEnter.append("text")
            .attr("class", "status-label")
            .attr("y", 40)
            .attr("text-anchor", "middle")
            .attr("fill", "#94a3b8")
            .style("font-size", "10px")
            .style("font-weight", "bold")
            .text(d => d.label);


        // --- PACKETS SYNC ---
        // Crucial: Key by ID to ensure continuity
        const packets = packetGroup.selectAll<SVGGElement, CyberPacket>(".packet")
            .data(state.packets, d => d.id);

        // EXIT
        packets.exit().transition().duration(300).attr("opacity", 0).remove();

        // ENTER
        const packetsEnter = packets.enter().append("g")
            .attr("class", "packet")
            .attr("opacity", 0); // Start hidden for smooth fade-in

        packetsEnter.append("circle")
            .attr("r", 8)
            .attr("fill", d => d.type === "exploit" ? "#ef4444" : "#3b82f6")
            .style("filter", "url(#glow-2)");

        packetsEnter.append("text")
            .attr("y", -12).attr("text-anchor", "middle")
            .style("font-size", "9px").style("fill", "white").style("font-family", "monospace")
            .text(d => d.content);

        // MERGE (Enter + Update)
        // We use a transition to move the packet from source to target
        // NOTE: In a 'stepped' simulation, usually the packet exists in one step at a specific place.
        // However, to make it 'flow', we can animate it from Source to Target whenever it APPEARS.
        packetsEnter
            .attr("transform", d => {
                const s = state.nodes.find(n => n.id === d.source);
                return `translate(${xScale(s?.x || 0)}, ${yScale(s?.y || 0)})`;
            })
            .transition().duration(1500).ease(d3.easeLinear)
            .attr("opacity", 1)
            .attrTween("transform", function (d) {
                const s = state.nodes.find(n => n.id === d.source);
                const t = state.nodes.find(n => n.id === d.target);
                const x1 = xScale(s?.x || 0), y1 = yScale(s?.y || 0);
                const x2 = xScale(t?.x || 0), y2 = yScale(t?.y || 0);
                return d3.interpolateString(`translate(${x1},${y1})`, `translate(${x2},${y2})`);
            });

    }, [state, width, height]);

    return (
        <svg
            ref={svgRef}
            className="w-full h-full bg-slate-950 rounded-lg shadow-2xl"
            style={{ overflow: "visible" }}
        />
    );
}

function getNodeColor(status: NodeStatus): string {
    switch (status) {
        case "compromised": return "#ef4444";
        case "secure": return "#10b981";
        case "active": return "#3b82f6";
        default: return "#475569";
    }
}

function getIconForType(type: string): any {
    switch (type) {
        case "server": return Server;
        case "database": return Database;
        case "client": return User;
        case "attacker": return Skull;
        case "router": return Router;
        case "firewall": return Shield;
        default: return Zap;
    }
}
