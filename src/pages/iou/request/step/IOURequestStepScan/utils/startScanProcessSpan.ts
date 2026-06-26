import {getSpan, startSpan} from '@libs/telemetry/activeSpans';
import CONST from '@src/CONST';

/**
 * Starts the scan-process-and-navigate telemetry span as a child of the shutter-to-confirmation span.
 */
function startScanProcessSpan(isMultiScanEnabled: boolean) {
    startSpan(CONST.TELEMETRY.SPAN_SCAN_PROCESS_AND_NAVIGATE, {
        name: CONST.TELEMETRY.SPAN_SCAN_PROCESS_AND_NAVIGATE,
        op: CONST.TELEMETRY.SPAN_SCAN_PROCESS_AND_NAVIGATE,
        parentSpan: getSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION),
        attributes: {[CONST.TELEMETRY.ATTRIBUTE_IS_MULTI_SCAN]: isMultiScanEnabled},
    });
}

export default startScanProcessSpan;
