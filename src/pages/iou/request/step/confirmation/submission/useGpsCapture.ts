import useOnyx from '@hooks/useOnyx';

import type {WriteReadyBarrier} from '@libs/API';
import getCurrentPositionWithinCap from '@libs/getCurrentPosition/getCurrentPositionWithinCap';
import {endSpan, getSpan, startSpan} from '@libs/telemetry/activeSpans';
import markSubmitExpenseEnd from '@libs/telemetry/markSubmitExpenseEnd';

import type {GPSPoint as GpsPoint} from '@userActions/IOU/types/TrackExpenseTransactionParams';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function getCurrentPositionWithGeolocationSpan(onPosition: (gpsCoords?: {lat: number; long: number}) => void) {
    const parentSpan = getSpan(CONST.TELEMETRY.SPAN_SUBMIT_EXPENSE);
    parentSpan?.setAttribute(CONST.TELEMETRY.ATTRIBUTE_LOCATION_SOURCE, CONST.TELEMETRY.SUBMIT_EXPENSE_LOCATION_SOURCE.WAITED);
    markSubmitExpenseEnd();

    startSpan(CONST.TELEMETRY.SPAN_GEOLOCATION_WAIT, {
        name: CONST.TELEMETRY.SPAN_GEOLOCATION_WAIT,
        op: CONST.TELEMETRY.SPAN_GEOLOCATION_WAIT,
        parentSpan,
    });

    getCurrentPositionWithinCap((gpsCoords, source) => {
        getSpan(CONST.TELEMETRY.SPAN_GEOLOCATION_WAIT)?.setAttribute(CONST.TELEMETRY.ATTRIBUTE_LOCATION_SOURCE, source);
        onPosition(gpsCoords);
        endSpan(CONST.TELEMETRY.SPAN_GEOLOCATION_WAIT);
    });
}

type SubmitWithGpsPointParams = {
    shouldCaptureGpsPoint: boolean;
    shouldHandleNavigation: boolean;
    writeBarrier: WriteReadyBarrier | undefined;
    write: (shouldHandleNavigation: boolean, gpsPoint: GpsPoint | undefined, writeBarrier: WriteReadyBarrier | undefined) => void;
};

/** Hook that captures a GPS point (from cached user location or a live geolocation read) before running an expense write. `submitWithGpsPoint` returns true when the write is handed off to a live geolocation read. */
function useGpsCapture() {
    const [userLocation] = useOnyx(ONYXKEYS.USER_LOCATION);

    function submitWithGpsPoint({shouldCaptureGpsPoint, shouldHandleNavigation, writeBarrier, write}: SubmitWithGpsPointParams): boolean {
        if (!shouldCaptureGpsPoint) {
            write(shouldHandleNavigation, undefined, writeBarrier);
            markSubmitExpenseEnd();
            return false;
        }

        if (userLocation) {
            getSpan(CONST.TELEMETRY.SPAN_SUBMIT_EXPENSE)?.setAttribute(CONST.TELEMETRY.ATTRIBUTE_LOCATION_SOURCE, CONST.TELEMETRY.SUBMIT_EXPENSE_LOCATION_SOURCE.CACHED);
            write(shouldHandleNavigation, {lat: userLocation.latitude, long: userLocation.longitude}, writeBarrier);
            markSubmitExpenseEnd();
            return false;
        }

        // No markSubmitExpenseEnd() here - getCurrentPositionWithGeolocationSpan ends the span itself before
        // opening the geolocation one, and the write runs in its callback.
        getCurrentPositionWithGeolocationSpan((gpsCoords) => write(shouldHandleNavigation, gpsCoords, writeBarrier));
        return true;
    }

    return {submitWithGpsPoint};
}

type SubmitWithGpsPoint = ReturnType<typeof useGpsCapture>['submitWithGpsPoint'];

export default useGpsCapture;
export type {SubmitWithGpsPoint};
