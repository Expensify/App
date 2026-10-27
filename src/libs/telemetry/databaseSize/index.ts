import CONST from '@src/CONST';

import Storage from 'react-native-onyx/dist/storage';

import type MeasureDatabaseSize from './types';

/**
 * usageDetails is the only reliable size source on web and only Chromium provides it, so its absence means the size is unavailable.
 * Errors are mapped to the "unavailable" source by the caller in databaseSizeTracker.
 */
const measureDatabaseSize: MeasureDatabaseSize = () =>
    Storage.getDatabaseSize().then(({usageDetails}) => {
        if (usageDetails === undefined) {
            return {source: CONST.TELEMETRY.DB_SIZE_SOURCE.UNAVAILABLE};
        }
        // Chromium omits zero-usage buckets from usageDetails, so a missing indexedDB entry means an empty database, not an unsupported platform.
        return {bytes: usageDetails.indexedDB ?? 0, source: CONST.TELEMETRY.DB_SIZE_SOURCE.INDEXED_DB};
    });

export default measureDatabaseSize;
