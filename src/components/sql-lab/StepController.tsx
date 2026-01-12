import { Play, Pause, SkipBack, SkipForward, Rewind, FastForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface StepControllerProps {
    currentStep: number;
    totalSteps: number;
    isPlaying: boolean;
    speed: number;
    onStepChange: (step: number) => void;
    onPlayPause: () => void;
    onSpeedChange: (speed: number) => void;
}

export function StepController({
    currentStep,
    totalSteps,
    isPlaying,
    speed,
    onStepChange,
    onPlayPause,
    onSpeedChange,
}: StepControllerProps) {
    return (
        <div className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            {/* Step Navigation */}
            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onStepChange(0)}
                    disabled={currentStep === 0}
                >
                    <Rewind className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onStepChange(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                >
                    <SkipBack className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full"
                    onClick={onPlayPause}
                >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onStepChange(Math.min(totalSteps - 1, currentStep + 1))}
                    disabled={currentStep === totalSteps - 1}
                >
                    <SkipForward className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onStepChange(totalSteps - 1)}
                    disabled={currentStep === totalSteps - 1}
                >
                    <FastForward className="h-4 w-4" />
                </Button>
            </div>

            {/* Step Progress */}
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <Slider
                        value={[currentStep]}
                        max={Math.max(0, totalSteps - 1)}
                        step={1}
                        onValueChange={([val]) => onStepChange(val)}
                        className="flex-1"
                    />
                    <span className="text-sm font-mono text-slate-400 min-w-[60px]">
                        {currentStep + 1} / {totalSteps}
                    </span>
                </div>
            </div>

            {/* Speed Control */}
            <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Speed</span>
                <div className="flex gap-1">
                    {[0.5, 1, 2].map((s) => (
                        <button
                            key={s}
                            onClick={() => onSpeedChange(s)}
                            className={cn(
                                "px-2 py-1 text-xs rounded transition-colors",
                                speed === s
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                            )}
                        >
                            {s}x
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
