import type {PusherEvent} from '@pusher/pusher-websocket-react-native';
import CONST from '@src/CONST';

type OnSubscriptionSucceeded = () => void;

type OnEvent = (event: PusherEvent) => void;

type ChannelCallbacks = {
    onSubscriptionSucceeded: OnSubscriptionSucceeded;
    onEvent: OnEvent;
};

type InitProps = {
    onConnectionStateChange: (currentState: string, previousState: string) => void;
};

type SubscribeProps = {
    channelName: string;
    onEvent: OnEvent;
    onSubscriptionSucceeded: OnSubscriptionSucceeded;
};

type UnsubscribeProps = {
    channelName: string;
};

class MockedPusher {
    static instance: MockedPusher | null = null;

    channels = new Map<string, ChannelCallbacks>();

    socketId = 'mock-socket-id';

    connectionState: string = CONST.PUSHER.STATE.DISCONNECTED;

    static getInstance() {
        if (!MockedPusher.instance) {
            MockedPusher.instance = new MockedPusher();
        }
        return MockedPusher.instance;
    }

    init({onConnectionStateChange}: InitProps) {
        onConnectionStateChange(CONST.PUSHER.STATE.CONNECTED, CONST.PUSHER.STATE.DISCONNECTED);
        return Promise.resolve();
    }

    connect() {
        this.connectionState = CONST.PUSHER.STATE.CONNECTED;
        return Promise.resolve();
    }

    disconnect() {
        this.connectionState = CONST.PUSHER.STATE.DISCONNECTED;
        this.channels.clear();
        return Promise.resolve();
    }

    subscribe({channelName, onEvent, onSubscriptionSucceeded}: SubscribeProps) {
        if (!this.channels.has(channelName)) {
            this.channels.set(channelName, {onEvent, onSubscriptionSucceeded});
            onSubscriptionSucceeded();
        }
        return Promise.resolve();
    }

    unsubscribe({channelName}: UnsubscribeProps) {
        this.channels.delete(channelName);
    }

    trigger({channelName, eventName, data}: PusherEvent) {
        this.channels.get(channelName)?.onEvent({channelName, eventName, data: data as Record<string, unknown>});
    }

    getChannel(channelName: string) {
        return this.channels.get(channelName);
    }

    getSocketId() {
        return Promise.resolve(this.socketId);
    }
}

// eslint-disable-next-line import/prefer-default-export
export {MockedPusher as Pusher};
