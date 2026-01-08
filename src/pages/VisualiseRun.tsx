import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
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

export default function VisualiseRun() {
  const { algorithm, id } = useParams<{ algorithm: string; id: string }>();
  const [code, setCode] = useState("// Algorithm code here");
  const { fetchRun, loading, error } = useAlgoRun();

  const [runData, setRunData] = useState<any>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (id) {
      loadRun(id);
    }
    if (algorithm) {
      loadAlgorithmCode(algorithm);
    }
  }, [id, algorithm]);

  const loadRun = async (runId: string) => {
    const data = await fetchRun(runId);
    if (data) {
      setRunData(data);
      setSteps(data.steps);
    }
  };

  const loadAlgorithmCode = (algo: string) => {
    // Same as in Visualise.tsx
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
            {runData && <Badge>Run ID: {runData.id}</Badge>}
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