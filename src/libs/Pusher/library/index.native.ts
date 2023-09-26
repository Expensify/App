/**
 * We use the pusher-js/react-native module to support pusher on native environments.
 * @see: https://github.com/pusher/pusher-js
 */
import PusherNative from 'pusher-js/react-native';
import Pusher from './types';

export default PusherNative satisfies Pusher;
