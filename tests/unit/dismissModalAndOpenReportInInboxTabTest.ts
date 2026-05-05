import dismissModalAndOpenReportInInboxTab from '@libs/Navigation/helpers/dismissModalAndOpenReportInInboxTab';
import Navigation from '@libs/Navigation/Navigation';

const mockIsSearchTopmostFullScreenRoute = jest.fn();
const mockIsReportOpenInRHP = jest.fn();
const mockGetTrackingState = jest.fn();

jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => () => mockIsSearchTopmostFullScreenRoute() as boolean);
jest.mock('@libs/Navigation/helpers/isReportOpenInRHP', () => () => mockIsReportOpenInRHP() as boolean);
jest.mock('@libs/Navigation/helpers/isReportOpenInSuperWideRHP', () => () => false as boolean);
jest.mock('@libs/Navigation/helpers/setNavigationActionToMicrotaskQueue', () => (callback: () => void) => {
    callback();
});
jest.mock('@libs/getIsNarrowLayout', () => () => false as boolean);
jest.mock('@libs/telemetry/submitFollowUpAction', () => ({
    isTracking: (...args: unknown[]) => mockGetTrackingState(...args) as boolean,
    endSubmitFollowUpActionSpan: jest.fn(),
    setPendingSubmitFollowUpAction: jest.fn(),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    dismissModal: jest.fn(),
    dismissToPreviousRHP: jest.fn(),
    dismissModalWithReport: jest.fn(),
    pop: jest.fn(),
    navigate: jest.fn(),
    navigationRef: {
        getRootState: jest.fn(() => ({
            routes: [],
        })),
    },
}));

jest.mock('@react-navigation/native');

describe('dismissModalAndOpenReportInInboxTab', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetTrackingState.mockReturnValue(null);
        mockIsReportOpenInRHP.mockReturnValue(false);
        mockIsSearchTopmostFullScreenRoute.mockReturnValue(false);
    });

    it('should call dismissModalWithReport when report is not in RHP and not on search', () => {
        const reportID = 'report-123';
        dismissModalAndOpenReportInInboxTab(reportID, undefined, false);

        expect(Navigation.dismissModalWithReport).toHaveBeenCalledWith({reportID});
    });

    it('should call dismissModal when on search page', () => {
        mockIsSearchTopmostFullScreenRoute.mockReturnValue(true);
        dismissModalAndOpenReportInInboxTab('report-123', undefined, false);

        expect(Navigation.dismissModal).toHaveBeenCalled();
        expect(Navigation.dismissModalWithReport).not.toHaveBeenCalled();
    });

    it('should call dismissModal when reportID is undefined', () => {
        dismissModalAndOpenReportInInboxTab(undefined, undefined, false);

        expect(Navigation.dismissModal).toHaveBeenCalled();
    });

    it('should skip RHP logic for invoices', () => {
        mockIsReportOpenInRHP.mockReturnValue(true);
        const reportID = 'report-123';
        dismissModalAndOpenReportInInboxTab(reportID, true, false);

        // Should fall through to dismissModalWithReport, not use RHP logic
        expect(Navigation.dismissToPreviousRHP).not.toHaveBeenCalled();
        expect(Navigation.dismissModalWithReport).toHaveBeenCalledWith({reportID});
    });
});
