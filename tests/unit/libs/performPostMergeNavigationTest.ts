import performPostMergeNavigation from '@libs/performPostMergeNavigation';

const mockDismissModalWithReport = jest.fn();
const mockDismissToSuperWideRHP = jest.fn();
const mockIsSearchTopmostFullScreenRoute = jest.fn();

jest.mock('@libs/Navigation/Navigation', () => ({
    dismissModalWithReport: (...args: unknown[]): void => {
        mockDismissModalWithReport(...args);
    },
    dismissModal: jest.fn(),
    setNavigationActionToMicrotaskQueue: jest.fn((cb: () => void): void => {
        cb();
    }),
    dismissToSuperWideRHP: (...args: unknown[]): void => {
        mockDismissToSuperWideRHP(...args);
    },
    navigate: jest.fn(),
}));

jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => {
    return function mockIsSearchTopmostFullScreenRouteImpl(..._args: unknown[]): boolean {
        return mockIsSearchTopmostFullScreenRoute(..._args) as boolean;
    };
});

describe('performPostMergeNavigation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsSearchTopmostFullScreenRoute.mockReturnValue(false);
    });

    it('calls Navigation.dismissModalWithReport when not on search, reportID differs from target report, and not search topmost route', () => {
        const reportIDToOpen = 'report-to-open-after-merge';
        const targetTransactionReportID = 'target-expense-report';

        performPostMergeNavigation({
            isOnSearch: false,
            reportID: reportIDToOpen,
            targetTransactionReportID,
        });

        expect(mockDismissModalWithReport).toHaveBeenCalledTimes(1);
        expect(mockDismissModalWithReport).toHaveBeenCalledWith({reportID: reportIDToOpen});
        expect(mockDismissToSuperWideRHP).not.toHaveBeenCalled();
    });

    it('does not call dismissModalWithReport when isOnSearch is true', () => {
        performPostMergeNavigation({
            isOnSearch: true,
            reportID: 'report-123',
            targetTransactionReportID: 'report-456',
        });

        expect(mockDismissModalWithReport).not.toHaveBeenCalled();
        expect(mockDismissToSuperWideRHP).toHaveBeenCalledTimes(1);
    });

    it('does not call dismissModalWithReport when reportID equals targetTransactionReportID', () => {
        const sameReportID = 'same-report';

        performPostMergeNavigation({
            isOnSearch: false,
            reportID: sameReportID,
            targetTransactionReportID: sameReportID,
        });

        expect(mockDismissModalWithReport).not.toHaveBeenCalled();
        expect(mockDismissToSuperWideRHP).toHaveBeenCalledTimes(1);
    });
});
