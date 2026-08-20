import CONST from '@src/CONST';

import Storage from 'react-native-onyx/dist/storage';

import type MeasureDatabaseSize from './types';

/** usageDetails is the only reliable size source on web and only Chromium provides it, so its absence means the size is unavailable. */
const measureDatabaseSize: MeasureDatabaseSize = () =>
    Storage.getDatabaseSize().then(({usageDetails}) => {
        const indexedDBBytes = usageDetails?.indexedDB;
        if (indexedDBBytes === undefined) {
            return {source: CONST.TELEMETRY.DB_SIZE_SOURCE.UNAVAILABLE};
        }
        return {bytes: indexedDBBytes, source: CONST.TELEMETRY.DB_SIZE_SOURCE.INDEXED_DB};
    });

export default measureDatabaseSize;
