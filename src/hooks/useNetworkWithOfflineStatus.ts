import {useDeferredValue, useEffect, useMemo, useState} from 'react';
import DateUtils from '@libs/DateUtils';
import useLocalize from './useLocalize';
import useNetwork from './useNetwork';

type UseNetworkWithOfflineStatus = {isOffline: boolean; lastOfflineAt?: Date; lastOnlineAt?: Date};

export default function useNetworkWithOfflineStatus(): UseNetworkWithOfflineStatus {
    const {isOffline} = useNetwork();
    const {preferredLocale} = useLocalize();

    // Used to get the last time the user went offline.
    // Set to a JS Date object if the user was offline before, otherwise undefined.
    const [lastOfflineAt, setLastOfflineAt] = useState(() => (isOffline ? DateUtils.getLocalDateFromDatetime(preferredLocale) : undefined));
    useEffect(() => {
        if (!isOffline) {
            return;
        }
        setLastOfflineAt(DateUtils.getLocalDateFromDatetime(preferredLocale));
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOffline]);

    // Used to get the last time the user went back online after being offline.
    // Set to a JS Date object if the user was online before, otherwise undefined.
    const [lastOnlineAt, setLastOnlineAt] = useState(() => (isOffline ? undefined : DateUtils.getLocalDateFromDatetime(preferredLocale)));
    useEffect(() => {
        if (isOffline) {
            return;
        }
        setLastOnlineAt(DateUtils.getLocalDateFromDatetime(preferredLocale));
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOffline]);

    const lastOfflineAtDeferred = useDeferredValue(lastOfflineAt);
    const lastOnlineAtDeferred = useDeferredValue(lastOnlineAt);

    return useMemo(() => ({isOffline, lastOfflineAt: lastOfflineAtDeferred, lastOnlineAt: lastOnlineAtDeferred}), [isOffline, lastOfflineAtDeferred, lastOnlineAtDeferred]);
}
