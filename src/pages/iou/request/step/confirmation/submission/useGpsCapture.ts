import useOnyx from '@hooks/useOnyx';

import getCurrentPosition from '@libs/getCurrentPosition';
import Log from '@libs/Log';
import {endSpan, getSpan, startSpan} from '@libs/telemetry/activeSpans';
import markSubmitExpenseEnd from '@libs/telemetry/markSubmitExpenseEnd';

import type {GPSPoint as GpsPoint} from '@userActions/IOU/types/TrackExpenseTransactionParams';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function getCurrentPositionWithGeolocationSpan(onPosition: (gpsCoords?: {lat: number; long: number}) => void) {
    const parentSpan = getSpan(CONST.TELEMETRY.SPAN_SUBMIT_EXPENSE);
    markSubmitExpenseEnd();

    startSpan(CONST.TELEMETRY.SPAN_GEOLOCATION_WAIT, {
        name: CONST.TELEMETRY.SPAN_GEOLOCATION_WAIT,
        op: CONST.TELEMETRY.SPAN_GEOLOCATION_WAIT,
        parentSpan,
    });

    getCurrentPosition(
        (successData) => {
            onPosition({lat: successData.coords.latitude, long: successData.coords.longitude});
            endSpan(CONST.TELEMETRY.SPAN_GEOLOCATION_WAIT);
        },
        (errorData) => {
            Log.info('[useGpsCapture] getCurrentPosition failed', false, errorData);
            onPosition();
            endSpan(CONST.TELEMETRY.SPAN_GEOLOCATION_WAIT);
        },
    );
}

type SubmitWithGpsPointParams = {
    /** Whether this submission needs a GPS point. Each caller derives it from its own guard. */
    shouldCaptureGpsPoint: boolean;
    shouldHandleNavigation: boolean;
    write: (shouldHandleNavigation: boolean, gpsPoint?: GpsPoint) => void;
};

function useGpsCapture() {
    const [userLocation] = useOnyx(ONYXKEYS.USER_LOCATION);

    function submitWithGpsPoint({shouldCaptureGpsPoint, shouldHandleNavigation, write}: SubmitWithGpsPointParams) {
        if (!shouldCaptureGpsPoint) {
            write(shouldHandleNavigation);
            markSubmitExpenseEnd();
            return;
        }
        if (userLocation) {
            write(shouldHandleNavigation, {lat: userLocation.latitude, long: userLocation.longitude});
            markSubmitExpenseEnd();
            return;
        }
        // No markSubmitExpenseEnd() here - getCurrentPositionWithGeolocationSpan ends the span itself before
        // opening the geolocation one, and the write runs in its callback.
        getCurrentPositionWithGeolocationSpan((gpsCoords) => write(shouldHandleNavigation, gpsCoords));
    }

    return {submitWithGpsPoint};
}

export default useGpsCapture;
