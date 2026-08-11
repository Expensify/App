import Pusher from '@libs/Pusher';

import CONFIG from '@src/CONFIG';

// Jest resolves `@libs/Pusher` to `index.native.ts`, so point the module registry at the web file.
// TypeScript resolves the same import to `index.ts`, so the import above already carries the right types.
jest.mock('@libs/Pusher', () => {
    const webPusher: unknown = jest.requireActual('../../src/libs/Pusher/index.ts');
    return webPusher;
});

/** Behaviour follows pusher-js 8.3.0. It cannot reuse pusher-js's own types, because `Channel.bind` returns `this` and satisfying that means implementing the whole class. */
type FakeChannel = {
    subscribed: boolean;
    subscriptionPending: boolean;
    subscriptionCancelled: boolean;

    bind: (eventName: string, callback: (data?: unknown) => void) => void;
    unbind: (eventName: string, callback?: (data?: unknown) => void) => void;

    handlerCount: (eventName: string) => number;

    /** Mirrors `Channel.subscribe()` — no-ops once subscribed, which is what makes a repeat call safe. */
    subscribe: () => void;
    subscribeAttempts: number;

    cancelSubscription: () => void;
    reinstateSubscription: () => void;

    completeHandshake: () => void;
    failSubscription: (error?: unknown) => void;
    dropConnection: () => void;
    emit: (eventName: string, data: unknown) => void;
};

const mockChannels = new Map<string, FakeChannel>();

jest.mock('pusher-js/with-encryption', () => {
    function createChannel(channelName: string, removeChannel: (name: string) => void): FakeChannel {
        const handlers = new Map<string, Array<(data?: unknown) => void>>();

        const channel: FakeChannel = {
            subscribed: false,
            subscriptionPending: false,
            subscriptionCancelled: false,
            subscribeAttempts: 0,

            bind: (eventName, callback) => {
                const existing = handlers.get(eventName) ?? [];
                existing.push(callback);
                handlers.set(eventName, existing);
            },

            unbind: (eventName, callback) => {
                if (!callback) {
                    handlers.delete(eventName);
                    return;
                }
                handlers.set(
                    eventName,
                    (handlers.get(eventName) ?? []).filter((bound) => bound !== callback),
                );
            },

            handlerCount: (eventName) => (handlers.get(eventName) ?? []).length,

            subscribe: () => {
                if (channel.subscribed) {
                    return;
                }
                channel.subscriptionPending = true;
                channel.subscriptionCancelled = false;
                channel.subscribeAttempts += 1;
            },

            cancelSubscription: () => {
                channel.subscriptionCancelled = true;
            },

            reinstateSubscription: () => {
                channel.subscriptionCancelled = false;
            },

            completeHandshake: () => {
                channel.subscriptionPending = false;
                channel.subscribed = true;

                // pusher-js drops a channel that was cancelled while its handshake was in flight.
                if (channel.subscriptionCancelled) {
                    removeChannel(channelName);
                    return;
                }

                channel.emit('pusher:subscription_succeeded', undefined);
            },

            failSubscription: (error = 'auth failed') => {
                channel.subscriptionPending = false;
                channel.emit('pusher:subscription_error', {type: 'AuthError', error, status: 403});
            },

            dropConnection: () => {
                channel.subscribed = false;
                channel.subscriptionPending = false;
            },

            emit: (eventName, data) => {
                for (const callback of [...(handlers.get(eventName) ?? [])]) {
                    callback(data);
                }
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

        // Mirrors Pusher.subscribe in pusher-js 8.3.0.
        subscribe(channelName: string) {
            const channel = mockChannels.get(channelName) ?? createChannel(channelName, (name) => mockChannels.delete(name));
            mockChannels.set(channelName, channel);

            if (channel.subscriptionPending && channel.subscriptionCancelled) {
                channel.reinstateSubscription();
            } else if (!channel.subscriptionPending && this.connection.state === 'connected') {
                channel.subscribe();
            }

            return channel;
        }

        // Mirrors Pusher.unsubscribe in pusher-js 8.3.0.
        unsubscribe(channelName: string) {
            const channel = mockChannels.get(channelName);
            if (channel?.subscriptionPending) {
                channel.cancelSubscription();
                return;
            }
            mockChannels.delete(channelName);
            if (channel?.subscribed) {
                channel.subscribed = false;
            }
        }

        disconnect() {}
    }

    return {__esModule: true, default: FakePusher};
});

describe('Pusher.subscribe on web', () => {
    const CHANNEL = 'private-encrypted-user-accountID-1';

    function getChannel(): FakeChannel {
        const channel = mockChannels.get(CHANNEL);
        if (!channel) {
            throw new Error(`Expected Pusher.subscribe to have created the channel ${CHANNEL}`);
        }
        return channel;
    }

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
    });

    it('should bind one subscription_succeeded handler when two callers subscribe to the same channel in one tick', async () => {
        const onResubscribe = jest.fn();

        const pong = Pusher.subscribe(CHANNEL, 'pong', () => {}, onResubscribe);
        const events = Pusher.subscribe(CHANNEL, 'multipleEvents', () => {}, onResubscribe);
        await jest.runAllTimersAsync();

        const channel = getChannel();
        expect(channel.handlerCount('pusher:subscription_succeeded')).toBe(1);

        channel.completeHandshake();
        await Promise.all([pong, events]);

        expect(onResubscribe).not.toHaveBeenCalled();

        channel.dropConnection();
        channel.completeHandshake();

        expect(onResubscribe).toHaveBeenCalledTimes(1);
    });

    it('should bind no extra handler when a caller subscribes during a reconnect window', async () => {
        const onResubscribe = jest.fn();

        const pong = Pusher.subscribe(CHANNEL, 'pong', () => {}, onResubscribe);
        await jest.runAllTimersAsync();

        const channel = getChannel();
        channel.completeHandshake();
        await pong;

        channel.dropConnection();
        const events = Pusher.subscribe(CHANNEL, 'multipleEvents', () => {}, onResubscribe);
        await jest.runAllTimersAsync();

        expect(channel.handlerCount('pusher:subscription_succeeded')).toBe(1);

        channel.completeHandshake();
        await events;

        // Discard the window above. One ordinary resubscribe must still produce one call.
        onResubscribe.mockClear();
        channel.dropConnection();
        channel.completeHandshake();

        expect(onResubscribe).toHaveBeenCalledTimes(1);
    });

    it('should keep every subscriber resubscribe handler, including one that joins an already-created channel', async () => {
        // A report channel is typically created by a subscriber with no resubscribe handler, and the one that needs it joins afterwards.
        const withoutHandler = Pusher.subscribe(CHANNEL, 'userIsTyping', () => {});
        await jest.runAllTimersAsync();

        const channel = getChannel();
        channel.completeHandshake();
        await withoutHandler;

        const onResubscribe = jest.fn();
        const withHandler = Pusher.subscribe(CHANNEL, 'conciergeDraftEvents', () => {}, onResubscribe);
        await jest.runAllTimersAsync();
        await withHandler;

        channel.dropConnection();
        channel.completeHandshake();

        expect(onResubscribe).toHaveBeenCalledTimes(1);
    });

    it('should call each distinct resubscribe handler once and collapse handlers shared by reference', async () => {
        const first = jest.fn();
        const second = jest.fn();
        const shared = jest.fn();

        const a = Pusher.subscribe(CHANNEL, 'pong', () => {}, first);
        const b = Pusher.subscribe(CHANNEL, 'multipleEvents', () => {}, second);
        const c = Pusher.subscribe(CHANNEL, 'eventC', () => {}, shared);
        const d = Pusher.subscribe(CHANNEL, 'eventD', () => {}, shared);
        await jest.runAllTimersAsync();

        const channel = getChannel();
        channel.completeHandshake();
        await Promise.all([a, b, c, d]);

        channel.dropConnection();
        channel.completeHandshake();

        expect(first).toHaveBeenCalledTimes(1);
        expect(second).toHaveBeenCalledTimes(1);
        expect(shared).toHaveBeenCalledTimes(1);
    });

    it('should deliver events to a caller that subscribed to an already-created channel', async () => {
        const firstCallback = jest.fn();
        const lateCallback = jest.fn();

        const first = Pusher.subscribe(CHANNEL, 'pong', firstCallback);
        await jest.runAllTimersAsync();

        const channel = getChannel();
        channel.completeHandshake();
        await first;

        const late = Pusher.subscribe(CHANNEL, 'multipleEvents', lateCallback);
        await jest.runAllTimersAsync();
        await late;

        channel.emit('pong', {value: 1});
        channel.emit('multipleEvents', {value: 2});

        expect(firstCallback).toHaveBeenCalledTimes(1);
        expect(firstCallback).toHaveBeenCalledWith({value: 1});
        expect(lateCallback).toHaveBeenCalledTimes(1);
        expect(lateCallback).toHaveBeenCalledWith({value: 2});
    });

    it('should retry the subscription after a subscription_error', async () => {
        const failed = Pusher.subscribe(CHANNEL, 'pong', () => {});
        await jest.runAllTimersAsync();

        const channel = getChannel();
        expect(channel.subscribeAttempts).toBe(1);

        channel.failSubscription('auth expired');
        await expect(failed).rejects.toBe('auth expired');
        expect(channel.subscribed).toBe(false);

        // The channel object survives the failure, so a later subscribe has to ask pusher-js to try again.
        const retried = Pusher.subscribe(CHANNEL, 'multipleEvents', () => {});
        await jest.runAllTimersAsync();

        expect(channel.subscribeAttempts).toBe(2);
        expect(channel.subscriptionPending).toBe(true);

        channel.completeHandshake();
        await expect(retried).resolves.toBeUndefined();
    });

    it('should reject every caller waiting on a failed handshake, not just the first', async () => {
        const first = Pusher.subscribe(CHANNEL, 'pong', () => {});
        const second = Pusher.subscribe(CHANNEL, 'multipleEvents', () => {});
        await jest.runAllTimersAsync();

        getChannel().failSubscription('auth expired');

        await expect(first).rejects.toBe('auth expired');
        await expect(second).rejects.toBe('auth expired');
    });

    it('should reinstate a subscription that was cancelled while its handshake was in flight', async () => {
        const first = Pusher.subscribe(CHANNEL, 'pong', () => {});
        await jest.runAllTimersAsync();

        // pusher-js cancels rather than removes when the channel is unsubscribed mid-handshake.
        const channel = getChannel();
        channel.cancelSubscription();
        expect(channel.subscriptionCancelled).toBe(true);

        const second = Pusher.subscribe(CHANNEL, 'multipleEvents', () => {});
        await jest.runAllTimersAsync();

        expect(channel.subscriptionCancelled).toBe(false);

        channel.completeHandshake();
        await Promise.all([first, second]);

        // A cancelled channel that was never reinstated would have been dropped by completeHandshake.
        expect(mockChannels.has(CHANNEL)).toBe(true);
    });
});
