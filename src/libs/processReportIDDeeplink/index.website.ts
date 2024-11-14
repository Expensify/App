import CONST from '@src/CONST';
import {getReportIDFromUrl} from './getReportIDFromUrl';

export default function processReportIDDeeplink(url: string): string {
    const prevUrl = sessionStorage.getItem(CONST.SESSION_STORAGE_KEYS.INITIAL_URL);
    const prevReportID = getReportIDFromUrl(prevUrl ?? '');
    const currentReportID = getReportIDFromUrl(url);

    if (currentReportID && url) {
        sessionStorage.setItem(CONST.SESSION_STORAGE_KEYS.INITIAL_URL, url);
    }

    return currentReportID || prevReportID;
}
