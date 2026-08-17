import {reconnect} from '@libs/actions/Reconnect';
import Pusher from '@libs/Pusher';
import PusherUtils from '@libs/PusherUtils';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';

// Jest resolves `@libs/Pusher` to `index.native.ts`, so point the module registry at the web file.
// TypeScript resolves the same import to `index.ts`, so the import above already carries the right types.
jest.mock('@libs/Pusher', () => {
    const webPusher: unknown = jest.requireActual('../../src/libs/Pusher/index.ts');
    return webPusher;
});

jest.mock('@libs/actions/Reconnect', () => ({reconnect: jest.fn()}));

type FakeChannel = {
    subscribed: boolean;
    subscriptionPending: boolean;
    subscriptionCancelled: boolean;
    authAttempts: number;

    bind: (eventName: string, callback: (data?: unknown) => void) => void;
    unbind: (eventName?: string, callback?: (data?: unknown) => void) => void;

    startSubscription: () => void;
    completeHandshake: () => void;
    failAuthorization: () => void;
    dropConnection: () => void;
};

const mockChannels = new Map<string, FakeChannel>();

jest.mock('pusher-js/with-encryption', () => {
    function createChannel(channelName: string): FakeChannel {
        const handlers = new Map<string, Array<(data?: unknown) => void>>();

        function emit(eventName: string, data?: unknown) {
            for (const callback of handlers.get(eventName) ?? []) {
                callback(data);
            }
        }

        const channel: FakeChannel = {
            subscribed: false,
            subscriptionPending: false,
            subscriptionCancelled: false,
            authAttempts: 0,

            bind: (eventName, callback) => {
                handlers.set(eventName, [...(handlers.get(eventName) ?? []), callback]);
            },

            unbind: (eventName, callback) => {
                if (!eventName) {
                    handlers.clear();
                    return;
                }
                if (!callback) {
                    handlers.delete(eventName);
                    return;
                }
                handlers.set(
                    eventName,
                    (handlers.get(eventName) ?? []).filter((bound) => bound !== callback),
                );
            },

            startSubscription: () => {
                if (channel.subscribed) {
                    return;
                }
                channel.subscriptionPending = true;
                channel.subscriptionCancelled = false;
                channel.authAttempts += 1;
            },

            completeHandshake: () => {
                channel.subscriptionPending = false;
                channel.subscribed = true;

                if (channel.subscriptionCancelled) {
                    mockChannels.delete(channelName);
                    return;
                }
                emit('pusher:subscription_succeeded');
            },

            failAuthorization: () => {
                channel.subscriptionPending = false;
                emit('pusher:subscription_error', {type: 'AuthError', error: 'Forbidden', status: 403});
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
            const channel = mockChannels.get(channelName) ?? createChannel(channelName);
            mockChannels.set(channelName, channel);

            if (channel.subscriptionPending && channel.subscriptionCancelled) {
                channel.subscriptionCancelled = false;
            } else if (!channel.subscriptionPending && this.connection.state === 'connected') {
                channel.startSubscription();
            }

            return channel;
        }

        unsubscribe(channelName: string) {
            const channel = mockChannels.get(channelName);

            if (channel?.subscriptionPending) {
                channel.subscriptionCancelled = true;
                return;
            }
            mockChannels.delete(channelName);
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
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should reinstate a subscription that a screen cancelled while a reconnect handshake was in flight', async () => {
        const typing = Pusher.subscribe(CHANNEL, 'userIsTyping', () => {});
        await jest.runAllTimersAsync();

        const channel = mockChannels.get(CHANNEL);
        channel?.completeHandshake();
        await typing;

        channel?.dropConnection();
        channel?.startSubscription();

        Pusher.unsubscribe(CHANNEL, 'userIsTyping');
        expect(channel?.subscriptionCancelled).toBe(true);

        Pusher.subscribe(CHANNEL, 'userIsTyping', () => {});
        await jest.runAllTimersAsync();
        channel?.completeHandshake();

        expect(channel?.subscriptionCancelled).toBe(false);
        expect(mockChannels.get(CHANNEL)).toBeDefined();
    });

    it('should authorize again when a caller subscribes after a subscription error', async () => {
        const failed = Pusher.subscribe(CHANNEL, 'pong', () => {});
        await jest.runAllTimersAsync();

        const channel = mockChannels.get(CHANNEL);
        expect(channel?.authAttempts).toBe(1);

        channel?.failAuthorization();
        await expect(failed).rejects.toBe('Forbidden');

        const retried = Pusher.subscribe(CHANNEL, 'pong', () => {});
        await jest.runAllTimersAsync();
        channel?.completeHandshake();
        await retried;

        expect(channel?.authAttempts).toBe(2);
    });

    it('should reject every caller waiting on a failed handshake, not only the first', async () => {
        const first = Pusher.subscribe(CHANNEL, 'pong', () => {});
        const second = Pusher.subscribe(CHANNEL, 'multipleEvents', () => {});
        await jest.runAllTimersAsync();

        mockChannels.get(CHANNEL)?.failAuthorization();

        await expect(first).rejects.toBe('Forbidden');
        await expect(second).rejects.toBe('Forbidden');
    });

    it('should fire every registered resubscribe callback, whoever created the channel', async () => {
        const onTypingResubscribe = jest.fn();
        const onDraftResubscribe = jest.fn();

        const typing = Pusher.subscribe(CHANNEL, 'userIsTyping', () => {});
        Pusher.onChannelResubscribe(CHANNEL, onTypingResubscribe);
        const draft = Pusher.subscribe(CHANNEL, 'conciergeDraftEvents', () => {});
        Pusher.onChannelResubscribe(CHANNEL, onDraftResubscribe);
        await jest.runAllTimersAsync();

        const channel = mockChannels.get(CHANNEL);
        channel?.completeHandshake();
        await Promise.all([typing, draft]);

        channel?.dropConnection();
        channel?.startSubscription();
        channel?.completeHandshake();

        expect(onTypingResubscribe).toHaveBeenCalledTimes(1);
        expect(onDraftResubscribe).toHaveBeenCalledTimes(1);
    });

    it('should fire the resubscribe callback of a caller that registered on an already subscribed channel', async () => {
        const onDraftResubscribe = jest.fn();

        const typing = Pusher.subscribe(CHANNEL, 'userIsTyping', () => {});
        await jest.runAllTimersAsync();

        const channel = mockChannels.get(CHANNEL);
        channel?.completeHandshake();
        await typing;

        Pusher.onChannelResubscribe(CHANNEL, onDraftResubscribe);
        await jest.runAllTimersAsync();

        channel?.dropConnection();
        channel?.startSubscription();
        channel?.completeHandshake();

        expect(onDraftResubscribe).toHaveBeenCalledTimes(1);
    });

    it('should trigger one reconnect per drop, however many events subscribe to the private user channel', async () => {
        const accountID = '1';
        const userChannel = `${CONST.PUSHER.PRIVATE_USER_CHANNEL_PREFIX}${accountID}${CONFIG.PUSHER.SUFFIX}`;

        PusherUtils.onPrivateUserChannelResubscribe(accountID);
        PusherUtils.subscribeToPrivateUserChannelEvent(Pusher.TYPE.PONG, accountID, () => {});
        PusherUtils.subscribeToPrivateUserChannelEvent(Pusher.TYPE.MULTIPLE_EVENTS, accountID, () => {});
        await jest.runAllTimersAsync();

        const channel = mockChannels.get(userChannel);
        channel?.completeHandshake();
        await jest.runAllTimersAsync();

        channel?.dropConnection();
        channel?.completeHandshake();

        expect(reconnect).toHaveBeenCalledTimes(1);
    });
});
