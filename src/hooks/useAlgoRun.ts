import { useState } from "react";

export function useAlgoRun() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (algorithm: string, input: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/visualise/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ algorithm, input }),
      });
      if (!response.ok) throw new Error('Failed to run algorithm');
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchRun = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/visualise/run/${id}`);
      if (!response.ok) throw new Error('Failed to fetch run');
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { run, fetchRun, loading, error };
}