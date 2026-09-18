import Log from '@libs/Log';

import {subscribeToUserEvents} from '@userActions/User';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import PusherHelper from '../utils/PusherHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const mockApplyOnyxUpdatesReliably = jest.fn<Promise<void>, unknown[]>(() => Promise.resolve());

jest.mock('@libs/actions/applyOnyxUpdatesReliably', () => ({
    __esModule: true,
    default: (...args: unknown[]) => mockApplyOnyxUpdatesReliably(...args),
}));

jest.mock('@libs/ActiveClientManager', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/ActiveClientManager'),
    isClientTheLeader: () => true,
}));

describe('subscribeToUserEvents, when applying a Pusher update fails', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: 1, email: 'test@example.com'});
        await waitForBatchedUpdates();
        PusherHelper.setup();
        subscribeToUserEvents(1, 'test@example.com', () => undefined, undefined);
    });

    afterEach(() => PusherHelper.teardown());

    it('should report the failure instead of leaving it as an unhandled rejection', async () => {
        // Given an apply that rejects
        const alertSpy = jest.spyOn(Log, 'alert');
        mockApplyOnyxUpdatesReliably.mockImplementationOnce(() => Promise.reject(new Error('apply failed')));

        // When an update arrives over Pusher
        PusherHelper.emitOnyxUpdate([]);
        await waitForBatchedUpdates();

        // Then the failure is reported, so nothing escapes as an unhandled rejection
        expect(mockApplyOnyxUpdatesReliably).toHaveBeenCalledTimes(1);
        expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('[subscribeToUserEvents]'), expect.objectContaining({error: 'apply failed'}));
    });
});
