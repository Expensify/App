import {useContext, useEffect, useRef} from 'react';
import {NetworkContext} from '@components/OnyxProvider';
import CONST from '@src/CONST';

type UseNetworkProps = {
    onReconnect?: () => void;
};

type UseNetwork = {isOffline: boolean; isBackendReachable: boolean};

export default function useNetwork({onReconnect = () => {}}: UseNetworkProps = {}): UseNetwork {
    const callback = useRef(onReconnect);
    callback.current = onReconnect;

    const {isOffline, networkStatus, isBackendReachable} = useContext(NetworkContext) ?? {...CONST.DEFAULT_NETWORK_DATA, networkStatus: CONST.NETWORK.NETWORK_STATUS.UNKNOWN};
    const isNetworkStatusUnknown = networkStatus === CONST.NETWORK.NETWORK_STATUS.UNKNOWN;
    const prevOfflineStatusRef = useRef(isOffline);
    useEffect(() => {
        // If we were offline before and now we are not offline then we just reconnected
        const didReconnect = prevOfflineStatusRef.current && !isOffline;
        if (!didReconnect) {
            return;
        }

        callback.current();
    }, [isOffline]);

    useEffect(() => {
        // Used to store previous prop values to compare on next render
        prevOfflineStatusRef.current = isOffline;
    }, [isOffline]);

    // If the network status is unknown, we fallback to default state, i.e. we're online and backend is reachable.
    return isNetworkStatusUnknown ? CONST.DEFAULT_NETWORK_DATA : {isOffline, isBackendReachable};
}
