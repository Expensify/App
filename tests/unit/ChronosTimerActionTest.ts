import {startOrStopChronosTimer} from '@libs/actions/Chronos';
import {write} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import type {AnyOnyxUpdate} from '@src/types/onyx/Request';

jest.mock('@libs/API');

const mockWrite = jest.mocked(write);

const TEST_REPORT = {reportID: '123456789', reportName: 'Chronos', type: 'chat'} as Report;
const TEST_ACCOUNT_ID = 12345;
const TEST_START_TIME = '2026-07-13 10:00:00';

function getWriteOptions(): {optimisticData: AnyOnyxUpdate[]; successData: AnyOnyxUpdate[]; failureData: AnyOnyxUpdate[]} {
    const options = mockWrite.mock.calls.at(0)?.at(2);
    if (!options || typeof options !== 'object' || !('optimisticData' in options)) {
        throw new Error('write was not called with optimistic options');
    }
    return options as {optimisticData: AnyOnyxUpdate[]; successData: AnyOnyxUpdate[]; failureData: AnyOnyxUpdate[]};
}

function getChronosNVPStartTime(updates: AnyOnyxUpdate[]): string | undefined {
    const update = updates.find((u) => u.key === ONYXKEYS.NVP_CHRONOS_TIME_TRACKING);
    return (update?.value as {startTime?: string} | undefined)?.startTime;
}

describe('startOrStopChronosTimer', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('does nothing when the report has no reportID', () => {
        startOrStopChronosTimer({reportID: ''} as Report, TEST_ACCOUNT_ID, null);
        expect(mockWrite).not.toHaveBeenCalled();
    });

    it('optimistically starts the timer when none is running', () => {
        // When starting a timer (no previous startTime)
        startOrStopChronosTimer(TEST_REPORT, TEST_ACCOUNT_ID, null);

        // Then an AddComment write is sent with the canonical params (dedup key + client-created time)
        expect(mockWrite).toHaveBeenCalledWith(
            WRITE_COMMANDS.ADD_COMMENT,
            expect.objectContaining({
                reportID: TEST_REPORT.reportID,
                reportComment: expect.any(String) as string,
                idempotencyKey: expect.any(String) as string,
                clientCreatedTime: expect.any(String) as string,
            }),
            expect.any(Object),
        );

        const {optimisticData, failureData} = getWriteOptions();
        // The NVP is optimistically given a non-empty startTime (timer running)
        expect(getChronosNVPStartTime(optimisticData)).toBeTruthy();
        // And reverts to empty (no timer) if the send fails
        expect(getChronosNVPStartTime(failureData)).toBe('');
    });

    it('optimistically stops the timer when one is running', () => {
        // When stopping a running timer (previous startTime present)
        startOrStopChronosTimer(TEST_REPORT, TEST_ACCOUNT_ID, TEST_START_TIME);

        const {optimisticData, failureData} = getWriteOptions();
        // The NVP startTime is optimistically cleared (no timer running)
        expect(getChronosNVPStartTime(optimisticData)).toBe('');
        // And reverts to the previous startTime if the send fails
        expect(getChronosNVPStartTime(failureData)).toBe(TEST_START_TIME);
    });
});
