import type {MutableRefObject} from 'react';
import {useEffect, useRef} from 'react';
import {useOnyx} from 'react-native-onyx';
import DateUtils from '@libs/DateUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import useLocalize from './useLocalize';
import useNetwork from './useNetwork';
import usePrevious from './usePrevious';

type UseNetworkWithOfflineStatus = {isOffline: boolean; lastOfflineAt: MutableRefObject<Date | undefined>; lastOnlineAt: MutableRefObject<Date | undefined>};

export default function useNetworkWithOfflineStatus(): UseNetworkWithOfflineStatus {
    const {isOffline} = useNetwork();
    const prevIsOffline = usePrevious(isOffline);
    const {preferredLocale} = useLocalize();

    const [network] = useOnyx(ONYXKEYS.NETWORK);

    // The last time/date the user went/was offline. If the user was never offline, it is set to undefined.
    const lastOfflineAt = useRef(isOffline ? network?.lastOfflineAt : undefined);

    // The last time/date the user went/was online. If the user was never online, it is set to undefined.
    const lastOnlineAt = useRef(isOffline ? undefined : DateUtils.getLocalDateFromDatetime(preferredLocale));

    useEffect(() => {
        if (isOffline && !prevIsOffline) {
            lastOfflineAt.current = DateUtils.getLocalDateFromDatetime(preferredLocale);
        }

        if (!isOffline && prevIsOffline) {
            lastOnlineAt.current = DateUtils.getLocalDateFromDatetime(preferredLocale);
        }
    }, [isOffline, preferredLocale, prevIsOffline]);

    return {isOffline, lastOfflineAt, lastOnlineAt};
}
