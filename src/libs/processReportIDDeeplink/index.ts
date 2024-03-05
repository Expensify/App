import getReportIDfromUrl from './getReportIDfromUrl';

export default function processReportIDDeeplink(url: string) {
    return getReportIDfromUrl(url);
}
