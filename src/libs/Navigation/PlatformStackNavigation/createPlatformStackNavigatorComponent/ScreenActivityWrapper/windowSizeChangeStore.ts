import type {EmitterSubscription, ScaledSize} from 'react-native';

import {Dimensions} from 'react-native';

// Every screen of every stack reads this flag, so it is kept in one module store instead of in each of them. One
// dimensions listener and one timer serve all the screens, the raw events are filtered in a single place, and the
// subscribers are notified only when the flag actually flips. A per instance version would run that whole handler
// in every screen for every event of a drag, and those arrive about every 16 ms.
//
// A screen that mounts in the middle of a resize also reads true right away, because the shared flag is already
// set, while a per instance version would report false until the next event. That part matters much less. The
// first render is visible anyway, and the next event sets the flag a few frames after the screen mounted.

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
