import {parseReportRouteParams} from '@libs/ReportUtils';

export default function getReportIDFromUrl(url: string): string {
    const currentParams = new URLSearchParams(url);
    const currentExitToRoute = currentParams.get('exitTo') ?? '';
    const {reportID} = parseReportRouteParams(currentExitToRoute);

    return reportID;
}
