import * as ReportUtils from '@libs/ReportUtils';

export default function getReportIDFromUrl(url: string): string {
    const currentParams = new URLSearchParams(url);
    const currentExitToRoute = currentParams.get('exitTo') ?? '';
    const {reportID} = ReportUtils.parseReportRouteParams(currentExitToRoute);

    return reportID;
}
