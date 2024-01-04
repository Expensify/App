import type PusherClass from 'pusher-js/with-encryption';
import type {LiteralUnion} from 'type-fest';

type Pusher = typeof PusherClass;

type SocketEventName = LiteralUnion<'error' | 'connected' | 'disconnected' | 'state_change', string>;

export default Pusher;

export type {SocketEventName};
