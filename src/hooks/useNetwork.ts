import {networkStatusSelector} from '@selectors/Network';
import {useEffect, useRef} from 'react';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

type UseNetworkProps = {
    onReconnect?: () => void;
};

type UseNetwork = {isOffline: boolean; lastOfflineAt?: string};

export default function useNetwork({onReconnect = () => {}}: UseNetworkProps = {}): UseNetwork {
    const callback = useRef(onReconnect);
    useEffect(() => {
        callback.current = onReconnect;
    });

    const [network] = useOnyx(ONYXKEYS.NETWORK, {
        selector: networkStatusSelector,
    });

    const isOffline = network?.isOffline ?? false;
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
        prevOfflineStatusRef.current = isOffline;
    }, [isOffline]);

    return {isOffline, lastOfflineAt};
}
