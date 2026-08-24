import {setLastMeasuredDatabaseSize} from '@libs/actions/Telemetry';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {DatabaseSizeMeasurement} from '@src/types/onyx';

import debounce from 'lodash/debounce';
import Onyx from 'react-native-onyx';

import measureDatabaseSize from './databaseSize';
import {getGlobalSpanAttributes, setGlobalSpanAttribute} from './globalSpanAttributes';

/**
 * Keeps the db_size_bytes/db_size_source global span attributes up to date and persists each measurement,
 * so that on the next app start the spans (including the startup span) carry the last known size right away.
 */

const INITIAL_MEASUREMENT_DELAY_MS = 10000;
const REMEASURE_DEBOUNCE_TIME_MS = 5000;
const REMEASURE_MAX_WAIT_MS = 60000;

let hasScheduledInitialMeasurement = false;
let hasMeasuredThisSession = false;
let initialMeasurementTimeout: NodeJS.Timeout | undefined;

function applyMeasurement(measurement: DatabaseSizeMeasurement) {
    setGlobalSpanAttribute(CONST.TELEMETRY.ATTRIBUTE_DB_SIZE_SOURCE, measurement.source);
    if (measurement.source === CONST.TELEMETRY.DB_SIZE_SOURCE.UNAVAILABLE) {
        return;
    }
    setGlobalSpanAttribute(CONST.TELEMETRY.ATTRIBUTE_DB_SIZE_BYTES, measurement.bytes);
}

// connectWithoutView: module-level telemetry logic, no UI. The persisted measurement lets startup spans carry a size before this session measures one.
Onyx.connectWithoutView({
    key: ONYXKEYS.LAST_MEASURED_DATABASE_SIZE,
    callback: (value) => {
        if (!value || hasMeasuredThisSession) {
            return;
        }
        applyMeasurement(value);
    },
});

function measureAndStoreDatabaseSize(): Promise<unknown> {
    return measureDatabaseSize()
        .catch((): DatabaseSizeMeasurement => ({source: CONST.TELEMETRY.DB_SIZE_SOURCE.UNAVAILABLE}))
        .then((measurement) => {
            hasMeasuredThisSession = true;
            if (measurement.source === CONST.TELEMETRY.DB_SIZE_SOURCE.UNAVAILABLE) {
                // Report unavailable when no size is known, but only persist successful measurements.
                if (getGlobalSpanAttributes()[CONST.TELEMETRY.ATTRIBUTE_DB_SIZE_BYTES] === undefined) {
                    applyMeasurement(measurement);
                }
                return;
            }
            applyMeasurement(measurement);
            return setLastMeasuredDatabaseSize(measurement);
        });
}

const debouncedMeasureAndStoreDatabaseSize = debounce(measureAndStoreDatabaseSize, REMEASURE_DEBOUNCE_TIME_MS, {maxWait: REMEASURE_MAX_WAIT_MS});

function scheduleInitialDatabaseSizeMeasurement() {
    if (hasScheduledInitialMeasurement) {
        return;
    }
    hasScheduledInitialMeasurement = true;
    initialMeasurementTimeout = setTimeout(() => {
        measureAndStoreDatabaseSize();
    }, INITIAL_MEASUREMENT_DELAY_MS);
}

/** Debounced re-measurement for data changes; ignored until the initial measurement ran. */
function requestDatabaseSizeRemeasurement() {
    if (!hasMeasuredThisSession) {
        return;
    }
    debouncedMeasureAndStoreDatabaseSize();
}

function cleanupDatabaseSizeTracking() {
    clearTimeout(initialMeasurementTimeout);
    debouncedMeasureAndStoreDatabaseSize.cancel();
    hasScheduledInitialMeasurement = false;
    hasMeasuredThisSession = false;
}

export {cleanupDatabaseSizeTracking, INITIAL_MEASUREMENT_DELAY_MS, REMEASURE_DEBOUNCE_TIME_MS, requestDatabaseSizeRemeasurement, scheduleInitialDatabaseSizeMeasurement};
