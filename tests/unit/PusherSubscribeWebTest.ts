import Pusher from '@libs/Pusher';

import CONFIG from '@src/CONFIG';

// Jest resolves `@libs/Pusher` to `index.native.ts`, so point the module registry at the web file.
// TypeScript resolves the same import to `index.ts`, so the import above already carries the right types.
jest.mock('@libs/Pusher', () => {
    const webPusher: unknown = jest.requireActual('../../src/libs/Pusher/index.ts');
    return webPusher;
});

type FakeChannel = {
    subscribed: boolean;
    subscriptionPending: boolean;
    bind: (eventName: string, callback: () => void) => void;
    completeHandshake: () => void;
    dropConnection: () => void;
};

const mockChannels = new Map<string, FakeChannel>();

jest.mock('pusher-js/with-encryption', () => {
    function createChannel(): FakeChannel {
        const onHandshake: Array<() => void> = [];

        const channel: FakeChannel = {
            subscribed: false,
            subscriptionPending: false,

            bind: (eventName, callback) => {
                if (eventName !== 'pusher:subscription_succeeded') {
                    return;
                }
                onHandshake.push(callback);
            },

            completeHandshake: () => {
                channel.subscriptionPending = false;
                channel.subscribed = true;
                for (const callback of onHandshake) {
                    callback();
                }
            },

            dropConnection: () => {
                channel.subscribed = false;
                channel.subscriptionPending = false;
            },
        };

        return channel;
    }

    class FakePusher {
        connection = {
            state: 'connected',

            // jest/setupAfterEnv.ts calls useRealTimers, so a deferred connect would never fire.
            bind: (eventName: string, callback: () => void) => {
                if (eventName !== 'connected') {
                    return;
                }
                callback();
            },
        };

        channel(channelName: string) {
            return mockChannels.get(channelName);
        }

        subscribe(channelName: string) {
            const channel = mockChannels.get(channelName) ?? createChannel();
            mockChannels.set(channelName, channel);

            channel.subscriptionPending = true;
            return channel;
        }

        disconnect() {}
    }

    return {__esModule: true, default: FakePusher};
});

describe('Pusher.subscribe on web', () => {
    const CHANNEL = 'private-encrypted-user-accountID-1';

    beforeEach(async () => {
        await Pusher.init({
            appKey: CONFIG.PUSHER.APP_KEY,
            cluster: CONFIG.PUSHER.CLUSTER,
            authEndpoint: `${CONFIG.EXPENSIFY.DEFAULT_API_ROOT}api/AuthenticatePusher?`,
        });
    });

    afterEach(() => {
        Pusher.disconnect();
        mockChannels.clear();
        jest.restoreAllMocks();
    });

    it('should bind one subscription_succeeded handler when two callers subscribe to the same channel in one tick', async () => {
        const onResubscribe = jest.fn();

        const pong = Pusher.subscribe(CHANNEL, 'pong', () => {}, onResubscribe);
        const events = Pusher.subscribe(CHANNEL, 'multipleEvents', () => {}, onResubscribe);
        await jest.runAllTimersAsync();

        const channel = mockChannels.get(CHANNEL);
        channel?.completeHandshake();
        await Promise.all([pong, events]);

        expect(onResubscribe).not.toHaveBeenCalled();

        channel?.dropConnection();
        channel?.completeHandshake();

        expect(onResubscribe).toHaveBeenCalledTimes(1);
    });

    it('should bind no extra handler when a caller subscribes during a reconnect window', async () => {
        const onResubscribe = jest.fn();

        const pong = Pusher.subscribe(CHANNEL, 'pong', () => {}, onResubscribe);
        await jest.runAllTimersAsync();

        const channel = mockChannels.get(CHANNEL);
        channel?.completeHandshake();
        await pong;

        channel?.dropConnection();
        const events = Pusher.subscribe(CHANNEL, 'multipleEvents', () => {}, onResubscribe);
        await jest.runAllTimersAsync();
        channel?.completeHandshake();
        await events;

        // Discard the window above. One ordinary resubscribe must still produce one call.
        onResubscribe.mockClear();
        channel?.dropConnection();
        channel?.completeHandshake();

        expect(onResubscribe).toHaveBeenCalledTimes(1);
    });
});
