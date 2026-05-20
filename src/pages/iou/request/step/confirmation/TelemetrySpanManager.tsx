import {useEffect} from 'react';
import {cancelSpan, endSpan, getSpan, startSpan} from '@libs/telemetry/activeSpans';
import CONST from '@src/CONST';
import type {IOUType} from '@src/CONST';

type TelemetrySpanManagerProps = {
    iouType: IOUType;
};

/**
 * Side-effect-only component that manages telemetry spans for the confirmation step.
 * On mount: ends the open/mount spans, starts list-ready and receipt-load spans.
 * On unmount: cancels any still-open child spans.
 */
function TelemetrySpanManager({iouType}: TelemetrySpanManagerProps) {
    useEffect(() => {
        endSpan(CONST.TELEMETRY.SPAN_OPEN_CREATE_EXPENSE);
        endSpan(CONST.TELEMETRY.SPAN_CONFIRMATION_MOUNT);

        // Grab parent ref before ending it — children need it for parent_span_id linking
        const parentSpan = getSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION) ?? getSpan(CONST.TELEMETRY.SPAN_ODOMETER_TO_CONFIRMATION);

        startSpan(CONST.TELEMETRY.SPAN_CONFIRMATION_LIST_READY, {
            name: CONST.TELEMETRY.SPAN_CONFIRMATION_LIST_READY,
            op: CONST.TELEMETRY.SPAN_CONFIRMATION_LIST_READY,
            parentSpan,
            attributes: {[CONST.TELEMETRY.ATTRIBUTE_IOU_TYPE]: iouType},
        });
        startSpan(CONST.TELEMETRY.SPAN_CONFIRMATION_RECEIPT_LOAD, {
            name: CONST.TELEMETRY.SPAN_CONFIRMATION_RECEIPT_LOAD,
            op: CONST.TELEMETRY.SPAN_CONFIRMATION_RECEIPT_LOAD,
            parentSpan,
        });

        // End parent AFTER children are created — Sentry preserves parent_span_id regardless
        endSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION);
        endSpan(CONST.TELEMETRY.SPAN_ODOMETER_TO_CONFIRMATION);

        return () => {
            cancelSpan(CONST.TELEMETRY.SPAN_CONFIRMATION_LIST_READY);
            cancelSpan(CONST.TELEMETRY.SPAN_CONFIRMATION_RECEIPT_LOAD);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- we only want this to run on mount/unmount
    }, []);

    return null;
}

TelemetrySpanManager.displayName = 'TelemetrySpanManager';

export default TelemetrySpanManager;
