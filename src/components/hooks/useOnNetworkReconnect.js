import {useRef, useContext, useEffect} from 'react';
import {NetworkContext} from '../OnyxProvider';

/**
 * @param {Function} onNetworkReconnect
 */
export default function useOnNetworkReconnect(onNetworkReconnect) {
    const callback = useRef(onNetworkReconnect);
    callback.current = onNetworkReconnect;

    const {isOffline} = useContext(NetworkContext);
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
}
