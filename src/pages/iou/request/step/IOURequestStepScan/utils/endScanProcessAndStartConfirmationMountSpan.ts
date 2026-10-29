import {endSpan, getSpan, startSpan} from '@libs/telemetry/activeSpans';

import CONST from '@src/CONST';

/**
 * Hands the shutter to confirmation chain over from the navigate step to the mount step: ends the
 * scan-process span and starts the confirmation-mount span as a child of the same parent.
 *
 * `navigateToConfirmationPage` in IOUUtils already does this, but the global-create scan route calls
 * `Navigation.navigate` directly, so without this the mount segment goes unmeasured. It is the
 * single largest part of ManualShutterToConfirmation on that route.
 *
 * Call immediately before `Navigation.navigate`.
 */
function endScanProcessAndStartConfirmationMountSpan() {
    endSpan(CONST.TELEMETRY.SPAN_SCAN_PROCESS_AND_NAVIGATE);
    startSpan(CONST.TELEMETRY.SPAN_CONFIRMATION_MOUNT, {
        name: CONST.TELEMETRY.SPAN_CONFIRMATION_MOUNT,
        op: CONST.TELEMETRY.SPAN_CONFIRMATION_MOUNT,
        parentSpan: getSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION),
    });
}

export default endScanProcessAndStartConfirmationMountSpan;
