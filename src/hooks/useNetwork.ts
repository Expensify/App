import {useEffect, useRef} from 'react';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

type UseNetworkProps = {
    onReconnect?: () => void;
};

type UseNetwork = {isOffline: boolean; lastOfflineAt?: Date};

export default function useNetwork({onReconnect = () => {}}: UseNetworkProps = {}): UseNetwork {
    const callback = useRef(onReconnect);
    // eslint-disable-next-line react-compiler/react-compiler
    callback.current = onReconnect;

    const [network] = useOnyx(ONYXKEYS.NETWORK, {
        selector: (networkData) => {
            if (!networkData) {
                return {...CONST.DEFAULT_NETWORK_DATA, networkStatus: CONST.NETWORK.NETWORK_STATUS.UNKNOWN};
            }

            return {
                isOffline: networkData.isOffline,
                networkStatus: networkData.networkStatus,
                lastOfflineAt: networkData.lastOfflineAt,
            };
        },
        canBeMissing: true,
    });

    // Extract values with proper defaults
    const isOffline = network?.isOffline ?? false;
    const networkStatus = network?.networkStatus;
    const lastOfflineAt = network?.lastOfflineAt;

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
    return {isOffline: networkStatus === CONST.NETWORK.NETWORK_STATUS.UNKNOWN ? false : isOffline, lastOfflineAt};
}
