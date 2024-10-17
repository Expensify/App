import {useContext, useEffect, useMemo, useRef, useState} from 'react';
import {NetworkContext} from '@components/OnyxProvider';
import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';
import useLocalize from './useLocalize';

type UseNetworkProps = {
    onReconnect?: () => void;
};

type UseNetwork = {isOffline: boolean; lastOfflineAt?: Date; lastOnlineAt?: Date};

export default function useNetwork({onReconnect = () => {}}: UseNetworkProps = {}): UseNetwork {
    const callback = useRef(onReconnect);
    callback.current = onReconnect;

    const {preferredLocale} = useLocalize();
    const {isOffline: isOfflineContext, networkStatus} = useContext(NetworkContext) ?? {...CONST.DEFAULT_NETWORK_DATA, networkStatus: CONST.NETWORK.NETWORK_STATUS.UNKNOWN};
    const prevOfflineStatusRef = useRef(isOfflineContext);
    useEffect(() => {
        // If we were offline before and now we are not offline then we just reconnected
        const didReconnect = prevOfflineStatusRef.current && !isOfflineContext;
        if (!didReconnect) {
            return;
        }

        callback.current();
    }, [isOfflineContext]);

    useEffect(() => {
        // Used to store previous prop values to compare on next render
        prevOfflineStatusRef.current = isOfflineContext;
    }, [isOfflineContext]);

    // If the network status is undefined, we don't treat it as offline. Otherwise, we utilize the isOffline prop.
    const isOffline = useMemo(() => (networkStatus === CONST.NETWORK.NETWORK_STATUS.UNKNOWN ? false : isOfflineContext), [isOfflineContext, networkStatus]);

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

    return useMemo(() => ({isOffline, lastOfflineAt, lastOnlineAt}), [isOffline, lastOfflineAt, lastOnlineAt]);
}
