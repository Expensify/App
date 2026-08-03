import {subscribeToUserEvents} from '@libs/actions/User';
import type * as NetworkStateModule from '@libs/NetworkState';
import Pusher from '@libs/Pusher';
import PusherUtils from '@libs/PusherUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

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

// The watchdog checks every 60s; each reconnect skips the following check, so while PONGs stay missing it fires on every second check tick (~2 minutes)
const CHECK_INTERVAL_MS = 60_000;

describe('Pusher PINGPONG watchdog', () => {
    let reconnectSpy: jest.SpyInstance;
    let pongCallback: Parameters<typeof PusherUtils.subscribeToPrivateUserChannelEvent>[2];

    beforeAll(() => {
        // jest/setupAfterEnv.ts calls jest.useRealTimers() after the globally-enabled fake timers are installed,
        // so they must be re-installed here for setInterval/setTimeout in User.ts to be controllable
        jest.useFakeTimers();
        Onyx.init({keys: ONYXKEYS});
        reconnectSpy = jest.spyOn(Pusher, 'reconnect').mockImplementation(() => {});

        subscribeToUserEvents(123, 'test@example.com', () => undefined);

        const callback = jest.mocked(PusherUtils.subscribeToPrivateUserChannelEvent).mock.calls.find(([eventName]) => eventName === Pusher.TYPE.PONG)?.[2];
        if (!callback) {
            throw new Error('The PONG subscription was not registered');
        }
        pongCallback = callback;
    });

    afterAll(() => {
        reconnectSpy.mockRestore();
        jest.useRealTimers();
    });

    // Both tests share one continuous fake-timer timeline and must run in file order

    it('reconnects once past the threshold and keeps retrying every second check tick while PONGs stay missing', async () => {
        await jest.advanceTimersByTimeAsync(CHECK_INTERVAL_MS + 1_000);
        expect(reconnectSpy).toHaveBeenCalledTimes(1);

        // The check tick right after a reconnect is skipped
        await jest.advanceTimersByTimeAsync(CHECK_INTERVAL_MS);
        expect(reconnectSpy).toHaveBeenCalledTimes(1);

        await jest.advanceTimersByTimeAsync(CHECK_INTERVAL_MS);
        expect(reconnectSpy).toHaveBeenCalledTimes(2);

        await jest.advanceTimersByTimeAsync(2 * CHECK_INTERVAL_MS);
        expect(reconnectSpy).toHaveBeenCalledTimes(3);
    });

    it('defers the next reconnect when a PONG arrives', async () => {
        reconnectSpy.mockClear();

        // Let the skipped check tick pass, then deliver a PONG
        await jest.advanceTimersByTimeAsync(CHECK_INTERVAL_MS);
        pongCallback({pingID: '1', pingTimestamp: Date.now()});

        // Without the PONG resetting the clock, this next check tick would reconnect
        await jest.advanceTimersByTimeAsync(CHECK_INTERVAL_MS);
        expect(reconnectSpy).not.toHaveBeenCalled();

        await jest.advanceTimersByTimeAsync(CHECK_INTERVAL_MS);
        expect(reconnectSpy).toHaveBeenCalledTimes(1);
    });
});
