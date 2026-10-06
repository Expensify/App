import CONST from '@src/CONST';

import type {Segment, Timeline} from './types';

type Interval = {start: number; end?: number};

/**
 * Tracks which intervals are active while boundaries are visited in increasing order, so each interval is added once
 * instead of scanning every interval again at every boundary.
 */
function createActiveIntervalTracker<T extends Interval>(intervals: T[]) {
    const byStart = [...intervals].sort((a, b) => a.start - b.start);
    let nextIndex = 0;
    let active: T[] = [];

    /** Returns the latest-started interval active at `time`, i.e. the most specific thing going on. */
    return (time: number): T | undefined => {
        let next = byStart.at(nextIndex);
        while (next && next.start <= time) {
            active.push(next);
            nextIndex++;
            next = byStart.at(nextIndex);
        }
        active = active.filter((interval) => interval.end === undefined || interval.end > time);
        // `active` is in start order, so the last one started latest.
        return active.at(-1);
    };
}

/**
 * Splits [windowStart, windowEnd) into segments during which the screen, interaction and operation didn't change.
 * Adjacent segments with the same context are merged, so a window without context changes is a single segment.
 * `screens` must be sorted by time.
 */
function buildSegments(windowStart: number, windowEnd: number, {screens, interactions, operations, flows, modals}: Timeline): Segment[] {
    if (windowEnd <= windowStart) {
        return [];
    }

    const boundaries = new Set<number>([windowStart, windowEnd]);
    const addBoundary = (time: number | undefined) => {
        if (time === undefined || time <= windowStart || time >= windowEnd) {
            return;
        }
        boundaries.add(time);
    };
    for (const change of screens) {
        addBoundary(change.time);
    }
    for (const interval of [...interactions, ...operations, ...flows, ...modals]) {
        addBoundary(interval.start);
        addBoundary(interval.end);
    }

    const sortedBoundaries = [...boundaries].sort((a, b) => a - b);
    const findInteraction = createActiveIntervalTracker(interactions);
    const findOperation = createActiveIntervalTracker(operations);
    const findFlow = createActiveIntervalTracker(flows);
    const findModal = createActiveIntervalTracker(modals);
    let screenIndex = -1;
    const segments: Segment[] = [];
    for (let i = 0; i < sortedBoundaries.length - 1; i++) {
        const start = sortedBoundaries.at(i) ?? windowStart;
        const end = sortedBoundaries.at(i + 1) ?? windowEnd;
        let nextScreen = screens.at(screenIndex + 1);
        while (nextScreen && nextScreen.time <= start) {
            screenIndex++;
            nextScreen = screens.at(screenIndex + 1);
        }
        const baseScreen = screens.at(screenIndex)?.screen ?? CONST.TELEMETRY.FRAME_DROPS.NONE;
        const modal = findModal(start);
        // A shown modal counts as a separate screen, named after the screen it covers so it is still known where it opened.
        const screen = modal ? `${baseScreen}/${modal.name}` : baseScreen;
        const activeInteraction = findInteraction(start);
        const interaction = activeInteraction?.label ?? CONST.TELEMETRY.FRAME_DROPS.NONE;
        const interactionID = activeInteraction?.id;
        const operation = findOperation(start)?.name ?? CONST.TELEMETRY.FRAME_DROPS.NONE;
        const flow = findFlow(start)?.name ?? CONST.TELEMETRY.FRAME_DROPS.NONE;

        const previous = segments.at(-1);
        if (
            previous &&
            previous.screen === screen &&
            previous.interaction === interaction &&
            previous.operation === operation &&
            previous.flow === flow &&
            previous.interactionID === interactionID
        ) {
            previous.end = end;
            continue;
        }
        segments.push({start, end, screen, interaction, operation, flow, interactionID});
    }
    return segments;
}

export default buildSegments;
