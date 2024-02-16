/**
 * We use the pusher-js/react-native module to support pusher on native environments.
 * @see: https://github.com/pusher/pusher-js
 */
import PusherImplementation from 'pusher-js/react-native';
import type Pusher from './types';

const PusherNative: Pusher = PusherImplementation;

export default PusherNative;
