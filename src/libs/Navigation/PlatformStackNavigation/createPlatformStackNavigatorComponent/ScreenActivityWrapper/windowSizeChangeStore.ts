import type {EmitterSubscription, ScaledSize} from 'react-native';

import {Dimensions} from 'react-native';

// Every screen of every stack reads this flag, so one shared listener and one timer serve them all and the
// subscribers are notified only when the flag actually flips. A per instance version would run the whole handler
// in every screen for every event of a drag.

// How long the window stays marked as changing after the last qualifying change. Long enough for the revealed
// screens to finish their layout, short enough that they are deprioritized again before the user can reach them.
const WINDOW_SIZE_CHANGE_DURATION_MS = 250;

let isWindowSizeChanging = false;
let lastWidth = 0;
let stopTimeoutID: NodeJS.Timeout | undefined;
let dimensionsSubscription: EmitterSubscription | undefined;

const listeners = new Set<() => void>();

function notify() {
    for (const listener of listeners) {
        listener();
    }
}

function setIsWindowSizeChanging(value: boolean) {
    if (isWindowSizeChanging === value) {
        return;
    }
    isWindowSizeChanging = value;
    notify();
}

function handleDimensionsChange({window}: {window: ScaledSize}) {
    // Only width changes count, which also covers a rotation. The soft keyboard changes the window height on
    // Android and on mobile web, and reacting to that would remount the effects of every hidden screen on each
    // keyboard toggle.
    if (window.width === lastWidth) {
        return;
    }

    lastWidth = window.width;
    setIsWindowSizeChanging(true);
    clearTimeout(stopTimeoutID);
    stopTimeoutID = setTimeout(() => setIsWindowSizeChanging(false), WINDOW_SIZE_CHANGE_DURATION_MS);
}

function subscribe(listener: () => void) {
    if (listeners.size === 0) {
        lastWidth = Dimensions.get('window').width;
        dimensionsSubscription = Dimensions.addEventListener('change', handleDimensionsChange);
    }
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
        if (listeners.size > 0) {
            return;
        }
        dimensionsSubscription?.remove();
        dimensionsSubscription = undefined;
        clearTimeout(stopTimeoutID);
        stopTimeoutID = undefined;
        isWindowSizeChanging = false;
    };
}

function getSnapshot() {
    return isWindowSizeChanging;
}

export {subscribe, getSnapshot};
