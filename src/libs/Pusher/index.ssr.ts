import EventType from './EventType';
import type PusherModule from './types';

const noopModule: PusherModule = {
    init: () => Promise.resolve(),
    subscribe: () => Promise.resolve(),
    unsubscribe: () => {},
    getChannel: () => undefined,
    isSubscribed: () => false,
    isAlreadySubscribing: () => false,
    sendEvent: () => {},
    disconnect: () => {},
    reconnect: () => {},
    registerSocketEventCallback: () => {},
    registerCustomAuthorizer: () => {},
    getPusherSocketID: () => undefined,
    TYPE: EventType,
};

export default noopModule;
