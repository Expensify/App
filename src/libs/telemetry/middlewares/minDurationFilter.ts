import CONST from '@src/CONST';
import type {TelemetryBeforeSend} from './index';

const minDurationFilter: TelemetryBeforeSend = (event) => {
    // Check if the transaction (event) itself has a min_duration requirement
    const eventMinDuration = event.contexts?.trace?.data?.[CONST.TELEMETRY.ATTRIBUTE_MIN_DURATION] as number;
    if (eventMinDuration && !Number.isNaN(eventMinDuration)) {
        if (event.timestamp && event.start_timestamp) {
            const eventDuration = (event.timestamp - event.start_timestamp) * 1000;
            if (eventDuration < eventMinDuration) {
                return null; // Drop the entire event
            }
        }
    }

    if (!event.spans) {
        return event;
    }

    // Check if transaction's spans have a min_duration requirement
    const spans = event.spans.filter((span) => {
        const minDuration = span.data?.[CONST.TELEMETRY.ATTRIBUTE_MIN_DURATION];
        if (!minDuration || typeof minDuration !== 'number' || Number.isNaN(minDuration)) {
            return true;
        }
        if (!span.timestamp) {
            return true;
        }

        const duration = (span.timestamp - span.start_timestamp) * 1000;

        return duration >= minDuration;
    });
    return {...event, spans};
};

export default minDurationFilter;
