import CONST from '@src/CONST';
import type {TelemetryBeforeSend} from './index';

function isValidMinDuration(value: unknown): value is number {
    return typeof value === 'number' && !Number.isNaN(value);
}

function calculateDuration(startTimestamp: number, endTimestamp: number): number {
    return (endTimestamp - startTimestamp) * 1000;
}

const minDurationFilter: TelemetryBeforeSend = (event) => {
    console.log('morwa minDurationFilter');
    // Check if the transaction (event) itself has a min_duration requirement
    const eventMinDuration = event.contexts?.trace?.data?.[CONST.TELEMETRY.ATTRIBUTE_MIN_DURATION] as number | undefined;

    if (isValidMinDuration(eventMinDuration)) {
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
        const minDuration = span.data?.[CONST.TELEMETRY.ATTRIBUTE_MIN_DURATION];

        if (!isValidMinDuration(minDuration)) {
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
