import NetInfo from '@react-native-community/netinfo';
import Ion from './Ion';
import IONKEYS from '../IONKEYS';
import EventEmitter from './EventEmitter';

export const CONNECTED = 'connected';
export const DISCONNECTED = 'disconnected';

const Connection = new EventEmitter();

let previousIsConnected;

NetInfo.fetch()
    .then((initialState) => {
        previousIsConnected = initialState.isConnected;
        Ion.merge(IONKEYS.NETWORK, {isOffline: !initialState.isConnected});

        NetInfo.addEventListener((state) => {
            // We moved from disconnected to connected fire reconnection callbacks
            if (!previousIsConnected && state.isConnected) {
                Connection.emit(CONNECTED);
            }

            previousIsConnected = state.isConnected;
            Ion.merge(IONKEYS.NETWORK, {isOffline: !state.isConnected});
        });
    });

export default Connection;
