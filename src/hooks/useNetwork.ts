import {networkStatusSelector} from '@selectors/Network';
import {useEffect, useRef} from 'react';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

type UseNetworkProps = {
    onReconnect?: () => void;
};

type UseNetwork = {isOffline: boolean; lastOfflineAt?: string};

export default function useNetwork({onReconnect = () => {}}: UseNetworkProps = {}): UseNetwork {
    const callback = useRef(onReconnect);
    callback.current = onReconnect;

    const [network] = useOnyx(ONYXKEYS.NETWORK, {
        selector: networkStatusSelector,
        canBeMissing: true,
    });

    // Extract values with proper defaults
    const isOffline = network?.isOffline ?? false;
    const shouldForceOffline = network?.shouldForceOffline ?? false;
    const shouldFailAllRequests = network?.shouldFailAllRequests ?? false;
    const networkStatus = network?.networkStatus;
    const lastOfflineAt = network?.lastOfflineAt;

    const isOfflineEffective = isOffline || shouldForceOffline || shouldFailAllRequests;

    const prevOfflineStatusRef = useRef(isOfflineEffective);
    useEffect(() => {
        // If we were offline before and now we are not offline then we just reconnected
        const didReconnect = prevOfflineStatusRef.current && !isOfflineEffective;
        if (!didReconnect) {
            return;
        }

        callback.current();
    }, [isOfflineEffective]);

    useEffect(() => {
        // Used to store previous prop values to compare on next render
        prevOfflineStatusRef.current = isOfflineEffective;
    }, [isOfflineEffective]);

    // If the network status is undefined, we don't treat it as offline. Otherwise, we utilize the isOffline prop.
    return {isOffline: networkStatus === CONST.NETWORK.NETWORK_STATUS.UNKNOWN ? false : isOfflineEffective, lastOfflineAt};
}
