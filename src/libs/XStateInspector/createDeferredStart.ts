import type {LoadedInspector} from './types';

/**
 * Bridges the dev-menu button, which fires synchronously, to the asynchronously loaded inspector. A
 * press made before the chunk resolves is remembered and replayed on load, so the window still opens.
 * If the chunk fails to load, the returned function stays a no-op.
 */
function createDeferredStart(ready: Promise<LoadedInspector>): () => void {
    let start: (() => void) | undefined;
    let isStartRequested = false;

    ready.then(
        (inspector) => {
            start = inspector.start;
            if (isStartRequested) {
                start();
            }
        },
        () => {
            // The inspector chunk failed to load, so leave start() as a no-op.
        },
    );

    return () => {
        if (start) {
            start();
            return;
        }
        isStartRequested = true;
    };
}

export default createDeferredStart;
