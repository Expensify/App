type OffsetListener = (offsetX: number) => void;

/** The current horizontal offset per sync key, kept outside React so a recycled scroller can restore it on mount. */
const offsetsByKey = new Map<string, number>();

/** Every mounted scroller listening on a sync key, so one scroller's drag can drive its siblings. */
const listenersByKey = new Map<string, Set<OffsetListener>>();

function getSyncedHorizontalOffset(key: string) {
    return offsetsByKey.get(key) ?? 0;
}

/** Drops every saved offset. Call this when the underlying query changes so a new table starts at the left edge. */
function resetSyncedHorizontalOffsets() {
    offsetsByKey.clear();
}

/** Records `offsetX` for `key` and pushes it to every scroller on that key except the one it came from. */
function publishSyncedHorizontalOffset(key: string, offsetX: number, source: OffsetListener) {
    offsetsByKey.set(key, offsetX);
    for (const listener of listenersByKey.get(key) ?? []) {
        if (listener !== source) {
            listener(offsetX);
        }
    }
}

function subscribeToSyncedHorizontalOffset(key: string, listener: OffsetListener) {
    let listeners = listenersByKey.get(key);
    if (!listeners) {
        listeners = new Set();
        listenersByKey.set(key, listeners);
    }
    listeners.add(listener);
    return () => {
        listeners?.delete(listener);
        if (listeners?.size === 0) {
            listenersByKey.delete(key);
        }
    };
}

export {getSyncedHorizontalOffset, publishSyncedHorizontalOffset, resetSyncedHorizontalOffsets, subscribeToSyncedHorizontalOffset};
export type {OffsetListener};
