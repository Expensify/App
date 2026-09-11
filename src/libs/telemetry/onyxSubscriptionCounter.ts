// Counts the subscription work an Onyx key causes: how many times subscribing `useOnyx` hooks re-ran, and how
// many times their selectors executed. Idle until `start()` opens a window, so the shipped cost is one boolean check.

/** Work attributed to a single Onyx key inside a counting window. */
type OnyxSubscriptionCounts = {
    /** Executions of a `useOnyx` body subscribed to this key. One execution is one render of a subscribing component. */
    hookRuns: number;

    /** Executions of the `selector` passed to `useOnyx` for this key. Also a proxy for how often Onyx woke the subscriber. */
    selectorRuns: number;
};

const countsByKey = new Map<string, OnyxSubscriptionCounts>();
let isCounting = false;

/** Records one unit of subscription work for `key`. A no-op outside a counting window. */
function bump(key: string, field: keyof OnyxSubscriptionCounts) {
    if (!isCounting) {
        return;
    }

    let counts = countsByKey.get(key);
    if (!counts) {
        counts = {hookRuns: 0, selectorRuns: 0};
        countsByKey.set(key, counts);
    }
    counts[field]++;
}

/** Opens a counting window, discarding anything counted before it. */
function start() {
    countsByKey.clear();
    isCounting = true;
}

/** Closes the counting window and returns the tally, keyed by Onyx key. */
function stop(): Record<string, OnyxSubscriptionCounts> {
    isCounting = false;
    return Object.fromEntries(countsByKey);
}

export default {bump, start, stop};
export type {OnyxSubscriptionCounts};
