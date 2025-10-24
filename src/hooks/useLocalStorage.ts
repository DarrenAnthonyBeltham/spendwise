import { useState, useEffect } from 'react';

function getValue<T>(key: string, initialValue: T | (() => T)): T {
  const savedValue = localStorage.getItem(key);
  if (savedValue) {
    try {
      return JSON.parse(savedValue) as T;
    } catch (e) {
      console.error(`Failed to parse ${key} from localStorage`, e);
      localStorage.removeItem(key);
    }
  }

  if (typeof initialValue === 'function') {
    return (initialValue as () => T)();
  }
  return initialValue;
}

export function useLocalStorage<T>(key: string, initialValue: T | (() => T)) {
  const [value, setValue] = useState<T>(() => getValue(key, initialValue));

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [value, key]);

  return [value, setValue] as const;
}