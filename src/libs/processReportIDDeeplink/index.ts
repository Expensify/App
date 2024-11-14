import {getReportIDFromUrl} from './getReportIDFromUrl';

export default function processReportIDDeeplink(url: string): string {
    return getReportIDFromUrl(url);
}
