import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import findMatchingDynamicSuffix from '@libs/Navigation/helpers/dynamicRoutesUtils/findMatchingDynamicSuffix';
import getPathWithoutDynamicSuffix from '@libs/Navigation/helpers/dynamicRoutesUtils/getPathWithoutDynamicSuffix';
import splitPathAndQuery from '@libs/Navigation/helpers/dynamicRoutesUtils/splitPathAndQuery';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES, {DYNAMIC_ROUTES, type DynamicRouteSuffix, type Route} from '@src/ROUTES';

const TRANSACTION_DUPLICATE_SUFFIXES = new Set<string>([
    DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW.path,
    DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW_MERCHANT.path,
    DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW_CATEGORY.path,
    DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW_TAG.path,
    DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW_DESCRIPTION.path,
    DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW_TAX_CODE.path,
    DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW_REIMBURSABLE.path,
    DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_REVIEW_BILLABLE.path,
    DYNAMIC_ROUTES.TRANSACTION_DUPLICATE_CONFIRMATION.path,
]);

type TransactionDuplicateRouteParams = {
    threadReportID?: string;
    reportID?: string;
};

function isTransactionDuplicateSuffix(pattern: string) {
    return TRANSACTION_DUPLICATE_SUFFIXES.has(pattern);
}

function getTransactionDuplicateThreadReportID(params: TransactionDuplicateRouteParams) {
    return params.threadReportID ?? params.reportID ?? '';
}

function getTransactionDuplicateFlowBasePath(threadReportID: string): Route {
    const activeRoute = Navigation.getActiveRoute();
    const pathWithoutLeadingSlash = activeRoute.replaceAll(/^\/+/g, '');
    const match = findMatchingDynamicSuffix(pathWithoutLeadingSlash);

    if (match && isTransactionDuplicateSuffix(match.pattern)) {
        return getPathWithoutDynamicSuffix(pathWithoutLeadingSlash, match.actualSuffix, match.pattern);
    }

    return ROUTES.REPORT_WITH_ID.getRoute(threadReportID);
}

function getTransactionDuplicateRoute(dynamicRouteSuffix: DynamicRouteSuffix, threadReportID: string): Route {
    return createDynamicRoute(dynamicRouteSuffix, getTransactionDuplicateFlowBasePath(threadReportID));
}

function getTransactionDuplicateEntryBasePath(threadReportID: string, backTo?: string): Route {
    if (backTo) {
        return ROUTES.REPORT_WITH_ID.getRoute(threadReportID, undefined, backTo);
    }

    return getTransactionDuplicateFlowBasePath(threadReportID);
}

function getTransactionDuplicateExitBackPath(backPath: Route): Route {
    const [, query] = splitPathAndQuery(backPath);
    if (!query) {
        return backPath;
    }

    const backTo = new URLSearchParams(query).get('backTo');
    if (!backTo) {
        return backPath;
    }

    try {
        return decodeURIComponent(backTo) as Route;
    } catch {
        return backTo as Route;
    }
}

function isActiveRouteInTransactionDuplicateFlow() {
    const activeRoute = Navigation.getActiveRoute();
    return activeRoute.includes('/duplicates/review') || activeRoute.includes('/duplicates/confirm');
}

export {
    getTransactionDuplicateEntryBasePath,
    getTransactionDuplicateExitBackPath,
    getTransactionDuplicateFlowBasePath,
    getTransactionDuplicateRoute,
    getTransactionDuplicateThreadReportID,
    isActiveRouteInTransactionDuplicateFlow,
};
