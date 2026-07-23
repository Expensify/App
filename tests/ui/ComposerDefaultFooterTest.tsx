import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import ComposerDefaultFooter from '@pages/inbox/report/ReportActionCompose/ComposerDefaultFooter';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// Mock useResponsiveLayout so each test can pin an exact layout combination.
jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
const mockedUseResponsiveLayout = jest.mocked(useResponsiveLayout);

// These siblings need the composer context and are unrelated to the offline indicator, so stub them out.
jest.mock('@pages/inbox/report/ReportActionCompose/ComposerTypingIndicator', () => () => null);
jest.mock('@pages/inbox/report/ReportActionCompose/ComposerExceededLength', () => () => null);

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

const renderComposerDefaultFooter = () =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <ComposerDefaultFooter />
        </ComposeProviders>,
    );

describe('ComposerDefaultFooter', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    describe('when offline', () => {
        beforeEach(async () => {
            await act(async () => {
                await Onyx.merge(ONYXKEYS.NETWORK, {shouldForceOffline: true});
            });
        });

        it('shows the offline indicator in an RHP chat on a wide screen', async () => {
            // RHP makes shouldUseNarrowLayout true, but ScreenWrapper only renders the page-level indicator on
            // small screens, so the footer has to render its own inline one here.
            mockLayout({isSmallScreenWidth: false, isInNarrowPaneModal: true});
            renderComposerDefaultFooter();
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(OFFLINE_MESSAGE)).toBeOnTheScreen();
        });

        it('shows the offline indicator in a regular chat on a wide screen', async () => {
            mockLayout({isSmallScreenWidth: false, isInNarrowPaneModal: false});
            renderComposerDefaultFooter();
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(OFFLINE_MESSAGE)).toBeOnTheScreen();
        });

        it('hides the offline indicator on a small screen so it is not duplicated', async () => {
            // The page-level ScreenWrapper indicator already covers small screens.
            mockLayout({isSmallScreenWidth: true, isInNarrowPaneModal: false});
            renderComposerDefaultFooter();
            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByText(OFFLINE_MESSAGE)).not.toBeOnTheScreen();
        });
    });

    describe('when online', () => {
        it('does not show the offline indicator in an RHP chat on a wide screen', async () => {
            mockLayout({isSmallScreenWidth: false, isInNarrowPaneModal: true});
            renderComposerDefaultFooter();
            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByText(OFFLINE_MESSAGE)).not.toBeOnTheScreen();
        });
    });
});
