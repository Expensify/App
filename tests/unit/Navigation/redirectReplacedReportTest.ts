import redirectReplacedReport from '@libs/Navigation/helpers/redirectReplacedReport';
import replaceReportIDInPath from '@libs/Navigation/helpers/replaceReportIDInPath';

import SCREENS from '@src/SCREENS';

const mockSetParams = jest.fn();
const mockIsReady = jest.fn(() => true);
type TestRouteState = {key?: string; routes: Array<{key?: string; name: string; params?: unknown; state?: TestRouteState}>};
const mockGetRootState = jest.fn<TestRouteState | undefined, []>();

function setCurrentRoute(route: {name: string; params?: unknown}) {
    mockGetRootState.mockReturnValue({key: 'root', routes: [{...route, key: 'report-route'}]});
}

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        setParams: (...args: unknown[]) => {
            mockSetParams(...args);
        },
    },
    navigationRef: {
        isReady: () => mockIsReady(),
        getRootState: () => mockGetRootState(),
    },
}));

describe('redirectReplacedReport', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsReady.mockReturnValue(true);
        mockGetRootState.mockReturnValue(undefined);
    });

    it.each([SCREENS.REPORT, SCREENS.RIGHT_MODAL.EXPENSE_REPORT, SCREENS.RIGHT_MODAL.SEARCH_REPORT, SCREENS.REPORT_DETAILS.DYNAMIC_ROOT])('redirects a replaced report on %s', (name) => {
        // Given the focused screen is showing the optimistic report
        setCurrentRoute({name, params: {reportID: '100', backTo: '/r/300'}});
        // When the server replaces that report
        redirectReplacedReport('100', '200');
        // Then only the report parameter changes, preserving the navigation stack
        expect(mockSetParams).toHaveBeenCalledWith({reportID: '200'}, 'report-route', 'root');
    });

    it('leaves another report and unrelated screens alone', () => {
        // Given another report is focused
        setCurrentRoute({name: SCREENS.REPORT, params: {reportID: '300'}});
        // When a background report is replaced, then no redirect is dispatched
        redirectReplacedReport('100', '200');
        expect(mockSetParams).not.toHaveBeenCalled();

        // Given an unrelated screen has a matching value in a non-report parameter
        setCurrentRoute({name: 'UnrelatedScreen', params: {accountID: '100'}});
        // When the report is replaced, then that screen is not redirected
        redirectReplacedReport('100', '200');
        expect(mockSetParams).not.toHaveBeenCalled();
    });

    it('does nothing before navigation is ready', () => {
        // Given navigation has not mounted
        mockIsReady.mockReturnValue(false);
        // When a report is replaced
        redirectReplacedReport('100', '200');
        // Then no route is read or changed
        expect(mockGetRootState).not.toHaveBeenCalled();
        expect(mockSetParams).not.toHaveBeenCalled();
    });

    it('ignores missing route parameters and replacements with the same ID', () => {
        // Given the focused report has no parameters
        setCurrentRoute({name: SCREENS.REPORT});
        // When replacement is requested, then it cannot redirect an unidentified report
        redirectReplacedReport('100', '200');
        expect(mockSetParams).not.toHaveBeenCalled();

        // Given the server's destination is the same report
        setCurrentRoute({name: SCREENS.REPORT, params: {reportID: '100'}});
        // When replacement is requested, then no redundant redirect occurs
        redirectReplacedReport('100', '100');
        expect(mockSetParams).not.toHaveBeenCalled();
    });

    it('updates details and the underlying expense route before deletion, preserving Back navigation', () => {
        // Given details are open above the second optimistic expense report
        mockGetRootState.mockReturnValue({
            key: 'root',
            routes: [
                {
                    key: 'modal',
                    name: 'ModalNavigator',
                    state: {
                        key: 'modal-stack',
                        routes: [
                            {key: 'workspace', name: SCREENS.REPORT, params: {reportID: '300'}},
                            {key: 'expense', name: SCREENS.RIGHT_MODAL.EXPENSE_REPORT, params: {reportID: '100', backTo: '/r/300'}},
                            {
                                key: 'details-navigator',
                                name: 'DetailsNavigator',
                                state: {
                                    key: 'details-stack',
                                    routes: [{key: 'details', name: SCREENS.REPORT_DETAILS.DYNAMIC_ROOT, params: {reportID: '100', backTo: '/e/100?backTo=%2Fr%2F300'}}],
                                },
                            },
                        ],
                    },
                },
            ],
        });
        // When reconnection replaces the expense report
        redirectReplacedReport('100', '200');
        // Then both panels point to the survivor, without changing the workspace chat
        expect(mockSetParams).toHaveBeenCalledTimes(2);
        expect(mockSetParams).toHaveBeenCalledWith({reportID: '200'}, 'expense', 'modal-stack');
        expect(mockSetParams).toHaveBeenCalledWith({reportID: '200', backTo: '/e/200?backTo=%2Fr%2F300'}, 'details', 'details-stack');
    });

    it('updates nested encoded return paths without matching a longer report ID', () => {
        // Given a child screen returns to the replaced report, while another report ID merely shares its prefix
        mockGetRootState.mockReturnValue({
            key: 'root',
            routes: [
                {key: 'child', name: SCREENS.RIGHT_MODAL.SEARCH_REPORT, params: {reportID: '400', backTo: '/search/view/400?backTo=%2Fe%2F100'}},
                {key: 'other', name: SCREENS.REPORT, params: {reportID: '1000', backTo: '/e/1000'}},
            ],
        });
        // When report 100 is replaced
        redirectReplacedReport('100', '200');
        // Then only the exact reference in the child's return path changes
        expect(mockSetParams).toHaveBeenCalledTimes(1);
        expect(mockSetParams).toHaveBeenCalledWith({backTo: '/search/view/400?backTo=%2Fe%2F200'}, 'child', 'root');
    });

    it('does nothing when the root state is unavailable', () => {
        // Given navigation has no state yet
        mockGetRootState.mockReturnValue(undefined);
        // When replacement is requested
        redirectReplacedReport('100', '200');
        // Then no redirect can be dispatched
        expect(mockSetParams).not.toHaveBeenCalled();
    });
});

describe('replaceReportIDInPath', () => {
    it('updates details query parameters and encoded return paths', () => {
        // Given report details and its return path reference the same optimistic report
        const path = '/details?reportID=100&backTo=%2Fe%2F100';
        // When the report is replaced
        const updated = replaceReportIDInPath(path, '100', '200');
        // Then both references point to the survivor
        expect(updated).toBe('/details?reportID=200&backTo=%2Fe%2F200');
    });

    it('does not let malformed encoded return paths prevent valid path replacement', () => {
        // Given a malformed return path alongside a valid report path
        const path = '/e/100?backTo=%invalid';
        // When the report is replaced
        const updated = replaceReportIDInPath(path, '100', '200');
        // Then the valid reference changes and the malformed value remains untouched
        expect(updated).toBe('/e/200?backTo=%invalid');
    });
});
