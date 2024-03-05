import getReportIDfromUrl from './getReportIDfromUrl';

export default function processReportIDDeeplink(url: string): string {
    return getReportIDfromUrl(url);
}
