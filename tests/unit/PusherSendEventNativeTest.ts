import Log from '@libs/Log';
import Pusher from '@libs/Pusher';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import {Pusher as MockedPusher} from '../../__mocks__/@pusher/pusher-websocket-react-native/index';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('Native Pusher.sendEvent', () => {
    const channelName = 'private-report-send-event';
    const accountID = 123;
    const payload = {[accountID]: true};

    async function subscribeToTyping() {
        const subscription = Pusher.subscribe(channelName, Pusher.TYPE.USER_IS_TYPING);
        await jest.runAllTimersAsync();
        await subscription;
        return subscription;
    }

    beforeEach(async () => {
        await Onyx.set(ONYXKEYS.NETWORK, {shouldForceOffline: false});
        await waitForBatchedUpdates();
        const initialization = Pusher.init({appKey: CONFIG.PUSHER.APP_KEY, cluster: CONFIG.PUSHER.CLUSTER});
        await jest.runAllTimersAsync();
        await initialization;
    });

    afterEach(async () => {
        Pusher.disconnect();
        jest.restoreAllMocks();
        await Onyx.set(ONYXKEYS.NETWORK, {shouldForceOffline: false});
        await waitForBatchedUpdates();
    });

    it('sends the serialized typing payload when connected and subscribed', async () => {
        // Given a completed subscription, because the native SDK requires it for client events.
        await subscribeToTyping();
        const trigger = jest.spyOn(MockedPusher.getInstance(), 'trigger');

        // When a connected client broadcasts typing.
        Pusher.sendEvent(channelName, Pusher.TYPE.USER_IS_TYPING, payload);

        // Then delivery preserves the event and payload expected by other clients.
        expect(trigger).toHaveBeenCalledTimes(1);
        expect(trigger).toHaveBeenCalledWith({channelName, eventName: Pusher.TYPE.USER_IS_TYPING, data: JSON.stringify(payload)});
    });

    it.each(['CONNECTING', 'RECONNECTING', 'DISCONNECTING', CONST.PUSHER.STATE.DISCONNECTED])('skips broadcasts while %s despite a cached subscription', async (state) => {
        // Given a previously subscribed channel whose socket is no longer ready.
        await subscribeToTyping();
        const socket = MockedPusher.getInstance();
        const trigger = jest.spyOn(socket, 'trigger');
        socket.connectionState = state;
        expect(Pusher.isSubscribed(channelName)).toBe(true);

        // When typing occurs during the connection interruption.
        Pusher.sendEvent(channelName, Pusher.TYPE.USER_IS_TYPING, payload);

        // Then the stale subscription flag does not permit a native trigger.
        expect(trigger).not.toHaveBeenCalled();
    });

    it('handles a trigger rejection after the connected check without retrying', async () => {
        // Given a ready socket that loses its connection before the native send executes.
        await subscribeToTyping();
        const error = new Error('Cannot trigger event client-userIsTyping because connection is in RECONNECTING state');
        const trigger = jest.spyOn(MockedPusher.getInstance(), 'trigger').mockRejectedValueOnce(error);
        const log = jest.spyOn(Log, 'info');

        // When the native bridge rejects the broadcast after the readiness check.
        Pusher.sendEvent(channelName, Pusher.TYPE.USER_IS_TYPING, payload);
        await jest.runAllTimersAsync();

        // Then the rejection is consumed with a diagnostic, not retried with stale typing data.
        expect(trigger).toHaveBeenCalledTimes(1);
        expect(log).toHaveBeenCalledWith('[Pusher] Failed to send client event, ignoring', false, {eventName: Pusher.TYPE.USER_IS_TYPING, error: String(error)});
    });

    it('resumes sending after reconnection without replaying skipped broadcasts', async () => {
        // Given a retained subscription, because resubscribe notifications rely on its history.
        await subscribeToTyping();
        const socket = MockedPusher.getInstance();
        const trigger = jest.spyOn(socket, 'trigger');
        const resubscribe = jest.fn();
        Pusher.onChannelResubscribe(channelName, resubscribe);
        socket.connectionState = 'RECONNECTING';
        Pusher.sendEvent(channelName, Pusher.TYPE.USER_IS_TYPING, payload);

        // When the socket reconnects and the SDK confirms its subscription again.
        socket.connectionState = CONST.PUSHER.STATE.CONNECTED;
        socket.getChannel(channelName)?.onSubscriptionSucceeded();
        await jest.runAllTimersAsync();
        expect(trigger).not.toHaveBeenCalled();
        Pusher.sendEvent(channelName, Pusher.TYPE.USER_IS_TYPING, payload);

        // Then new broadcasts work and the original resubscribe behavior is preserved.
        expect(resubscribe).toHaveBeenCalledTimes(1);
        expect(trigger).toHaveBeenCalledTimes(1);
    });

    it('skips broadcasts before subscription completes and after unsubscribe', async () => {
        // Given a connected socket, which alone is insufficient for sending client events.
        const trigger = jest.spyOn(MockedPusher.getInstance(), 'trigger');
        const subscription = Pusher.subscribe(channelName, Pusher.TYPE.USER_IS_TYPING);

        // When sending before the handshake and after the completed subscription is removed.
        Pusher.sendEvent(channelName, Pusher.TYPE.USER_IS_TYPING, payload);
        await jest.runAllTimersAsync();
        await subscription;
        subscription.unsubscribe();
        Pusher.sendEvent(channelName, Pusher.TYPE.USER_IS_TYPING, payload);

        // Then neither attempt reaches the native SDK with an unsubscribed channel.
        expect(trigger).not.toHaveBeenCalled();
    });

    it('skips broadcasts when forced offline despite a connected subscription', async () => {
        // Given a ready subscription with the developer offline override enabled.
        await subscribeToTyping();
        const trigger = jest.spyOn(MockedPusher.getInstance(), 'trigger');
        await Onyx.set(ONYXKEYS.NETWORK, {shouldForceOffline: true});
        await waitForBatchedUpdates();

        // When typing occurs while forced offline.
        Pusher.sendEvent(channelName, Pusher.TYPE.USER_IS_TYPING, payload);

        // Then the new connection guard does not bypass the existing offline behavior.
        expect(trigger).not.toHaveBeenCalled();
    });
});
