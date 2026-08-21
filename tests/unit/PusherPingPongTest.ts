import {subscribeToUserEvents} from '@libs/actions/User';
import * as API from '@libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';
import Log from '@libs/Log';
import type * as NetworkStateModule from '@libs/NetworkState';
import Pusher from '@libs/Pusher';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

jest.mock('@libs/API');
const mockAPI = jest.mocked(API);

jest.mock('@libs/PusherUtils');
jest.mock('@libs/ActiveClientManager', () => ({
    isClientTheLeader: jest.fn(() => true),
    isReady: jest.fn(() => Promise.resolve()),
    init: jest.fn(),
}));
jest.mock('@libs/NetworkState', () => ({
    ...jest.requireActual<typeof NetworkStateModule>('@libs/NetworkState'),
    getIsOffline: () => false,
}));

const PING_INTERVAL_MS = 30_000;
const MISSING_PONG_THRESHOLD_MS = 60_000;

describe('Pusher PINGPONG', () => {
    let reconnectSpy: jest.SpyInstance;
    let logSpy: jest.SpyInstance;

    beforeAll(() => {
        // jest/setupAfterEnv.ts calls jest.useRealTimers() after the globally-enabled fake timers are installed,
        // so they must be re-installed here for setInterval/setTimeout in User.ts to be controllable
        jest.useFakeTimers();
        Onyx.init({keys: ONYXKEYS});
        reconnectSpy = jest.spyOn(Pusher, 'reconnect').mockImplementation(() => {});
        logSpy = jest.spyOn(Log, 'info').mockImplementation(() => {});

        // The automock returns undefined, and pingPusher chains a .catch on the returned promise
        mockAPI.makeRequestWithSideEffects.mockResolvedValue(undefined);

        subscribeToUserEvents(123, 'test@example.com', () => undefined);
    });

    afterAll(() => {
        reconnectSpy.mockRestore();
        logSpy.mockRestore();
        jest.useRealTimers();
    });

    it('logs a missing PONG without reconnecting, leaving recovery to the Pusher SDK', async () => {
        await jest.advanceTimersByTimeAsync(5 * MISSING_PONG_THRESHOLD_MS);

        expect(reconnectSpy).not.toHaveBeenCalled();
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('leaving recovery to the Pusher SDK'));
    });

    it('sends the PING off the durable write queue', async () => {
        mockAPI.makeRequestWithSideEffects.mockClear();
        await jest.advanceTimersByTimeAsync(PING_INTERVAL_MS);

        expect(mockAPI.makeRequestWithSideEffects).toHaveBeenCalledWith(SIDE_EFFECT_REQUEST_COMMANDS.PUSHER_PING, expect.anything());
        expect(mockAPI.writeWithNoDuplicatesConflictAction).not.toHaveBeenCalled();
    });
});
