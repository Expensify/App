import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import Log from './Log';
import Navigation from './Navigation/Navigation';

type RouteMapping = {
    /** Condition that determines if this route mapping applies to the current active route */
    check: (activeRoute: string) => boolean;

    /** Navigates to the appropriate verification route when the check condition is met */
    navigate: () => void;
};

const handleRouteVerification = (reportID: string | undefined, chatReportID: string) => {
    const routeMappings: RouteMapping[] = [
        {
            check: (activeRoute: string) => activeRoute.includes(ROUTES.SEARCH_ROOT.getRoute({query: ''})),
            navigate: () => Navigation.navigate(ROUTES.SEARCH_ROOT_VERIFY_ACCOUNT),
        },
        {
            check: (activeRoute: string) => reportID !== undefined && activeRoute.includes(ROUTES.SEARCH_REPORT.getRoute({reportID})),
            navigate: () => {
                if (reportID === undefined) {
                    return;
                }
                Navigation.navigate(ROUTES.SEARCH_REPORT_VERIFY_ACCOUNT.getRoute(reportID));
            },
        },
        {
            check: (activeRoute: string) => reportID !== undefined && activeRoute.includes(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID})),
            navigate: () => {
                if (reportID === undefined) {
                    return;
                }
                Navigation.navigate(ROUTES.SEARCH_MONEY_REQUEST_REPORT_VERIFY_ACCOUNT.getRoute(reportID));
            },
        },
        {
            check: (activeRoute: string) => activeRoute.includes(ROUTES.REPORT_WITH_ID.getRoute(chatReportID)),
            navigate: () => Navigation.navigate(ROUTES.REPORT_VERIFY_ACCOUNT.getRoute(chatReportID)),
        },
        {
            check: (activeRoute: string) => reportID !== undefined && activeRoute.includes(ROUTES.REPORT_WITH_ID.getRoute(reportID)),
            navigate: () => {
                if (reportID === undefined) {
                    return;
                }
                Navigation.navigate(ROUTES.REPORT_VERIFY_ACCOUNT.getRoute(reportID));
            },
        },
        {
            check: (activeRoute: string) =>
                activeRoute.includes(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.PAY, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, chatReportID)),
            navigate: () =>
                Navigation.navigate(
                    ROUTES.MONEY_REQUEST_STEP_CONFIRMATION_VERIFY_ACCOUNT.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.PAY, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, chatReportID),
                ),
        },
        {
            check: (activeRoute: string) =>
                activeRoute.includes(ROUTES.MONEY_REQUEST_CREATE.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.PAY, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, chatReportID)),
            navigate: () =>
                Navigation.navigate(ROUTES.MONEY_REQUEST_CREATE_VERIFY_ACCOUNT.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.PAY, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, chatReportID)),
        },
    ];

    const activeRoute = Navigation.getActiveRoute();
    const matchedRoute = routeMappings.find((mapping) => mapping.check(activeRoute));

    if (matchedRoute) {
        matchedRoute.navigate();
    } else {
        Log.warn('Failed to navigate to the correct path');
    }
};

export default handleRouteVerification;
