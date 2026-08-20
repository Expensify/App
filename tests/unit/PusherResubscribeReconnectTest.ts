import {reconnect} from '@libs/actions/Reconnect';
import getPlatform from '@libs/getPlatform';
import Pusher from '@libs/Pusher';
import type {SocketEventCallback} from '@libs/Pusher/types';
import PusherUtils from '@libs/PusherUtils';

import CONST from '@src/CONST';

jest.mock('@libs/Log');
jest.mock('@libs/actions/Reconnect', () => ({reconnect: jest.fn()}));
jest.mock('@libs/getPlatform', () => ({__esModule: true, default: jest.fn(() => 'web')}));
jest.mock('@libs/Pusher', () => ({
    __esModule: true,
    default: {
        registerSocketEventCallback: jest.fn(),
        onChannelResubscribe: jest.fn(() => jest.fn()),
    },
}));

// The subscriber is bound once, on the first registration, so grab it before any beforeEach clears mock history.
PusherUtils.onPrivateUserChannelResubscribe('1234');
const registration = jest.mocked(Pusher.registerSocketEventCallback).mock.calls.at(0);
if (!registration) {
    throw new Error('PusherUtils did not register a socket event callback');
}
const onSocketEvent: SocketEventCallback = registration[0];

function goUnavailable() {
    onSocketEvent('state_change', {previous: 'connecting', current: 'unavailable'});
}

function reconnectSocket() {
    onSocketEvent('state_change', {previous: 'connecting', current: 'connected'});
}

function registerAndGetResubscribeHandler(): () => void {
    PusherUtils.onPrivateUserChannelResubscribe('1234');
    const onResubscribe = jest.mocked(Pusher.onChannelResubscribe).mock.calls.at(-1)?.[1];
    if (!onResubscribe) {
        throw new Error('Pusher.onChannelResubscribe was not called with a callback');
    }
    return onResubscribe;
}

describe('Pusher resubscribe reconnect', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(getPlatform).mockReturnValue(CONST.PLATFORM.WEB);
    });

    it('does not sync when the socket recovered without going unavailable', () => {
        // Given a socket that dropped and came back while the page was alive to notice
        const onResubscribe = registerAndGetResubscribeHandler();
        reconnectSocket();

        // When the channel resubscribes
        onResubscribe();

        // Then no full app sync is triggered
        expect(reconnect).not.toHaveBeenCalled();
    });

    it('syncs when the socket passed through unavailable', () => {
        // Given a socket that stayed down past pusher-js's unavailableTimeout
        const onResubscribe = registerAndGetResubscribeHandler();
        goUnavailable();
        reconnectSocket();

        // When the channel resubscribes
        onResubscribe();

        // Then a full app sync is triggered
        expect(reconnect).toHaveBeenCalledTimes(1);
    });

    it('does not sync again on a later resubscribe from the same outage', () => {
        // Given an outage that already triggered one sync
        const onResubscribe = registerAndGetResubscribeHandler();
        goUnavailable();
        reconnectSocket();
        onResubscribe();

        // When the channel resubscribes again without a new outage
        onResubscribe();

        // Then the sync is not repeated
        expect(reconnect).toHaveBeenCalledTimes(1);
    });

    it('syncs on every resubscribe on native, which has no unavailable state', () => {
        // Given a native client, where the gate does not apply
        jest.mocked(getPlatform).mockReturnValue(CONST.PLATFORM.IOS);
        const onResubscribe = registerAndGetResubscribeHandler();
        reconnectSocket();

        // When the channel resubscribes without ever going unavailable
        onResubscribe();

        // Then a full app sync is still triggered
        expect(reconnect).toHaveBeenCalledTimes(1);
    });
});
