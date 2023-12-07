import Pusher from 'pusher-js/types/src/core/pusher';

declare global {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Window {
        getPusherInstance: () => Pusher | null;
    }

    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface File {
        source?: string;

        uri?: string;
    }
}
