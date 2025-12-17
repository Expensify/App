import CONST from '@src/CONST';
import type {TelemetryBeforeSend} from './index';

const minDurationFilter: TelemetryBeforeSend = (event) => {
    if (!event.spans) {
        return event;
    }

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
