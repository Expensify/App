import Log from '@libs/Log';

import type {EmitterSubscription, ScaledSize} from 'react-native';

import {Dimensions} from 'react-native';

// How long the window stays marked as changing after the last qualifying dimension change. Long enough for the
// revealed screens to run their layout effects and receive their onLayout callbacks, short enough that they are
// deprioritized again before the user can navigate to them.
const WINDOW_SIZE_CHANGE_DURATION_MS = 250;

let isWindowSizeChanging = false;
let lastWidth = 0;
let lastIsPortrait = true;
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

function isPortrait(size: ScaledSize) {
    return size.height >= size.width;
}

function rememberWindowSize(size: ScaledSize) {
    lastWidth = size.width;
    lastIsPortrait = isPortrait(size);
}

function handleDimensionsChange({window}: {window: ScaledSize}) {
    // Only width and orientation changes count as a resize. The soft keyboard changes the window height on Android
    // (adjustResize) and on mobile web, and reacting to that would remount and clean up the effects of every hidden
    // screen on each keyboard toggle. A scale only change keeps the same layout size in density independent units,
    // so it does not count either.
    if (window.width === lastWidth && isPortrait(window) === lastIsPortrait) {
        return;
    }

    rememberWindowSize(window);
    if (!isWindowSizeChanging) {
        // Logged once per change instead of per screen, because every deprioritized screen flips twice here.
        Log.info('[ScreenActivityWrapper] Window size changed, revealing deprioritized screens', false, {
            width: window.width,
            height: window.height,
            isPortrait: lastIsPortrait,
        });
    }
    setIsWindowSizeChanging(true);
    clearTimeout(stopTimeoutID);
    stopTimeoutID = setTimeout(() => setIsWindowSizeChanging(false), WINDOW_SIZE_CHANGE_DURATION_MS);
}

function subscribe(listener: () => void) {
    if (listeners.size === 0) {
        rememberWindowSize(Dimensions.get('window'));
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
