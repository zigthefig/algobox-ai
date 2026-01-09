import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ExplainParams {
  algorithm: string;
  step: number;
  stepType: string;
  description: string;
  code?: string;
}

interface DebugParams {
  code: string;
  error?: string;
  language: string;
  problemContext?: string;
}

export function useAIExplanation() {
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);

  const explainStep = useCallback(async (params: ExplainParams) => {
    setIsLoading(true);
    setExplanation(null);

    try {
      const { data, error } = await supabase.functions.invoke("explain-algorithm", {
        body: params,
      });

      if (error) {
        console.error("Error calling explain-algorithm:", error);
        toast.error("Failed to get AI explanation");
        return null;
      }

      if (data?.error) {
        toast.error(data.error);
        return null;
      }

      setExplanation(data.explanation);
      return data.explanation;
    } catch (err) {
      console.error("Error in explainStep:", err);
      toast.error("Failed to connect to AI service");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debugCode = useCallback(async (params: DebugParams) => {
    setIsLoading(true);
    setExplanation(null);

    try {
      const { data, error } = await supabase.functions.invoke("debug-code", {
        body: params,
      });

      if (error) {
        console.error("Error calling debug-code:", error);
        toast.error("Failed to get AI analysis");
        return null;
      }

      if (data?.error) {
        toast.error(data.error);
        return null;
      }

      setExplanation(data.analysis);
      return data.analysis;
    } catch (err) {
      console.error("Error in debugCode:", err);
      toast.error("Failed to connect to AI service");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearExplanation = useCallback(() => {
    setExplanation(null);
  }, []);

  return {
    isLoading,
    explanation,
    explainStep,
    debugCode,
    clearExplanation,
  };
}
