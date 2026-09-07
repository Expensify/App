import {reconnect} from '@libs/actions/Reconnect';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
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
    receiveEvent: (eventName: string, data?: unknown) => void;
};

const mockChannels = new Map<string, FakeChannel>();
const mockConnectionHandlers = new Map<string, Array<(data?: unknown) => void>>();

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

            receiveEvent: (eventName, data) => {
                emit(eventName, data);
            },
        };

        return channel;
    }

    class FakePusher {
        connection = {
            state: 'connected',

            // jest/setupAfterEnv.ts calls useRealTimers, so a deferred connect would never fire.
            bind: (eventName: string, callback: (data?: unknown) => void) => {
                if (eventName === 'connected') {
                    callback();
                    return;
                }
                mockConnectionHandlers.set(eventName, [...(mockConnectionHandlers.get(eventName) ?? []), callback]);
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

        connect() {}
    }

    return {__esModule: true, default: FakePusher};
});

describe('Pusher.subscribe on web', () => {
    const CHANNEL = 'private-encrypted-user-accountID-1';

    function goUnavailable() {
        for (const callback of mockConnectionHandlers.get('state_change') ?? []) {
            callback({previous: 'connecting', current: 'unavailable'});
        }
    }

    beforeEach(async () => {
        await Pusher.init({
            appKey: CONFIG.PUSHER.APP_KEY,
            cluster: CONFIG.PUSHER.CLUSTER,
        });
    });

    afterEach(() => {
        Pusher.disconnect();
        mockChannels.clear();
        mockConnectionHandlers.clear();
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should reinstate a subscription that a screen cancelled while a reconnect handshake was in flight', async () => {
        // Given a live subscription whose socket then drops, so pusher-js starts a fresh handshake
        const typing = Pusher.subscribe(CHANNEL, 'userIsTyping', () => {});
        await jest.runAllTimersAsync();

        const channel = mockChannels.get(CHANNEL);
        channel?.completeHandshake();
        await typing;

        channel?.dropConnection();
        channel?.startSubscription();

        // When a screen leaves during that handshake and another screen subscribes after it, because
        // pusher-js marks the pending subscription as cancelled and keeps the channel object
        Pusher.unsubscribe(CHANNEL, 'userIsTyping');
        expect(channel?.subscriptionCancelled).toBe(true);

        Pusher.subscribe(CHANNEL, 'userIsTyping', () => {});
        await jest.runAllTimersAsync();
        channel?.completeHandshake();

        // Then the channel serves the new caller, because subscribe() always calls socket.subscribe()
        // and that call reinstates a cancelled subscription
        expect(channel?.subscriptionCancelled).toBe(false);
        expect(mockChannels.get(CHANNEL)).toBeDefined();
    });

    it('should authorize again when a caller subscribes after a subscription error', async () => {
        // Given a channel that failed authorization, because pusher-js keeps such a channel and the
        // old guard read it as usable and never asked for authorization again
        const failed = Pusher.subscribe(CHANNEL, 'pong', () => {});
        await jest.runAllTimersAsync();

        const channel = mockChannels.get(CHANNEL);
        expect(channel?.authAttempts).toBe(1);

        channel?.failAuthorization();
        await expect(failed).rejects.toBe('Forbidden');

        // When a caller subscribes to the same channel after that failure
        const retried = Pusher.subscribe(CHANNEL, 'pong', () => {});
        await jest.runAllTimersAsync();
        channel?.completeHandshake();
        await retried;

        // Then pusher-js authorizes a second time, so one failed AuthenticatePusher call recovers
        expect(channel?.authAttempts).toBe(2);
    });

    it('should bind the event callback when pusher-js authorizes the channel again after a subscription error', async () => {
        // Given a caller whose first handshake failed authorization, because pusher-js retries the
        // channel on its own at the next reconnect and the caller must not stay silent
        const onEvent = jest.fn();

        const failed = Pusher.subscribe(CHANNEL, 'pong', onEvent);
        await jest.runAllTimersAsync();

        const channel = mockChannels.get(CHANNEL);
        channel?.failAuthorization();
        await expect(failed).rejects.toBe('Forbidden');

        // When pusher-js authorizes the channel again and the channel then carries one event
        channel?.startSubscription();
        channel?.completeHandshake();
        channel?.receiveEvent('pong', {});

        // Then the caller reads the event, because its success handler stays bound after a failure
        expect(onEvent).toHaveBeenCalledTimes(1);
    });

    it('should reject every caller waiting on a failed handshake, not only the first', async () => {
        // Given two callers that wait on the same first handshake, because one shared error handler
        // rejected only the caller that opened the channel
        const first = Pusher.subscribe(CHANNEL, 'pong', () => {});
        const second = Pusher.subscribe(CHANNEL, 'multipleEvents', () => {});
        await jest.runAllTimersAsync();

        // When authorization fails for that channel
        mockChannels.get(CHANNEL)?.failAuthorization();

        // Then both callers learn about the failure, so no caller waits for a handshake that is dead
        await expect(first).rejects.toBe('Forbidden');
        await expect(second).rejects.toBe('Forbidden');
    });

    it('should fire every registered resubscribe callback, whoever created the channel', async () => {
        // Given two screens that each register a resubscribe callback on one report channel, because
        // typing events often open that channel before draft pacing mounts
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

        // When the socket drops and the channel shakes hands again
        channel?.dropConnection();
        channel?.startSubscription();
        channel?.completeHandshake();

        // Then each callback runs one time, so draft clearing does not depend on the subscribe order
        expect(onTypingResubscribe).toHaveBeenCalledTimes(1);
        expect(onDraftResubscribe).toHaveBeenCalledTimes(1);
    });

    it('should fire the resubscribe callback of a caller that registered on an already subscribed channel', async () => {
        // Given a channel that finished its handshake before a later screen registers, because the
        // first handshake flag must come from the channel and not from the registration
        const onDraftResubscribe = jest.fn();

        const typing = Pusher.subscribe(CHANNEL, 'userIsTyping', () => {});
        await jest.runAllTimersAsync();

        const channel = mockChannels.get(CHANNEL);
        channel?.completeHandshake();
        await typing;

        Pusher.onChannelResubscribe(CHANNEL, onDraftResubscribe);
        await jest.runAllTimersAsync();

        // When the socket drops and the channel shakes hands again
        channel?.dropConnection();
        channel?.startSubscription();
        channel?.completeHandshake();

        // Then the late callback runs, because the handshake it reads is a real resubscribe
        expect(onDraftResubscribe).toHaveBeenCalledTimes(1);
    });

    it('should fire the resubscribe callback of a caller that registered while the socket was down', async () => {
        // Given a registration made while the socket is down, because channel.subscribed reads false
        // then and a bound event is the only sign of an earlier handshake
        const onDraftResubscribe = jest.fn();

        const typing = Pusher.subscribe(CHANNEL, 'userIsTyping', () => {});
        await jest.runAllTimersAsync();

        const channel = mockChannels.get(CHANNEL);
        channel?.completeHandshake();
        await typing;

        channel?.dropConnection();

        Pusher.onChannelResubscribe(CHANNEL, onDraftResubscribe);
        await jest.runAllTimersAsync();

        // When the socket comes back and the channel shakes hands
        channel?.completeHandshake();

        // Then the callback runs, so a drop during a screen mount still clears the draft cache
        expect(onDraftResubscribe).toHaveBeenCalledTimes(1);
    });

    it('should open no channel when a caller disposes its resubscribe registration during a transition', async () => {
        // Given a registration that a caller disposes inside one navigation transition, because the
        // web registration opens the channel itself and a dead registration must open none
        const transition = TransitionTracker.startTransition();

        const unregister = Pusher.onChannelResubscribe(CHANNEL, () => {});
        await Promise.resolve();
        unregister();

        // When the transition ends and the deferred work runs
        TransitionTracker.endTransition(transition);

        // Then no channel exists, so a screen that leaves at once costs no AuthenticatePusher call
        expect(mockChannels.get(CHANNEL)).toBeUndefined();
    });

    it('should trigger one reconnect per drop when the user channel is set up again without a disconnect', async () => {
        // Given a private user channel that the app sets up one time, because a delegate connect runs
        // subscribeToUserEvents again in the same session and Pusher never disconnects between them
        const accountID = '1';
        const userChannel = `${CONST.PUSHER.PRIVATE_USER_CHANNEL_PREFIX}${accountID}${CONFIG.PUSHER.SUFFIX}`;

        PusherUtils.onPrivateUserChannelResubscribe(accountID);
        PusherUtils.subscribeToPrivateUserChannelEvent(Pusher.TYPE.MULTIPLE_EVENTS, accountID, () => {});
        await jest.runAllTimersAsync();

        const channel = mockChannels.get(userChannel);
        channel?.completeHandshake();
        await jest.runAllTimersAsync();

        // When the app sets the same channel up a second time and the socket then goes down long enough
        // for pusher-js to give up on it
        PusherUtils.onPrivateUserChannelResubscribe(accountID);
        PusherUtils.subscribeToPrivateUserChannelEvent(Pusher.TYPE.MULTIPLE_EVENTS, accountID, () => {});
        await jest.runAllTimersAsync();

        channel?.dropConnection();
        goUnavailable();
        channel?.startSubscription();
        channel?.completeHandshake();

        // Then one reconnect follows the drop, because each set up drops the earlier registration
        expect(reconnect).toHaveBeenCalledTimes(1);
    });

    it('should trigger one reconnect per drop, however many events subscribe to the private user channel', async () => {
        // Given a private user channel with both PONG and MULTIPLE_EVENTS subscribed, because each
        // call carried its own onResubscribe and one drop sent two ReconnectApp requests
        const accountID = '1';
        const userChannel = `${CONST.PUSHER.PRIVATE_USER_CHANNEL_PREFIX}${accountID}${CONFIG.PUSHER.SUFFIX}`;

        PusherUtils.onPrivateUserChannelResubscribe(accountID);
        PusherUtils.subscribeToPrivateUserChannelEvent(Pusher.TYPE.PONG, accountID, () => {});
        PusherUtils.subscribeToPrivateUserChannelEvent(Pusher.TYPE.MULTIPLE_EVENTS, accountID, () => {});
        await jest.runAllTimersAsync();

        const channel = mockChannels.get(userChannel);
        channel?.completeHandshake();
        await jest.runAllTimersAsync();

        // When the socket goes down past pusher-js's unavailableTimeout and the channel shakes hands again
        channel?.dropConnection();
        goUnavailable();
        channel?.completeHandshake();

        // Then one reconnect follows the drop, whatever the number of subscribed events
        expect(reconnect).toHaveBeenCalledTimes(1);
    });

    it('should trigger no reconnect when the socket came back without ever going unavailable', async () => {
        // Given a private user channel on a socket that only blipped, because pusher-js recovers from
        // those on its own and the sync that followed was discarded as older than current state
        const accountID = '1';
        const userChannel = `${CONST.PUSHER.PRIVATE_USER_CHANNEL_PREFIX}${accountID}${CONFIG.PUSHER.SUFFIX}`;

        PusherUtils.onPrivateUserChannelResubscribe(accountID);
        PusherUtils.subscribeToPrivateUserChannelEvent(Pusher.TYPE.MULTIPLE_EVENTS, accountID, () => {});
        await jest.runAllTimersAsync();

        const channel = mockChannels.get(userChannel);
        channel?.completeHandshake();
        await jest.runAllTimersAsync();

        // When the channel shakes hands again without the socket having reached unavailable
        channel?.dropConnection();
        channel?.startSubscription();
        channel?.completeHandshake();

        // Then no reconnect follows, so OnyxUpdateManager gap detection covers anything that was missed
        expect(reconnect).not.toHaveBeenCalled();
    });

    it('should trigger one reconnect per outage, however many times the channel shakes hands', async () => {
        // Given an outage that already triggered a sync, because the record is cleared by the resubscribe
        // that reads it and not by the next connect
        const accountID = '1';
        const userChannel = `${CONST.PUSHER.PRIVATE_USER_CHANNEL_PREFIX}${accountID}${CONFIG.PUSHER.SUFFIX}`;

        PusherUtils.onPrivateUserChannelResubscribe(accountID);
        PusherUtils.subscribeToPrivateUserChannelEvent(Pusher.TYPE.MULTIPLE_EVENTS, accountID, () => {});
        await jest.runAllTimersAsync();

        const channel = mockChannels.get(userChannel);
        channel?.completeHandshake();
        await jest.runAllTimersAsync();

        channel?.dropConnection();
        goUnavailable();
        channel?.startSubscription();
        channel?.completeHandshake();

        // When the channel shakes hands a second time without a new outage
        channel?.dropConnection();
        channel?.startSubscription();
        channel?.completeHandshake();

        // Then the sync does not repeat, so one outage costs one ReconnectApp
        expect(reconnect).toHaveBeenCalledTimes(1);
    });

    it('should trigger one reconnect when the app forces the socket to reconnect', async () => {
        // Given a private user channel on a socket that the app tears down itself, which pusher-js takes
        // through `disconnected` and never through `unavailable`
        const accountID = '1';
        const userChannel = `${CONST.PUSHER.PRIVATE_USER_CHANNEL_PREFIX}${accountID}${CONFIG.PUSHER.SUFFIX}`;

        PusherUtils.onPrivateUserChannelResubscribe(accountID);
        PusherUtils.subscribeToPrivateUserChannelEvent(Pusher.TYPE.MULTIPLE_EVENTS, accountID, () => {});
        await jest.runAllTimersAsync();

        const channel = mockChannels.get(userChannel);
        channel?.completeHandshake();
        await jest.runAllTimersAsync();

        // When an expired authToken or a Channels 1006 error forces the reconnect
        Pusher.reconnect();

        channel?.dropConnection();
        channel?.startSubscription();
        channel?.completeHandshake();

        // Then the sync still runs, because the app only forces a reconnect once the socket is already broken
        expect(reconnect).toHaveBeenCalledTimes(1);
    });

    it('should trigger no reconnect on a later socket for an outage the session left behind', async () => {
        // Given an outage that no resubscribe ever read, because a sign out or a delegate switch replaced
        // the socket while it was still down
        const accountID = '1';
        const userChannel = `${CONST.PUSHER.PRIVATE_USER_CHANNEL_PREFIX}${accountID}${CONFIG.PUSHER.SUFFIX}`;

        PusherUtils.onPrivateUserChannelResubscribe(accountID);
        PusherUtils.subscribeToPrivateUserChannelEvent(Pusher.TYPE.MULTIPLE_EVENTS, accountID, () => {});
        await jest.runAllTimersAsync();

        mockChannels.get(userChannel)?.completeHandshake();
        await jest.runAllTimersAsync();

        goUnavailable();
        Pusher.disconnect();

        // When the next session opens its own socket and that one only blips
        mockChannels.clear();
        mockConnectionHandlers.clear();
        await Pusher.init({
            appKey: CONFIG.PUSHER.APP_KEY,
            cluster: CONFIG.PUSHER.CLUSTER,
        });

        PusherUtils.onPrivateUserChannelResubscribe(accountID);
        PusherUtils.subscribeToPrivateUserChannelEvent(Pusher.TYPE.MULTIPLE_EVENTS, accountID, () => {});
        await jest.runAllTimersAsync();

        const channel = mockChannels.get(userChannel);
        channel?.completeHandshake();
        await jest.runAllTimersAsync();

        channel?.dropConnection();
        channel?.startSubscription();
        channel?.completeHandshake();

        // Then the earlier socket's outage costs no sync on this one
        expect(reconnect).not.toHaveBeenCalled();
    });
});
