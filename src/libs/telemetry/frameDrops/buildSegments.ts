import CONST from '@src/CONST';

import type {Interaction, Operation, ScreenChange, Segment} from './types';

type Interval = {start: number; end?: number};

/** Returns the latest-started interval that is active at `time`, i.e. the most specific thing going on. */
function findActive<T extends Interval>(intervals: T[], time: number): T | undefined {
    let active: T | undefined;
    for (const interval of intervals) {
        if (interval.start > time || (interval.end !== undefined && interval.end <= time)) {
            continue;
        }
        if (!active || interval.start >= active.start) {
            active = interval;
        }
    }
    return active;
}

/** `screens` must be sorted by time. */
function findScreen(screens: ScreenChange[], time: number): string {
    let screen: string = CONST.TELEMETRY.FRAME_DROPS.NONE;
    for (const change of screens) {
        if (change.time > time) {
            break;
        }
        screen = change.screen;
    }
    return screen;
}

/**
 * Splits [windowStart, windowEnd) into segments during which the screen, interaction and operation didn't change.
 * Adjacent segments with the same context are merged, so a window without context changes is a single segment.
 */
function buildSegments(windowStart: number, windowEnd: number, screens: ScreenChange[], interactions: Interaction[], operations: Operation[]): Segment[] {
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
    for (const interval of [...interactions, ...operations]) {
        addBoundary(interval.start);
        addBoundary(interval.end);
    }

    const sortedBoundaries = [...boundaries].sort((a, b) => a - b);
    const segments: Segment[] = [];
    for (let i = 0; i < sortedBoundaries.length - 1; i++) {
        const start = sortedBoundaries.at(i) ?? windowStart;
        const end = sortedBoundaries.at(i + 1) ?? windowEnd;
        const screen = findScreen(screens, start);
        const activeInteraction = findActive(interactions, start);
        const interaction = activeInteraction?.label ?? CONST.TELEMETRY.FRAME_DROPS.NONE;
        const interactionID = activeInteraction?.id;
        const operation = findActive(operations, start)?.name ?? CONST.TELEMETRY.FRAME_DROPS.NONE;

        const previous = segments.at(-1);
        if (previous && previous.screen === screen && previous.interaction === interaction && previous.operation === operation && previous.interactionID === interactionID) {
            previous.end = end;
            continue;
        }
        segments.push({start, end, screen, interaction, operation, interactionID});
    }
    return segments;
}

export default buildSegments;
