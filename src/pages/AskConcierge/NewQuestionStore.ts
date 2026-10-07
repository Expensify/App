import {useSyncExternalStore} from 'react';

/**
 * Lets the navigation bar ask the Concierge page for a blank question while the page is already open, where a
 * navigation would be a no-op. The page watches the count and starts a new question each time it rises.
 */
let requestCount = 0;
const listeners = new Set<() => void>();

function requestNewConciergeQuestion() {
    requestCount += 1;
    for (const listener of listeners) {listener();}
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

function getSnapshot() {
    return requestCount;
}

function useNewConciergeQuestionRequests(): number {
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export {requestNewConciergeQuestion, useNewConciergeQuestionRequests};
