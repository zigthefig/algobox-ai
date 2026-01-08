import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import VisualCanvas from "@/components/visualisation/VisualCanvas";
import TimelineController from "@/components/visualisation/TimelineController";
import AIExplanation from "@/components/visualisation/AIExplanation";
import { useAlgoRun } from "@/hooks/useAlgoRun";

export default function Visualise() {
  const { algorithm } = useParams<{ algorithm: string }>();
  const [code, setCode] = useState("// Algorithm code here");
  const [input, setInput] = useState({ array: [3, 1, 4, 1, 5] }); // Default input
  const { run, loading, error } = useAlgoRun();

  const [runId, setRunId] = useState<string | null>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (algorithm) {
      // Load default code for algorithm
      loadAlgorithmCode(algorithm);
    }
  }, [algorithm]);

  const loadAlgorithmCode = (algo: string) => {
    // Mock code loading
    if (algo === 'quick-sort') {
      setCode(`function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    const pi = partition(arr, low, high);
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
  return arr;
}

function partition(arr, low, high) {
  const pivot = arr[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}`);
    } else if (algo === 'bubble-sort') {
      setCode(`function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`);
    } else if (algo === 'merge-sort') {
      setCode(`function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }
  return result.concat(left.slice(i)).concat(right.slice(j));
}`);
    }
  };

  const handleRun = async () => {
    if (!algorithm) return;
    const result = await run(algorithm, input);
    if (result) {
      setRunId(result.id);
      setSteps(JSON.parse(result.steps));
      setCurrentStep(0);
    }
  };

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };

  return (
    <div className="flex h-screen">
      {/* Left: Code Editor */}
      <div className="w-1/3 p-4 border-r">
        <Card className="h-full">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Algorithm Code</h2>
            <Badge variant="outline" className="mt-2">{algorithm}</Badge>
          </div>
          <div className="h-full">
            <Editor
              height="100%"
              language="javascript"
              value={code}
              onChange={(value) => setCode(value || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
              }}
            />
          </div>
        </Card>
      </div>

      {/* Center: Visual Canvas */}
      <div className="w-1/3 p-4">
        <Card className="h-full">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Visualization</h2>
            <Button onClick={handleRun} disabled={loading}>
              {loading ? "Running..." : "Run Algorithm"}
            </Button>
          </div>
          <div className="h-full p-4">
            <VisualCanvas
              algorithm={algorithm || ""}
              steps={steps}
              currentStep={currentStep}
            />
          </div>
        </Card>
      </div>

      {/* Right: Timeline + AI */}
      <div className="w-1/3 p-4">
        <div className="space-y-4">
          <TimelineController
            steps={steps}
            currentStep={currentStep}
            onStepChange={handleStepChange}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
          />
          <AIExplanation
            algorithm={algorithm || ""}
            stepIndex={currentStep}
            state={steps[currentStep]?.state}
            codeLines={code.split('\n')}
          />
        </div>
      </div>
    </div>
  );
}