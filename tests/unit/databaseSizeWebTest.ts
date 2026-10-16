import type MeasureDatabaseSize from '@libs/telemetry/databaseSize/types';

import CONST from '@src/CONST';

import Storage from 'react-native-onyx/dist/storage';

jest.mock('react-native-onyx/dist/storage', () => ({
    __esModule: true,
    default: {getDatabaseSize: jest.fn()},
}));

// Import the web implementation explicitly: Jest resolves the platform-split module to index.native.ts.
const measureDatabaseSize = jest.requireActual<{default: MeasureDatabaseSize}>('@libs/telemetry/databaseSize/index.ts').default;

const mockGetDatabaseSize = jest.mocked(Storage.getDatabaseSize);

describe('databaseSize (web)', () => {
    it('reports unavailable when the browser does not provide usageDetails', async () => {
        mockGetDatabaseSize.mockResolvedValue({bytesUsed: 5000, bytesRemaining: 100000});

        await expect(measureDatabaseSize()).resolves.toEqual({source: CONST.TELEMETRY.DB_SIZE_SOURCE.UNAVAILABLE});
    });

    it('reports 0 bytes when usageDetails has no indexedDB entry (empty database)', async () => {
        mockGetDatabaseSize.mockResolvedValue({bytesUsed: 5000, bytesRemaining: 100000, usageDetails: {caches: 5000}});

        await expect(measureDatabaseSize()).resolves.toEqual({bytes: 0, source: CONST.TELEMETRY.DB_SIZE_SOURCE.INDEXED_DB});
    });

    it('reports the indexedDB usage when it is present', async () => {
        mockGetDatabaseSize.mockResolvedValue({bytesUsed: 5000, bytesRemaining: 100000, usageDetails: {indexedDB: 4200}});

        await expect(measureDatabaseSize()).resolves.toEqual({bytes: 4200, source: CONST.TELEMETRY.DB_SIZE_SOURCE.INDEXED_DB});
    });
});
