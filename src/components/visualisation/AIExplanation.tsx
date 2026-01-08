import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

interface AIExplanationProps {
  algorithm: string;
  stepIndex: number;
  state: any;
  codeLines: string[];
}

export default function AIExplanation({ algorithm, stepIndex, state, codeLines }: AIExplanationProps) {
  const [explanation, setExplanation] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleExplain = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/visualise/explain-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          algorithm,
          stepIndex,
          state,
          codeLines,
        }),
      });
      const data = await response.json();
      setExplanation(data.explanation);
    } catch (error) {
      setExplanation("Error fetching explanation");
    }
    setLoading(false);
  };

  useEffect(() => {
    // Auto-explain on step change
    handleExplain();
  }, [stepIndex, state]);

  return (
    <Card className="p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Lightbulb className="h-5 w-5" />
        <h3 className="text-lg font-semibold">AI Explanation</h3>
      </div>

      <Button onClick={handleExplain} disabled={loading} className="mb-4">
        {loading ? "Explaining..." : "Explain This Step"}
      </Button>

      <div className="text-sm text-gray-700">
        {explanation || "Click to get explanation for this step."}
      </div>
    </Card>
  );
}