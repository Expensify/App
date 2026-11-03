import type {StartSpanOptions} from '@sentry/core';

import {useState} from 'react';

import {startSpan} from './activeSpans';

type RenderPhaseSpan = {
    /** Registry key the span is tracked under */
    spanId: string;

    /** Forwarded to `startSpan` */
    options: StartSpanOptions;
};

/**
 * Registers spans during the first render instead of from an effect, which is both too late and order-dependent:
 *
 * - React flushes a descendant's effect before its parent's (reconciler behaviour, not a documented contract),
 *   so a descendant can end the span before it was ever registered. The end then no-ops and the span leaks. Render
 *   provably precedes every effect, so registering here doesn't depend on flush order at all.
 * - The span has to cover the subtree's own render and commit, which an effect-time start excludes entirely.
 *
 * Same approach as Sentry's `Profiler`: span created in the constructor, ended in `componentDidMount`.
 *
 * `useState` (not a ref) because React Compiler rejects refs in render and rejects `useMemo` for a void callback.
 */
function useStartSpansOnRender(spansToStart: RenderPhaseSpan[]): void {
    useState(() => {
        for (const {spanId, options} of spansToStart) {
            startSpan(spanId, options);
        }
    });
}

export default useStartSpansOnRender;
