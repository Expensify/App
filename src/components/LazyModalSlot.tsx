import React, {Suspense} from 'react';
import {ErrorBoundary as ReactErrorBoundary} from 'react-error-boundary';
import Log from '@libs/Log';

const logModalChunkFailure = (error: Error, info: {componentStack?: string | null}) =>
    Log.alert(`[GlobalModals] lazy chunk failure - ${error.message}`, {componentStack: info.componentStack ?? undefined}, false);

/**
 * Wraps a lazy-loaded child in its own ErrorBoundary + Suspense pair so a chunk-load failure
 * (or unrelated load latency) in one slot cannot tear down sibling slots or surrounding components.
 */
function LazyModalSlot({children}: {children: React.ReactNode}) {
    return (
        <ReactErrorBoundary
            fallback={null}
            onError={logModalChunkFailure}
        >
            <Suspense fallback={null}>{children}</Suspense>
        </ReactErrorBoundary>
    );
}

export default LazyModalSlot;
