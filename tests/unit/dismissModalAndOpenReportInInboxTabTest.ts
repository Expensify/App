import dismissModalAndOpenReportInInboxTab from '@libs/Navigation/helpers/dismissModalAndOpenReportInInboxTab';
import type isReportOpenInRHP from '@libs/Navigation/helpers/isReportOpenInRHP';
import Navigation from '@libs/Navigation/Navigation';

const mockIsSearchTopmostFullScreenRoute = jest.fn<boolean, []>();
const mockIsReportOpenInRHP = jest.fn<ReturnType<typeof isReportOpenInRHP>, Parameters<typeof isReportOpenInRHP>>();
const mockGetTrackingState = jest.fn<boolean, []>();

jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => () => mockIsSearchTopmostFullScreenRoute());
jest.mock(
    '@libs/Navigation/helpers/isReportOpenInRHP',
    () =>
        (...args: Parameters<typeof isReportOpenInRHP>) =>
            mockIsReportOpenInRHP(...args),
);
jest.mock('@libs/Navigation/helpers/isReportOpenInSuperWideRHP', () => () => false);
jest.mock('@libs/Navigation/helpers/setNavigationActionToMicrotaskQueue', () => (callback: () => void) => {
    callback();
});
jest.mock('@libs/getIsNarrowLayout', () => () => false);
jest.mock('@libs/telemetry/submitFollowUpAction', () => ({
    isTracking: () => mockGetTrackingState(),
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
        mockGetTrackingState.mockReturnValue(false);
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
