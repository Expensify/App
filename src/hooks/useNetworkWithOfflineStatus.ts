import type {MutableRefObject} from 'react';
import {useEffect, useRef} from 'react';
import DateUtils from '@libs/DateUtils';
import useLocalize from './useLocalize';
import useNetwork from './useNetwork';

type UseNetworkWithOfflineStatus = {isOffline: boolean; lastOfflineAt: MutableRefObject<Date | undefined>; lastOnlineAt: MutableRefObject<Date | undefined>};

export default function useNetworkWithOfflineStatus(): UseNetworkWithOfflineStatus {
    const {isOffline} = useNetwork();
    const {preferredLocale} = useLocalize();

    // Used to get the last time the user went offline.
    // Set to a JS Date object if the user was offline before, otherwise undefined.
    const lastOfflineAt = useRef(isOffline ? DateUtils.getLocalDateFromDatetime(preferredLocale) : undefined);
    useEffect(() => {
        if (!isOffline) {
            return;
        }
        lastOfflineAt.current = DateUtils.getLocalDateFromDatetime(preferredLocale);
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOffline]);

    // Used to get the last time the user went back online after being offline.
    // Set to a JS Date object if the user was online before, otherwise undefined.
    const lastOnlineAt = useRef(isOffline ? undefined : DateUtils.getLocalDateFromDatetime(preferredLocale));
    useEffect(() => {
        if (isOffline) {
            return;
        }
        lastOnlineAt.current = DateUtils.getLocalDateFromDatetime(preferredLocale);
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOffline]);

    return {isOffline, lastOfflineAt, lastOnlineAt};
}
