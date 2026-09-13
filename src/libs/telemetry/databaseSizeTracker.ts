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
let hasCompletedInitialMeasurement = false;
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
        if (!value || hasCompletedInitialMeasurement) {
            return;
        }
        applyMeasurement(value);
    },
});

async function measureAndStoreDatabaseSize(): Promise<void> {
    let measurement: DatabaseSizeMeasurement;
    try {
        measurement = await measureDatabaseSize();
    } catch {
        measurement = {source: CONST.TELEMETRY.DB_SIZE_SOURCE.UNAVAILABLE};
    }
    hasCompletedInitialMeasurement = true;

    if (measurement.source === CONST.TELEMETRY.DB_SIZE_SOURCE.UNAVAILABLE) {
        // Report unavailable when no size is known, but only persist successful measurements.
        if (getGlobalSpanAttributes()[CONST.TELEMETRY.ATTRIBUTE_DB_SIZE_BYTES] === undefined) {
            applyMeasurement(measurement);
        }
        return;
    }
    applyMeasurement(measurement);
    try {
        await setLastMeasuredDatabaseSize(measurement);
    } catch {
        // Persisting is best-effort. Losing it only means the next launch starts without a size until it measures one.
    }
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

/**
 * Debounced re-measurement for data changes, ignored until the initial measurement ran.
 * A count of 0 means the collection was just emptied by an `Onyx.clear`, so skip it to not persist the emptied database's size.
 */
function requestDatabaseSizeRemeasurement(itemCount: number) {
    if (!hasCompletedInitialMeasurement || itemCount === 0) {
        return;
    }
    debouncedMeasureAndStoreDatabaseSize();
}

function cleanupDatabaseSizeTracking() {
    clearTimeout(initialMeasurementTimeout);
    debouncedMeasureAndStoreDatabaseSize.cancel();
    hasScheduledInitialMeasurement = false;
    hasCompletedInitialMeasurement = false;
}

export {cleanupDatabaseSizeTracking, INITIAL_MEASUREMENT_DELAY_MS, REMEASURE_DEBOUNCE_TIME_MS, requestDatabaseSizeRemeasurement, scheduleInitialDatabaseSizeMeasurement};
