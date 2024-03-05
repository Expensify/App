import CONST from '@src/CONST';
import getReportIDfromUrl from './getReportIDfromUrl';

export default function processReportIDDeeplink(url: string): string {
    const prevUrl = sessionStorage.getItem(CONST.SESSION_STORAGE_KEYS.INITIAL_URL);
    const prevReportID = getReportIDfromUrl(prevUrl ?? '');
    const currentReportID = getReportIDfromUrl(url);

    if (currentReportID && url) {
        sessionStorage.setItem(CONST.SESSION_STORAGE_KEYS.INITIAL_URL, url);
    }

    return currentReportID || prevReportID;
}
