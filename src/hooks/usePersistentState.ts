import { useEffect, useState } from 'react';
import { loadFromStorage, saveToStorage } from '../utils/persistentStorage';

interface Options<T> {
  /** localStorage에서 읽은 원본 값을 상태 타입으로 변환한다(예: Date 복원). */
  deserialize?: (raw: unknown) => T;
}

const MISSING = Symbol('missing');

/**
 * useState와 동일하게 동작하되, 값을 localStorage(key)에 영속화한다.
 * 마운트 시 저장된 값이 있으면 복원하고, 값이 바뀔 때마다 저장한다.
 */
export function usePersistentState<T>(
  key: string,
  initialValue: T,
  options?: Options<T>,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    const stored = loadFromStorage<unknown>(key, MISSING);
    if (stored === MISSING) return initialValue;
    return options?.deserialize ? options.deserialize(stored) : (stored as T);
  });

  useEffect(() => {
    saveToStorage(key, value);
  }, [key, value]);

  return [value, setValue];
}
