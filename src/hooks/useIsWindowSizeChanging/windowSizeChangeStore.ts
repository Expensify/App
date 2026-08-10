import type {EmitterSubscription, ScaledSize} from 'react-native';

import {Dimensions} from 'react-native';

// How long the window stays marked as changing after the last qualifying dimension change. Long enough for a
// subscriber to re-render and receive its onLayout callbacks against the new size, short enough that the flag
// settles right after the change ends.
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
    // Only a width change counts. The soft keyboard changes the window height on Android (adjustResize) and on
    // mobile web, so a height that counted would report a size change on every keyboard toggle. A scale only change
    // keeps the same size in density independent units, so it does not count either. Rotating a device always
    // changes the width, which is why there is no separate orientation check.
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
