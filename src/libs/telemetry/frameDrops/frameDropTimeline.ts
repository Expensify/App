import CONST from '@src/CONST';

import type {Interaction, Operation, ScreenChange, Timeline} from './types';

import {isStaticFlowName, sanitizePressLabel} from './staticLabels';

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
const flows: Operation[] = [];
let activeScroll: Interaction | undefined;
// Several lists can report scrolling at once, so the scroll interaction lasts until the last of them stops.
let scrollingListCount = 0;
// Kept while not recording too (e.g. the app became inactive for a permission prompt during navigation), so the
// screen is known again as soon as recording resumes.
let currentScreen: string | undefined;

function truncate(label: string): string {
    return label.length > CONST.TELEMETRY.FRAME_DROPS.MAX_LABEL_LENGTH ? label.slice(0, CONST.TELEMETRY.FRAME_DROPS.MAX_LABEL_LENGTH) : label;
}

function hasRoom(): boolean {
    return interactions.length + operations.length + flows.length < CONST.TELEMETRY.FRAME_DROPS.MAX_EVENTS;
}

/** Screens have their own cap: a burst of operations must not make a navigation get lost. */
function pushScreen(screen: string) {
    if (screens.at(-1)?.screen === screen || screens.length >= CONST.TELEMETRY.FRAME_DROPS.MAX_EVENTS) {
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

function recordPress(label: string | undefined) {
    if (!isRecording || !hasRoom()) {
        return;
    }
    const start = performance.now();
    interactions.push({id: nextID++, label: sanitizePressLabel(label), start, end: start + CONST.TELEMETRY.FRAME_DROPS.PRESS_WINDOW_MS});
}

function endScroll() {
    scrollingListCount = 0;
    if (!activeScroll) {
        return;
    }
    activeScroll.end = performance.now();
    activeScroll = undefined;
}

function recordScroll(isScrolling: boolean) {
    if (!isScrolling) {
        scrollingListCount = Math.max(0, scrollingListCount - 1);
        if (scrollingListCount === 0) {
            endScroll();
        }
        return;
    }
    scrollingListCount++;
    if (!isRecording || activeScroll || !hasRoom()) {
        return;
    }
    activeScroll = {id: nextID++, label: CONST.TELEMETRY.FRAME_DROPS.INTERACTION_SCROLL, start: performance.now()};
    interactions.push(activeScroll);
}

/** Whether the user is interacting right now, so native queries (which hop to the UI thread on iOS) can wait. */
function isInteractionActive(time: number): boolean {
    return !!activeScroll || interactions.some((interaction) => interaction.end !== undefined && interaction.end > time);
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

/** Starts a user flow, e.g. a root telemetry span. Returns an id to pass to endFlow, or undefined when not recording or the name isn't static. */
function startFlow(name: string): number | undefined {
    if (!isRecording || !hasRoom() || !isStaticFlowName(name)) {
        return undefined;
    }
    const id = nextID++;
    flows.push({id, name: truncate(name), start: performance.now()});
    return id;
}

function endFlow(id: number | undefined) {
    if (id === undefined) {
        return;
    }
    const flow = flows.find((entry) => entry.id === id);
    if (flow && flow.end === undefined) {
        flow.end = performance.now();
    }
}

function keepWhere<T>(list: T[], predicate: (item: T) => boolean) {
    list.splice(0, list.length, ...list.filter(predicate));
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
    const isKept = (interval: Interaction | Operation) => (interval.end === undefined ? interval.start >= staleStart : interval.end > time);
    keepWhere(interactions, isKept);
    keepWhere(operations, isKept);
    keepWhere(flows, isKept);
    if (activeScroll && !interactions.includes(activeScroll)) {
        activeScroll = undefined;
        scrollingListCount = 0;
    }
}

/** Ends the open scroll and stops recording, e.g. when the app leaves the foreground. */
function pauseRecording() {
    endScroll();
    isRecording = false;
}

function clear() {
    screens.length = 0;
    interactions.length = 0;
    operations.length = 0;
    flows.length = 0;
    activeScroll = undefined;
    scrollingListCount = 0;
    currentScreen = undefined;
}

function getTimeline(): Timeline {
    return {screens, interactions, operations, flows};
}

export {clear, endFlow, endOperation, getTimeline, isInteractionActive, pauseRecording, pruneBefore, recordPress, recordScreen, recordScroll, setRecording, startFlow, startOperation};
