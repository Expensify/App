/**
 * We use the standard pusher-js module to support pusher on web environments.
 * @see: https://github.com/pusher/pusher-js
 */
import PusherWeb from 'pusher-js/with-encryption';
import Pusher from './types';

export default PusherWeb satisfies Pusher;
