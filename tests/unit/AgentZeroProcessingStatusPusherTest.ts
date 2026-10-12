import applyOnyxUpdatesReliably from '@libs/actions/applyOnyxUpdatesReliably';
import * as ActiveClientManager from '@libs/ActiveClientManager';
import * as API from '@libs/API';
import Log from '@libs/Log';
import * as SequentialQueue from '@libs/Network/SequentialQueue';
import Pusher from '@libs/Pusher';
import type {EventData} from '@libs/Pusher/types';

import {subscribeToUserEvents} from '@userActions/User';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import PusherHelper from '../utils/PusherHelper';
import {formatPhoneNumber} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/API');
jest.mock('@libs/actions/applyOnyxUpdatesReliably');
jest.mock('@libs/ActiveClientManager', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/ActiveClientManager'),
    isClientTheLeader: jest.fn(() => true),
}));

const CHANNEL_NAME = `${CONST.PUSHER.PRIVATE_USER_CHANNEL_PREFIX}1${CONFIG.PUSHER.SUFFIX}`;
const ACTOR_ACCOUNT_ID = 123;
const REPORT_NVP_KEY = `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}1001` as const;
const PARENT_REPORT_NVP_KEY = `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}1002` as const;
const processingStatusEvent: EventData<typeof Pusher.TYPE.AGENT_ZERO_PROCESSING_STATUS> = {
    updates: [REPORT_NVP_KEY, PARENT_REPORT_NVP_KEY].map((key) => ({
        onyxMethod: 'merge',
        key,
        value: {agentZeroProcessingRequestIndicator: {[ACTOR_ACCOUNT_ID]: 'Thinking...'}},
    })),
};

describe('Agent Zero processing status Pusher events', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        jest.mocked(ActiveClientManager.isClientTheLeader).mockReturnValue(true);
        await Onyx.clear();
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: 1, email: 'test@example.com'});
        await Onyx.merge(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 42);
        await waitForBatchedUpdates();
        PusherHelper.setup();
        subscribeToUserEvents(1, 'test@example.com', () => undefined, formatPhoneNumber, undefined);
        await waitForBatchedUpdates();
    });

    afterEach(() => {
        PusherHelper.teardown();
        jest.restoreAllMocks();
    });

    it('sets and clears processing labels without advancing or recovering the reliable update stream', async () => {
        // Given a subscribed client with a synchronization watermark
        expect(await getOnyxValue(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT)).toBe(42);

        // When temporary status updates arrive for a report and its parent
        Pusher.sendEvent(CHANNEL_NAME, Pusher.TYPE.AGENT_ZERO_PROCESSING_STATUS, processingStatusEvent);
        await waitForBatchedUpdates();

        // Then both reports show the processing label
        expect(await getOnyxValue(REPORT_NVP_KEY)).toEqual({agentZeroProcessingRequestIndicator: {[ACTOR_ACCOUNT_ID]: 'Thinking...'}});
        expect(await getOnyxValue(PARENT_REPORT_NVP_KEY)).toEqual({agentZeroProcessingRequestIndicator: {[ACTOR_ACCOUNT_ID]: 'Thinking...'}});

        // When the agent finishes and clears its processing labels
        Pusher.sendEvent(CHANNEL_NAME, Pusher.TYPE.AGENT_ZERO_PROCESSING_STATUS, {
            updates: processingStatusEvent.updates.map((update) => ({...update, value: {agentZeroProcessingRequestIndicator: {[ACTOR_ACCOUNT_ID]: null}}})),
        });
        await waitForBatchedUpdates();

        // Then the labels clear without affecting the synchronization watermark or fetching catch-up updates
        expect(await getOnyxValue(REPORT_NVP_KEY)).toEqual({agentZeroProcessingRequestIndicator: {}});
        expect(await getOnyxValue(PARENT_REPORT_NVP_KEY)).toEqual({agentZeroProcessingRequestIndicator: {}});
        expect(await getOnyxValue(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT)).toBe(42);
        expect(applyOnyxUpdatesReliably).not.toHaveBeenCalled();
        expect(API.makeRequestWithSideEffects).not.toHaveBeenCalled();
    });

    it('applies new processing status after an older OpenApp response clears the indicator', async () => {
        // Given an earlier OpenApp request is still applying its response
        let finishRequest = () => {};
        const currentRequest = new Promise<void>((resolve) => {
            finishRequest = resolve;
        });
        jest.spyOn(SequentialQueue, 'getCurrentRequest').mockReturnValue(currentRequest);

        // When a new processing status arrives before that response completes
        Pusher.sendEvent(CHANNEL_NAME, Pusher.TYPE.AGENT_ZERO_PROCESSING_STATUS, processingStatusEvent);
        await waitForBatchedUpdates();

        // Then the status waits for the earlier request
        expect(await getOnyxValue(REPORT_NVP_KEY)).toBeUndefined();

        // When the older snapshot clears the indicator and finishes
        await Onyx.merge(REPORT_NVP_KEY, {agentZeroProcessingRequestIndicator: null});
        finishRequest();
        await waitForBatchedUpdates();

        // Then the new label survives the older response
        expect(await getOnyxValue(REPORT_NVP_KEY)).toEqual({agentZeroProcessingRequestIndicator: {[ACTOR_ACCOUNT_ID]: 'Thinking...'}});
    });

    it('ignores processing status events on a non-leader client', async () => {
        // Given another client is responsible for updating shared Onyx data
        jest.mocked(ActiveClientManager.isClientTheLeader).mockReturnValue(false);

        // When a temporary processing status arrives
        Pusher.sendEvent(CHANNEL_NAME, Pusher.TYPE.AGENT_ZERO_PROCESSING_STATUS, processingStatusEvent);
        await waitForBatchedUpdates();

        // Then this client leaves the report unchanged
        expect(await getOnyxValue(REPORT_NVP_KEY)).toBeUndefined();
    });

    it.each([undefined, 2])('ignores processing status from an earlier session after the account changes to %s', async (accountID) => {
        // Given a status listener is waiting for the current account's API request
        let finishRequest = () => {};
        const currentRequest = new Promise<void>((resolve) => {
            finishRequest = resolve;
        });
        jest.spyOn(SequentialQueue, 'getCurrentRequest').mockReturnValue(currentRequest);

        // When a status arrives and the account signs out or changes before the request finishes
        Pusher.sendEvent(CHANNEL_NAME, Pusher.TYPE.AGENT_ZERO_PROCESSING_STATUS, processingStatusEvent);
        await Onyx.set(ONYXKEYS.SESSION, accountID ? {accountID} : null);
        await waitForBatchedUpdates();
        finishRequest();
        await waitForBatchedUpdates();

        // Then it cannot populate the new session's report data
        expect(await getOnyxValue(REPORT_NVP_KEY)).toBeUndefined();
    });

    it('reports a failed local status update', async () => {
        // Given Onyx cannot apply the temporary status update
        jest.spyOn(Onyx, 'update').mockRejectedValueOnce(new Error('apply failed'));
        const alertSpy = jest.spyOn(Log, 'alert');

        // When a processing status arrives
        Pusher.sendEvent(CHANNEL_NAME, Pusher.TYPE.AGENT_ZERO_PROCESSING_STATUS, processingStatusEvent);
        await waitForBatchedUpdates();

        // Then the failure is logged without an unhandled rejection or a synchronization recovery
        expect(alertSpy).toHaveBeenCalledWith('[subscribeToUserEvents] Applying Agent Zero processing status failed', expect.objectContaining({error: 'apply failed'}));
        expect(applyOnyxUpdatesReliably).not.toHaveBeenCalled();
    });
});
