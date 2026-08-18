import CONST from '@src/CONST';

import Storage from 'react-native-onyx/dist/storage';

import type MeasureDatabaseSize from './types';

const measureDatabaseSize: MeasureDatabaseSize = () => Storage.getDatabaseSize().then(({bytesUsed}) => ({bytes: bytesUsed, source: CONST.TELEMETRY.DB_SIZE_SOURCE.SQLITE}));

export default measureDatabaseSize;
