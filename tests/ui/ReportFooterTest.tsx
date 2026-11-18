import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useConciergeAskState from '@hooks/useConciergeAskState';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import ReportFooter from '@pages/inbox/report/ReportFooter';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type * as ReactNavigation from '@react-navigation/native';

import {useRoute} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// Mock useResponsiveLayout so each test can pin an exact layout combination.
jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
const mockedUseResponsiveLayout = jest.mocked(useResponsiveLayout);

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof ReactNavigation>('@react-navigation/native');
    return {
        ...actualNav,
        useRoute: jest.fn(),
        useIsFocused: () => true,
    };
});
const mockedUseRoute = jest.mocked(useRoute);

jest.mock('@hooks/useConciergeAskState', () => ({
    __esModule: true,
    default: jest.fn(jest.requireActual<{default: typeof useConciergeAskState}>('@hooks/useConciergeAskState').default),
}));

jest.mock('@pages/inbox/report/ReportActionCompose/ReportActionCompose', () => {
    const MockReportActionCompose = Object.assign(() => null, {EditOnly: () => null});
    return {__esModule: true, default: MockReportActionCompose};
});

const REPORT_ID = '1';
const OFFLINE_MESSAGE = 'You appear to be offline.';

const mockLayout = ({isSmallScreenWidth, isInNarrowPaneModal}: {isSmallScreenWidth: boolean; isInNarrowPaneModal: boolean}) =>
    mockedUseResponsiveLayout.mockReturnValue({
        // This mirrors the real hook: shouldUseNarrowLayout is true on small screens OR in a narrow pane modal (RHP).
        shouldUseNarrowLayout: isSmallScreenWidth || isInNarrowPaneModal,
        isSmallScreenWidth,
        isInNarrowPaneModal,
        isSmallScreen: isSmallScreenWidth,
        isMediumScreenWidth: false,
        isLargeScreenWidth: !isSmallScreenWidth,
        isExtraLargeScreenWidth: !isSmallScreenWidth,
        isExtraSmallScreenWidth: false,
        isExtraSmallScreenHeight: false,
        onboardingIsMediumOrLargerScreenWidth: !isSmallScreenWidth,
        isInLandscapeMode: false,
    });

/** Archived chat: canUserPerformWriteAction() is false, so ReportFooter renders the archived branch. */
const setUpArchivedReport = async () => {
    await act(async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID, type: CONST.REPORT.TYPE.CHAT});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${REPORT_ID}`, {private_isArchived: new Date().toString()});
    });
};

/** Read-only chat: a non-empty permissions array without "write"/"auditor" hits the read-only branch. */
const setUpReadOnlyReport = async () => {
    await act(async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.CHAT,
            permissions: [CONST.REPORT.PERMISSIONS.READ],
        });
    });
};

const renderReportFooter = () =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <ReportFooter />
        </ComposeProviders>,
    );

describe('ReportFooter', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(async () => {
        mockedUseRoute.mockReturnValue({key: 'report', name: 'Report', params: {reportID: REPORT_ID}});
        await act(async () => {
            await Onyx.merge(ONYXKEYS.NETWORK, {shouldForceOffline: true});
        });
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
        jest.mocked(useConciergeAskState).mockImplementation(jest.requireActual<{default: typeof useConciergeAskState}>('@hooks/useConciergeAskState').default);
    });

    it('labels the composer `Ask a new question` once the Concierge chat history is expanded', async () => {
        // Given the main Concierge chat with its history expanded
        mockLayout({isSmallScreenWidth: false, isInNarrowPaneModal: false});
        jest.mocked(useConciergeAskState).mockReturnValue({
            isHistoryExpanded: true,
            shouldShowWelcome: false,
            shouldCenterWelcomeWithComposer: false,
            hasUnreadMessageFromOthers: false,
        });
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID, type: CONST.REPORT.TYPE.CHAT});
        });

        // When the footer renders
        renderReportFooter();
        await waitForBatchedUpdatesWithAct();

        // Then the composer is labeled, so the user knows a new message starts a new question
        expect(screen.getByText('Ask a new question')).toBeOnTheScreen();
    });

    describe.each([
        {name: 'archived', setUpReport: setUpArchivedReport, bannerText: 'This chat room has been archived.'},
        {name: 'read-only', setUpReport: setUpReadOnlyReport, bannerText: 'This conversation is read-only.'},
    ])('$name footer while offline', ({setUpReport, bannerText}) => {
        it('shows the offline indicator in an RHP chat on a wide screen', async () => {
            // RHP makes shouldUseNarrowLayout true, but ScreenWrapper only renders the page-level indicator on
            // small screens, so the footer has to render its own inline one here.
            mockLayout({isSmallScreenWidth: false, isInNarrowPaneModal: true});
            await setUpReport();
            renderReportFooter();
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(bannerText)).toBeOnTheScreen();
            expect(screen.getByText(OFFLINE_MESSAGE)).toBeOnTheScreen();
        });

        it('hides the offline indicator on a small screen so it is not duplicated', async () => {
            // The page-level ScreenWrapper indicator already covers small screens.
            mockLayout({isSmallScreenWidth: true, isInNarrowPaneModal: false});
            await setUpReport();
            renderReportFooter();
            await waitForBatchedUpdatesWithAct();

            // Assert the branch actually rendered, so the absence of the indicator below is meaningful.
            expect(screen.getByText(bannerText)).toBeOnTheScreen();
            expect(screen.queryByText(OFFLINE_MESSAGE)).not.toBeOnTheScreen();
        });
    });
});
