import CONST from '@src/CONST';

import {Platform} from 'react-native';

import {getSpan, startSpan} from './activeSpans';

/** Names the camera button as where the scan started, whether it floats over the content or sits in the vertical bar. */
const CAMERA_BUTTON_SOURCE = 'camera_fab';

/**
 * Starts the spans that time the way from a press on the camera button to a camera that is ready. The camera screen ends
 * them, so a camera button that opens the scan without starting them leaves its presses out of that measurement.
 */
function startCameraButtonScanSpans(reportID: string) {
    startSpan(CONST.TELEMETRY.SPAN_ENTRY_TO_SCAN, {
        name: CONST.TELEMETRY.SPAN_ENTRY_TO_SCAN,
        op: CONST.TELEMETRY.SPAN_ENTRY_TO_SCAN,
        attributes: {
            [CONST.TELEMETRY.ATTRIBUTE_REPORT_ID]: reportID,
            [CONST.TELEMETRY.ATTRIBUTE_PLATFORM]: Platform.OS,
            [CONST.TELEMETRY.ATTRIBUTE_SOURCE]: CAMERA_BUTTON_SOURCE,
        },
    });
    startSpan(CONST.TELEMETRY.SPAN_ENTRY_TO_SCAN_NAVIGATION, {
        name: CONST.TELEMETRY.SPAN_ENTRY_TO_SCAN_NAVIGATION,
        op: CONST.TELEMETRY.SPAN_ENTRY_TO_SCAN_NAVIGATION,
        parentSpan: getSpan(CONST.TELEMETRY.SPAN_ENTRY_TO_SCAN),
    });
}

export default startCameraButtonScanSpans;
