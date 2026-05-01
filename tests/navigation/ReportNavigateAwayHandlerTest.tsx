/* eslint-disable @typescript-eslint/naming-convention */
import {render, waitFor} from '@testing-library/react-native';
import React from 'react';
import useIsOwnWorkspaceChatRef from '@hooks/useIsOwnWorkspaceChatRef';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@libs/Navigation/Navigation';
import {navigateToConciergeChat} from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import useReportWasDeleted from '@src/pages/inbox/hooks/useReportWasDeleted';
import ReportNavigateAwayHandler from '@src/pages/inbox/ReportNavigateAwayHandler';

jest.mock('@react-navigation/native', () => ({
    createNavigationContainerRef: jest.fn(() => ({
        current: null,
        dispatch: jest.fn(),
        canGoBack: jest.fn(),
        getRootState: jest.fn(),
        getCurrentRoute: jest.fn(),
    })),
    useIsFocused: jest.fn(() => true),
    useRoute: jest.fn(() => ({
        name: 'Report',
        params: {
            reportID: '123',
        },
    })),
}));

jest.mock('@hooks/useCurrentReportID', () => ({
    useCurrentReportIDState: jest.fn(() => ({currentReportID: '123'})),
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: jest.fn(() => ({accountID: 1})),
}));

jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: jest.fn(() => ({isInNarrowPaneModal: false})),
}));

jest.mock('@hooks/useParentReportAction', () => ({
    __esModule: true,
    default: jest.fn(() => undefined),
}));

jest.mock('@hooks/useIsOwnWorkspaceChatRef', () => ({
    __esModule: true,
    default: jest.fn(() => ({current: false})),
}));

jest.mock('@userActions/Composer', () => ({
    setShouldShowComposeInput: jest.fn(),
}));

jest.mock('@userActions/Report', () => ({
    navigateToConciergeChat: jest.fn(),
}));

jest.mock('@src/pages/inbox/hooks/useReportWasDeleted', () => jest.fn());

jest.mock('@hooks/useOnyx', () => jest.fn());

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        dismissModal: jest.fn(),
        getTopmostReportId: jest.fn(() => 'different-report-id'),
        getTopmostSearchReportID: jest.fn(() => undefined),
        popToSidebar: jest.fn(),
        navigate: jest.fn(),
        isNavigationReady: jest.fn(() => Promise.resolve()),
    },
    navigationRef: {
        getCurrentRoute: jest.fn(() => ({name: 'Report', params: {reportID: '123'}})),
    },
}));

type MinimalReport = {
    reportID?: string;
    participants?: Record<number, {notificationPreference?: string}>;
    statusNum?: number;
};

let deletedParentReport: MinimalReport | undefined;
let deletedReportParentID: string | undefined;
let reportWasDeleted = true;

const mockUseOnyx = jest.mocked(useOnyx);
const mockUseReportWasDeleted = jest.mocked(useReportWasDeleted);
const mockNavigateToConciergeChat = jest.mocked(navigateToConciergeChat);
const mockNavigation = jest.mocked(Navigation);
const onyxMeta = {status: 'loaded'} as const;

describe('ReportNavigateAwayHandler', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        deletedParentReport = undefined;
        deletedReportParentID = 'parentReportID';
        reportWasDeleted = true;

        mockUseReportWasDeleted.mockReturnValue({
            wasDeleted: reportWasDeleted,
            parentReportID: deletedReportParentID,
        });

        mockUseOnyx.mockImplementation((key: string) => {
            if (key === `${ONYXKEYS.COLLECTION.REPORT}123`) {
                return [{reportID: '123', statusNum: 2} as MinimalReport, onyxMeta];
            }
            if (key === `${ONYXKEYS.COLLECTION.REPORT_USER_IS_LEAVING_ROOM}123`) {
                return [false, onyxMeta];
            }
            if (key === ONYXKEYS.NVP_INTRO_SELECTED) {
                return [undefined, onyxMeta];
            }
            if (key === ONYXKEYS.BETAS) {
                return [[], onyxMeta];
            }
            if (key === ONYXKEYS.NVP_ONBOARDING) {
                return [{selfTourViewed: true}, onyxMeta];
            }
            if (key === ONYXKEYS.CONCIERGE_REPORT_ID) {
                return ['conciergeReportID', onyxMeta];
            }
            if (key === `${ONYXKEYS.COLLECTION.REPORT}parentReportID`) {
                return [deletedParentReport, onyxMeta];
            }
            return [undefined, onyxMeta];
        });
    });

    it('navigates to concierge when deleted parent exists but user is not a participant', async () => {
        const participants: Record<number, {notificationPreference?: string}> = {};
        participants[999] = {};
        deletedParentReport = {reportID: 'parentReportID', participants};

        render(<ReportNavigateAwayHandler />);

        await waitFor(() => {
            expect(mockNavigation.popToSidebar).toHaveBeenCalledTimes(1);
            expect(mockNavigateToConciergeChat).toHaveBeenCalledTimes(1);
        });

        expect(mockNavigation.navigate).not.toHaveBeenCalled();
    });

    it('navigates to deleted parent when user is a participant', async () => {
        const participants: Record<number, {notificationPreference?: string}> = {};
        participants[1] = {};
        deletedParentReport = {reportID: 'parentReportID', participants};

        render(<ReportNavigateAwayHandler />);

        await waitFor(() => {
            expect(mockNavigation.navigate).toHaveBeenCalledWith(expect.stringContaining('parentReportID'));
        });

        expect(mockNavigation.popToSidebar).not.toHaveBeenCalled();
        expect(mockNavigateToConciergeChat).not.toHaveBeenCalled();
    });

    it('does not navigate away when own workspace chat ref is true', async () => {
        const mockUseIsOwnWorkspaceChatRef = jest.mocked(useIsOwnWorkspaceChatRef);
        mockUseIsOwnWorkspaceChatRef.mockReturnValue({current: true});
        const participants: Record<number, {notificationPreference?: string}> = {};
        participants[999] = {};
        deletedParentReport = {reportID: 'parentReportID', participants};

        render(<ReportNavigateAwayHandler />);

        expect(mockNavigation.popToSidebar).not.toHaveBeenCalled();
        expect(mockNavigation.navigate).not.toHaveBeenCalled();
        expect(mockNavigateToConciergeChat).not.toHaveBeenCalled();
    });
});
