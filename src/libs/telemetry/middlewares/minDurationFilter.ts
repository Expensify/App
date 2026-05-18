import CONST from '@src/CONST';
import type {TelemetryBeforeSend} from './index';

function getValidMinDuration(value: unknown): number | undefined {
    if (typeof value === 'number' && !Number.isNaN(value)) {
        return value;
    }

    if (typeof value === 'string') {
        const parsed = Number(value);
        if (Number.isNaN(parsed)) {
            return undefined;
        }

        return parsed;
    }

    return undefined;
}

function calculateDuration(startTimestamp: number, endTimestamp: number): number {
    return (endTimestamp - startTimestamp) * 1000;
}

const minDurationFilter: TelemetryBeforeSend = (event) => {
    // Check if the transaction (event) itself has a min_duration requirement
    const eventMinDuration = getValidMinDuration(event.contexts?.trace?.data?.[CONST.TELEMETRY.ATTRIBUTE_MIN_DURATION]);

    if (eventMinDuration !== undefined) {
        if (!event.timestamp || !event.start_timestamp) {
            return event;
        }

        const eventDuration = calculateDuration(event.start_timestamp, event.timestamp);

        // if the main transaction (event) has min_duration requirements, it means that this is a root span, and we should filter it out if it's too short
        if (eventDuration < eventMinDuration) {
            return null;
        }
    }

    if (!event.spans) {
        return event;
    }

    // Filter spans based on their individual min_duration requirements
    const spans = event.spans.filter((span) => {
        const minDuration = getValidMinDuration(span.data?.[CONST.TELEMETRY.ATTRIBUTE_MIN_DURATION]);

        if (minDuration === undefined) {
            return true;
        }

        if (!span.timestamp) {
            return true;
        }

        const duration = calculateDuration(span.start_timestamp, span.timestamp);

        return duration >= minDuration;
    });

    return {...event, spans};
};

export default minDurationFilter;
