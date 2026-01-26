import type {PusherChannel} from '@pusher/pusher-websocket-react-native';
import type PusherClass from 'pusher-js/with-encryption';
import type {Channel, ChannelAuthorizerGenerator} from 'pusher-js/with-encryption';
import type {LiteralUnion, ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type {OnyxUpdatesFromServer, ReportUserIsTyping} from '@src/types/onyx';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import type TYPE from './EventType';

type SocketEventName = LiteralUnion<'error' | 'connected' | 'disconnected' | 'state_change', string>;

type States = {
    previous: string;
    current: string;
};

type Args = {
    appKey: string;
    cluster: string;
    authEndpoint: string;
};

type UserIsTypingEvent = ReportUserIsTyping & {
    userLogin?: string;
};

type UserIsLeavingRoomEvent = Record<string, boolean> & {
    userLogin?: string;
};

type PingPongEvent = Record<string, string | number> & {
    pingID: string;
    pingTimestamp: number;
};

type ConciergeReasoningEvent = {
    reasoning: string;
    agentZeroRequestID: string;
    loopCount: number;
};

type PusherEventMap = {
    [TYPE.USER_IS_TYPING]: UserIsTypingEvent;
    [TYPE.USER_IS_LEAVING_ROOM]: UserIsLeavingRoomEvent;
    [TYPE.PONG]: PingPongEvent;
    [TYPE.CONCIERGE_REASONING]: ConciergeReasoningEvent;
};

type EventData<EventName extends string> = {chunk?: string; id?: string; index?: number; final?: boolean} & (EventName extends keyof PusherEventMap
    ? PusherEventMap[EventName]
    : OnyxUpdatesFromServer);

type EventCallbackError = {type?: ValueOf<typeof CONST.ERROR>; data: {code?: number; message?: string}};

type ChunkedDataEvents = {chunks: unknown[]; receivedFinal: boolean};

type SocketEventCallback = (eventName: SocketEventName, data?: States | EventCallbackError) => void;

type PusherWithAuthParams = InstanceType<typeof PusherClass> & {
    config: {
        auth?: {
            params?: unknown;
        };
    };
};

type PusherEventName = LiteralUnion<DeepValueOf<typeof TYPE>, string>;

type PusherSubscriptionErrorData = {type?: string; error?: string; status?: string};

type PusherModule = {
    init: (args: Args) => Promise<void>;
    subscribe: <EventName extends PusherEventName>(
        channelName: string,
        eventName?: EventName,
        eventCallback?: (data: EventData<EventName>) => void,
        onResubscribe?: () => void,
    ) => Promise<void>;
    unsubscribe: (channelName: string, eventName?: PusherEventName) => void;
    getChannel: (channelName: string) => Channel | PusherChannel | undefined;
    isSubscribed: (channelName: string) => boolean;
    isAlreadySubscribing: (channelName: string) => boolean;
    sendEvent: <EventName extends PusherEventName>(channelName: string, eventName: EventName, payload: EventData<EventName>) => void;
    disconnect: () => void;
    reconnect: () => void;
    registerSocketEventCallback: (cb: SocketEventCallback) => void;
    registerCustomAuthorizer?: (authorizer: ChannelAuthorizerGenerator) => void;
    getPusherSocketID: () => string | undefined;
    TYPE: typeof TYPE;
};

export default PusherModule;

export type {
    SocketEventName,
    States,
    Args,
    UserIsTypingEvent,
    UserIsLeavingRoomEvent,
    PingPongEvent,
    ConciergeReasoningEvent,
    EventData,
    EventCallbackError,
    ChunkedDataEvents,
    SocketEventCallback,
    PusherWithAuthParams,
    PusherEventName,
    PusherSubscriptionErrorData,
};
