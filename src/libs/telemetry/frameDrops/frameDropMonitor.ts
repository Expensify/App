import CONST from '@src/CONST';

import type {NativeEventSubscription} from 'react-native';

import * as Sentry from '@sentry/react-native';
import {AppState, DeviceEventEmitter} from 'react-native';

import type {FrameDropContext, LongTask, Segment} from './types';

import buildSegments from './buildSegments';
import fetchFramesDelay, {isFramesDelayAvailable} from './fetchFramesDelay';
import {getTimeline, isInteractionActive, pauseRecording, pruneBefore, recordScroll, setRecording} from './frameDropTimeline';

/**
 * Attributes frame drops to what the app was doing when they happened, and reports the totals to Sentry as metrics.
 *
 * Built so it can't slow the app down:
 * - No frame observer of its own: frame delay comes from the store Sentry's native SDKs already keep.
 * - Nothing per frame on the JS thread: the timeline only records transitions (see frameDropTimeline).
 * - Few native queries, never while the user scrolls or presses: one per flush when nothing dropped (the common case),
 *   and a binary search over the segments when something did, so a single drop among N segments costs about log2(N).
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

type InteractionCount = {
    screen: string;
    interaction: string;
    count: number;
};

const UNATTRIBUTED_CONTEXT: FrameDropContext = {
    screen: CONST.TELEMETRY.FRAME_DROPS.UNATTRIBUTED,
    interaction: CONST.TELEMETRY.FRAME_DROPS.UNATTRIBUTED,
    operation: CONST.TELEMETRY.FRAME_DROPS.UNATTRIBUTED,
};

const OVERFLOW_CONTEXT: FrameDropContext = {
    screen: CONST.TELEMETRY.FRAME_DROPS.OVERFLOW,
    interaction: CONST.TELEMETRY.FRAME_DROPS.OVERFLOW,
    operation: CONST.TELEMETRY.FRAME_DROPS.OVERFLOW,
};

const aggregates = new Map<string, Aggregate>();
const interactionDelays = new Map<number, InteractionDelay>();
const interactionCounts = new Map<string, InteractionCount>();
let longTasks: LongTask[] = [];

let isStarted = false;
let windowStart: number | undefined;
let lastReportTime = 0;
let unmeasuredFlushCount = 0;
// Flushes run one after another, so a flush requested while another is waiting for native data is queued, not dropped.
let flushQueue: Promise<void> = Promise.resolve();
let flushIntervalID: ReturnType<typeof setInterval> | undefined;
let appStateSubscription: NativeEventSubscription | undefined;
let scrollSubscription: {remove: () => void} | undefined;
let longTaskObserver: PerformanceObserver | undefined;

function getContextKey(context: FrameDropContext): string {
    return `${context.screen}|${context.interaction}|${context.operation}`;
}

/** Aggregates are capped per report period, so a busy period can't turn into a burst of metric calls. */
function getAggregate(context: FrameDropContext): Aggregate {
    const key = getContextKey(context);
    const existing = aggregates.get(key);
    if (existing) {
        return existing;
    }
    const isFull = aggregates.size >= CONST.TELEMETRY.FRAME_DROPS.MAX_AGGREGATES;
    const target = isFull ? OVERFLOW_CONTEXT : context;
    const targetKey = getContextKey(target);
    const aggregate = aggregates.get(targetKey) ?? {
        screen: target.screen,
        interaction: target.interaction,
        operation: target.operation,
        activeTimeMs: 0,
        frameDelayMs: 0,
        longTaskTimeMs: 0,
        longTaskCount: 0,
    };
    aggregates.set(targetKey, aggregate);
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

/**
 * A long task goes to the segment it overlaps most. Its start isn't enough: a press handler or an API response
 * handler records its transition from inside the very task it makes long, so by start time the task would land in
 * the context before the one that caused it.
 */
function findLongTaskSegment(segments: Segment[], task: LongTask): Segment | undefined {
    const taskEnd = task.start + task.duration;
    let best: Segment | undefined;
    let bestOverlap = -1;
    for (const segment of segments) {
        if (segment.start >= taskEnd) {
            break;
        }
        const overlap = Math.min(segment.end, taskEnd) - Math.max(segment.start, task.start);
        if (overlap > bestOverlap) {
            best = segment;
            bestOverlap = overlap;
        }
    }
    return best;
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

function reportEndedInteractions(endedInteractionIDs: Set<number>) {
    for (const interactionID of endedInteractionIDs) {
        const interactionDelay = interactionDelays.get(interactionID);
        interactionDelays.delete(interactionID);
        if (!interactionDelay?.isMeasured) {
            continue;
        }
        const countKey = `${interactionDelay.screen}|${interactionDelay.label}`;
        const interactionCount = interactionCounts.get(countKey) ?? {screen: interactionDelay.screen, interaction: interactionDelay.label, count: 0};
        interactionCount.count++;
        interactionCounts.set(countKey, interactionCount);

        // Only janky interactions are sent one by one; interaction counts give the share of them (see report()).
        const delayMs = Math.round(interactionDelay.delayMs);
        if (delayMs <= 0) {
            continue;
        }
        Sentry.metrics.distribution(CONST.TELEMETRY.FRAME_DROPS.METRIC_INTERACTION_FRAME_DELAY, delayMs, {
            unit: 'millisecond',
            attributes: {
                [CONST.TELEMETRY.FRAME_DROPS.ATTRIBUTE_SCREEN]: interactionDelay.screen,
                [CONST.TELEMETRY.FRAME_DROPS.ATTRIBUTE_INTERACTION]: interactionDelay.label,
            },
        });
    }
}

function stopMonitoring() {
    if (flushIntervalID) {
        clearInterval(flushIntervalID);
        flushIntervalID = undefined;
    }
    appStateSubscription?.remove();
    scrollSubscription?.remove();
    longTaskObserver?.disconnect();
    appStateSubscription = undefined;
    scrollSubscription = undefined;
    longTaskObserver = undefined;
    pauseRecording();
    windowStart = undefined;
}

/** Matches the timeline of [start, end) against the native frame delay store. */
async function flushWindow(start: number, end: number) {
    const {screens, interactions, operations} = getTimeline();
    const segments = buildSegments(start, end, screens, interactions, operations);
    const endedInteractionIDs = new Set(interactions.filter((interaction) => interaction.end !== undefined && interaction.end <= end).map((interaction) => interaction.id));
    const windowLongTasks = takeLongTasks(start, end);
    pruneBefore(end);
    const remainingInteractionIDs = new Set(interactions.map((interaction) => interaction.id));
    // An interaction pruned without ending (e.g. a scroll whose end event was lost) is never reported.
    for (const interactionID of interactionDelays.keys()) {
        if (!endedInteractionIDs.has(interactionID) && !remainingInteractionIDs.has(interactionID)) {
            interactionDelays.delete(interactionID);
        }
    }

    try {
        const toUnixSeconds = createUnixSecondsConverter();
        const totalDelaySeconds = await fetchFramesDelay(toUnixSeconds(start), toUnixSeconds(end));

        // The window isn't covered by the native store. Skipping it entirely keeps active time and delay consistent,
        // so the delay per active second isn't diluted by time we couldn't measure.
        if (totalDelaySeconds === undefined) {
            for (const segment of segments) {
                if (segment.interactionID !== undefined) {
                    getInteractionDelay(segment, segment.interactionID).isMeasured = false;
                }
            }
            unmeasuredFlushCount++;
            // Native frame tracking isn't running at all (e.g. native Sentry isn't initialized in development builds),
            // so there's nothing to attribute and the monitor turns itself off.
            if (unmeasuredFlushCount >= CONST.TELEMETRY.FRAME_DROPS.MAX_UNMEASURED_FLUSHES) {
                stopMonitoring();
            }
            return;
        }
        unmeasuredFlushCount = 0;

        const {delays, queryCount} = await splitDelay(segments, totalDelaySeconds, toUnixSeconds, CONST.TELEMETRY.FRAME_DROPS.MAX_QUERIES_PER_FLUSH);
        console.debug('[FrameDrops] Flushed window', {
            windowMs: Math.round(end - start),
            segments: segments.length,
            frameDelayMs: Math.round(totalDelaySeconds * 1000),
            nativeQueries: 1 + queryCount,
            longTasks: windowLongTasks.length,
        });

        let attributedDelaySeconds = 0;
        for (const [index, segment] of segments.entries()) {
            const delaySeconds = delays.at(index);
            // Segments whose delay couldn't be resolved within the query budget give both their time and their delay to
            // "unattributed", so the contexts they belong to don't look healthier than they were.
            const aggregate = getAggregate(delaySeconds === undefined ? UNATTRIBUTED_CONTEXT : segment);
            aggregate.activeTimeMs += segment.end - segment.start;
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

        const unattributedDelaySeconds = totalDelaySeconds - attributedDelaySeconds;
        if (unattributedDelaySeconds > 0.001) {
            getAggregate(UNATTRIBUTED_CONTEXT).frameDelayMs += unattributedDelaySeconds * 1000;
        }

        for (const task of windowLongTasks) {
            const segment = findLongTaskSegment(segments, task);
            if (!segment) {
                continue;
            }
            const aggregate = getAggregate(segment);
            aggregate.longTaskCount++;
            aggregate.longTaskTimeMs += task.duration;
        }
    } finally {
        reportEndedInteractions(endedInteractionIDs);
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
    for (const interactionCount of interactionCounts.values()) {
        Sentry.metrics.count(CONST.TELEMETRY.FRAME_DROPS.METRIC_INTERACTION_COUNT, interactionCount.count, {
            attributes: {
                [CONST.TELEMETRY.FRAME_DROPS.ATTRIBUTE_SCREEN]: interactionCount.screen,
                [CONST.TELEMETRY.FRAME_DROPS.ATTRIBUTE_INTERACTION]: interactionCount.interaction,
            },
        });
    }
    aggregates.clear();
    interactionCounts.clear();
}

/** Closes the current window at `windowEnd` and queues its flush, followed by a report when asked for. */
function enqueueFlush(windowEnd: number, shouldReport: boolean): Promise<void> {
    if (windowStart !== undefined && windowEnd > windowStart) {
        const start = windowStart;
        windowStart = windowEnd;
        flushQueue = flushQueue.then(() => flushWindow(start, windowEnd));
    }
    if (shouldReport) {
        flushQueue = flushQueue.then(report);
    }
    // A failed flush must not block the ones queued after it.
    flushQueue = flushQueue.catch(() => {});
    return flushQueue;
}

function scheduleFlush() {
    const run = () => {
        const now = performance.now();
        // On iOS every native query runs on the UI thread, so queries wait until the user isn't scrolling or pressing.
        // The native store keeps delayed frames for minutes, so a deferred window is still fully measurable.
        if (windowStart !== undefined && isInteractionActive(now) && now - windowStart < CONST.TELEMETRY.FRAME_DROPS.MAX_FLUSH_DEFER_MS) {
            return;
        }
        enqueueFlush(now - CONST.TELEMETRY.FRAME_DROPS.SETTLE_MS, now - lastReportTime >= CONST.TELEMETRY.FRAME_DROPS.REPORT_INTERVAL_MS);
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
    if (!lastReportTime) {
        lastReportTime = windowStart;
    }
    setRecording(true);
    if (!flushIntervalID) {
        flushIntervalID = setInterval(scheduleFlush, CONST.TELEMETRY.FRAME_DROPS.FLUSH_INTERVAL_MS);
    }
}

/**
 * Stops measuring while the app isn't active. Aggregates are only sent when it goes to the background, so short
 * interruptions (a permission prompt, the notification center) don't cause extra reports.
 */
function pause(shouldReport: boolean) {
    if (flushIntervalID) {
        clearInterval(flushIntervalID);
        flushIntervalID = undefined;
    }
    pauseRecording();
    enqueueFlush(performance.now(), shouldReport);
    windowStart = undefined;
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
    if (isStarted || !isFramesDelayAvailable()) {
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
        pause(state === CONST.APP_STATE.BACKGROUND);
    });
    if ((AppState.currentState ?? CONST.APP_STATE.ACTIVE) === CONST.APP_STATE.ACTIVE) {
        resume();
    }
}

/** Waits for the queued flushes to finish. Only used by tests. */
function flush(windowEnd: number): Promise<void> {
    return enqueueFlush(windowEnd, false);
}

/** Only used by tests. */
function stopFrameDropMonitor() {
    stopMonitoring();
    aggregates.clear();
    interactionDelays.clear();
    interactionCounts.clear();
    longTasks = [];
    lastReportTime = 0;
    unmeasuredFlushCount = 0;
    flushQueue = Promise.resolve();
    isStarted = false;
}

export {flush, report, scheduleFlush, startFrameDropMonitor, stopFrameDropMonitor};
