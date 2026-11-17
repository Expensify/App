type OffsetListener = (offsetX: number) => void;

/**
 * The current horizontal offset per sync key, kept outside React so a recycled scroller or follower can restore it on
 * mount. It is also kept for the session so an offset survives a query change, which is the same behaviour
 * `HorizontalTableScroll` gives the flat table. Entries are one number under a group's key, and are deliberately never
 * dropped: clearing them when a scroller unmounts would defeat the point, since FlashList unmounts a group's header
 * and rows whenever it recycles them.
 */
const offsetsByKey = new Map<string, number>();

/** Every mounted follower listening on a sync key, so the group's scroller can drive all of them. */
const listenersByKey = new Map<string, Set<OffsetListener>>();

function getSyncedHorizontalOffset(key: string) {
    return offsetsByKey.get(key) ?? 0;
}

/**
 * Records `offsetX` for `key` and pushes it to every follower on that key.
 *
 * Only a group's rows scroller publishes. A follower is moved by whoever owns this offset and never reports its own
 * position back, so there is no echo to filter out here.
 */
function publishSyncedHorizontalOffset(key: string, offsetX: number) {
    offsetsByKey.set(key, offsetX);
    for (const listener of listenersByKey.get(key) ?? []) {
        listener(offsetX);
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
