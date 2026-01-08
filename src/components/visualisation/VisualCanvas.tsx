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
      renderQuickSort(ctx, step);
    } else if (algorithm === 'bubble-sort') {
      renderBubbleSort(ctx, step);
    } else if (algorithm === 'merge-sort') {
      renderMergeSort(ctx, step);
    } else if (algorithm === 'binary-search') {
      renderBinarySearch(ctx, step);
    } else if (algorithm === 'a-star') {
      renderAStar(ctx, step);
    } else if (algorithm === 'dijkstra') {
      renderDijkstra(ctx, step);
    }
  }, [algorithm, steps, currentStep]);

  const renderQuickSort = (ctx: CanvasRenderingContext2D, step: AlgoStep) => {
    const { array, low, high, pivot, i, j } = step.state;
    const barWidth = 40;
    const barHeight = 20;
    const startX = 50;
    const startY = 100;

    array.forEach((value: number, index: number) => {
      const x = startX + index * (barWidth + 10);
      const height = value * barHeight;

      // Color based on state
      let color = 'blue';
      if (index === pivot) color = 'red';
      if (index === i) color = 'green';
      if (index === j) color = 'yellow';
      if (index >= low && index <= high) color = 'orange';

      ctx.fillStyle = color;
      ctx.fillRect(x, startY - height, barWidth, height);

      ctx.fillStyle = 'black';
      ctx.fillText(value.toString(), x + barWidth / 2 - 5, startY + 20);
    });
  };

  const renderBubbleSort = (ctx: CanvasRenderingContext2D, step: AlgoStep) => {
    const { array, comparing } = step.state;
    const barWidth = 40;
    const barHeight = 20;
    const startX = 50;
    const startY = 100;

    array.forEach((value: number, index: number) => {
      const x = startX + index * (barWidth + 10);
      const height = value * barHeight;

      let color = 'blue';
      if (comparing && comparing.includes(index)) color = 'yellow';

      ctx.fillStyle = color;
      ctx.fillRect(x, startY - height, barWidth, height);

      ctx.fillStyle = 'black';
      ctx.fillText(value.toString(), x + barWidth / 2 - 5, startY + 20);
    });
  };

  const renderMergeSort = (ctx: CanvasRenderingContext2D, step: AlgoStep) => {
    // Similar to quick sort for now
    renderQuickSort(ctx, step);
  };

  const renderBinarySearch = (ctx: CanvasRenderingContext2D, step: AlgoStep) => {
    const { array, left, right, mid, target } = step.state;
    const barWidth = 30;
    const barHeight = 20;
    const startX = 50;
    const startY = 100;

    array.forEach((value: number, index: number) => {
      const x = startX + index * (barWidth + 10);
      const height = value * barHeight;

      let color = 'blue';
      if (index === mid) color = 'red';
      if (index >= left && index <= right) color = 'green';

      ctx.fillStyle = color;
      ctx.fillRect(x, startY - height, barWidth, height);

      ctx.fillStyle = 'black';
      ctx.fillText(value.toString(), x + barWidth / 2 - 5, startY + 20);
    });

    ctx.fillStyle = 'black';
    ctx.fillText(`Target: ${target}`, 50, 50);
    ctx.fillText(`Left: ${left}, Right: ${right}`, 50, 70);
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={400}
        height={300}
        className="border border-gray-300 max-w-full max-h-full"
        style={{ aspectRatio: '4/3' }}
      />
    </div>
  );
}