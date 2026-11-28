import type {Pusher as MobilePusher} from '@pusher/pusher-websocket-react-native';
import type Pusher from 'pusher-js/types/src/core/pusher';

declare global {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Window {
        getPusherInstance: () => Pusher | MobilePusher | null;
    }
}

export {};
