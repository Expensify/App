import * as Url from '@src/libs/Url';
import ROUTES from '@src/ROUTES';

type ReportRouteParams = {
    reportID: string;
    isSubReportPageRoute: boolean;
};

function parseReportRouteParams(route: string): ReportRouteParams {
    let parsingRoute = route;
    if (parsingRoute.at(0) === '/') {
        // remove the first slash
        parsingRoute = parsingRoute.slice(1);
    }

    if (!parsingRoute.startsWith(Url.addTrailingForwardSlash(ROUTES.REPORT))) {
        return {reportID: '', isSubReportPageRoute: false};
    }

    const pathSegments = parsingRoute.split('/');

    const reportIDSegment = pathSegments.at(1);
    const hasRouteReportActionID = !Number.isNaN(Number(reportIDSegment));

    // Check for "undefined" or any other unwanted string values
    if (!reportIDSegment || reportIDSegment === 'undefined') {
        return {reportID: '', isSubReportPageRoute: false};
    }

    return {
        reportID: reportIDSegment,
        isSubReportPageRoute: pathSegments.length > 2 && !hasRouteReportActionID,
    };
}
function getReportIDFromUrl(url: string): string {
    const currentParams = new URLSearchParams(url);
    const currentExitToRoute = currentParams.get('exitTo') ?? '';
    const {reportID} = parseReportRouteParams(currentExitToRoute);

    return reportID;
}

export {getReportIDFromUrl, parseReportRouteParams};
