import type {MutableRefObject} from 'react';
import {useEffect, useRef} from 'react';
import DateUtils from '@libs/DateUtils';
import useLocalize from './useLocalize';
import useNetwork from './useNetwork';
import usePrevious from './usePrevious';

type UseNetworkWithOfflineStatus = {isOffline: boolean; lastOfflineAt: MutableRefObject<Date | undefined>; lastOnlineAt: MutableRefObject<Date | undefined>};

export default function useNetworkWithOfflineStatus(): UseNetworkWithOfflineStatus {
    const {isOffline, lastOfflineAt: lastOfflineAtFromOnyx} = useNetwork();
    const prevIsOffline = usePrevious(isOffline);
    const {preferredLocale} = useLocalize();

    // The last time/date the user went/was offline. If the user was never offline, it is set to undefined.
    const lastOfflineAt = useRef(isOffline ? lastOfflineAtFromOnyx : undefined);

    // The last time/date the user went/was online. If the user was never online, it is set to undefined.
    const lastOnlineAt = useRef(isOffline ? undefined : DateUtils.getLocalDateFromDatetime(preferredLocale));

    useEffect(() => {
        // If the user has just gone offline (was online before but is now offline), update `lastOfflineAt` with the current local date/time.
        if (isOffline && !prevIsOffline) {
            lastOfflineAt.current = DateUtils.getLocalDateFromDatetime(preferredLocale);
        }
        // If the user has just come back online (was offline before but is now online), update `lastOnlineAt` with the current local date/time.
        if (!isOffline && prevIsOffline) {
            lastOnlineAt.current = DateUtils.getLocalDateFromDatetime(preferredLocale);
        }
    }, [isOffline, preferredLocale, prevIsOffline]);

    return {isOffline, lastOfflineAt, lastOnlineAt};
}
