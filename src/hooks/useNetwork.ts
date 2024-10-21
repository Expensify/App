import {useContext, useEffect, useRef} from 'react';
import {NetworkContext} from '@components/OnyxProvider';
import CONST from '@src/CONST';

type UseNetworkProps = {
    onReconnect?: () => void;
};

type UseNetwork = {isOffline: boolean};

export default function useNetwork({onReconnect = () => {}}: UseNetworkProps = {}): UseNetwork {
    const callback = useRef(onReconnect);
    callback.current = onReconnect;

    const {isOffline, networkStatus} = useContext(NetworkContext) ?? {...CONST.DEFAULT_NETWORK_DATA, networkStatus: CONST.NETWORK.NETWORK_STATUS.UNKNOWN};
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

    // If the network status is undefined, we don't treat it as offline. Otherwise, we utilize the isOffline prop.
    return {isOffline: networkStatus === CONST.NETWORK.NETWORK_STATUS.UNKNOWN ? false : isOffline};
}
