import { useState, useCallback } from 'react';
import type { GeneratedComponent, Provider } from '../types';
import { usePersistentState } from './usePersistentState';
import { reviveComponents } from '../utils/reviveComponents';
import { addPromptToHistory } from '../utils/promptHistory';

const COMPONENTS_KEY = 'rcg:components';
const PROMPT_HISTORY_KEY = 'rcg:promptHistory';

interface UseComponentGeneratorReturn {
  components: GeneratedComponent[];
  promptHistory: string[];
  isLoading: boolean;
  error: string | null;
  generate: (prompt: string, apiKey: string | undefined, provider: Provider) => Promise<void>;
  removeComponent: (id: string) => void;
  clearAll: () => void;
  clearHistory: () => void;
}

export function useComponentGenerator(): UseComponentGeneratorReturn {
  const [components, setComponents] = usePersistentState<GeneratedComponent[]>(
    COMPONENTS_KEY,
    [],
    { deserialize: reviveComponents },
  );
  const [promptHistory, setPromptHistory] = usePersistentState<string[]>(PROMPT_HISTORY_KEY, []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (prompt: string, apiKey: string | undefined, provider: Provider) => {
      setIsLoading(true);
      setError(null);
      setPromptHistory((prev) => addPromptToHistory(prev, prompt));

      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, ...(apiKey && { apiKey }), provider }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to generate component');
        }

        const newComponent: GeneratedComponent = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          prompt,
          code: data.code,
          createdAt: new Date(),
        };

        setComponents((prev) => [newComponent, ...prev]);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [setComponents, setPromptHistory],
  );

  const removeComponent = useCallback(
    (id: string) => {
      setComponents((prev) => prev.filter((c) => c.id !== id));
    },
    [setComponents],
  );

  const clearAll = useCallback(() => {
    setComponents([]);
  }, [setComponents]);

  const clearHistory = useCallback(() => {
    setPromptHistory([]);
  }, [setPromptHistory]);

  return {
    components,
    promptHistory,
    isLoading,
    error,
    generate,
    removeComponent,
    clearAll,
    clearHistory,
  };
}
