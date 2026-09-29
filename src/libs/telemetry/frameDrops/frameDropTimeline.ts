import CONST from '@src/CONST';

import type {Interaction, Operation, ScreenChange} from './types';

/**
 * Records what the app is doing, so frame drops measured natively can later be attributed to it.
 *
 * Recording only pushes an entry on context transitions (screen change, press, scroll start/end, operation start/end).
 * Nothing runs per frame and nothing crosses the bridge here: the timeline is matched against the native frame delay
 * store in batches, when the app is idle (see frameDropMonitor).
 */

let isRecording = false;
let nextID = 0;

const screens: ScreenChange[] = [];
const interactions: Interaction[] = [];
const operations: Operation[] = [];
let activeScroll: Interaction | undefined;
// Kept while not recording too (e.g. the app became inactive for a permission prompt during navigation), so the
// screen is known again as soon as recording resumes.
let currentScreen: string | undefined;

function truncate(label: string): string {
    return label.length > CONST.TELEMETRY.FRAME_DROPS.MAX_LABEL_LENGTH ? label.slice(0, CONST.TELEMETRY.FRAME_DROPS.MAX_LABEL_LENGTH) : label;
}

function hasRoom(): boolean {
    return screens.length + interactions.length + operations.length < CONST.TELEMETRY.FRAME_DROPS.MAX_EVENTS;
}

function pushScreen(screen: string) {
    if (screens.at(-1)?.screen === screen || !hasRoom()) {
        return;
    }
    screens.push({time: performance.now(), screen});
}

function setRecording(enabled: boolean) {
    isRecording = enabled;
    if (enabled && currentScreen) {
        pushScreen(currentScreen);
    }
}

function recordScreen(screen: string | undefined) {
    if (!screen) {
        return;
    }
    currentScreen = truncate(screen);
    if (!isRecording) {
        return;
    }
    pushScreen(currentScreen);
}

/** Only static labels (sentryLabel) may be passed here: they become metric attributes, so they must not carry user data. */
function recordPress(label: string | undefined) {
    if (!isRecording || !hasRoom()) {
        return;
    }
    const start = performance.now();
    interactions.push({
        id: nextID++,
        label: label ? truncate(label) : CONST.TELEMETRY.FRAME_DROPS.INTERACTION_UNLABELED_PRESS,
        start,
        end: start + CONST.TELEMETRY.FRAME_DROPS.PRESS_WINDOW_MS,
    });
}

function recordScroll(isScrolling: boolean) {
    if (!isRecording) {
        return;
    }
    if (!isScrolling) {
        if (activeScroll) {
            activeScroll.end = performance.now();
            activeScroll = undefined;
        }
        return;
    }
    if (activeScroll || !hasRoom()) {
        return;
    }
    activeScroll = {id: nextID++, label: CONST.TELEMETRY.FRAME_DROPS.INTERACTION_SCROLL, start: performance.now()};
    interactions.push(activeScroll);
}

/** Returns an id to pass to endOperation, or undefined when not recording. */
function startOperation(name: string): number | undefined {
    if (!isRecording || !hasRoom()) {
        return undefined;
    }
    const id = nextID++;
    operations.push({id, name: truncate(name), start: performance.now()});
    return id;
}

function endOperation(id: number | undefined) {
    if (id === undefined) {
        return;
    }
    const operation = operations.find((entry) => entry.id === id);
    if (operation && operation.end === undefined) {
        operation.end = performance.now();
    }
}

/**
 * Drops everything that ended before `time`, keeping the screen that was current at `time`.
 * Intervals that were never closed (e.g. a lost scroll end event) are dropped once they get too old, so they can't own frames forever.
 */
function pruneBefore(time: number) {
    const lastScreenBefore = screens.findLastIndex((change) => change.time <= time);
    if (lastScreenBefore > 0) {
        screens.splice(0, lastScreenBefore);
    }
    const staleStart = time - CONST.TELEMETRY.FRAME_DROPS.MAX_OPEN_INTERVAL_MS;
    for (const list of [interactions, operations]) {
        for (let i = list.length - 1; i >= 0; i--) {
            const interval = list.at(i);
            if (!interval) {
                continue;
            }
            const isEnded = interval.end !== undefined && interval.end <= time;
            const isStale = interval.end === undefined && interval.start < staleStart;
            if (isEnded || isStale) {
                list.splice(i, 1);
            }
        }
    }
    if (activeScroll && !interactions.includes(activeScroll)) {
        activeScroll = undefined;
    }
}

function clear() {
    screens.length = 0;
    interactions.length = 0;
    operations.length = 0;
    activeScroll = undefined;
    currentScreen = undefined;
}

function getTimeline() {
    return {screens, interactions, operations};
}

export {clear, endOperation, getTimeline, pruneBefore, recordPress, recordScreen, recordScroll, setRecording, startOperation};
