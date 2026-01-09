import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipBack, 
  SkipForward,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Slider } from "@/components/ui/slider";

type Algorithm = 
  | "bubble-sort" 
  | "quick-sort" 
  | "merge-sort" 
  | "binary-search" 
  | "dijkstra" 
  | "a-star";

interface AlgoStep {
  index: number;
  type: string;
  state: any;
  description: string;
}

const ALGORITHMS: { id: Algorithm; name: string; category: string }[] = [
  { id: "bubble-sort", name: "Bubble Sort", category: "Sorting" },
  { id: "quick-sort", name: "Quick Sort", category: "Sorting" },
  { id: "merge-sort", name: "Merge Sort", category: "Sorting" },
  { id: "binary-search", name: "Binary Search", category: "Searching" },
  { id: "dijkstra", name: "Dijkstra's Algorithm", category: "Graph" },
  { id: "a-star", name: "A* Pathfinding", category: "Graph" },
];

// Algorithm step generators
function generateBubbleSortSteps(arr: number[]): AlgoStep[] {
  const steps: AlgoStep[] = [];
  const array = [...arr];
  const n = array.length;

  steps.push({
    index: 0,
    type: "init",
    state: { array: [...array], comparing: [], sorted: [] },
    description: `Starting Bubble Sort with array: [${array.join(", ")}]`,
  });

  const sorted: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({
        index: steps.length,
        type: "compare",
        state: { array: [...array], comparing: [j, j + 1], sorted: [...sorted] },
        description: `Comparing ${array[j]} and ${array[j + 1]}`,
      });

      if (array[j] > array[j + 1]) {
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
        steps.push({
          index: steps.length,
          type: "swap",
          state: { array: [...array], comparing: [j, j + 1], sorted: [...sorted] },
          description: `Swapped ${array[j + 1]} and ${array[j]}`,
        });
      }
    }
    sorted.unshift(n - 1 - i);
  }
  sorted.unshift(0);

  steps.push({
    index: steps.length,
    type: "done",
    state: { array: [...array], comparing: [], sorted: Array.from({ length: n }, (_, i) => i) },
    description: `Sorting complete! Result: [${array.join(", ")}]`,
  });

  return steps;
}

function generateQuickSortSteps(arr: number[]): AlgoStep[] {
  const steps: AlgoStep[] = [];
  const array = [...arr];

  steps.push({
    index: 0,
    type: "init",
    state: { array: [...array], low: 0, high: array.length - 1, pivot: -1, i: -1, j: -1 },
    description: `Starting Quick Sort with array: [${array.join(", ")}]`,
  });

  function partition(low: number, high: number): number {
    const pivot = array[high];
    steps.push({
      index: steps.length,
      type: "pivot",
      state: { array: [...array], low, high, pivot: high, i: low - 1, j: low },
      description: `Selecting pivot: ${pivot} at index ${high}`,
    });

    let i = low - 1;
    for (let j = low; j < high; j++) {
      steps.push({
        index: steps.length,
        type: "compare",
        state: { array: [...array], low, high, pivot: high, i, j },
        description: `Comparing ${array[j]} with pivot ${pivot}`,
      });

      if (array[j] < pivot) {
        i++;
        [array[i], array[j]] = [array[j], array[i]];
        steps.push({
          index: steps.length,
          type: "swap",
          state: { array: [...array], low, high, pivot: high, i, j },
          description: `Swapped ${array[j]} and ${array[i]}`,
        });
      }
    }

    [array[i + 1], array[high]] = [array[high], array[i + 1]];
    steps.push({
      index: steps.length,
      type: "place-pivot",
      state: { array: [...array], low, high, pivot: i + 1, i: i + 1, j: high },
      description: `Placed pivot ${pivot} at position ${i + 1}`,
    });

    return i + 1;
  }

  function quickSort(low: number, high: number) {
    if (low < high) {
      const pi = partition(low, high);
      quickSort(low, pi - 1);
      quickSort(pi + 1, high);
    }
  }

  quickSort(0, array.length - 1);

  steps.push({
    index: steps.length,
    type: "done",
    state: { array: [...array], low: 0, high: array.length - 1, pivot: -1, i: -1, j: -1 },
    description: `Sorting complete! Result: [${array.join(", ")}]`,
  });

  return steps;
}

function generateMergeSortSteps(arr: number[]): AlgoStep[] {
  const steps: AlgoStep[] = [];
  const array = [...arr];

  steps.push({
    index: 0,
    type: "init",
    state: { array: [...array], left: [], right: [], merging: [] },
    description: `Starting Merge Sort with array: [${array.join(", ")}]`,
  });

  function mergeSort(arr: number[], start: number): number[] {
    if (arr.length <= 1) return arr;

    const mid = Math.floor(arr.length / 2);
    const leftArr = arr.slice(0, mid);
    const rightArr = arr.slice(mid);

    steps.push({
      index: steps.length,
      type: "divide",
      state: { 
        array: [...array], 
        left: leftArr, 
        right: rightArr,
        merging: [],
        range: [start, start + arr.length - 1]
      },
      description: `Dividing: [${leftArr.join(", ")}] | [${rightArr.join(", ")}]`,
    });

    const sortedLeft = mergeSort(leftArr, start);
    const sortedRight = mergeSort(rightArr, start + mid);

    return merge(sortedLeft, sortedRight, start);
  }

  function merge(left: number[], right: number[], start: number): number[] {
    const result: number[] = [];
    let i = 0, j = 0;

    while (i < left.length && j < right.length) {
      if (left[i] <= right[j]) {
        result.push(left[i]);
        i++;
      } else {
        result.push(right[j]);
        j++;
      }

      steps.push({
        index: steps.length,
        type: "merge",
        state: { 
          array: [...array], 
          left, 
          right, 
          merging: [...result],
          leftIdx: i - 1,
          rightIdx: j - 1
        },
        description: `Merging: [${result.join(", ")}]`,
      });
    }

    const final = result.concat(left.slice(i)).concat(right.slice(j));
    
    // Update the main array
    for (let k = 0; k < final.length; k++) {
      array[start + k] = final[k];
    }

    steps.push({
      index: steps.length,
      type: "merged",
      state: { array: [...array], left: [], right: [], merging: final },
      description: `Merged segment: [${final.join(", ")}]`,
    });

    return final;
  }

  mergeSort(array, 0);

  steps.push({
    index: steps.length,
    type: "done",
    state: { array: [...array], left: [], right: [], merging: [] },
    description: `Sorting complete! Result: [${array.join(", ")}]`,
  });

  return steps;
}

function generateBinarySearchSteps(arr: number[], target: number): AlgoStep[] {
  const steps: AlgoStep[] = [];
  const array = [...arr].sort((a, b) => a - b);

  steps.push({
    index: 0,
    type: "init",
    state: { array, left: 0, right: array.length - 1, mid: -1, target, found: false },
    description: `Searching for ${target} in sorted array: [${array.join(", ")}]`,
  });

  let left = 0;
  let right = array.length - 1;
  let found = false;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    steps.push({
      index: steps.length,
      type: "check",
      state: { array, left, right, mid, target, found: false },
      description: `Checking middle element at index ${mid}: ${array[mid]}`,
    });

    if (array[mid] === target) {
      found = true;
      steps.push({
        index: steps.length,
        type: "found",
        state: { array, left, right, mid, target, found: true },
        description: `Found ${target} at index ${mid}!`,
      });
      break;
    } else if (array[mid] < target) {
      left = mid + 1;
      steps.push({
        index: steps.length,
        type: "narrow",
        state: { array, left, right, mid, target, found: false },
        description: `${target} > ${array[mid]}, searching right half`,
      });
    } else {
      right = mid - 1;
      steps.push({
        index: steps.length,
        type: "narrow",
        state: { array, left, right, mid, target, found: false },
        description: `${target} < ${array[mid]}, searching left half`,
      });
    }
  }

  if (!found) {
    steps.push({
      index: steps.length,
      type: "not-found",
      state: { array, left, right, mid: -1, target, found: false },
      description: `${target} not found in the array`,
    });
  }

  return steps;
}

function generateDijkstraSteps(): AlgoStep[] {
  const steps: AlgoStep[] = [];
  
  // Simple 5-node graph
  const nodes = [
    { id: 0, x: 100, y: 150, label: "A" },
    { id: 1, x: 250, y: 50, label: "B" },
    { id: 2, x: 250, y: 250, label: "C" },
    { id: 3, x: 400, y: 100, label: "D" },
    { id: 4, x: 400, y: 200, label: "E" },
  ];

  const edges = [
    { from: 0, to: 1, weight: 4 },
    { from: 0, to: 2, weight: 2 },
    { from: 1, to: 2, weight: 1 },
    { from: 1, to: 3, weight: 5 },
    { from: 2, to: 3, weight: 8 },
    { from: 2, to: 4, weight: 10 },
    { from: 3, to: 4, weight: 2 },
  ];

  const distances = [0, Infinity, Infinity, Infinity, Infinity];
  const visited: number[] = [];
  const previous: (number | null)[] = [null, null, null, null, null];

  steps.push({
    index: 0,
    type: "init",
    state: { nodes, edges, distances: [...distances], visited: [], current: 0, previous: [...previous] },
    description: "Initialize: Start at node A with distance 0",
  });

  const unvisited = [0, 1, 2, 3, 4];

  while (unvisited.length > 0) {
    // Find min distance unvisited node
    let minDist = Infinity;
    let current = -1;
    for (const node of unvisited) {
      if (distances[node] < minDist) {
        minDist = distances[node];
        current = node;
      }
    }

    if (current === -1) break;

    steps.push({
      index: steps.length,
      type: "visit",
      state: { nodes, edges, distances: [...distances], visited: [...visited], current, previous: [...previous] },
      description: `Visiting node ${nodes[current].label} (distance: ${distances[current]})`,
    });

    // Mark as visited
    visited.push(current);
    unvisited.splice(unvisited.indexOf(current), 1);

    // Update neighbors
    for (const edge of edges) {
      let neighbor = -1;
      if (edge.from === current && !visited.includes(edge.to)) {
        neighbor = edge.to;
      } else if (edge.to === current && !visited.includes(edge.from)) {
        neighbor = edge.from;
      }

      if (neighbor !== -1) {
        const newDist = distances[current] + edge.weight;
        if (newDist < distances[neighbor]) {
          distances[neighbor] = newDist;
          previous[neighbor] = current;
          
          steps.push({
            index: steps.length,
            type: "update",
            state: { 
              nodes, edges, 
              distances: [...distances], 
              visited: [...visited], 
              current,
              updating: neighbor,
              previous: [...previous]
            },
            description: `Update ${nodes[neighbor].label}: new distance ${newDist} (via ${nodes[current].label})`,
          });
        }
      }
    }
  }

  steps.push({
    index: steps.length,
    type: "done",
    state: { nodes, edges, distances: [...distances], visited: [...visited], current: -1, previous: [...previous] },
    description: `Complete! Shortest distances from A: ${nodes.map((n, i) => `${n.label}=${distances[i]}`).join(", ")}`,
  });

  return steps;
}

function generateAStarSteps(): AlgoStep[] {
  const steps: AlgoStep[] = [];
  
  // 8x6 grid
  const rows = 6;
  const cols = 8;
  const grid: number[][] = Array(rows).fill(null).map(() => Array(cols).fill(0));
  
  // Add some walls
  grid[1][2] = 1;
  grid[2][2] = 1;
  grid[3][2] = 1;
  grid[3][3] = 1;
  grid[1][5] = 1;
  grid[2][5] = 1;

  const start = { x: 0, y: 2 };
  const end = { x: 7, y: 3 };

  const openSet: { x: number; y: number; g: number; h: number; f: number; parent: any }[] = [];
  const closedSet: { x: number; y: number }[] = [];
  const path: { x: number; y: number }[] = [];

  const heuristic = (a: { x: number; y: number }, b: { x: number; y: number }) => 
    Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

  openSet.push({ ...start, g: 0, h: heuristic(start, end), f: heuristic(start, end), parent: null });

  steps.push({
    index: 0,
    type: "init",
    state: { grid, start, end, openSet: [...openSet], closedSet: [], path: [], current: null },
    description: "Initialize A* pathfinding from start (green) to end (red)",
  });

  while (openSet.length > 0) {
    // Find node with lowest f
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift()!;

    steps.push({
      index: steps.length,
      type: "visit",
      state: { 
        grid, start, end, 
        openSet: openSet.map(n => ({ x: n.x, y: n.y })), 
        closedSet: [...closedSet], 
        path: [], 
        current: { x: current.x, y: current.y } 
      },
      description: `Exploring cell (${current.x}, ${current.y}) - f=${current.f.toFixed(1)}`,
    });

    if (current.x === end.x && current.y === end.y) {
      // Reconstruct path
      let temp: any = current;
      while (temp) {
        path.unshift({ x: temp.x, y: temp.y });
        temp = temp.parent;
      }

      steps.push({
        index: steps.length,
        type: "done",
        state: { grid, start, end, openSet: [], closedSet: [...closedSet], path, current: null },
        description: `Path found! Length: ${path.length} steps`,
      });
      return steps;
    }

    closedSet.push({ x: current.x, y: current.y });

    // Check neighbors
    const neighbors = [
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 },
    ];

    for (const neighbor of neighbors) {
      if (
        neighbor.x < 0 || neighbor.x >= cols ||
        neighbor.y < 0 || neighbor.y >= rows ||
        grid[neighbor.y][neighbor.x] === 1 ||
        closedSet.some(n => n.x === neighbor.x && n.y === neighbor.y)
      ) {
        continue;
      }

      const g = current.g + 1;
      const h = heuristic(neighbor, end);
      const f = g + h;

      const existing = openSet.find(n => n.x === neighbor.x && n.y === neighbor.y);
      if (!existing) {
        openSet.push({ ...neighbor, g, h, f, parent: current });
        
        steps.push({
          index: steps.length,
          type: "add-open",
          state: { 
            grid, start, end, 
            openSet: openSet.map(n => ({ x: n.x, y: n.y })), 
            closedSet: [...closedSet], 
            path: [], 
            current: { x: current.x, y: current.y },
            adding: neighbor
          },
          description: `Adding (${neighbor.x}, ${neighbor.y}) to open set - f=${f.toFixed(1)}`,
        });
      } else if (g < existing.g) {
        existing.g = g;
        existing.f = f;
        existing.parent = current;
      }
    }
  }

  steps.push({
    index: steps.length,
    type: "no-path",
    state: { grid, start, end, openSet: [], closedSet: [...closedSet], path: [], current: null },
    description: "No path found!",
  });

  return steps;
}

export default function Visualise() {
  const [algorithm, setAlgorithm] = useState<Algorithm>("bubble-sort");
  const [steps, setSteps] = useState<AlgoStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [inputArray, setInputArray] = useState("64, 34, 25, 12, 22, 11, 90");
  const [searchTarget, setSearchTarget] = useState("25");

  const generateSteps = useCallback(() => {
    const arr = inputArray.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    
    let newSteps: AlgoStep[] = [];
    switch (algorithm) {
      case "bubble-sort":
        newSteps = generateBubbleSortSteps(arr);
        break;
      case "quick-sort":
        newSteps = generateQuickSortSteps(arr);
        break;
      case "merge-sort":
        newSteps = generateMergeSortSteps(arr);
        break;
      case "binary-search":
        newSteps = generateBinarySearchSteps(arr, parseInt(searchTarget) || 25);
        break;
      case "dijkstra":
        newSteps = generateDijkstraSteps();
        break;
      case "a-star":
        newSteps = generateAStarSteps();
        break;
    }
    
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [algorithm, inputArray, searchTarget]);

  useEffect(() => {
    generateSteps();
  }, [algorithm]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentStep < steps.length - 1) {
      interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps.length, speed]);

  const handlePlay = () => setIsPlaying(!isPlaying);
  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };
  const handleStepBack = () => setCurrentStep(prev => Math.max(0, prev - 1));
  const handleStepForward = () => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1));

  const currentStepData = steps[currentStep];
  const isSortingAlgo = ["bubble-sort", "quick-sort", "merge-sort"].includes(algorithm);
  const isSearchAlgo = algorithm === "binary-search";
  const isGraphAlgo = ["dijkstra", "a-star"].includes(algorithm);

  return (
    <div className="flex flex-col h-full p-6 gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Algorithm Visualization</h1>
          <p className="text-muted-foreground">Step through algorithms to understand how they work</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Controls */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Algorithm Selection */}
            <div className="space-y-2">
              <Label>Algorithm</Label>
              <Select value={algorithm} onValueChange={(v) => setAlgorithm(v as Algorithm)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select algorithm" />
                </SelectTrigger>
                <SelectContent>
                  {ALGORITHMS.map(algo => (
                    <SelectItem key={algo.id} value={algo.id}>
                      <div className="flex items-center gap-2">
                        <span>{algo.name}</span>
                        <Badge variant="outline" className="text-xs">{algo.category}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Input for sorting/search algorithms */}
            {(isSortingAlgo || isSearchAlgo) && (
              <div className="space-y-2">
                <Label>Input Array</Label>
                <Input
                  value={inputArray}
                  onChange={(e) => setInputArray(e.target.value)}
                  placeholder="Enter comma-separated numbers"
                />
              </div>
            )}

            {isSearchAlgo && (
              <div className="space-y-2">
                <Label>Search Target</Label>
                <Input
                  value={searchTarget}
                  onChange={(e) => setSearchTarget(e.target.value)}
                  placeholder="Enter target number"
                />
              </div>
            )}

            {/* Speed Control */}
            <div className="space-y-2">
              <Label>Speed: {speed}ms</Label>
              <Slider
                value={[speed]}
                onValueChange={([v]) => setSpeed(v)}
                min={100}
                max={2000}
                step={100}
              />
            </div>

            {/* Generate Button */}
            <Button onClick={generateSteps} className="w-full">
              Generate Steps
            </Button>

            {/* Playback Controls */}
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="icon" onClick={handleStepBack} disabled={currentStep === 0}>
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))} disabled={currentStep === 0}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button onClick={handlePlay} size="icon">
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="icon" onClick={handleStepForward} disabled={currentStep >= steps.length - 1}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            {/* Step Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Step {currentStep + 1}</span>
                <span>of {steps.length}</span>
              </div>
              <Slider
                value={[currentStep]}
                onValueChange={([v]) => setCurrentStep(v)}
                min={0}
                max={Math.max(0, steps.length - 1)}
                step={1}
              />
            </div>
          </CardContent>
        </Card>

        {/* Center: Visualization Canvas */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Visualization</CardTitle>
              {currentStepData && (
                <Badge variant={currentStepData.type === "done" ? "default" : "secondary"}>
                  {currentStepData.type}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative w-full h-[400px] bg-muted/30 rounded-lg overflow-hidden">
              {/* Sorting Visualization */}
              {isSortingAlgo && currentStepData && (
                <SortingVisualization step={currentStepData} algorithm={algorithm} />
              )}

              {/* Binary Search Visualization */}
              {isSearchAlgo && currentStepData && (
                <BinarySearchVisualization step={currentStepData} />
              )}

              {/* Dijkstra Visualization */}
              {algorithm === "dijkstra" && currentStepData && (
                <DijkstraVisualization step={currentStepData} />
              )}

              {/* A* Visualization */}
              {algorithm === "a-star" && currentStepData && (
                <AStarVisualization step={currentStepData} />
              )}
            </div>

            {/* Step Description */}
            {currentStepData && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-foreground">{currentStepData.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Visualization Components
function SortingVisualization({ step, algorithm }: { step: AlgoStep; algorithm: string }) {
  const { array, comparing = [], sorted = [], pivot, i, j, low, high } = step.state;
  const maxVal = Math.max(...array);

  return (
    <div className="flex items-end justify-center gap-1 h-full p-8">
      {array.map((value: number, index: number) => {
        let bgColor = "bg-primary/60";
        
        if (sorted?.includes(index)) {
          bgColor = "bg-green-500";
        } else if (comparing?.includes(index)) {
          bgColor = "bg-yellow-500";
        } else if (algorithm === "quick-sort") {
          if (index === pivot) bgColor = "bg-red-500";
          else if (index === i) bgColor = "bg-blue-500";
          else if (index === j) bgColor = "bg-purple-500";
          else if (index >= low && index <= high) bgColor = "bg-primary/40";
        }

        const height = (value / maxVal) * 280;

        return (
          <div key={index} className="flex flex-col items-center gap-2">
            <div
              className={`w-10 ${bgColor} rounded-t transition-all duration-200`}
              style={{ height: `${height}px` }}
            />
            <span className="text-xs font-mono text-muted-foreground">{value}</span>
          </div>
        );
      })}
    </div>
  );
}

function BinarySearchVisualization({ step }: { step: AlgoStep }) {
  const { array, left, right, mid, target, found } = step.state;

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 p-8">
      <div className="text-lg font-medium">
        Target: <span className="text-primary font-bold">{target}</span>
      </div>
      <div className="flex items-center gap-2">
        {array.map((value: number, index: number) => {
          let bgColor = "bg-muted";
          let textColor = "text-foreground";

          if (found && index === mid) {
            bgColor = "bg-green-500";
            textColor = "text-white";
          } else if (index === mid) {
            bgColor = "bg-yellow-500";
            textColor = "text-black";
          } else if (index >= left && index <= right) {
            bgColor = "bg-primary/30";
          } else {
            bgColor = "bg-muted/50";
            textColor = "text-muted-foreground";
          }

          return (
            <div
              key={index}
              className={`w-12 h-12 flex items-center justify-center rounded-lg font-mono font-bold ${bgColor} ${textColor} transition-all duration-200`}
            >
              {value}
            </div>
          );
        })}
      </div>
      <div className="flex gap-8 text-sm">
        <span>Left: <strong>{left}</strong></span>
        <span>Mid: <strong>{mid >= 0 ? mid : "-"}</strong></span>
        <span>Right: <strong>{right}</strong></span>
      </div>
    </div>
  );
}

function DijkstraVisualization({ step }: { step: AlgoStep }) {
  const { nodes, edges, distances, visited, current, updating } = step.state;

  return (
    <svg className="w-full h-full" viewBox="0 0 500 300">
      {/* Edges */}
      {edges.map((edge: any, i: number) => {
        const from = nodes[edge.from];
        const to = nodes[edge.to];
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;

        return (
          <g key={i}>
            <line
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="currentColor"
              strokeWidth="2"
              className="text-muted-foreground/50"
            />
            <text
              x={midX}
              y={midY - 5}
              textAnchor="middle"
              className="text-xs fill-muted-foreground"
            >
              {edge.weight}
            </text>
          </g>
        );
      })}

      {/* Nodes */}
      {nodes.map((node: any) => {
        let fill = "hsl(var(--muted))";
        if (node.id === current) fill = "hsl(var(--primary))";
        else if (node.id === updating) fill = "hsl(47, 100%, 50%)";
        else if (visited.includes(node.id)) fill = "hsl(142, 76%, 36%)";

        return (
          <g key={node.id}>
            <circle
              cx={node.x}
              cy={node.y}
              r="25"
              fill={fill}
              className="transition-all duration-200"
            />
            <text
              x={node.x}
              y={node.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-sm font-bold fill-white"
            >
              {node.label}
            </text>
            <text
              x={node.x}
              y={node.y + 40}
              textAnchor="middle"
              className="text-xs fill-muted-foreground"
            >
              d={distances[node.id] === Infinity ? "∞" : distances[node.id]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function AStarVisualization({ step }: { step: AlgoStep }) {
  const { grid, start, end, openSet, closedSet, path, current, adding } = step.state;
  const cellSize = 45;
  const gap = 2;

  return (
    <div className="flex items-center justify-center h-full">
      <div className="grid" style={{ gridTemplateColumns: `repeat(${grid[0].length}, ${cellSize}px)`, gap: `${gap}px` }}>
        {grid.map((row: number[], y: number) =>
          row.map((cell: number, x: number) => {
            let bgColor = "bg-muted/50";

            if (cell === 1) {
              bgColor = "bg-foreground/80";
            } else if (path.some((p: any) => p.x === x && p.y === y)) {
              bgColor = "bg-primary";
            } else if (current?.x === x && current?.y === y) {
              bgColor = "bg-yellow-500";
            } else if (adding?.x === x && adding?.y === y) {
              bgColor = "bg-blue-400";
            } else if (x === start.x && y === start.y) {
              bgColor = "bg-green-500";
            } else if (x === end.x && y === end.y) {
              bgColor = "bg-red-500";
            } else if (openSet.some((n: any) => n.x === x && n.y === y)) {
              bgColor = "bg-blue-300/50";
            } else if (closedSet.some((n: any) => n.x === x && n.y === y)) {
              bgColor = "bg-muted";
            }

            return (
              <div
                key={`${x}-${y}`}
                className={`${bgColor} rounded transition-all duration-150`}
                style={{ width: cellSize, height: cellSize }}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
