import type {RefObject} from 'react';
import {useEffect, useRef} from 'react';
import useLocalize from './useLocalize';
import useNetwork from './useNetwork';
import usePrevious from './usePrevious';

type UseNetworkWithOfflineStatus = {isOffline: boolean; lastOfflineAt: RefObject<Date | undefined>; lastOnlineAt: RefObject<Date | undefined>};

export default function useNetworkWithOfflineStatus(): UseNetworkWithOfflineStatus {
    const {isOffline, lastOfflineAt: lastOfflineAtFromOnyx} = useNetwork();
    const prevIsOffline = usePrevious(isOffline);
    const {getLocalDateFromDatetime} = useLocalize();

    // The last time/date the user went/was offline. If the user was never offline, it is set to undefined.
    const lastOfflineAt = useRef(isOffline ? getLocalDateFromDatetime(lastOfflineAtFromOnyx) : undefined);

    // The last time/date the user went/was online. If the user was never online, it is set to undefined.
    const lastOnlineAt = useRef(isOffline ? undefined : getLocalDateFromDatetime());

    useEffect(() => {
        // If the user has just gone offline (was online before but is now offline), update `lastOfflineAt` with the current local date/time.
        if (isOffline && !prevIsOffline) {
            lastOfflineAt.current = getLocalDateFromDatetime();
        }
        // If the user has just come back online (was offline before but is now online), update `lastOnlineAt` with the current local date/time.
        if (!isOffline && prevIsOffline) {
            lastOnlineAt.current = getLocalDateFromDatetime();
        }
    }, [isOffline, getLocalDateFromDatetime, prevIsOffline]);

    return {isOffline, lastOfflineAt, lastOnlineAt};
}
