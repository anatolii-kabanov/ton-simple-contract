import { useEffect, useState } from 'react';

export function useAsyncInit<T>(func: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<T | undefined>();

  const execute = async () => {
    const result = await func();
    setState(result);
  };

  useEffect(() => {
    execute();
  }, deps);

  return state;
}
