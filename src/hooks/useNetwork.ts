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
    const {isOffline, networkStatus} = useContext(NetworkContext) ?? {...CONST.DEFAULT_NETWORK_DATA, networkStatus: CONST.NETWORK.NETWORK_STATUS.UNKNOWN};
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

    const isOfflineResult = useMemo(() => (networkStatus === CONST.NETWORK.NETWORK_STATUS.UNKNOWN ? false : isOffline), [isOffline, networkStatus]);

    const [lastOfflineAt, setLastOfflineAt] = useState(() => (isOfflineResult ? DateUtils.getLocalDateFromDatetime(preferredLocale) : undefined));
    useEffect(() => {
        if (!isOffline) {
            return;
        }
        setLastOfflineAt(DateUtils.getLocalDateFromDatetime(preferredLocale));
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOffline]);

    const [lastOnlineAt, setLastOnlineAt] = useState(() => (isOfflineResult ? undefined : DateUtils.getLocalDateFromDatetime(preferredLocale)));
    useEffect(() => {
        if (isOffline) {
            return;
        }
        setLastOnlineAt(DateUtils.getLocalDateFromDatetime(preferredLocale));
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOffline]);

    // If the network status is undefined, we don't treat it as offline. Otherwise, we utilize the isOffline prop.
    return {isOffline: isOfflineResult, lastOfflineAt, lastOnlineAt};
}
