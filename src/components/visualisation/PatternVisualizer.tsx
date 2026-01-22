import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import * as d3 from "d3";
import { Card } from "@/components/ui/card";

export interface PatternVisualizerProps {
    patternId: string;
}

export function PatternVisualizer({ patternId }: PatternVisualizerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [speed, setSpeed] = useState(1);
    const [steps, setSteps] = useState<any[]>([]);
    const svgRef = useRef<SVGSVGElement>(null);

    // --- Step Generation Dispatcher ---
    useEffect(() => {
        let generatedSteps: any[] = [];
        const pId = patternId;

        if (pId === "two-pointers-opposite") {
            generatedSteps = generateTwoPointersSteps([-3, 0, 2, 4, 7, 9, 11], 9);
        } else if (pId.startsWith("binary-search")) {
            generatedSteps = generateBinarySearchSteps([-5, 2, 4, 6, 9, 12, 15, 20], 12, pId);
        } else if (pId === "variable-sliding-window") {
            generatedSteps = generateSlidingWindowSteps([2, 1, 5, 2, 8, 1], 3);
        } else if (pId === "fast-slow-pointers") {
            generatedSteps = generateFastSlowSteps();
        } else if (pId === "bfs-tree" || pId === "dfs-tree") {
            generatedSteps = generateTreeSteps(pId);
        } else if (pId.includes("stack")) {
            generatedSteps = generateStackSteps(pId);
        } else if (pId === "two-pointers-same-direction") { // Add if missing in library but useful
            generatedSteps = generateTwoPointersSteps([0, 1, 0, 3, 12], 0); // Move zeroes example
        } else {
            // Fallback for others
            generatedSteps = [{ description: "Interactive visualization coming soon for this pattern.", state: {} }];
        }

        setSteps(generatedSteps);
        setCurrentStep(0);
        setIsPlaying(false);
    }, [patternId]);

    // --- Playback Loop ---
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isPlaying && currentStep < steps.length - 1) {
            timer = setTimeout(() => {
                setCurrentStep(prev => prev + 1);
            }, 1000 / speed);
        } else if (currentStep >= steps.length - 1) {
            setIsPlaying(false);
        }
        return () => clearTimeout(timer);
    }, [isPlaying, currentStep, steps, speed]);

    // --- Render Trigger ---
    useEffect(() => {
        if (!svgRef.current || steps.length === 0 || !steps[currentStep]) return;
        const type = getVizType(patternId);
        if (type === 'array') renderArrayViz(svgRef.current, steps[currentStep], patternId);
        else if (type === 'linked-list') renderLinkedList(svgRef.current, steps[currentStep]);
        else if (type === 'tree') renderTree(svgRef.current, steps[currentStep]);
        else if (type === 'stack') renderStack(svgRef.current, steps[currentStep]);
        else renderText(svgRef.current, "Visualization not available");
    }, [currentStep, steps, patternId]);

    // --- Helper to determine renderer ---
    const getVizType = (id: string) => {
        if (id.includes("pointer") && !id.includes("fast")) return 'array';
        if (id.includes("sliding")) return 'array';
        if (id.includes("binary")) return 'array';
        if (id.includes("fast-slow")) return 'linked-list';
        if (id.includes("tree") || id.includes("bfs") || id.includes("dfs")) return 'tree';
        if (id.includes("stack")) return 'stack';
        return 'text';
    };

    const togglePlay = () => setIsPlaying(!isPlaying);
    const reset = () => { setIsPlaying(false); setCurrentStep(0); };
    const stepForward = () => setCurrentStep(Math.min(steps.length - 1, currentStep + 1));
    const stepBack = () => setCurrentStep(Math.max(0, currentStep - 1));

    if (steps.length === 0) return null;

    return (
        <Card className="p-4 border-primary/20 bg-card/50">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                    <Maximize2 className="h-4 w-4 text-primary" />
                    Visual Walkthrough
                </h3>
                <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    Step {currentStep + 1} / {steps.length}
                </div>
            </div>

            <div className="aspect-video bg-background/50 rounded-lg border mb-4 relative overflow-hidden flex items-center justify-center">
                <svg ref={svgRef} className="w-full h-full p-4" width="100%" height="100%" viewBox="0 0 600 300"></svg>
            </div>

            <div className="min-h-[3rem] text-sm text-center text-muted-foreground mb-4 font-medium px-4">
                {steps[currentStep]?.description}
            </div>

            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={reset}><RotateCcw className="h-3 w-3" /></Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={stepBack} disabled={currentStep === 0}><ChevronLeft className="h-3 w-3" /></Button>
                    <Button size="icon" className="h-8 w-8" onClick={togglePlay}>
                        {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 ml-0.5" />}
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={stepForward} disabled={currentStep === steps.length - 1}><ChevronRight className="h-3 w-3" /></Button>
                </div>
                <div className="flex items-center gap-2 w-32">
                    <span className="text-xs text-muted-foreground">Speed</span>
                    <Slider value={[speed]} min={0.5} max={3} step={0.5} onValueChange={(v) => setSpeed(v[0])} />
                </div>
            </div>
        </Card>
    );
}

// ================= GENERATORS =================

function generateTwoPointersSteps(arr: number[], target: number) {
    const steps = [];
    let left = 0, right = arr.length - 1;
    steps.push({ state: { arr, left, right }, description: `Start: Find pair summing to ${target}` });
    while (left < right) {
        const sum = arr[left] + arr[right];
        steps.push({ state: { arr, left, right, comparing: true }, description: `Compare ${arr[left]} + ${arr[right]} = ${sum}` });
        if (sum === target) {
            steps.push({ state: { arr, left, right, found: true }, description: `Found pair! ${arr[left]} + ${arr[right]} = ${target}` });
            break;
        } else if (sum < target) {
            steps.push({ state: { arr, left, right }, description: `Sum too small. Move Left ->` });
            left++;
        } else {
            steps.push({ state: { arr, left, right }, description: `Sum too large. Phase Right <-` });
            right--;
        }
    }
    return steps;
}

function generateBinarySearchSteps(arr: number[], target: number, mode: string) {
    const steps = [];
    let left = 0, right = arr.length - 1;
    steps.push({ state: { arr, left, right, mid: -1 }, description: `Start Binary Search for ${target}` });

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        steps.push({ state: { arr, left, right, mid, checking: true }, description: `Check middle index ${mid} (value: ${arr[mid]})` });

        if (arr[mid] === target) {
            steps.push({ state: { arr, left, right, mid, found: true }, description: `Found ${target} at index ${mid}!` });
            return steps;
        } else if (arr[mid] < target) {
            steps.push({ state: { arr, left, right, mid }, description: `${arr[mid]} < ${target}. Eliminate left half.` });
            left = mid + 1;
        } else {
            steps.push({ state: { arr, left, right, mid }, description: `${arr[mid]} > ${target}. Eliminate right half.` });
            right = mid - 1;
        }
    }
    steps.push({ state: { arr, left, right, mid: -1, found: false }, description: `Target not found.` });
    return steps;
}

function generateSlidingWindowSteps(arr: number[], k: number) {
    const steps = [];
    let windowSum = 0;
    for (let i = 0; i < k; i++) windowSum += arr[i];
    steps.push({ state: { arr, windowStart: 0, windowEnd: k - 1, windowSum }, description: `Init window [0..${k - 1}], Sum: ${windowSum}` });

    for (let i = k; i < arr.length; i++) {
        steps.push({ state: { arr, windowStart: i - k, windowEnd: i - 1, windowSum, sliding: true }, description: `Slide window right...` });
        windowSum = windowSum - arr[i - k] + arr[i];
        steps.push({ state: { arr, windowStart: i - k + 1, windowEnd: i, windowSum }, description: `New Sum: ${windowSum} ( -${arr[i - k]} +${arr[i]} )` });
    }
    return steps;
}

function generateFastSlowSteps() {
    // 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 4 (cycle)
    const nodes = [1, 2, 3, 4, 5, 6];
    const cycleMap: Record<number, number> = { 6: 4 }; // 6 points to 4 (val, not index)
    // Map to indices: 0->1, 1->2 ... 5->3 (index 3 is val 4)
    // Indices: 0, 1, 2, 3, 4, 5
    // Next: 0->1, 1->2, 2->3, 3->4, 4->5, 5->3

    const steps = [];
    let slow = 0;
    let fast = 0;

    steps.push({ state: { slow, fast }, description: "Start: Slow and Fast at Head" });

    // Simulate a few steps
    for (let i = 0; i < 8; i++) {
        steps.push({ state: { slow, fast, moving: true }, description: `Slow moves 1, Fast moves 2` });

        // Move Slow 1
        slow = slow === 5 ? 3 : slow + 1;

        // Move Fast 2
        let nextFast = fast === 5 ? 3 : fast + 1;
        nextFast = nextFast === 5 ? 3 : nextFast + 1;
        fast = nextFast;

        steps.push({ state: { slow, fast }, description: `Positions: Slow@${nodes[slow]}, Fast@${nodes[fast]}` });

        if (slow === fast) {
            steps.push({ state: { slow, fast, found: true }, description: `Collision! Cycle detected at node ${nodes[slow]}` });
            break;
        }
    }
    return steps;
}

function generateTreeSteps(mode: 'bfs-tree' | 'dfs-tree') {
    // Simple tree: 1 -> (2, 3), 2 -> (4, 5), 3 -> (6, 7)
    const tree = {
        id: 1,
        children: [
            { id: 2, children: [{ id: 4, children: [] }, { id: 5, children: [] }] },
            { id: 3, children: [{ id: 6, children: [] }, { id: 7, children: [] }] }
        ]
    };

    const steps = [];
    const visited = new Set();
    const queueOrStack = [tree]; // Queue for BFS, Stack for DFS

    // Simplification: Manual simulation for visualization data stability
    if (mode === 'bfs-tree') {
        const order = [1, 2, 3, 4, 5, 6, 7];
        steps.push({ state: { active: 1, visited: [], queue: [1] }, description: "Start BFS: Queue [1]" });
        let q = [1];
        let v = [];

        // Step 1: Pop 1
        steps.push({ state: { active: 1, visited: [], queue: [] }, description: "Pop 1, Visit." });
        v.push(1);
        steps.push({ state: { active: null, visited: [1], queue: [2, 3] }, description: "Add neighbors 2, 3 to Queue." });

        steps.push({ state: { active: 2, visited: [1], queue: [3] }, description: "Pop 2, Visit." });
        v.push(2);
        steps.push({ state: { active: null, visited: [1, 2], queue: [3, 4, 5] }, description: "Add neighbors 4, 5" });

        steps.push({ state: { active: 3, visited: [1, 2], queue: [4, 5] }, description: "Pop 3, Visit." });
        v.push(3);
        steps.push({ state: { active: null, visited: [1, 2, 3], queue: [4, 5, 6, 7] }, description: "Add neighbors 6, 7" });

        // ... abbreviated rest for UI responsiveness
        steps.push({ state: { active: null, visited: [1, 2, 3, 4, 5, 6, 7], queue: [] }, description: "Traversal Complete." });
    } else {
        // DFS Preorder: 1 -> 2 -> 4 -> 5 -> 3 -> 6 -> 7
        steps.push({ state: { active: 1, visited: [], stack: [1] }, description: "Start DFS: Stack [1]" });
        steps.push({ state: { active: 1, visited: [1], stack: [3, 2] }, description: "Visit 1. Push 3, then 2." });

        steps.push({ state: { active: 2, visited: [1], stack: [3] }, description: "Pop 2, Visit." });
        steps.push({ state: { active: null, visited: [1, 2], stack: [3, 5, 4] }, description: "Push 5, then 4." });

        steps.push({ state: { active: 4, visited: [1, 2], stack: [3, 5] }, description: "Pop 4, Visit (Leaf)." });
        steps.push({ state: { active: 5, visited: [1, 2, 4], stack: [3] }, description: "Pop 5, Visit (Leaf)." });

        steps.push({ state: { active: 3, visited: [1, 2, 4, 5], stack: [] }, description: "Pop 3, Visit." });
        steps.push({ state: { active: null, visited: [1, 2, 4, 5, 3], stack: [7, 6] }, description: "Push 7, then 6." });
        steps.push({ state: { active: null, visited: [1, 2, 4, 5, 3, 6, 7], stack: [] }, description: "Complete." });
    }
    return steps;
}

function generateStackSteps(mode: string) {
    const steps = [];
    const ops = [
        { op: 'push', val: 1 }, { op: 'push', val: 2 }, { op: 'pop' }, { op: 'push', val: 3 }
    ];
    let stack: number[] = [];
    steps.push({ state: { stack: [], val: null }, description: "Empty Stack" });

    for (let op of ops) {
        if (op.op === 'push') {
            steps.push({ state: { stack: [...stack], val: op.val, action: 'pushing' }, description: `Push ${op.val}` });
            stack.push(op.val!);
            steps.push({ state: { stack: [...stack], val: null }, description: `Stack: [${stack.join(', ')}]` });
        } else {
            steps.push({ state: { stack: [...stack], val: null, action: 'popping' }, description: `Pop` });
            stack.pop();
            steps.push({ state: { stack: [...stack], val: null }, description: `Stack: [${stack.join(', ')}]` });
        }
    }
    return steps;
}

// ================= RENDERERS =================

function renderArrayViz(svgEl: SVGSVGElement, step: any, patternId: string) {
    const svg = d3.select(svgEl);
    svg.selectAll("*").remove();
    const width = 600, height = 300;
    const { arr, left, right, mid, windowStart, windowEnd, found } = step.state;

    const margin = { left: 40, right: 40 };
    const xScale = d3.scaleBand().domain(d3.range(arr.length).map(String)).range([margin.left, width - margin.right]).padding(0.2);
    const boxSize = Math.min(60, xScale.bandwidth());

    const g = svg.append("g").attr("transform", `translate(0, ${height / 2 - boxSize / 2})`);

    const nodes = g.selectAll(".node").data(arr).enter().append("g").attr("transform", (d, i) => `translate(${xScale(String(i))}, 0)`);

    // Rect
    nodes.append("rect").attr("width", boxSize).attr("height", boxSize).attr("rx", 8)
        .attr("fill", (d, i) => {
            if (found) {
                if (patternId === 'two-pointers-opposite' && (i === left || i === right)) return "#22c55e";
                if (patternId.includes('binary') && i === mid) return "#22c55e";
            }
            if (windowStart !== undefined && i >= windowStart && i <= windowEnd) return "#3b82f6";
            return "#1e293b";
        })
        .attr("stroke", (d, i) => {
            if (patternId === 'two-pointers-opposite' && (i === left || i === right)) return "#60a5fa";
            if (patternId.includes('binary') && i === mid) return "#f59e0b";
            return "#334155";
        }).attr("stroke-width", 2);

    // Text
    nodes.append("text").text(d => String(d)).attr("x", boxSize / 2).attr("y", boxSize / 2 + 5).attr("text-anchor", "middle").attr("fill", "white").attr("font-weight", "bold");

    // Indices
    nodes.append("text").text((d, i) => i).attr("x", boxSize / 2).attr("y", boxSize + 20).attr("text-anchor", "middle").attr("fill", "#64748b").attr("font-size", "10px");

    // Pointers
    if (patternId === 'two-pointers-opposite') {
        drawPointer(g, xScale, String(left), "L", "#60a5fa");
        drawPointer(g, xScale, String(right), "R", "#f472b6");
    }
}

function renderLinkedList(svgEl: SVGSVGElement, step: any) {
    const svg = d3.select(svgEl);
    svg.selectAll("*").remove();
    const width = 600, height = 300;
    const { slow, fast, found } = step.state;

    // Nodes 0..5. 5 links back to 3.
    const nodes = [0, 1, 2, 3, 4, 5];
    const nodeRadius = 25;
    const startX = 50;
    const gap = 80;

    const g = svg.append("g").attr("transform", `translate(0, ${height / 2})`);

    // Links
    nodes.forEach((n, i) => {
        if (i < nodes.length - 1) {
            g.append("line").attr("x1", startX + i * gap + nodeRadius).attr("y1", 0)
                .attr("x2", startX + (i + 1) * gap - nodeRadius).attr("y2", 0)
                .attr("stroke", "#475569").attr("stroke-width", 2).attr("marker-end", "url(#arrow)");
        }
    });
    // Cycle link 5 -> 3
    const x1 = startX + 5 * gap;
    const x2 = startX + 3 * gap;
    const path = d3.path();
    path.moveTo(x1, -nodeRadius);
    path.quadraticCurveTo((x1 + x2) / 2, -100, x2, -nodeRadius);
    g.append("path").attr("d", path.toString()).attr("fill", "none").attr("stroke", "#ef4444").attr("stroke-width", 2).attr("stroke-dasharray", "4");

    // Nodes
    const circles = g.selectAll(".node").data(nodes).enter().append("g")
        .attr("transform", (d, i) => `translate(${startX + i * gap}, 0)`);

    circles.append("circle").attr("r", nodeRadius).attr("fill", "#1e293b").attr("stroke", "#334155").attr("stroke-width", 2);
    circles.append("text").text(d => d + 1).attr("dy", "0.3em").attr("text-anchor", "middle").attr("fill", "white").attr("font-weight", "bold");

    // Pointers
    // Slow (Top)
    const slowX = startX + slow * gap;
    g.append("path").attr("d", d3.symbol().type(d3.symbolTriangle).size(80)).attr("transform", `translate(${slowX}, -40) rotate(180)`).attr("fill", "#22c55e");
    g.append("text").text("S").attr("x", slowX).attr("y", -50).attr("text-anchor", "middle").attr("fill", "#22c55e").attr("font-weight", "bold");

    // Fast (Bottom)
    const fastX = startX + fast * gap;
    g.append("path").attr("d", d3.symbol().type(d3.symbolTriangle).size(80)).attr("transform", `translate(${fastX}, 40)`).attr("fill", "#f59e0b");
    g.append("text").text("F").attr("x", fastX).attr("y", 55).attr("text-anchor", "middle").attr("fill", "#f59e0b").attr("font-weight", "bold");

    if (found) {
        g.append("text").text("CYCLE DETECTED").attr("x", 300).attr("y", -100).attr("text-anchor", "middle").attr("fill", "#ef4444").attr("font-weight", "bold").attr("font-size", 20);
    }
}

function renderTree(svgEl: SVGSVGElement, step: any) {
    const svg = d3.select(svgEl);
    svg.selectAll("*").remove();
    const width = 600, height = 300;
    const { active, visited, queue, stack } = step.state;

    const treeData = {
        name: "1", children: [
            { name: "2", children: [{ name: "4" }, { name: "5" }] },
            { name: "3", children: [{ name: "6" }, { name: "7" }] }
        ]
    };

    const root = d3.hierarchy(treeData);
    const treeLayout = d3.tree().size([width - 100, height - 100]);
    treeLayout(root);

    const g = svg.append("g").attr("transform", `translate(50, 50)`);

    // Links
    g.selectAll(".link").data(root.links()).enter().append("path")
        .attr("d", d3.linkVertical<any, any>().x(d => d.x).y(d => d.y) as any)
        .attr("fill", "none").attr("stroke", "#475569").attr("stroke-width", 2);

    // Nodes
    const nodes = g.selectAll(".node").data(root.descendants()).enter().append("g")
        .attr("transform", d => `translate(${d.x}, ${d.y})`);

    nodes.append("circle").attr("r", 20)
        .attr("fill", d => {
            if (active === parseInt(d.data.name)) return "#f59e0b"; // Active
            if (visited && visited.includes(parseInt(d.data.name))) return "#22c55e"; // Visited
            return "#1e293b"; // Default
        })
        .attr("stroke", "#334155").attr("stroke-width", 2);

    nodes.append("text").text(d => d.data.name).attr("dy", "0.3em").attr("text-anchor", "middle").attr("fill", "white").attr("font-weight", "bold");

    // Optional: Show Queue/Stack content on side
}

function renderStack(svgEl: SVGSVGElement, step: any) {
    const svg = d3.select(svgEl);
    svg.selectAll("*").remove();
    const width = 600, height = 300;
    const { stack, val, action } = step.state;

    // Draw container bucket
    const g = svg.append("g").attr("transform", `translate(${width / 2}, ${height - 20})`);

    // Stack items (build up)
    const boxHeight = 40;
    const boxWidth = 80;

    g.selectAll(".item").data(stack).enter().append("rect")
        .attr("x", -boxWidth / 2).attr("y", (d, i) => -(i + 1) * boxHeight)
        .attr("width", boxWidth).attr("height", boxHeight - 5)
        .attr("fill", "#3b82f6").attr("rx", 4);

    g.selectAll(".text").data(stack).enter().append("text")
        .text(d => String(d)).attr("x", 0).attr("y", (d, i) => -(i + 1) * boxHeight + boxHeight / 2 + 5)
        .attr("text-anchor", "middle").attr("fill", "white").attr("font-weight", "bold");
}

function renderText(svgEl: SVGSVGElement, text: string) {
    const svg = d3.select(svgEl);
    svg.selectAll("*").remove();
    svg.append("text").text(text).attr("x", 300).attr("y", 150).attr("text-anchor", "middle").attr("fill", "#64748b");
}

function drawPointer(g: any, xScale: any, indexStr: string, label: string, color: string) {
    const x = (xScale(indexStr) || 0) + xScale.bandwidth() / 2;
    g.append("path").attr("d", d3.symbol().type(d3.symbolTriangle).size(60)).attr("transform", `translate(${x}, -15) rotate(180)`).attr("fill", color);
    g.append("text").text(label).attr("x", x).attr("y", -25).attr("text-anchor", "middle").attr("fill", color).attr("font-weight", "bold").attr("font-size", "10px");
}
