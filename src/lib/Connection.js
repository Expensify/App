import NetInfo from '@react-native-community/netinfo';
import EventEmitter from './EventEmitter';
import {setOfflineStatus} from './Network';

export const CONNECTED = 'connected';
export const DISCONNECTED = 'disconnected';

const Connection = new EventEmitter();

let previousIsConnected;

NetInfo.addEventListener((state) => {

    // We moved from disconnected to connected fire reconnection callbacks
    if (!previousIsConnected && state.isConnected) {
        Connection.emit(CONNECTED);
    }

    previousIsConnected = state.isConnected;
    setOfflineStatus(!state.isConnected);
});

export default Connection;
