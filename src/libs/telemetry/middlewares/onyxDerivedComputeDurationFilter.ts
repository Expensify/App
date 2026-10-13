import CONST from '@src/CONST';

import type {TelemetryBeforeSend} from './index';

const MIN_ONYX_DERIVED_COMPUTE_DURATION_MS = 16;

/**
 * Middleware that drops fast `OnyxDerivedCompute` child spans.
 * They are started with `onlyIfParent`, so they are always children of a startup or send-message span, and nothing is
 * ever parented to them, which means dropping one cannot orphan another span.
 */
const onyxDerivedComputeDurationFilter: TelemetryBeforeSend = (event) => {
    if (!event.spans) {
        return event;
    }

    const spans = event.spans.filter((span) => {
        if (span.op !== CONST.TELEMETRY.SPAN_ONYX_DERIVED_COMPUTE) {
            return true;
        }

        if (span.timestamp === undefined) {
            return true;
        }

        const durationMs = (span.timestamp - span.start_timestamp) * 1000;
        return durationMs >= MIN_ONYX_DERIVED_COMPUTE_DURATION_MS;
    });

    return {...event, spans};
};

export default onyxDerivedComputeDurationFilter;
export {MIN_ONYX_DERIVED_COMPUTE_DURATION_MS};
