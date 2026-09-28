import {startOrStopChronosTimer} from '@libs/actions/Chronos';
import {write} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';
import type {OnyxData} from '@src/types/onyx/Request';

import type {OnyxKey, OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/API');

const mockWrite = jest.mocked(write);

const TEST_REPORT = {reportID: '123456789', reportName: 'Chronos', type: 'chat'} as Report;
const TEST_ACCOUNT_ID = 12345;
const TEST_START_TIME = '2026-07-13 10:00:00';

function getWriteOptions(): OnyxData<OnyxKey> {
    const options = mockWrite.mock.calls.at(0)?.[2];
    if (!options || !('optimisticData' in options)) {
        throw new Error('write was not called with optimistic options');
    }
    return options;
}

/** Reads back the last-visible-action fields the report update restores, narrowing instead of asserting the Onyx value's type. */
function getRestoredLastAction(updates: Array<OnyxUpdate<OnyxKey>> | undefined, reportID: string) {
    const update = updates?.find((u) => u.key === `${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    if (!update || !('value' in update) || typeof update.value !== 'object' || update.value === null) {
        return undefined;
    }
    const {value} = update;
    return {
        lastVisibleActionCreated: 'lastVisibleActionCreated' in value && typeof value.lastVisibleActionCreated === 'string' ? value.lastVisibleActionCreated : undefined,
        lastActorAccountID: 'lastActorAccountID' in value && typeof value.lastActorAccountID === 'number' ? value.lastActorAccountID : undefined,
    };
}

function getChronosNVPStartTime(updates: Array<OnyxUpdate<OnyxKey>> | undefined): string | undefined {
    const update = updates?.find((u) => u.key === ONYXKEYS.NVP_CHRONOS_TIME_TRACKING);
    if (!update || !('value' in update) || typeof update.value !== 'object' || update.value === null) {
        return undefined;
    }
    const {value} = update;
    if ('startTime' in value && typeof value.startTime === 'string') {
        return value.startTime;
    }
    return undefined;
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

        // Then an AddComment write is sent for the Chronos report
        expect(mockWrite).toHaveBeenCalledWith(WRITE_COMMANDS.ADD_COMMENT, expect.objectContaining({reportID: TEST_REPORT.reportID}), expect.any(Object));

        const {optimisticData, failureData} = getWriteOptions();
        // The NVP is optimistically given a non-empty startTime (timer running)
        expect(getChronosNVPStartTime(optimisticData)).toBeTruthy();
        // And reverts to empty (no timer) if the send fails
        expect(getChronosNVPStartTime(failureData)).toBe('');
    });

    it('restores the last visible action that the acting user could see when the send fails', async () => {
        const WHISPER_TARGET_ACCOUNT_ID = 777;
        const COMMENT_ACTOR_ACCOUNT_ID = 888;

        const comment: ReportAction = {
            reportActionID: 'chronosComment',
            reportID: TEST_REPORT.reportID,
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            actorAccountID: COMMENT_ACTOR_ACCOUNT_ID,
            created: '2026-07-13 09:00:00.000',
            message: [{type: 'COMMENT', html: 'Older comment', text: 'Older comment'}],
            originalMessage: {html: 'Older comment'},
        };

        /** Newer than `comment`, and only the whispered-to account can see it. */
        const whisper: ReportAction = {
            reportActionID: 'chronosWhisper',
            reportID: TEST_REPORT.reportID,
            actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
            actorAccountID: WHISPER_TARGET_ACCOUNT_ID,
            created: '2026-07-13 09:30:00.000',
            message: [{type: 'COMMENT', html: 'changed the amount', text: 'changed the amount', whisperedTo: [WHISPER_TARGET_ACCOUNT_ID]}],
            originalMessage: {whisperedTo: [WHISPER_TARGET_ACCOUNT_ID]},
        };

        // Given a Chronos report whose newest action is a whisper aimed at one account
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${TEST_REPORT.reportID}`, {[comment.reportActionID]: comment, [whisper.reportActionID]: whisper});
        await waitForBatchedUpdates();

        // When the whispered-to account starts the timer
        startOrStopChronosTimer(TEST_REPORT, WHISPER_TARGET_ACCOUNT_ID, null);

        // Then the failure data restores the whisper, which is the newest action that account can see
        expect(getRestoredLastAction(getWriteOptions().failureData, TEST_REPORT.reportID)).toEqual({
            lastVisibleActionCreated: whisper.created,
            lastActorAccountID: WHISPER_TARGET_ACCOUNT_ID,
        });

        jest.clearAllMocks();

        // When somebody the whisper does not target starts the timer
        startOrStopChronosTimer(TEST_REPORT, COMMENT_ACTOR_ACCOUNT_ID, null);

        // Then the whisper is invisible to them, so the older comment is restored instead
        expect(getRestoredLastAction(getWriteOptions().failureData, TEST_REPORT.reportID)).toEqual({
            lastVisibleActionCreated: comment.created,
            lastActorAccountID: COMMENT_ACTOR_ACCOUNT_ID,
        });
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
