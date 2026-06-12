import CONST from '@src/CONST';
import type {TelemetryBeforeSend} from './index';

const MAX_SPAN_DURATION_MS = 60_000;

const maxDurationFilter: TelemetryBeforeSend = (event) => {
    const op = event.contexts?.trace?.op;
    if (op !== CONST.TELEMETRY.SPAN_SUBMIT_TO_DESTINATION_VISIBLE) {
        return event;
    }

    if (!event.timestamp || !event.start_timestamp) {
        return event;
    }

    const durationMs = (event.timestamp - event.start_timestamp) * 1000;
    if (durationMs > MAX_SPAN_DURATION_MS) {
        return null;
    }

    return event;
};

export default maxDurationFilter;
