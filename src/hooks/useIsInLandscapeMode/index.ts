import {isMobile as isMobileUtil} from '@libs/Browser';
import isInLandscapeMode from '@libs/isInLandscapeMode';

import {useSyncExternalStore} from 'react';

const isMobile = isMobileUtil();
const subscribers = new Set<() => void>();
let cachedValue = isInLandscapeMode();
let isListenerAttached = false;

function handleOrientationChange() {
    const nextValue = isInLandscapeMode();

    if (nextValue === cachedValue) {
        return;
    }

    cachedValue = nextValue;
    for (const callback of subscribers) {
        callback();
    }
}

function addOrientationChangeListener() {
    const orientation = window.screen?.orientation;

    if (orientation) {
        orientation.addEventListener('change', handleOrientationChange);
        return;
    }

    window.addEventListener('resize', handleOrientationChange);
}

function removeOrientationChangeListener() {
    const orientation = window.screen?.orientation;

    if (orientation) {
        orientation.removeEventListener('change', handleOrientationChange);
        return;
    }

    window.removeEventListener('resize', handleOrientationChange);
}

function subscribe(callback: () => void): () => void {
    if (!isMobile) {
        return () => {};
    }

    subscribers.add(callback);

    if (!isListenerAttached) {
        addOrientationChangeListener();
        isListenerAttached = true;
    }

    return () => {
        subscribers.delete(callback);

        if (subscribers.size > 0) {
            return;
        }

        removeOrientationChangeListener();
        isListenerAttached = false;
    };
}

function getSnapshot(): boolean {
    return cachedValue;
}

/**
 * Returns whether device that is currently in landscape orientation.
 * It checks whether device is a mobile before subscribing to orientation changes.
 */
function useIsInLandscapeMode(): boolean {
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export default useIsInLandscapeMode;
