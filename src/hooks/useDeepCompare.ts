// useDeepCompare.ts
import { useRef } from 'react';
import isEqual from 'lodash/isEqual';

export default function useDeepCompare<T>(value: T): T | undefined {
  const ref = useRef<T>();
  if (!isEqual(value, ref.current)) {
    ref.current = value;
  }
  return ref.current;
}