import React from 'react';
import usePersistScroll from './hooks/usePersistScroll';

/**
 * A tiny component that attaches the scroll persistence logic.
 * It renders nothing but ensures the hook runs once per route change.
 */
export default function ScrollRestoration() {
  usePersistScroll();
  return null;
}
