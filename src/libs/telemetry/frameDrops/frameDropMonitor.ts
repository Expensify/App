import CONST from '@src/CONST';

import type {NativeEventSubscription} from 'react-native';

import * as Sentry from '@sentry/react-native';
import {AppState, DeviceEventEmitter} from 'react-native';

import type {FrameDropContext, LongTask, Segment} from './types';

import buildSegments from './buildSegments';
import fetchFramesDelay from './fetchFramesDelay';
import {getTimeline, pruneBefore, recordScroll, setRecording} from './frameDropTimeline';

/**
 * Attributes frame drops to what the app was doing when they happened, and reports the totals to Sentry as metrics.
 *
 * Built so it can't slow the app down:
 * - No frame observer of its own: frame delay comes from the store Sentry's native SDKs already keep.
 * - Nothing per frame on the JS thread: the timeline only records transitions (see frameDropTimeline).
 * - Few native queries: one per flush when nothing dropped (the common case), and a binary search over the segments
 *   when something did, so a single drop among N segments costs about log2(N) queries.
 * - JS thread blocking comes from React Native's `longtask` entries, which the runtime scheduler reports anyway.
 * - On-device aggregation: a handful of metrics every few minutes, not one event per frame.
 */

type Aggregate = FrameDropContext & {
    activeTimeMs: number;
    frameDelayMs: number;
    longTaskTimeMs: number;
    longTaskCount: number;
};

/** Frame delay of one press or scroll, summed over the flushes its window spans, sent once the window has ended. */
type InteractionDelay = {
    label: string;
    screen: string;
    delayMs: number;
    isMeasured: boolean;
};

const aggregates = new Map<string, Aggregate>();
const interactionDelays = new Map<number, InteractionDelay>();
let longTasks: LongTask[] = [];

let isStarted = false;
let windowStart: number | undefined;
let lastReportTime = 0;
let isFlushing = false;
let flushIntervalID: ReturnType<typeof setInterval> | undefined;
let appStateSubscription: NativeEventSubscription | undefined;
let scrollSubscription: {remove: () => void} | undefined;
let longTaskObserver: PerformanceObserver | undefined;

function getAggregate(context: FrameDropContext): Aggregate {
    const key = `${context.screen}|${context.interaction}|${context.operation}`;
    let aggregate = aggregates.get(key);
    if (!aggregate) {
        aggregate = {screen: context.screen, interaction: context.interaction, operation: context.operation, activeTimeMs: 0, frameDelayMs: 0, longTaskTimeMs: 0, longTaskCount: 0};
        aggregates.set(key, aggregate);
    }
    return aggregate;
}

function getInteractionDelay(segment: Segment, interactionID: number): InteractionDelay {
    let interactionDelay = interactionDelays.get(interactionID);
    if (!interactionDelay) {
        interactionDelay = {label: segment.interaction, screen: segment.screen, delayMs: 0, isMeasured: true};
        interactionDelays.set(interactionID, interactionDelay);
    }
    return interactionDelay;
}

/** Native frame delay is queried with Unix timestamps, the timeline uses performance.now(). One offset per flush keeps them aligned. */
function createUnixSecondsConverter(): (time: number) => number {
    const offset = Date.now() - performance.now();
    return (time) => (time + offset) / 1000;
}

/** Takes the long tasks of [from, before). Older ones happened outside any measured window (e.g. in the background) and are dropped. */
function takeLongTasks(from: number, before: number): LongTask[] {
    const taken = longTasks.filter((task) => task.start >= from && task.start < before);
    longTasks = longTasks.filter((task) => task.start >= before);
    return taken;
}

function findSegment(segments: Segment[], time: number): Segment | undefined {
    return segments.find((segment) => time < segment.end) ?? segments.at(-1);
}

/**
 * Splits `totalDelaySeconds`, the known delay of all segments, between the segments. Each step queries the left half and
 * derives the right half by subtraction, and halves without delay are not searched further, so a single drop among N
 * segments costs about log2(N) queries. Delay that can't be split within `maxQueries` stays undefined for its segments.
 */
async function splitDelay(
    segments: Segment[],
    totalDelaySeconds: number,
    toUnixSeconds: (time: number) => number,
    maxQueries: number,
): Promise<{delays: Array<number | undefined>; queryCount: number}> {
    let queryCount = 0;

    const split = async (from: number, to: number, delaySeconds: number): Promise<Array<number | undefined>> => {
        const count = to - from;
        if (delaySeconds <= 0) {
            return new Array<number | undefined>(count).fill(0);
        }
        if (count === 1) {
            return [delaySeconds];
        }
        const firstSegment = segments.at(from);
        const middle = Math.floor((from + to) / 2);
        const lastLeftSegment = segments.at(middle - 1);
        if (queryCount >= maxQueries || !firstSegment || !lastLeftSegment) {
            return new Array<number | undefined>(count).fill(undefined);
        }
        queryCount++;
        const leftDelaySeconds = await fetchFramesDelay(toUnixSeconds(firstSegment.start), toUnixSeconds(lastLeftSegment.end));
        if (leftDelaySeconds === undefined) {
            return new Array<number | undefined>(count).fill(undefined);
        }
        const clampedLeftDelaySeconds = Math.min(leftDelaySeconds, delaySeconds);
        const leftDelays = await split(from, middle, clampedLeftDelaySeconds);
        const rightDelays = await split(middle, to, delaySeconds - clampedLeftDelaySeconds);
        return [...leftDelays, ...rightDelays];
    };

    const delays = await split(0, segments.length, totalDelaySeconds);
    return {delays, queryCount};
}

/** Matches the timeline between the previous flush and `windowEnd` against the native frame delay store. */
async function flush(windowEnd: number) {
    if (isFlushing || windowStart === undefined || windowEnd <= windowStart) {
        return;
    }
    isFlushing = true;
    const start = windowStart;
    windowStart = windowEnd;

    const {screens, interactions, operations} = getTimeline();
    const segments = buildSegments(start, windowEnd, screens, interactions, operations);
    const endedInteractionIDs = interactions.filter((interaction) => interaction.end !== undefined && interaction.end <= windowEnd).map((interaction) => interaction.id);
    const windowLongTasks = takeLongTasks(start, windowEnd);
    pruneBefore(windowEnd);
    // An interaction pruned without ending (e.g. a scroll whose end event was lost) is never reported.
    for (const interactionID of interactionDelays.keys()) {
        if (!endedInteractionIDs.includes(interactionID) && !interactions.some((interaction) => interaction.id === interactionID)) {
            interactionDelays.delete(interactionID);
        }
    }

    try {
        const toUnixSeconds = createUnixSecondsConverter();
        const totalDelaySeconds = await fetchFramesDelay(toUnixSeconds(start), toUnixSeconds(windowEnd));

        // The window isn't covered by the native store (e.g. frame tracking isn't running yet). Skipping it entirely keeps
        // active time and delay consistent, so the delay per active second isn't diluted by time we couldn't measure.
        if (totalDelaySeconds === undefined) {
            for (const segment of segments) {
                if (segment.interactionID !== undefined) {
                    getInteractionDelay(segment, segment.interactionID).isMeasured = false;
                }
            }
            return;
        }

        const {delays, queryCount} = await splitDelay(segments, totalDelaySeconds, toUnixSeconds, CONST.TELEMETRY.FRAME_DROPS.MAX_QUERIES_PER_FLUSH);
        console.debug('[FrameDrops] Flushed window', {
            windowMs: Math.round(windowEnd - start),
            segments: segments.length,
            frameDelayMs: Math.round(totalDelaySeconds * 1000),
            nativeQueries: 1 + queryCount,
            longTasks: windowLongTasks.length,
        });

        let attributedDelaySeconds = 0;
        for (const [index, segment] of segments.entries()) {
            const aggregate = getAggregate(segment);
            aggregate.activeTimeMs += segment.end - segment.start;
            const delaySeconds = delays.at(index);
            if (delaySeconds !== undefined) {
                aggregate.frameDelayMs += delaySeconds * 1000;
                attributedDelaySeconds += delaySeconds;
            }
            if (segment.interactionID === undefined) {
                continue;
            }
            const interactionDelay = getInteractionDelay(segment, segment.interactionID);
            if (delaySeconds === undefined) {
                interactionDelay.isMeasured = false;
                continue;
            }
            interactionDelay.delayMs += delaySeconds * 1000;
        }

        // Only left over when the query budget ran out; it still counts towards the total.
        const unattributedDelaySeconds = totalDelaySeconds - attributedDelaySeconds;
        if (unattributedDelaySeconds > 0.001) {
            getAggregate({
                screen: CONST.TELEMETRY.FRAME_DROPS.UNATTRIBUTED,
                interaction: CONST.TELEMETRY.FRAME_DROPS.UNATTRIBUTED,
                operation: CONST.TELEMETRY.FRAME_DROPS.UNATTRIBUTED,
            }).frameDelayMs += unattributedDelaySeconds * 1000;
        }

        for (const task of windowLongTasks) {
            const segment = findSegment(segments, task.start);
            if (!segment) {
                continue;
            }
            const aggregate = getAggregate(segment);
            aggregate.longTaskCount++;
            aggregate.longTaskTimeMs += task.duration;
        }
    } finally {
        for (const interactionID of endedInteractionIDs) {
            const interactionDelay = interactionDelays.get(interactionID);
            interactionDelays.delete(interactionID);
            if (!interactionDelay?.isMeasured) {
                continue;
            }
            Sentry.metrics.distribution(CONST.TELEMETRY.FRAME_DROPS.METRIC_INTERACTION_FRAME_DELAY, Math.round(interactionDelay.delayMs), {
                unit: 'millisecond',
                attributes: {
                    [CONST.TELEMETRY.FRAME_DROPS.ATTRIBUTE_SCREEN]: interactionDelay.screen,
                    [CONST.TELEMETRY.FRAME_DROPS.ATTRIBUTE_INTERACTION]: interactionDelay.label,
                },
            });
        }
        isFlushing = false;
    }
}

/** Sends the aggregates as Sentry metrics. Summing them in Sentry gives total delay per context and delay per active second. */
function report() {
    lastReportTime = performance.now();
    console.debug('[FrameDrops] Reporting aggregates', [...aggregates.values()]);
    for (const aggregate of aggregates.values()) {
        const attributes = {
            [CONST.TELEMETRY.FRAME_DROPS.ATTRIBUTE_SCREEN]: aggregate.screen,
            [CONST.TELEMETRY.FRAME_DROPS.ATTRIBUTE_INTERACTION]: aggregate.interaction,
            [CONST.TELEMETRY.FRAME_DROPS.ATTRIBUTE_OPERATION]: aggregate.operation,
        };
        if (aggregate.activeTimeMs > 0) {
            Sentry.metrics.count(CONST.TELEMETRY.FRAME_DROPS.METRIC_ACTIVE_TIME, Math.round(aggregate.activeTimeMs), {unit: 'millisecond', attributes});
        }
        if (aggregate.frameDelayMs > 0) {
            Sentry.metrics.count(CONST.TELEMETRY.FRAME_DROPS.METRIC_FRAME_DELAY, Math.round(aggregate.frameDelayMs), {unit: 'millisecond', attributes});
        }
        if (aggregate.longTaskCount > 0) {
            Sentry.metrics.count(CONST.TELEMETRY.FRAME_DROPS.METRIC_LONG_TASK_COUNT, aggregate.longTaskCount, {attributes});
            Sentry.metrics.count(CONST.TELEMETRY.FRAME_DROPS.METRIC_LONG_TASK_TIME, Math.round(aggregate.longTaskTimeMs), {unit: 'millisecond', attributes});
        }
    }
    aggregates.clear();
}

function scheduleFlush() {
    const run = () => {
        flush(performance.now() - CONST.TELEMETRY.FRAME_DROPS.SETTLE_MS).then(() => {
            if (performance.now() - lastReportTime < CONST.TELEMETRY.FRAME_DROPS.REPORT_INTERVAL_MS) {
                return;
            }
            report();
        });
    };
    if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(run);
        return;
    }
    run();
}

function resume() {
    if (windowStart !== undefined) {
        return;
    }
    windowStart = performance.now();
    lastReportTime = windowStart;
    setRecording(true);
    if (!flushIntervalID) {
        flushIntervalID = setInterval(scheduleFlush, CONST.TELEMETRY.FRAME_DROPS.FLUSH_INTERVAL_MS);
    }
}

/** Frames aren't drawn in the background, so the window is closed and everything collected so far is sent. */
function pause() {
    if (flushIntervalID) {
        clearInterval(flushIntervalID);
        flushIntervalID = undefined;
    }
    recordScroll(false);
    setRecording(false);
    // flush() takes the window synchronously, so the window can be closed right away and a quick resume starts a fresh one.
    const pendingFlush = flush(performance.now());
    windowStart = undefined;
    pendingFlush.then(report);
}

function observeLongTasks() {
    if (typeof PerformanceObserver === 'undefined' || !PerformanceObserver.supportedEntryTypes?.includes('longtask')) {
        return;
    }
    longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (longTasks.length >= CONST.TELEMETRY.FRAME_DROPS.MAX_EVENTS) {
                return;
            }
            longTasks.push({start: entry.startTime, duration: entry.duration});
        }
    });
    longTaskObserver.observe({type: 'longtask'});
}

function startFrameDropMonitor() {
    if (isStarted) {
        return;
    }
    isStarted = true;
    try {
        observeLongTasks();
    } catch {
        // Long tasks are extra detail; frame delay attribution works without them.
    }
    scrollSubscription = DeviceEventEmitter.addListener(CONST.EVENTS.SCROLLING, recordScroll);
    appStateSubscription = AppState.addEventListener('change', (state) => {
        if (state === CONST.APP_STATE.ACTIVE) {
            resume();
            return;
        }
        if (windowStart === undefined) {
            return;
        }
        pause();
    });
    if ((AppState.currentState ?? CONST.APP_STATE.ACTIVE) === CONST.APP_STATE.ACTIVE) {
        resume();
    }
}

/** Only used by tests. */
function stopFrameDropMonitor() {
    if (flushIntervalID) {
        clearInterval(flushIntervalID);
        flushIntervalID = undefined;
    }
    appStateSubscription?.remove();
    scrollSubscription?.remove();
    longTaskObserver?.disconnect();
    setRecording(false);
    aggregates.clear();
    interactionDelays.clear();
    longTasks = [];
    windowStart = undefined;
    isFlushing = false;
    isStarted = false;
}

export {flush, report, startFrameDropMonitor, stopFrameDropMonitor};
