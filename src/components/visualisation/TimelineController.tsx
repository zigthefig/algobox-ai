import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Play, Pause, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import { useEffect, useState } from "react";

interface AlgoStep {
  index: number;
  type: string;
  state: any;
  description: string;
}

interface TimelineControllerProps {
  steps: AlgoStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

export default function TimelineController({
  steps,
  currentStep,
  onStepChange,
  isPlaying,
  setIsPlaying,
}: TimelineControllerProps) {
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      if (currentStep < steps.length - 1) {
        onStepChange(currentStep + 1);
      } else {
        setIsPlaying(false);
      }
    }, 1000 / speed);

    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps.length, speed, onStepChange, setIsPlaying]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    onStepChange(0);
    setIsPlaying(false);
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      onStepChange(currentStep + 1);
    }
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Timeline</h3>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handlePrev} disabled={currentStep === 0}>
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handlePlayPause}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={handleNext} disabled={currentStep === steps.length - 1}>
            <SkipForward className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <div>
          <label className="text-sm font-medium">Step: {currentStep + 1} / {steps.length}</label>
          <Slider
            value={[currentStep]}
            onValueChange={(value) => onStepChange(value[0])}
            max={steps.length - 1}
            step={1}
            className="mt-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Speed: {speed}x</label>
          <Slider
            value={[speed]}
            onValueChange={(value) => setSpeed(value[0])}
            min={0.5}
            max={5}
            step={0.5}
            className="mt-2"
          />
        </div>

        {steps[currentStep] && (
          <div className="text-sm text-gray-600">
            {steps[currentStep].description}
          </div>
        )}
      </div>
    </Card>
  );
}