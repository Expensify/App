import differenceInMilliseconds from 'date-fns/differenceInMilliseconds';
import CONST from '@src/CONST';

export default function refreshPage(resetBoundary: () => void) {
    const lastRefreshTimestamp = JSON.parse(sessionStorage.getItem(CONST.SESSION_STORAGE_KEYS.LAST_REFRESH_TIMESTAMP) ?? 'null') as string;

    if (lastRefreshTimestamp === null || differenceInMilliseconds(Date.now(), Number(lastRefreshTimestamp)) > CONST.ERROR_WINDOW_RELOAD_TIMEOUT) {
        resetBoundary();
        sessionStorage.setItem(CONST.SESSION_STORAGE_KEYS.LAST_REFRESH_TIMESTAMP, Date.now().toString());

        return;
    }

    window.location.reload();
    sessionStorage.removeItem(CONST.SESSION_STORAGE_KEYS.LAST_REFRESH_TIMESTAMP);
}
