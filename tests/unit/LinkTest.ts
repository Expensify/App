import {canAnonymousUserAccessRoute, isAnonymousUser} from '@libs/actions/Session';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import REPORT_LINK_ROUTE_PARAMS from '@libs/Navigation/reportLinkRouteParams';
import * as Url from '@libs/Url';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import {openLink} from '@src/libs/actions/Link';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type {NavigationState} from '@react-navigation/native';

const mockReports: Record<string, {isMoneyRequest?: boolean}> = {};
type ReportUtilsMock = Record<string, unknown> & {
    getReportOrDraftReport: (reportID: string) => {isMoneyRequest?: boolean} | undefined;
    isMoneyRequestReport: (report: {isMoneyRequest?: boolean} | undefined) => boolean;
};

jest.mock('@libs/getIsNarrowLayout', () => jest.fn());
jest.mock('@libs/Navigation/helpers/swapBackgroundTabForRHPTarget', () => jest.fn());
jest.mock('@libs/Navigation/navigationRef', () => ({
    __esModule: true,
    default: {
        getRootState: jest.fn(),
    },
}));
jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        closeRHPFlow: jest.fn(),
        getActiveRoute: jest.fn(),
        navigate: jest.fn(),
        setParams: jest.fn(),
    },
}));
jest.mock('@libs/actions/Session', () => ({
    canAnonymousUserAccessRoute: jest.fn(() => true),
    isAnonymousUser: jest.fn(() => false),
    signOutAndRedirectToSignIn: jest.fn(),
    waitForUserSignIn: jest.fn(),
}));
jest.mock('@libs/ReportUtils', () => {
    const actual = jest.requireActual<ReportUtilsMock>('@libs/ReportUtils');

    return {
        ...actual,
        getReportOrDraftReport: jest.fn((reportID: string) => mockReports[reportID]),
        isMoneyRequestReport: jest.fn((report: {isMoneyRequest?: boolean} | undefined) => !!report?.isMoneyRequest),
    };
});

const mockedGetIsNarrowLayout = jest.mocked(getIsNarrowLayout);
const mockedNavigation = jest.mocked(Navigation);
const mockedNavigationRef = jest.mocked(navigationRef);
const mockedCanAnonymousUserAccessRoute = jest.mocked(canAnonymousUserAccessRoute);
const mockedIsAnonymousUser = jest.mocked(isAnonymousUser);

function buildNavigationState(key: string, routes: NavigationState['routes'], index = routes.length - 1): NavigationState {
    return {
        stale: false,
        type: 'stack',
        key,
        index,
        routeNames: routes.map((route) => route.name),
        routes,
    };
}

function buildRootState({
    centralReportID = 'current-report',
    activeTab = NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
    isRHPOpen = false,
    focusedRootNavigator,
    rhpReportID = 'rhp-report',
    rhpReportActionID,
}: {centralReportID?: string; activeTab?: string; isRHPOpen?: boolean; focusedRootNavigator?: string; rhpReportID?: string; rhpReportActionID?: string} = {}) {
    const tabRoutes: NavigationState['routes'] = [
        {
            key: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
            name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
            state: buildNavigationState(`${NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}-state`, [
                {
                    key: `${SCREENS.REPORT}-${centralReportID}`,
                    name: SCREENS.REPORT,
                    params: {reportID: centralReportID},
                },
            ]),
        },
    ];
    if (activeTab !== NAVIGATORS.REPORTS_SPLIT_NAVIGATOR) {
        tabRoutes.push({
            key: activeTab,
            name: activeTab,
            state: buildNavigationState(`${activeTab}-state`, [
                {
                    key: activeTab,
                    name: activeTab,
                },
            ]),
        });
    }

    const routes: NavigationState['routes'] = [
        {
            key: NAVIGATORS.TAB_NAVIGATOR,
            name: NAVIGATORS.TAB_NAVIGATOR,
            state: buildNavigationState(`${NAVIGATORS.TAB_NAVIGATOR}-state`, tabRoutes, activeTab === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR ? 0 : 1),
        },
    ];

    if (isRHPOpen) {
        routes.push({
            key: NAVIGATORS.RIGHT_MODAL_NAVIGATOR,
            name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR,
            state: buildNavigationState(`${NAVIGATORS.RIGHT_MODAL_NAVIGATOR}-state`, [
                {
                    key: `${SCREENS.RIGHT_MODAL.SEARCH_REPORT}-rhp-report`,
                    name: SCREENS.RIGHT_MODAL.SEARCH_REPORT,
                    params: {reportID: rhpReportID, ...(rhpReportActionID ? {reportActionID: rhpReportActionID} : {})},
                },
            ]),
        });
    }

    if (focusedRootNavigator) {
        routes.push({
            key: focusedRootNavigator,
            name: focusedRootNavigator,
            state: buildNavigationState(`${focusedRootNavigator}-state`, [
                {
                    key: focusedRootNavigator,
                    name: focusedRootNavigator,
                },
            ]),
        });
    }

    return buildNavigationState('root', routes);
}

describe('Link.openLink', () => {
    const environmentURL = CONST.NEW_EXPENSIFY_URL;
    const activeRoute = ROUTES.REPORT_WITH_ID.getRoute('current-report');

    beforeEach(() => {
        jest.clearAllMocks();
        for (const reportID of Object.keys(mockReports)) {
            delete mockReports[reportID];
        }
        mockedGetIsNarrowLayout.mockReturnValue(false);
        mockedCanAnonymousUserAccessRoute.mockReturnValue(true);
        mockedIsAnonymousUser.mockReturnValue(false);
        mockedNavigation.getActiveRoute.mockReturnValue(activeRoute);
        mockedNavigationRef.getRootState.mockReturnValue(buildRootState());
    });

    it('opens a regular report link in the RHP on wide layout and preserves the report action', () => {
        openLink(`${CONST.NEW_EXPENSIFY_URL}/r/regular-report/123456789`, environmentURL);

        expect(Navigation.navigate).toHaveBeenCalledWith(
            ROUTES.SEARCH_REPORT.getRoute({
                reportID: 'regular-report',
                reportActionID: '123456789',
                backTo: activeRoute,
            }),
        );
        expect(Navigation.closeRHPFlow).not.toHaveBeenCalled();
    });

    it('marks uncached plain report links so loaded expenses can move to the expense RHP', () => {
        openLink(`${CONST.NEW_EXPENSIFY_URL}/r/uncached-report`, environmentURL);

        expect(Navigation.navigate).toHaveBeenCalledWith(
            Url.appendParam(
                ROUTES.SEARCH_REPORT.getRoute({
                    reportID: 'uncached-report',
                    backTo: activeRoute,
                }),
                REPORT_LINK_ROUTE_PARAMS.SHOULD_REPLACE_WITH_EXPENSE_REPORT_RHP,
                'true',
            ),
        );
    });

    it('opens an expense report link in the expense RHP on wide layout', () => {
        mockReports['expense-report'] = {isMoneyRequest: true};

        openLink(`${CONST.NEW_EXPENSIFY_URL}/r/expense-report`, environmentURL);

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID: 'expense-report', backTo: activeRoute}));
    });

    it('opens expense report action links in the report RHP so the linked action is preserved', () => {
        mockReports['expense-report'] = {isMoneyRequest: true};

        openLink(`${CONST.NEW_EXPENSIFY_URL}/r/expense-report/123456789`, environmentURL);

        expect(Navigation.navigate).toHaveBeenCalledWith(
            ROUTES.SEARCH_REPORT.getRoute({
                reportID: 'expense-report',
                reportActionID: '123456789',
                backTo: activeRoute,
            }),
        );
    });

    it('opens legacy Concierge report links in the RHP on wide layout', () => {
        openLink(`${CONFIG.EXPENSIFY.EXPENSIFY_URL}/newdotreport?reportID=legacy-report`, environmentURL);

        expect(Navigation.navigate).toHaveBeenCalledWith(
            Url.appendParam(
                ROUTES.SEARCH_REPORT.getRoute({
                    reportID: 'legacy-report',
                    backTo: activeRoute,
                }),
                REPORT_LINK_ROUTE_PARAMS.SHOULD_REPLACE_WITH_EXPENSE_REPORT_RHP,
                'true',
            ),
        );
    });

    it('keeps report links on the standard full-screen navigation on narrow layout', () => {
        mockedGetIsNarrowLayout.mockReturnValue(true);

        openLink(`${CONST.NEW_EXPENSIFY_URL}/r/regular-report/123456789`, environmentURL);

        // On narrow layouts the report-link RHP handling does not apply; the link falls through to the standard
        // internal-link handling and navigates exactly as it did before this feature.
        expect(Navigation.navigate).toHaveBeenCalledWith('/r/regular-report/123456789');
    });

    it('keeps legacy Concierge report links navigating internally on narrow layout', () => {
        mockedGetIsNarrowLayout.mockReturnValue(true);

        openLink(`${CONFIG.EXPENSIFY.EXPENSIFY_URL}/newdotreport?reportID=legacy-report`, environmentURL);

        // Legacy `newdotreport` links have no parseable internal path, so on narrow layouts they must keep the
        // explicit report navigation instead of falling back to OldDot link handling.
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute('legacy-report'));
    });

    it('does not update the focused RHP report action on narrow layout and keeps the standard navigation', () => {
        mockedGetIsNarrowLayout.mockReturnValue(true);
        mockedNavigationRef.getRootState.mockReturnValue(buildRootState({isRHPOpen: true, rhpReportID: 'regular-report', rhpReportActionID: '123456789'}));

        openLink(`${CONST.NEW_EXPENSIFY_URL}/r/regular-report/987654321`, environmentURL);

        expect(Navigation.setParams).not.toHaveBeenCalled();
        expect(Navigation.closeRHPFlow).not.toHaveBeenCalled();
        expect(Navigation.navigate).toHaveBeenCalledWith('/r/regular-report/987654321');
    });

    it('keeps report links as full-screen report routes for anonymous users on wide layout', () => {
        mockedIsAnonymousUser.mockReturnValue(true);

        openLink(`${CONST.NEW_EXPENSIFY_URL}/r/regular-report/123456789`, environmentURL);

        expect(mockedCanAnonymousUserAccessRoute).toHaveBeenCalledWith('/r/regular-report/123456789');
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute('regular-report', '123456789'));
    });

    it('keeps legacy Concierge report links as full-screen report routes for anonymous users on wide layout', () => {
        mockedIsAnonymousUser.mockReturnValue(true);

        openLink(`${CONFIG.EXPENSIFY.EXPENSIFY_URL}/newdotreport?reportID=legacy-report`, environmentURL);

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute('legacy-report'));
    });

    it('closes an open RHP and navigates the central report when the linked report is already focused behind the RHP', () => {
        mockedNavigationRef.getRootState.mockReturnValue(buildRootState({centralReportID: 'regular-report', isRHPOpen: true}));

        openLink(`${CONST.NEW_EXPENSIFY_URL}/r/regular-report/123456789`, environmentURL);

        expect(Navigation.closeRHPFlow).toHaveBeenCalled();
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute('regular-report', '123456789'));
    });

    it('updates the focused RHP report action instead of stacking another RHP for the same report', () => {
        mockedNavigationRef.getRootState.mockReturnValue(buildRootState({isRHPOpen: true, rhpReportID: 'regular-report', rhpReportActionID: '123456789'}));
        mockedNavigation.getActiveRoute.mockReturnValue(
            ROUTES.SEARCH_REPORT.getRoute({
                reportID: 'regular-report',
                reportActionID: '123456789',
                backTo: activeRoute,
            }),
        );

        openLink(`${CONST.NEW_EXPENSIFY_URL}/r/regular-report/987654321`, environmentURL);

        expect(Navigation.setParams).toHaveBeenCalledWith({reportActionID: '987654321'}, `${SCREENS.RIGHT_MODAL.SEARCH_REPORT}-rhp-report`, `${NAVIGATORS.RIGHT_MODAL_NAVIGATOR}-state`);
        expect(Navigation.closeRHPFlow).not.toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('opens an RHP when the target report exists in a stale inactive Reports tab', () => {
        mockedNavigationRef.getRootState.mockReturnValue(buildRootState({centralReportID: 'regular-report', activeTab: SCREENS.HOME}));

        openLink(`${CONST.NEW_EXPENSIFY_URL}/r/regular-report/123456789`, environmentURL);

        expect(Navigation.navigate).toHaveBeenCalledWith(
            ROUTES.SEARCH_REPORT.getRoute({
                reportID: 'regular-report',
                reportActionID: '123456789',
                backTo: activeRoute,
            }),
        );
    });

    it('opens an RHP when a non-RHP root route is focused over the target report', () => {
        mockedNavigationRef.getRootState.mockReturnValue(buildRootState({centralReportID: 'regular-report', focusedRootNavigator: NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR}));

        openLink(`${CONST.NEW_EXPENSIFY_URL}/r/regular-report/123456789`, environmentURL);

        expect(Navigation.navigate).toHaveBeenCalledWith(
            ROUTES.SEARCH_REPORT.getRoute({
                reportID: 'regular-report',
                reportActionID: '123456789',
                backTo: activeRoute,
            }),
        );
        expect(Navigation.closeRHPFlow).not.toHaveBeenCalled();
    });

    it('does not rewrite report subroutes', () => {
        openLink(`${CONST.NEW_EXPENSIFY_URL}/r/regular-report/details`, environmentURL);

        expect(Navigation.navigate).toHaveBeenCalledWith('/r/regular-report/details');
    });

    it('uses the resolved RHP route before deciding whether to close an existing RHP', () => {
        mockedNavigationRef.getRootState.mockReturnValue(buildRootState({isRHPOpen: true}));

        openLink(`${CONST.NEW_EXPENSIFY_URL}/r/regular-report`, environmentURL);

        expect(Navigation.closeRHPFlow).not.toHaveBeenCalled();
        expect(Navigation.navigate).toHaveBeenCalledWith(
            Url.appendParam(
                ROUTES.SEARCH_REPORT.getRoute({
                    reportID: 'regular-report',
                    backTo: activeRoute,
                }),
                REPORT_LINK_ROUTE_PARAMS.SHOULD_REPLACE_WITH_EXPENSE_REPORT_RHP,
                'true',
            ),
        );
    });
});
