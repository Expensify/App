import {toMarkdownLink} from '@libs/MarkdownLinkHelpers';
import ROUTES from '@src/ROUTES';

type Params = {
    reportName: string | undefined;
    reportID: string | undefined;
    canEditReport: boolean;
    activeRoute: string;
};

function getMoneyRequestViewReportTitle({reportName, reportID, canEditReport, activeRoute}: Params): string | undefined {
    if (!reportName || canEditReport || !reportID) {
        return reportName;
    }

    const normalizedActiveRoute = activeRoute.startsWith('/') ? activeRoute.slice(1) : activeRoute;
    const shouldOpenReportInSearch = normalizedActiveRoute.startsWith('search/');

    const reportRoute = shouldOpenReportInSearch ? ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID}) : ROUTES.REPORT_WITH_ID.getRoute(reportID);

    return toMarkdownLink(reportName, reportRoute);
}

export default getMoneyRequestViewReportTitle;
