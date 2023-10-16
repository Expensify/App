import PusherClass from 'pusher-js/with-encryption';
import {LiteralUnion} from 'type-fest';

type Pusher = typeof PusherClass;

type SocketEventName = LiteralUnion<'error' | 'connected' | 'disconnected' | 'state_change', string>;

export default Pusher;

export type {SocketEventName};
