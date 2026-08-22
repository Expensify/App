type OffsetListener = (offsetX: number) => void;

/**
 * The current horizontal offset per sync key, kept outside React so a recycled scroller can restore it on mount, and
 * kept for the session so an offset survives a query change — the same behaviour `HorizontalTableScroll` gives the
 * flat table. Entries are one number under a group's key, and are deliberately never dropped: clearing them when a
 * scroller unmounts would defeat the point, since FlashList unmounts a group's header and rows whenever it recycles them.
 */
const offsetsByKey = new Map<string, number>();

/** Every mounted scroller listening on a sync key, so one scroller's drag can drive its siblings. */
const listenersByKey = new Map<string, Set<OffsetListener>>();

function getSyncedHorizontalOffset(key: string) {
    return offsetsByKey.get(key) ?? 0;
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

export {getSyncedHorizontalOffset, publishSyncedHorizontalOffset, subscribeToSyncedHorizontalOffset};
