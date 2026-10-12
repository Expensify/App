import redirectReplacedReport from '@libs/Navigation/helpers/redirectReplacedReport';

import SCREENS from '@src/SCREENS';

const mockSetParams = jest.fn();
const mockIsReady = jest.fn(() => true);
const mockGetCurrentRoute = jest.fn<{name: string; params?: unknown} | undefined, []>();

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        setParams: (...args: unknown[]) => {
            mockSetParams(...args);
        },
    },
    navigationRef: {
        isReady: () => mockIsReady(),
        getCurrentRoute: () => mockGetCurrentRoute(),
    },
}));

describe('redirectReplacedReport', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsReady.mockReturnValue(true);
        mockGetCurrentRoute.mockReturnValue(undefined);
    });

    it.each([SCREENS.REPORT, SCREENS.RIGHT_MODAL.EXPENSE_REPORT, SCREENS.RIGHT_MODAL.SEARCH_REPORT])('redirects a replaced report on %s', (name) => {
        // Given the focused screen is showing the optimistic report
        mockGetCurrentRoute.mockReturnValue({name, params: {reportID: '100', backTo: '/r/300'}});
        // When the server replaces that report
        redirectReplacedReport('100', '200');
        // Then only the report parameter changes, preserving the navigation stack
        expect(mockSetParams).toHaveBeenCalledWith({reportID: '200'});
    });

    it('leaves another report and unrelated screens alone', () => {
        // Given another report is focused
        mockGetCurrentRoute.mockReturnValue({name: SCREENS.REPORT, params: {reportID: '300'}});
        // When a background report is replaced, then no redirect is dispatched
        redirectReplacedReport('100', '200');
        expect(mockSetParams).not.toHaveBeenCalled();

        // Given an unrelated screen has a matching parameter
        mockGetCurrentRoute.mockReturnValue({name: 'UnrelatedScreen', params: {reportID: '100'}});
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
        expect(mockGetCurrentRoute).not.toHaveBeenCalled();
        expect(mockSetParams).not.toHaveBeenCalled();
    });

    it('ignores missing route parameters and replacements with the same ID', () => {
        // Given the focused report has no parameters
        mockGetCurrentRoute.mockReturnValue({name: SCREENS.REPORT});
        // When replacement is requested, then it cannot redirect an unidentified report
        redirectReplacedReport('100', '200');
        expect(mockSetParams).not.toHaveBeenCalled();

        // Given the server's destination is the same report
        mockGetCurrentRoute.mockReturnValue({name: SCREENS.REPORT, params: {reportID: '100'}});
        // When replacement is requested, then no redundant redirect occurs
        redirectReplacedReport('100', '100');
        expect(mockSetParams).not.toHaveBeenCalled();
    });
});
