import measureDatabaseSize from '@libs/telemetry/databaseSize';
import {
    cleanupDatabaseSizeTracking,
    INITIAL_MEASUREMENT_DELAY_MS,
    REMEASURE_DEBOUNCE_TIME_MS,
    requestDatabaseSizeRemeasurement,
    scheduleInitialDatabaseSizeMeasurement,
} from '@libs/telemetry/databaseSizeTracker';
import {getGlobalSpanAttributes} from '@libs/telemetry/globalSpanAttributes';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/telemetry/databaseSize', () => ({
    __esModule: true,
    default: jest.fn(),
}));

Onyx.init({keys: ONYXKEYS});

const mockMeasureDatabaseSize = jest.mocked(measureDatabaseSize);

// The tracker keeps one-shot module state (initial schedule, first measurement), so these tests build on each other in order.
describe('databaseSizeTracker', () => {
    afterEach(() => {
        jest.useRealTimers();
    });

    it('applies a measurement persisted by a previous session', async () => {
        await Onyx.set(ONYXKEYS.LAST_MEASURED_DATABASE_SIZE, {bytes: 123, source: CONST.TELEMETRY.DB_SIZE_SOURCE.SQLITE});
        await waitForBatchedUpdatesWithAct();

        expect(getGlobalSpanAttributes()[CONST.TELEMETRY.ATTRIBUTE_DB_SIZE_BYTES]).toBe(123);
        expect(getGlobalSpanAttributes()[CONST.TELEMETRY.ATTRIBUTE_DB_SIZE_SOURCE]).toBe(CONST.TELEMETRY.DB_SIZE_SOURCE.SQLITE);
    });

    it('ignores re-measurement requests before the initial measurement ran', async () => {
        jest.useFakeTimers();

        requestDatabaseSizeRemeasurement(1);
        await jest.advanceTimersByTimeAsync(REMEASURE_DEBOUNCE_TIME_MS * 2);

        expect(mockMeasureDatabaseSize).not.toHaveBeenCalled();
    });

    it('measures after the startup delay, updates the attributes and persists the result', async () => {
        jest.useFakeTimers();
        const setSpy = jest.spyOn(Onyx, 'set');
        mockMeasureDatabaseSize.mockResolvedValue({bytes: 5000, source: CONST.TELEMETRY.DB_SIZE_SOURCE.SQLITE});

        scheduleInitialDatabaseSizeMeasurement();
        expect(mockMeasureDatabaseSize).not.toHaveBeenCalled();

        await jest.advanceTimersByTimeAsync(INITIAL_MEASUREMENT_DELAY_MS);

        expect(mockMeasureDatabaseSize).toHaveBeenCalledTimes(1);
        expect(getGlobalSpanAttributes()[CONST.TELEMETRY.ATTRIBUTE_DB_SIZE_BYTES]).toBe(5000);
        expect(setSpy).toHaveBeenCalledWith(ONYXKEYS.LAST_MEASURED_DATABASE_SIZE, {bytes: 5000, source: CONST.TELEMETRY.DB_SIZE_SOURCE.SQLITE});
        setSpy.mockRestore();
    });

    it('does not schedule the initial measurement twice', async () => {
        jest.useFakeTimers();
        mockMeasureDatabaseSize.mockClear();

        scheduleInitialDatabaseSizeMeasurement();
        await jest.advanceTimersByTimeAsync(INITIAL_MEASUREMENT_DELAY_MS * 2);

        expect(mockMeasureDatabaseSize).not.toHaveBeenCalled();
    });

    it('debounces re-measurements once the initial measurement exists', async () => {
        jest.useFakeTimers();
        mockMeasureDatabaseSize.mockClear();
        mockMeasureDatabaseSize.mockResolvedValue({bytes: 6000, source: CONST.TELEMETRY.DB_SIZE_SOURCE.SQLITE});

        requestDatabaseSizeRemeasurement(1);
        requestDatabaseSizeRemeasurement(1);
        expect(mockMeasureDatabaseSize).not.toHaveBeenCalled();

        await jest.advanceTimersByTimeAsync(REMEASURE_DEBOUNCE_TIME_MS * 2);

        expect(mockMeasureDatabaseSize).toHaveBeenCalledTimes(1);
        expect(getGlobalSpanAttributes()[CONST.TELEMETRY.ATTRIBUTE_DB_SIZE_BYTES]).toBe(6000);
    });

    it('keeps the last good measurement when a re-measurement fails', async () => {
        jest.useFakeTimers();
        mockMeasureDatabaseSize.mockClear();
        mockMeasureDatabaseSize.mockRejectedValue(new Error('no storage manager'));
        const setSpy = jest.spyOn(Onyx, 'set');

        requestDatabaseSizeRemeasurement(1);
        await jest.advanceTimersByTimeAsync(REMEASURE_DEBOUNCE_TIME_MS * 2);

        expect(mockMeasureDatabaseSize).toHaveBeenCalledTimes(1);
        expect(getGlobalSpanAttributes()[CONST.TELEMETRY.ATTRIBUTE_DB_SIZE_BYTES]).toBe(6000);
        expect(getGlobalSpanAttributes()[CONST.TELEMETRY.ATTRIBUTE_DB_SIZE_SOURCE]).toBe(CONST.TELEMETRY.DB_SIZE_SOURCE.SQLITE);
        expect(setSpy).not.toHaveBeenCalledWith(ONYXKEYS.LAST_MEASURED_DATABASE_SIZE, {source: CONST.TELEMETRY.DB_SIZE_SOURCE.UNAVAILABLE});
        setSpy.mockRestore();
    });

    it('re-arms the initial measurement after cleanup, so a remount can measure again', async () => {
        jest.useFakeTimers();
        mockMeasureDatabaseSize.mockClear();
        mockMeasureDatabaseSize.mockResolvedValue({bytes: 7000, source: CONST.TELEMETRY.DB_SIZE_SOURCE.SQLITE});

        cleanupDatabaseSizeTracking();
        scheduleInitialDatabaseSizeMeasurement();
        await jest.advanceTimersByTimeAsync(INITIAL_MEASUREMENT_DELAY_MS);

        expect(mockMeasureDatabaseSize).toHaveBeenCalledTimes(1);
        expect(getGlobalSpanAttributes()[CONST.TELEMETRY.ATTRIBUTE_DB_SIZE_BYTES]).toBe(7000);
    });

    it('ignores a re-measurement for an emptied collection, so an Onyx.clear does not persist the size of the emptied database', async () => {
        jest.useFakeTimers();
        mockMeasureDatabaseSize.mockClear();

        requestDatabaseSizeRemeasurement(0);
        await jest.advanceTimersByTimeAsync(REMEASURE_DEBOUNCE_TIME_MS * 2);

        expect(mockMeasureDatabaseSize).not.toHaveBeenCalled();
        expect(getGlobalSpanAttributes()[CONST.TELEMETRY.ATTRIBUTE_DB_SIZE_BYTES]).toBe(7000);
    });
});
