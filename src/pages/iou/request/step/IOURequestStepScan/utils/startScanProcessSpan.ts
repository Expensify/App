import {getSpan, startSpan} from '@libs/telemetry/activeSpans';
import CONST from '@src/CONST';

function startScanProcessSpan(isMultiScan = false) {
    startSpan(CONST.TELEMETRY.SPAN_SCAN_PROCESS_AND_NAVIGATE, {
        name: CONST.TELEMETRY.SPAN_SCAN_PROCESS_AND_NAVIGATE,
        op: CONST.TELEMETRY.SPAN_SCAN_PROCESS_AND_NAVIGATE,
        parentSpan: getSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION),
        attributes: {[CONST.TELEMETRY.ATTRIBUTE_IS_MULTI_SCAN]: isMultiScan},
    });
}

export default startScanProcessSpan;
