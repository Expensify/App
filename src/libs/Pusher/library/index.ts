/**
 * We use the standard pusher-js module to support pusher on web environments.
 * @see: https://github.com/pusher/pusher-js
 */
import PusherImplementation from 'pusher-js/with-encryption';
import type Pusher from './types';

const PusherWeb: Pusher = PusherImplementation;

export default PusherWeb;
