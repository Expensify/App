import isChunkLoadError from '@libs/isChunkLoadError';
import Log from '@libs/Log';

import * as Sentry from '@sentry/react-native';
import React, {Suspense} from 'react';
import {ErrorBoundary as ReactErrorBoundary} from 'react-error-boundary';

const logModalError = (error: Error, info: {componentStack?: string | null}) => {
    const componentStack = info.componentStack ?? undefined;

    if (isChunkLoadError(error)) {
        /* Chunk-load failures are silent ({fallback: null}) and largely environmental
         * (deploy churn, ad-blockers, flaky networks), so report as warning with a
         * fixed fingerprint to keep them in one Sentry issue instead of fragmenting
         * per slot/chunk. */
        Log.alert(`[GlobalModals] lazy chunk failure - ${error.message}`, {componentStack}, false);
        Sentry.captureException(error, {
            level: 'warning',
            tags: {context: 'lazy-modal-chunk'},
            fingerprint: ['lazy-modal-chunk-failure'],
            extra: {componentStack},
        });
        return;
    }

    // Render-phase error inside a lazy modal — a real bug. Keep default error level
    // and default (stack-based) fingerprint so it surfaces alongside other crashes.
    Log.alert(`[GlobalModals] modal render error - ${error.message}`, {componentStack}, false);
    Sentry.captureException(error, {
        tags: {context: 'lazy-modal-render-error'},
        extra: {componentStack},
    });
};

/**
 * Wraps a lazy-loaded child in its own ErrorBoundary + Suspense pair so a chunk-load failure
 * (or unrelated load latency) in one slot cannot tear down sibling slots or surrounding components.
 */
function LazyModalSlot({children}: {children: React.ReactNode}) {
    return (
        <ReactErrorBoundary
            fallback={null}
            onError={logModalError}
        >
            <Suspense fallback={null}>{children}</Suspense>
        </ReactErrorBoundary>
    );
}

export default LazyModalSlot;
