import {useRef, useContext, useEffect} from 'react';
import {NetworkContext} from '../OnyxProvider';

export default function useOnNetworkReconnect(callback) {
    const {isOffline} = useContext(NetworkContext);
    const prevOfflineStatusRef = useRef(isOffline);
    useEffect(() => {
        // If we were offline before and now we are not offline then we just reconnected
        const didReconnect = prevOfflineStatusRef.current && !isOffline;
        if (!didReconnect) {
            return;
        }

        callback();
    }, [isOffline, callback]);

    useEffect(() => {
        // Used to store previous prop values to compare on next render
        prevOfflineStatusRef.current = isOffline;
    }, [isOffline]);
}
