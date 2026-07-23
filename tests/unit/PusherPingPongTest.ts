import type * as NetworkStateModule from '@libs/NetworkState';
import Pusher from '@libs/Pusher';
import PusherUtils from '@libs/PusherUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import {subscribeToUserEvents} from '../../src/libs/actions/User';

jest.mock('@libs/API');
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
const CHECK_INTERVAL_MS = 60_000;
// Enough to cross the 2x ping-interval late-pong threshold and hit a watchdog check tick
const PAST_THRESHOLD_MS = 2 * PING_INTERVAL_MS + CHECK_INTERVAL_MS + 1_000;

describe('Pusher PINGPONG watchdog', () => {
    let reconnectSpy: jest.SpyInstance;
    let pongCallback: Parameters<typeof PusherUtils.subscribeToPrivateUserChannelEvent>[2] | undefined;

    beforeAll(() => {
        // The React Native jest setup replaces the global timers after the globally-enabled fake timers are installed,
        // so they must be re-installed here for setInterval/setTimeout in User.ts to be controllable
        jest.useFakeTimers();
        Onyx.init({keys: ONYXKEYS});
        reconnectSpy = jest.spyOn(Pusher, 'reconnect').mockImplementation(() => {});

        subscribeToUserEvents(123, 'test@example.com', () => undefined);

        pongCallback = jest.mocked(PusherUtils.subscribeToPrivateUserChannelEvent).mock.calls.find(([eventName]) => eventName === Pusher.TYPE.PONG)?.[2];
        expect(pongCallback).toBeDefined();
    });

    it('reconnects Pusher once per episode when the PONG goes missing', async () => {
        await jest.advanceTimersByTimeAsync(PAST_THRESHOLD_MS);
        expect(reconnectSpy).toHaveBeenCalledTimes(1);

        // Further check intervals must not reconnect again while the PONG is still missing
        await jest.advanceTimersByTimeAsync(3 * CHECK_INTERVAL_MS);
        expect(reconnectSpy).toHaveBeenCalledTimes(1);
    });

    it('re-arms and reconnects again after a PONG arrives and then goes missing again', async () => {
        reconnectSpy.mockClear();

        pongCallback?.({pingID: '1', pingTimestamp: Date.now()});

        await jest.advanceTimersByTimeAsync(PAST_THRESHOLD_MS);
        expect(reconnectSpy).toHaveBeenCalledTimes(1);
    });
});
