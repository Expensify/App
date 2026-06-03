import {differenceInMilliseconds} from 'date-fns/differenceInMilliseconds';
import {useErrorBoundary} from 'react-error-boundary';
import clearWorkboxRecoveryCaches from '@libs/clearWorkboxRecoveryCaches';
import reloadWithCacheBust from '@libs/reloadWithCacheBust';
import CONST from '@src/CONST';
import type UsePageRefresh from './type';

const usePageRefresh: UsePageRefresh = () => {
    const {resetBoundary} = useErrorBoundary();

    return (isChunkLoadError?: boolean) => {
        const lastRefreshTimestamp = JSON.parse(sessionStorage.getItem(CONST.SESSION_STORAGE_KEYS.LAST_REFRESH_TIMESTAMP) ?? 'null') as string;

        if (!isChunkLoadError && (lastRefreshTimestamp === null || differenceInMilliseconds(Date.now(), Number(lastRefreshTimestamp)) > CONST.ERROR_WINDOW_RELOAD_TIMEOUT)) {
            resetBoundary();
            sessionStorage.setItem(CONST.SESSION_STORAGE_KEYS.LAST_REFRESH_TIMESTAMP, Date.now().toString());

            return;
        }

        sessionStorage.removeItem(CONST.SESSION_STORAGE_KEYS.LAST_REFRESH_TIMESTAMP);
        clearWorkboxRecoveryCaches().then(() => reloadWithCacheBust());
    };
};

export default usePageRefresh;
