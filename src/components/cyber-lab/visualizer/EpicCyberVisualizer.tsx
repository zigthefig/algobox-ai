import { useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import { CyberState, CyberNode, CyberLink, CyberPacket, NodeStatus } from "../types";

interface EpicCyberVisualizerProps {
    state: CyberState;
    mode: "attack" | "defense";
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    color: string;
    size: number;
}

export function EpicCyberVisualizer({ state, mode }: EpicCyberVisualizerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    const particlesRef = useRef<Particle[]>([]);
    const dimensionsRef = useRef({ width: 800, height: 500 });

    // Particle system
    const createParticles = useCallback((x: number, y: number, color: string, count: number = 15) => {
        const newParticles: Particle[] = [];
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const speed = 1 + Math.random() * 3;
            newParticles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                maxLife: 60 + Math.random() * 40,
                color,
                size: 2 + Math.random() * 4,
            });
        }
        particlesRef.current = [...particlesRef.current, ...newParticles];
    }, []);

    // Ambient floating particles
    const createAmbientParticle = useCallback(() => {
        const { width, height } = dimensionsRef.current;
        const side = Math.floor(Math.random() * 4);
        let x: number, y: number, vx: number, vy: number;
        
        switch(side) {
            case 0: // top
                x = Math.random() * width;
                y = 0;
                vx = (Math.random() - 0.5) * 0.5;
                vy = 0.3 + Math.random() * 0.3;
                break;
            case 1: // right
                x = width;
                y = Math.random() * height;
                vx = -(0.3 + Math.random() * 0.3);
                vy = (Math.random() - 0.5) * 0.5;
                break;
            case 2: // bottom
                x = Math.random() * width;
                y = height;
                vx = (Math.random() - 0.5) * 0.5;
                vy = -(0.3 + Math.random() * 0.3);
                break;
            default: // left
                x = 0;
                y = Math.random() * height;
                vx = 0.3 + Math.random() * 0.3;
                vy = (Math.random() - 0.5) * 0.5;
        }
        
        const colors = mode === "attack" 
            ? ["#ef4444", "#f97316", "#dc2626"] 
            : ["#10b981", "#3b82f6", "#14b8a6"];
        
        particlesRef.current.push({
            x, y, vx, vy,
            life: 1,
            maxLife: 200 + Math.random() * 100,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: 1 + Math.random() * 2,
        });
    }, [mode]);

    // Canvas animation loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let frameCount = 0;
        
        const animate = () => {
            const { width, height } = dimensionsRef.current;
            ctx.clearRect(0, 0, width, height);
            
            // Add ambient particles
            frameCount++;
            if (frameCount % 8 === 0 && particlesRef.current.length < 150) {
                createAmbientParticle();
            }
            
            // Update and draw particles
            particlesRef.current = particlesRef.current.filter(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 1 / p.maxLife;
                
                if (p.life <= 0) return false;
                
                const alpha = p.life * 0.6;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                ctx.fillStyle = p.color.replace(")", `, ${alpha})`).replace("rgb", "rgba").replace("#", "");
                
                // Convert hex to rgba
                const hex = p.color;
                const r = parseInt(hex.slice(1, 3), 16);
                const g = parseInt(hex.slice(3, 5), 16);
                const b = parseInt(hex.slice(5, 7), 16);
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                ctx.fill();
                
                // Glow effect
                ctx.shadowBlur = 10;
                ctx.shadowColor = p.color;
                
                return true;
            });
            
            ctx.shadowBlur = 0;
            animationRef.current = requestAnimationFrame(animate);
        };
        
        animate();
        
        return () => {
            cancelAnimationFrame(animationRef.current);
        };
    }, [createAmbientParticle]);

    // Handle resize
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                dimensionsRef.current = { width: rect.width, height: rect.height };
                
                if (svgRef.current) {
                    svgRef.current.setAttribute("width", String(rect.width));
                    svgRef.current.setAttribute("height", String(rect.height));
                }
                if (canvasRef.current) {
                    canvasRef.current.width = rect.width;
                    canvasRef.current.height = rect.height;
                }
            }
        };
        
        updateDimensions();
        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    // D3 Visualization
    useEffect(() => {
        if (!svgRef.current) return;
        
        const svg = d3.select(svgRef.current);
        const { width, height } = dimensionsRef.current;
        
        // Scales
        const xScale = d3.scaleLinear().domain([0, 100]).range([80, width - 80]);
        const yScale = d3.scaleLinear().domain([0, 100]).range([80, height - 80]);

        // Setup defs once
        if (svg.select("defs").empty()) {
            const defs = svg.append("defs");
            
            // Animated grid pattern
            const gridPattern = defs.append("pattern")
                .attr("id", "cyber-grid")
                .attr("width", 50)
                .attr("height", 50)
                .attr("patternUnits", "userSpaceOnUse");
            
            gridPattern.append("path")
                .attr("d", "M 50 0 L 0 0 0 50")
                .attr("fill", "none")
                .attr("stroke", "rgba(59, 130, 246, 0.08)")
                .attr("stroke-width", 1);
                
            gridPattern.append("circle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", 1.5)
                .attr("fill", "rgba(59, 130, 246, 0.15)");

            // Glows for different states
            const createGlow = (id: string, color: string, intensity: number) => {
                const filter = defs.append("filter")
                    .attr("id", id)
                    .attr("x", "-100%")
                    .attr("y", "-100%")
                    .attr("width", "300%")
                    .attr("height", "300%");
                
                filter.append("feGaussianBlur")
                    .attr("in", "SourceGraphic")
                    .attr("stdDeviation", intensity)
                    .attr("result", "blur");
                    
                filter.append("feFlood")
                    .attr("flood-color", color)
                    .attr("flood-opacity", "0.8")
                    .attr("result", "color");
                    
                filter.append("feComposite")
                    .attr("in", "color")
                    .attr("in2", "blur")
                    .attr("operator", "in")
                    .attr("result", "coloredBlur");
                
                const merge = filter.append("feMerge");
                merge.append("feMergeNode").attr("in", "coloredBlur");
                merge.append("feMergeNode").attr("in", "coloredBlur");
                merge.append("feMergeNode").attr("in", "SourceGraphic");
            };

            createGlow("glow-red", "#ef4444", 8);
            createGlow("glow-green", "#10b981", 8);
            createGlow("glow-blue", "#3b82f6", 6);
            createGlow("glow-purple", "#8b5cf6", 6);
            createGlow("glow-orange", "#f97316", 8);
            
            // Pulse animation
            const pulseFilter = defs.append("filter")
                .attr("id", "pulse-glow")
                .attr("x", "-100%")
                .attr("y", "-100%")
                .attr("width", "300%")
                .attr("height", "300%");
            
            pulseFilter.append("feGaussianBlur")
                .attr("in", "SourceGraphic")
                .attr("stdDeviation", "4");
                
            // Gradient for links
            const linkGradient = defs.append("linearGradient")
                .attr("id", "link-gradient")
                .attr("gradientUnits", "userSpaceOnUse");
            
            linkGradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", "#3b82f6")
                .attr("stop-opacity", "0.3");
            
            linkGradient.append("stop")
                .attr("offset", "50%")
                .attr("stop-color", "#8b5cf6")
                .attr("stop-opacity", "0.6");
                
            linkGradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", "#3b82f6")
                .attr("stop-opacity", "0.3");
        }

        // Create layer groups
        let bgGroup = svg.select<SVGGElement>(".bg-layer");
        if (bgGroup.empty()) bgGroup = svg.append("g").attr("class", "bg-layer");
        
        let linkGroup = svg.select<SVGGElement>(".link-layer");
        if (linkGroup.empty()) linkGroup = svg.append("g").attr("class", "link-layer");
        
        let nodeGroup = svg.select<SVGGElement>(".node-layer");
        if (nodeGroup.empty()) nodeGroup = svg.append("g").attr("class", "node-layer");
        
        let packetGroup = svg.select<SVGGElement>(".packet-layer");
        if (packetGroup.empty()) packetGroup = svg.append("g").attr("class", "packet-layer");

        // Background
        const bgRect = bgGroup.selectAll("rect.bg").data([1]);
        bgRect.enter().append("rect")
            .attr("class", "bg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("fill", "url(#cyber-grid)");

        // --- LINKS ---
        const links = linkGroup.selectAll<SVGGElement, CyberLink>(".link-group")
            .data(state.links, d => `${d.source}-${d.target}`);
        
        links.exit().transition().duration(300).attr("opacity", 0).remove();
        
        const linksEnter = links.enter().append("g")
            .attr("class", "link-group")
            .attr("opacity", 0);
        
        // Main link line
        linksEnter.append("line")
            .attr("class", "link-line")
            .attr("stroke", d => d.dashed ? "rgba(239, 68, 68, 0.4)" : "rgba(59, 130, 246, 0.3)")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", d => d.dashed ? "8,4" : "none");
        
        // Glow line (animated)
        linksEnter.append("line")
            .attr("class", "link-glow")
            .attr("stroke", d => d.dashed ? "rgba(239, 68, 68, 0.2)" : "rgba(99, 102, 241, 0.2)")
            .attr("stroke-width", 6)
            .attr("stroke-linecap", "round")
            .style("filter", "blur(4px)");
        
        // Data flow particles along links
        linksEnter.append("circle")
            .attr("class", "flow-particle")
            .attr("r", 3)
            .attr("fill", d => d.dashed ? "#ef4444" : "#3b82f6")
            .style("filter", d => d.dashed ? "url(#glow-red)" : "url(#glow-blue)");
        
        // Merge and update all links
        const allLinks = linksEnter.merge(links);
        
        allLinks.transition().duration(500).attr("opacity", 1);
        
        allLinks.each(function(d) {
            const group = d3.select(this);
            const sourceNode = state.nodes.find(n => n.id === d.source);
            const targetNode = state.nodes.find(n => n.id === d.target);
            
            if (!sourceNode || !targetNode) return;
            
            const x1 = xScale(sourceNode.x);
            const y1 = yScale(sourceNode.y);
            const x2 = xScale(targetNode.x);
            const y2 = yScale(targetNode.y);
            
            group.selectAll("line")
                .attr("x1", x1)
                .attr("y1", y1)
                .attr("x2", x2)
                .attr("y2", y2);
            
            // Animate flow particle
            const flowParticle = group.select(".flow-particle");
            const animateFlow = () => {
                flowParticle
                    .attr("cx", x1)
                    .attr("cy", y1)
                    .attr("opacity", 0.8)
                    .transition()
                    .duration(2000 + Math.random() * 1000)
                    .ease(d3.easeLinear)
                    .attr("cx", x2)
                    .attr("cy", y2)
                    .attr("opacity", 0.3)
                    .on("end", animateFlow);
            };
            animateFlow();
        });

        // --- NODES ---
        const nodes = nodeGroup.selectAll<SVGGElement, CyberNode>(".node")
            .data(state.nodes, d => d.id);
        
        nodes.exit().transition().duration(300)
            .attr("opacity", 0)
            .attr("transform", (d: CyberNode) => `translate(${xScale(d.x)}, ${yScale(d.y)}) scale(0)`)
            .remove();
        
        const nodesEnter = nodes.enter().append("g")
            .attr("class", "node")
            .attr("transform", d => `translate(${xScale(d.x)}, ${yScale(d.y)})`)
            .attr("opacity", 0)
            .style("cursor", "pointer");
        
        // Outer pulse ring
        nodesEnter.append("circle")
            .attr("class", "pulse-ring")
            .attr("r", 45)
            .attr("fill", "none")
            .attr("stroke-width", 2)
            .attr("opacity", 0);
        
        // Hexagon background
        const hexRadius = 38;
        const hexPoints = d3.range(6).map(i => {
            const angle = (Math.PI / 3) * i - Math.PI / 2;
            return `${Math.cos(angle) * hexRadius},${Math.sin(angle) * hexRadius}`;
        }).join(" ");
        
        nodesEnter.append("polygon")
            .attr("class", "hex-bg")
            .attr("points", hexPoints)
            .attr("fill", "rgba(15, 23, 42, 0.9)")
            .attr("stroke-width", 2);
        
        // Inner glow circle
        nodesEnter.append("circle")
            .attr("class", "inner-glow")
            .attr("r", 30)
            .attr("fill", "rgba(30, 41, 59, 0.8)")
            .attr("stroke-width", 1);
        
        // Icon (using text for simplicity, but with proper symbols)
        nodesEnter.append("text")
            .attr("class", "node-icon")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("font-size", "22px")
            .attr("fill", "#e2e8f0");
        
        // Shield indicator
        nodesEnter.append("circle")
            .attr("class", "shield-indicator")
            .attr("cx", 25)
            .attr("cy", -25)
            .attr("r", 12)
            .attr("fill", "#10b981")
            .attr("opacity", 0)
            .style("filter", "url(#glow-green)");
        
        nodesEnter.append("text")
            .attr("class", "shield-icon")
            .attr("x", 25)
            .attr("y", -25)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("font-size", "12px")
            .attr("fill", "white")
            .text("🛡")
            .attr("opacity", 0);
        
        // Label
        nodesEnter.append("text")
            .attr("class", "node-label")
            .attr("y", 55)
            .attr("text-anchor", "middle")
            .attr("fill", "#94a3b8")
            .attr("font-size", "11px")
            .attr("font-weight", "600");
        
        // Data bubble
        nodesEnter.append("g")
            .attr("class", "data-bubble")
            .attr("transform", "translate(0, -60)")
            .attr("opacity", 0);
        
        // Merge and update
        const allNodes = nodesEnter.merge(nodes);
        
        allNodes.transition().duration(600)
            .attr("opacity", 1)
            .attr("transform", d => `translate(${xScale(d.x)}, ${yScale(d.y)})`);
        
        allNodes.each(function(d) {
            const group = d3.select(this);
            const statusColor = getStatusColor(d.status);
            const glowFilter = getGlowFilter(d.status);
            
            // Update hex border
            group.select(".hex-bg")
                .transition().duration(400)
                .attr("stroke", statusColor);
            
            // Update inner glow
            group.select(".inner-glow")
                .transition().duration(400)
                .attr("stroke", statusColor)
                .style("filter", glowFilter);
            
            // Pulse animation for active/compromised nodes
            const pulseRing = group.select(".pulse-ring");
            if (d.status === "compromised" || d.status === "active") {
                const animatePulse = () => {
                    pulseRing
                        .attr("r", 45)
                        .attr("opacity", 0.6)
                        .attr("stroke", statusColor)
                        .transition()
                        .duration(1500)
                        .ease(d3.easeQuadOut)
                        .attr("r", 70)
                        .attr("opacity", 0)
                        .on("end", animatePulse);
                };
                animatePulse();
                
                // Create explosion particles for compromised
                if (d.status === "compromised") {
                    createParticles(xScale(d.x), yScale(d.y), "#ef4444", 20);
                }
            } else {
                pulseRing.attr("opacity", 0);
            }
            
            // Update icon
            group.select(".node-icon")
                .text(getNodeIcon(d.type))
                .attr("fill", d.status === "compromised" ? "#ef4444" : 
                              d.status === "secure" ? "#10b981" : "#e2e8f0");
            
            // Update label
            group.select(".node-label")
                .text(d.label);
            
            // Shield indicator
            if (d.hasShield) {
                group.select(".shield-indicator").transition().duration(300).attr("opacity", 1);
                group.select(".shield-icon").transition().duration(300).attr("opacity", 1);
                createParticles(xScale(d.x), yScale(d.y), "#10b981", 10);
            } else {
                group.select(".shield-indicator").attr("opacity", 0);
                group.select(".shield-icon").attr("opacity", 0);
            }
            
            // Data bubble
            const dataBubble = group.select(".data-bubble");
            if (d.data) {
                dataBubble.selectAll("*").remove();
                
                const bubbleWidth = Math.min(200, d.data.length * 7 + 20);
                
                dataBubble.append("rect")
                    .attr("x", -bubbleWidth / 2)
                    .attr("y", -15)
                    .attr("width", bubbleWidth)
                    .attr("height", 30)
                    .attr("rx", 6)
                    .attr("fill", "rgba(15, 23, 42, 0.95)")
                    .attr("stroke", statusColor)
                    .attr("stroke-width", 1);
                
                dataBubble.append("text")
                    .attr("text-anchor", "middle")
                    .attr("dominant-baseline", "central")
                    .attr("fill", statusColor)
                    .attr("font-size", "10px")
                    .attr("font-family", "monospace")
                    .text(d.data.length > 25 ? d.data.substring(0, 25) + "..." : d.data);
                
                dataBubble.transition().duration(300).attr("opacity", 1);
            } else {
                dataBubble.transition().duration(200).attr("opacity", 0);
            }
        });

        // --- PACKETS ---
        const packets = packetGroup.selectAll<SVGGElement, CyberPacket>(".packet")
            .data(state.packets, d => d.id);
        
        packets.exit().transition().duration(200)
            .attr("opacity", 0)
            .remove();
        
        const packetsEnter = packets.enter().append("g")
            .attr("class", "packet")
            .attr("opacity", 0);
        
        // Packet glow
        packetsEnter.append("circle")
            .attr("class", "packet-glow")
            .attr("r", 18)
            .style("filter", "blur(8px)");
        
        // Packet body
        packetsEnter.append("circle")
            .attr("class", "packet-body")
            .attr("r", 10);
        
        // Packet inner
        packetsEnter.append("circle")
            .attr("class", "packet-inner")
            .attr("r", 5)
            .attr("fill", "white")
            .attr("opacity", 0.8);
        
        // Packet label
        packetsEnter.append("text")
            .attr("class", "packet-label")
            .attr("y", -20)
            .attr("text-anchor", "middle")
            .attr("font-size", "9px")
            .attr("font-family", "monospace")
            .attr("font-weight", "600");

        packetsEnter.each(function(d) {
            const group = d3.select(this);
            const sourceNode = state.nodes.find(n => n.id === d.source);
            const targetNode = state.nodes.find(n => n.id === d.target);
            
            if (!sourceNode || !targetNode) return;
            
            const x1 = xScale(sourceNode.x);
            const y1 = yScale(sourceNode.y);
            const x2 = xScale(targetNode.x);
            const y2 = yScale(targetNode.y);
            
            const packetColor = getPacketColor(d.type);
            const glowColor = d.type === "exploit" ? "rgba(239, 68, 68, 0.5)" : 
                             d.type === "encrypted" ? "rgba(16, 185, 129, 0.5)" : "rgba(59, 130, 246, 0.5)";
            
            group.select(".packet-glow").attr("fill", glowColor);
            group.select(".packet-body").attr("fill", packetColor);
            group.select(".packet-label")
                .attr("fill", packetColor)
                .text(d.content.length > 20 ? d.content.substring(0, 20) + "..." : d.content);
            
            // Animate from source to target
            group
                .attr("transform", `translate(${x1}, ${y1})`)
                .transition()
                .duration(100)
                .attr("opacity", 1)
                .transition()
                .duration(1500)
                .ease(d3.easeQuadInOut)
                .attrTween("transform", () => {
                    const interpolateX = d3.interpolateNumber(x1, x2);
                    const interpolateY = d3.interpolateNumber(y1, y2);
                    return (t: number) => {
                        // Add wave motion
                        const wave = Math.sin(t * Math.PI * 2) * 5;
                        const x = interpolateX(t);
                        const y = interpolateY(t) + wave;
                        return `translate(${x}, ${y})`;
                    };
                })
                .on("end", () => {
                    // Explosion at target
                    createParticles(x2, y2, packetColor, 12);
                });
        });

    }, [state, createParticles]);

    return (
        <div ref={containerRef} className="relative w-full h-full overflow-hidden">
            {/* Ambient gradient background */}
            <div className={`absolute inset-0 transition-all duration-1000 ${
                mode === "attack" 
                    ? "bg-gradient-to-br from-slate-950 via-red-950/10 to-slate-950" 
                    : "bg-gradient-to-br from-slate-950 via-emerald-950/10 to-slate-950"
            }`} />
            
            {/* Animated scan lines */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] animate-scan opacity-20" />
            </div>
            
            {/* Particle canvas */}
            <canvas 
                ref={canvasRef} 
                className="absolute inset-0 pointer-events-none z-10"
            />
            
            {/* D3 SVG */}
            <svg 
                ref={svgRef}
                className="absolute inset-0 z-20"
                style={{ overflow: "visible" }}
            />
            
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-blue-500/20 pointer-events-none" />
            <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-blue-500/20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-blue-500/20 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-blue-500/20 pointer-events-none" />
            
            {/* Mode indicator */}
            <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider z-30 ${
                mode === "attack" 
                    ? "bg-red-500/20 text-red-400 border border-red-500/30" 
                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            }`}>
                {mode === "attack" ? "⚠ THREAT ACTIVE" : "✓ SECURE MODE"}
            </div>
        </div>
    );
}

function getStatusColor(status: NodeStatus): string {
    switch (status) {
        case "compromised": return "#ef4444";
        case "secure": return "#10b981";
        case "active": return "#3b82f6";
        case "offline": return "#6b7280";
        default: return "#475569";
    }
}

function getGlowFilter(status: NodeStatus): string {
    switch (status) {
        case "compromised": return "url(#glow-red)";
        case "secure": return "url(#glow-green)";
        case "active": return "url(#glow-blue)";
        default: return "none";
    }
}

function getNodeIcon(type: string): string {
    switch (type) {
        case "server": return "🖥";
        case "database": return "🗄";
        case "client": return "👤";
        case "attacker": return "💀";
        case "router": return "📡";
        case "firewall": return "🛡";
        default: return "⚡";
    }
}

function getPacketColor(type: string): string {
    switch (type) {
        case "exploit": return "#ef4444";
        case "encrypted": return "#10b981";
        case "response": return "#8b5cf6";
        case "query": return "#f59e0b";
        default: return "#3b82f6";
    }
}
