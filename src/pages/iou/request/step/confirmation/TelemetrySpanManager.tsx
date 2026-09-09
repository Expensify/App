import {cancelSpan, endSpan, endSpanWithAttributes, getSpan, startSpan} from '@libs/telemetry/activeSpans';

import CONST from '@src/CONST';
import type {IOURequestType, IOUType} from '@src/CONST';

import type {Span} from '@sentry/core';

import {useEffect, useRef} from 'react';

type TelemetrySpanManagerProps = {
    iouType: IOUType;

    /** Request type of the transaction being confirmed (scan, manual, distance, ...) */
    requestType: IOURequestType;

    /** Whether the transaction has a receipt. Without one, the receipt-load span could never end. */
    hasReceipt: boolean;
};

/**
 * Side-effect-only component that manages telemetry spans for the confirmation step.
 * On mount: ends the open/mount spans, starts list-ready and receipt-load spans.
 * On unmount: cancels any still-open child spans.
 */
function TelemetrySpanManager({iouType, requestType, hasReceipt}: TelemetrySpanManagerProps) {
    // Parent of the receipt-load span. Kept in a ref because that span can only start once the
    // transaction has hydrated, which may happen after this mount effect already ended the parent.
    // Sentry preserves parent_span_id on an already-ended parent.
    const receiptLoadParentSpanRef = useRef<Span | undefined>(undefined);
    const hasStartedReceiptLoadSpanRef = useRef(false);

    useEffect(() => {
        endSpan(CONST.TELEMETRY.SPAN_OPEN_CREATE_EXPENSE);
        endSpanWithAttributes(CONST.TELEMETRY.SPAN_CONFIRMATION_MOUNT, {
            [CONST.TELEMETRY.ATTRIBUTE_IOU_TYPE]: iouType,
            [CONST.TELEMETRY.ATTRIBUTE_IOU_REQUEST_TYPE]: requestType,
        });

        // Grab parent ref before ending it — children need it for parent_span_id linking
        const parentSpan = getSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION) ?? getSpan(CONST.TELEMETRY.SPAN_ODOMETER_TO_CONFIRMATION);
        receiptLoadParentSpanRef.current = parentSpan;

        startSpan(CONST.TELEMETRY.SPAN_CONFIRMATION_LIST_READY, {
            name: CONST.TELEMETRY.SPAN_CONFIRMATION_LIST_READY,
            op: CONST.TELEMETRY.SPAN_CONFIRMATION_LIST_READY,
            parentSpan,
            attributes: {[CONST.TELEMETRY.ATTRIBUTE_IOU_TYPE]: iouType},
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

    useEffect(() => {
        if (!hasReceipt || hasStartedReceiptLoadSpanRef.current) {
            return;
        }
        hasStartedReceiptLoadSpanRef.current = true;
        startSpan(CONST.TELEMETRY.SPAN_CONFIRMATION_RECEIPT_LOAD, {
            name: CONST.TELEMETRY.SPAN_CONFIRMATION_RECEIPT_LOAD,
            op: CONST.TELEMETRY.SPAN_CONFIRMATION_RECEIPT_LOAD,
            parentSpan: receiptLoadParentSpanRef.current,
            attributes: {[CONST.TELEMETRY.ATTRIBUTE_IOU_TYPE]: iouType, [CONST.TELEMETRY.ATTRIBUTE_IOU_REQUEST_TYPE]: requestType},
        });
    }, [hasReceipt, iouType, requestType]);

    return null;
}

TelemetrySpanManager.displayName = 'TelemetrySpanManager';

export default TelemetrySpanManager;
