import type {PusherEvent} from '@pusher/pusher-websocket-react-native';
import {EventEmitter} from 'events';
import CONST from '@src/CONST';

type OnSubscriptionSucceeded = () => void;
type OnEvent = (event: PusherEvent) => void;

type ChannelCallbacks = {
    onSubscriptionSucceeded: OnSubscriptionSucceeded;
    onEvent: OnEvent;
};

class MockPusher extends EventEmitter {
    static instance: MockPusher | null = null;

    channels = new Map<string, ChannelCallbacks>();

    socketId = 'mock-socket-id';

    connectionState = 'DISCONNECTED';

    static getInstance() {
        if (!MockPusher.instance) {
            MockPusher.instance = new MockPusher();
        }
        return MockPusher.instance;
    }

    init({onConnectionStateChange}: {onConnectionStateChange: (currentState: string, previousState: string) => void}) {
        onConnectionStateChange(CONST.PUSHER.STATE.CONNECTED, CONST.PUSHER.STATE.DISCONNECTED);
        return Promise.resolve();
    }

    connect() {
        this.connectionState = CONST.PUSHER.STATE.CONNECTED;
        return Promise.resolve();
    }

    disconnect() {
        this.connectionState = CONST.PUSHER.STATE.DISCONNECTED;
        return Promise.resolve();
    }

    subscribe({channelName, onEvent, onSubscriptionSucceeded}: {channelName: string; onEvent: OnEvent; onSubscriptionSucceeded: OnSubscriptionSucceeded}) {
        if (!this.channels.has(channelName)) {
            this.channels.set(channelName, {onEvent, onSubscriptionSucceeded});
            onSubscriptionSucceeded();
        }
        return Promise.resolve();
    }

    unsubscribe({channelName}: {channelName: string}) {
        this.channels.delete(channelName);
    }

    trigger({channelName, eventName, data}: PusherEvent) {
        this.channels.get(channelName)?.onSubscriptionSucceeded();
        this.channels.get(channelName)?.onEvent({channelName, eventName, data: JSON.stringify(data)});
    }

    getChannel(channelName: string) {
        return this.channels.get(channelName);
    }

    // eslint-disable-next-line @typescript-eslint/require-await,@lwc/lwc/no-async-await
    async getSocketId() {
        return this.socketId;
    }
}

// eslint-disable-next-line import/prefer-default-export
export {MockPusher as Pusher};
