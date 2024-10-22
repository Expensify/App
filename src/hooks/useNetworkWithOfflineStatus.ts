import type {MutableRefObject} from 'react';
import {useEffect, useRef} from 'react';
import DateUtils from '@libs/DateUtils';
import useLocalize from './useLocalize';
import useNetwork from './useNetwork';

type UseNetworkWithOfflineStatus = {isOffline: boolean; lastOfflineAt: MutableRefObject<Date | undefined>; lastOnlineAt: MutableRefObject<Date | undefined>};

export default function useNetworkWithOfflineStatus(): UseNetworkWithOfflineStatus {
    const {isOffline} = useNetwork();
    const {preferredLocale} = useLocalize();

    // The last time/date the user went/was offline. If the user was never offline, it is set to undefined.
    const lastOfflineAt = useRef(isOffline ? DateUtils.getLocalDateFromDatetime(preferredLocale) : undefined);

    // The last time/date the user went/was online. If the user was never online, it is set to undefined.
    const lastOnlineAt = useRef(isOffline ? undefined : DateUtils.getLocalDateFromDatetime(preferredLocale));

    useEffect(() => {
        if (isOffline) {
            lastOfflineAt.current = DateUtils.getLocalDateFromDatetime(preferredLocale);
        } else {
            lastOnlineAt.current = DateUtils.getLocalDateFromDatetime(preferredLocale);
        }
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOffline]);

    return {isOffline, lastOfflineAt, lastOnlineAt};
}
