import { useEffect, useRef } from "react";

interface AlgoStep {
  index: number;
  type: string;
  state: any;
  description: string;
}

interface VisualCanvasProps {
  algorithm: string;
  steps: AlgoStep[];
  currentStep: number;
}

export default function VisualCanvas({ algorithm, steps, currentStep }: VisualCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !steps.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const step = steps[currentStep];
    if (!step) return;

    // Render based on algorithm
    if (algorithm === 'quick-sort') {
      renderQuickSort(ctx, step, canvas);
    } else if (algorithm === 'bubble-sort') {
      renderBubbleSort(ctx, step, canvas);
    } else if (algorithm === 'merge-sort') {
      renderMergeSort(ctx, step, canvas);
    } else if (algorithm === 'binary-search') {
      renderBinarySearch(ctx, step, canvas);
    } else if (algorithm === 'a-star') {
      renderAStar(ctx, step, canvas);
    } else if (algorithm === 'dijkstra') {
      renderDijkstra(ctx, step, canvas);
    }
  }, [algorithm, steps, currentStep]);

  const renderQuickSort = (ctx: CanvasRenderingContext2D, step: AlgoStep, canvas: HTMLCanvasElement) => {
    const { array, low, high, pivot, i, j } = step.state;
    if (!array) return;
    
    const maxVal = Math.max(...array);
    const barWidth = Math.min(40, (canvas.width - 100) / array.length - 5);
    const maxHeight = canvas.height - 80;
    const startX = (canvas.width - (array.length * (barWidth + 5))) / 2;
    const startY = canvas.height - 40;

    array.forEach((value: number, index: number) => {
      const x = startX + index * (barWidth + 5);
      const height = (value / maxVal) * maxHeight;

      // Color based on state
      let color = '#6366f1';
      if (index === pivot) color = '#ef4444';
      else if (index === i) color = '#22c55e';
      else if (index === j) color = '#eab308';
      else if (index >= low && index <= high) color = '#f97316';

      ctx.fillStyle = color;
      ctx.fillRect(x, startY - height, barWidth, height);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(value.toString(), x + barWidth / 2, startY + 15);
    });
  };

  const renderBubbleSort = (ctx: CanvasRenderingContext2D, step: AlgoStep, canvas: HTMLCanvasElement) => {
    const { array, comparing, sorted } = step.state;
    if (!array) return;

    const maxVal = Math.max(...array);
    const barWidth = Math.min(40, (canvas.width - 100) / array.length - 5);
    const maxHeight = canvas.height - 80;
    const startX = (canvas.width - (array.length * (barWidth + 5))) / 2;
    const startY = canvas.height - 40;

    array.forEach((value: number, index: number) => {
      const x = startX + index * (barWidth + 5);
      const height = (value / maxVal) * maxHeight;

      let color = '#6366f1';
      if (sorted?.includes(index)) color = '#22c55e';
      else if (comparing?.includes(index)) color = '#eab308';

      ctx.fillStyle = color;
      ctx.fillRect(x, startY - height, barWidth, height);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(value.toString(), x + barWidth / 2, startY + 15);
    });
  };

  const renderMergeSort = (ctx: CanvasRenderingContext2D, step: AlgoStep, canvas: HTMLCanvasElement) => {
    const { array, merging } = step.state;
    if (!array) return;

    const maxVal = Math.max(...array);
    const barWidth = Math.min(40, (canvas.width - 100) / array.length - 5);
    const maxHeight = canvas.height - 80;
    const startX = (canvas.width - (array.length * (barWidth + 5))) / 2;
    const startY = canvas.height - 40;

    array.forEach((value: number, index: number) => {
      const x = startX + index * (barWidth + 5);
      const height = (value / maxVal) * maxHeight;

      let color = '#6366f1';
      if (merging?.includes(value)) color = '#22c55e';

      ctx.fillStyle = color;
      ctx.fillRect(x, startY - height, barWidth, height);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(value.toString(), x + barWidth / 2, startY + 15);
    });
  };

  const renderBinarySearch = (ctx: CanvasRenderingContext2D, step: AlgoStep, canvas: HTMLCanvasElement) => {
    const { array, left, right, mid, target, found } = step.state;
    if (!array) return;

    const boxSize = Math.min(50, (canvas.width - 100) / array.length - 10);
    const startX = (canvas.width - (array.length * (boxSize + 10))) / 2;
    const startY = canvas.height / 2 - boxSize / 2;

    // Draw target
    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Target: ${target}`, canvas.width / 2, 40);

    array.forEach((value: number, index: number) => {
      const x = startX + index * (boxSize + 10);

      let fillColor = '#334155';
      let textColor = '#e2e8f0';

      if (found && index === mid) {
        fillColor = '#22c55e';
        textColor = '#ffffff';
      } else if (index === mid) {
        fillColor = '#eab308';
        textColor = '#000000';
      } else if (index >= left && index <= right) {
        fillColor = '#6366f1';
        textColor = '#ffffff';
      } else {
        fillColor = '#1e293b';
        textColor = '#64748b';
      }

      ctx.fillStyle = fillColor;
      ctx.fillRect(x, startY, boxSize, boxSize);

      ctx.fillStyle = textColor;
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(value.toString(), x + boxSize / 2, startY + boxSize / 2 + 5);

      // Index label
      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.fillText(index.toString(), x + boxSize / 2, startY + boxSize + 15);
    });

    // Draw pointers
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText(`L=${left}  M=${mid >= 0 ? mid : '-'}  R=${right}`, canvas.width / 2, canvas.height - 20);
  };

  const renderAStar = (ctx: CanvasRenderingContext2D, step: AlgoStep, canvas: HTMLCanvasElement) => {
    const { grid, start, end, openSet, closedSet, path, current } = step.state;
    if (!grid) return;

    const rows = grid.length;
    const cols = grid[0].length;
    const cellSize = Math.min((canvas.width - 40) / cols, (canvas.height - 40) / rows);
    const offsetX = (canvas.width - cols * cellSize) / 2;
    const offsetY = (canvas.height - rows * cellSize) / 2;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const px = offsetX + x * cellSize;
        const py = offsetY + y * cellSize;
        
        let fillColor = '#1e293b';

        if (grid[y][x] === 1) {
          fillColor = '#64748b';
        } else if (path?.some((p: any) => p.x === x && p.y === y)) {
          fillColor = '#6366f1';
        } else if (current?.x === x && current?.y === y) {
          fillColor = '#eab308';
        } else if (x === start.x && y === start.y) {
          fillColor = '#22c55e';
        } else if (x === end.x && y === end.y) {
          fillColor = '#ef4444';
        } else if (openSet?.some((n: any) => n.x === x && n.y === y)) {
          fillColor = '#3b82f6';
        } else if (closedSet?.some((n: any) => n.x === x && n.y === y)) {
          fillColor = '#334155';
        }

        ctx.fillStyle = fillColor;
        ctx.fillRect(px + 1, py + 1, cellSize - 2, cellSize - 2);
      }
    }
  };

  const renderDijkstra = (ctx: CanvasRenderingContext2D, step: AlgoStep, canvas: HTMLCanvasElement) => {
    const { nodes, edges, distances, visited, current, updating } = step.state;
    if (!nodes || !edges) return;

    // Scale factor for canvas
    const scaleX = canvas.width / 500;
    const scaleY = canvas.height / 300;

    // Draw edges
    edges.forEach((edge: any) => {
      const from = nodes[edge.from];
      const to = nodes[edge.to];
      
      ctx.beginPath();
      ctx.moveTo(from.x * scaleX, from.y * scaleY);
      ctx.lineTo(to.x * scaleX, to.y * scaleY);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Edge weight
      const midX = ((from.x + to.x) / 2) * scaleX;
      const midY = ((from.y + to.y) / 2) * scaleY;
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(edge.weight.toString(), midX, midY - 5);
    });

    // Draw nodes
    nodes.forEach((node: any) => {
      const x = node.x * scaleX;
      const y = node.y * scaleY;
      const radius = 22 * Math.min(scaleX, scaleY);

      let fillColor = '#334155';
      if (node.id === current) fillColor = '#6366f1';
      else if (node.id === updating) fillColor = '#eab308';
      else if (visited?.includes(node.id)) fillColor = '#22c55e';

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = fillColor;
      ctx.fill();

      // Node label
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${14 * Math.min(scaleX, scaleY)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, x, y);

      // Distance
      const dist = distances?.[node.id];
      ctx.fillStyle = '#94a3b8';
      ctx.font = `${10 * Math.min(scaleX, scaleY)}px sans-serif`;
      ctx.fillText(`d=${dist === Infinity ? '∞' : dist}`, x, y + radius + 12);
    });
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        className="border border-border rounded-lg max-w-full max-h-full bg-background"
      />
    </div>
  );
}
