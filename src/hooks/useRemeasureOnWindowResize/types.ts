/**
 * Measures the anchor again and applies the result. Call `isStale` once the measurement comes back: it is true when the
 * window changed again or the hook went inactive in the meantime, and the result should then be dropped.
 */
type UseRemeasureOnWindowResizeCallback = (isStale: () => boolean) => void;

/**
 * Calls `remeasure` while `isActive`, whenever the window changes size. The callback doesn't need to be stable.
 */
type UseRemeasureOnWindowResize = (isActive: boolean, remeasure: UseRemeasureOnWindowResizeCallback) => void;

export type {UseRemeasureOnWindowResizeCallback, UseRemeasureOnWindowResize};
