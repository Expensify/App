import {useEffect, useRef, useSyncExternalStore} from 'react';
import {getIsOffline, getLastOfflineAt, subscribe} from '@libs/NetworkState';

type UseNetworkProps = {
    onReconnect?: () => void;
};

type UseNetwork = {isOffline: boolean; lastOfflineAt?: string};

export default function useNetwork({onReconnect = () => {}}: UseNetworkProps = {}): UseNetwork {
    const callback = useRef(onReconnect);
    useEffect(() => {
        callback.current = onReconnect;
    });

    const isOffline = useSyncExternalStore(subscribe, getIsOffline);
    const lastOfflineAt = useSyncExternalStore(subscribe, getLastOfflineAt);

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

    return {isOffline, lastOfflineAt};
}
