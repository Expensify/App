/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return -- Jest factory mocks use CommonJS require() which returns untyped modules; typing each mock precisely is not practical here */
import {render, screen, within} from '@testing-library/react-native';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import HomePage from '@pages/home/HomePage';

import OnyxListItemProvider from '@src/components/OnyxListItemProvider';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({shouldUseNarrowLayout: true})));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);
jest.mock('@hooks/useDocumentTitle', () => jest.fn());
jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(() => ({
        flex1: {},
        homePageContentContainer: {},
        homePageMainLayout: () => ({}),
        homePageLeftColumn: {},
        homePageRightColumn: {},
    })),
);

jest.mock('@components/ScreenWrapper', () => {
    const ReactModule = require('react');
    function MockScreenWrapper({children}: {children: React.ReactNode}) {
        return ReactModule.createElement(ReactModule.Fragment, null, children);
    }
    return MockScreenWrapper;
});
jest.mock('@components/ScrollView', () => {
    const ReactModule = require('react');
    function MockScrollView({children}: {children: React.ReactNode}) {
        return ReactModule.createElement(ReactModule.Fragment, null, children);
    }
    return MockScrollView;
});
jest.mock('@components/Navigation/NavigationTabBar', () => {
    function MockNavigationTabBar() {
        return null;
    }
    return MockNavigationTabBar;
});
jest.mock('@components/Navigation/QuickCreationActionsBar', () => {
    function MockQuickCreationActionsBar() {
        return null;
    }
    return MockQuickCreationActionsBar;
});
jest.mock('@components/Navigation/TopBar', () => {
    function MockTopBar() {
        return null;
    }
    return MockTopBar;
});
jest.mock('@components/ReceiptScanDropZone', () => {
    function MockReceiptScanDropZone() {
        return null;
    }
    return MockReceiptScanDropZone;
});

// Each section is mocked to render a stable `section-<Name>` testID so we can assert ordering and column placement.
function mockSection(name: string) {
    const ReactModule = require('react');
    const {View: RNView} = require('react-native');
    function MockSection() {
        return ReactModule.createElement(RNView, {testID: `section-${name}`});
    }
    return MockSection;
}

jest.mock('@pages/home/FreeTrialSection', () => mockSection('FreeTrialSection'));
jest.mock('@pages/home/GettingStartedSection', () => mockSection('GettingStartedSection'));
jest.mock('@pages/home/ForYouSection', () => mockSection('ForYouSection'));
jest.mock('@pages/home/UpcomingTravelSection', () => mockSection('UpcomingTravelSection'));
jest.mock('@pages/home/RecentlyAddedSection', () => mockSection('RecentlyAddedSection'), {virtual: true});
jest.mock('@pages/home/YourSpendSection', () => mockSection('YourSpendSection'));
jest.mock('@pages/home/InsightsSection', () => mockSection('InsightsSection'));
jest.mock('@pages/home/DiscoverSection', () => mockSection('DiscoverSection'));

const mockUseResponsiveLayout = jest.mocked(useResponsiveLayout);

function buildLayout(shouldUseNarrowLayout: boolean): ReturnType<typeof useResponsiveLayout> {
    return {
        shouldUseNarrowLayout,
        isSmallScreenWidth: shouldUseNarrowLayout,
        isInNarrowPaneModal: false,
        isExtraSmallScreenHeight: false,
        isMediumScreenWidth: false,
        isLargeScreenWidth: !shouldUseNarrowLayout,
        isExtraLargeScreenWidth: false,
        isExtraSmallScreenWidth: false,
        isSmallScreen: shouldUseNarrowLayout,
        onboardingIsMediumOrLargerScreenWidth: !shouldUseNarrowLayout,
        isInLandscapeMode: false,
    };
}

function setNarrowLayout() {
    mockUseResponsiveLayout.mockReturnValue(buildLayout(true));
}

function setWideLayout() {
    mockUseResponsiveLayout.mockReturnValue(buildLayout(false));
}

const renderHomePage = () =>
    render(
        <OnyxListItemProvider>
            <HomePage />
        </OnyxListItemProvider>,
    );

function renderedSectionOrder() {
    return screen.getAllByTestId(/^section-/).map((el) => String(el.props.testID));
}

describe('HomePage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        setNarrowLayout();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    // For you sits above Getting started on narrow layouts, regardless of the onboarding intent.
    describe('mobile ordering', () => {
        it.each([
            ['no onboarding intent set', undefined],
            ['MANAGE_TEAM intent', CONST.ONBOARDING_CHOICES.MANAGE_TEAM],
            ['TRACK_WORKSPACE intent', CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE],
        ])('renders ForYouSection before GettingStartedSection on narrow layout with %s', async (_label, choice) => {
            // Given an onboarding intent
            if (choice) {
                await Onyx.set(ONYXKEYS.NVP_INTRO_SELECTED, {choice});
            }
            await waitForBatchedUpdates();

            // When the Home page renders on a narrow layout
            renderHomePage();

            // Then For you comes before Getting started
            const order = renderedSectionOrder();
            expect(order.indexOf('section-ForYouSection')).toBeLessThan(order.indexOf('section-GettingStartedSection'));
        });
    });

    // The mobile slot priority order, with Recently added moved up to sit directly after Your spend and
    // Announcements removed entirely (PRD-98653 R5).
    describe('mobile slot priority order', () => {
        it('renders all slots in the prescribed order on narrow layout', async () => {
            await waitForBatchedUpdates();

            renderHomePage();

            expect(renderedSectionOrder()).toEqual([
                'section-FreeTrialSection',
                'section-ForYouSection',
                'section-GettingStartedSection',
                'section-UpcomingTravelSection',
                'section-YourSpendSection',
                'section-RecentlyAddedSection',
                'section-InsightsSection',
                'section-DiscoverSection',
            ]);
        });

        it('places Recently added directly after Your spend on narrow layout', async () => {
            await waitForBatchedUpdates();

            renderHomePage();

            const order = renderedSectionOrder();
            expect(order.indexOf('section-RecentlyAddedSection')).toBe(order.indexOf('section-YourSpendSection') + 1);
        });

        it('does not render the Announcements section anywhere on narrow layout', async () => {
            await waitForBatchedUpdates();

            renderHomePage();

            expect(screen.queryByTestId('section-AnnouncementSection')).not.toBeOnTheScreen();
        });
    });

    // Recently added moves into the right column directly below Your spend on wide layout (PRD-98653 R1/R2).
    describe('wide layout column placement', () => {
        it('renders Discover and Recently added in the right column, not the left', async () => {
            setWideLayout();
            await waitForBatchedUpdates();

            renderHomePage();

            const leftColumn = screen.getByTestId('homePageLeftColumn');
            const rightColumn = screen.getByTestId('homePageRightColumn');

            expect(within(rightColumn).getByTestId('section-DiscoverSection')).toBeOnTheScreen();
            expect(within(leftColumn).queryByTestId('section-DiscoverSection')).not.toBeOnTheScreen();
            expect(within(rightColumn).getByTestId('section-RecentlyAddedSection')).toBeOnTheScreen();
            expect(within(leftColumn).queryByTestId('section-RecentlyAddedSection')).not.toBeOnTheScreen();
        });

        it('places Recently added directly below Your spend in the right column on wide layout', async () => {
            setWideLayout();
            await waitForBatchedUpdates();

            renderHomePage();

            const rightColumn = screen.getByTestId('homePageRightColumn');
            const rightOrder = within(rightColumn)
                .getAllByTestId(/^section-/)
                .map((el) => String(el.props.testID));
            expect(rightOrder.indexOf('section-RecentlyAddedSection')).toBe(rightOrder.indexOf('section-YourSpendSection') + 1);
        });

        it('does not render the Announcements section anywhere on wide layout', async () => {
            setWideLayout();
            await waitForBatchedUpdates();

            renderHomePage();

            expect(screen.queryByTestId('section-AnnouncementSection')).not.toBeOnTheScreen();
        });

        // Getting started lives in the left column below For you, matching mobile placement.
        it('renders Getting started in the left column below For you and not in the right column', async () => {
            // Given a wide layout
            setWideLayout();
            await waitForBatchedUpdates();

            // When the Home page renders
            renderHomePage();

            // Then Getting started is in the left column, below For you
            const leftColumn = screen.getByTestId('homePageLeftColumn');
            const rightColumn = screen.getByTestId('homePageRightColumn');

            expect(within(leftColumn).getByTestId('section-GettingStartedSection')).toBeOnTheScreen();
            expect(within(rightColumn).queryByTestId('section-GettingStartedSection')).not.toBeOnTheScreen();

            const leftOrder = within(leftColumn)
                .getAllByTestId(/^section-/)
                .map((el) => String(el.props.testID));
            expect(leftOrder.indexOf('section-GettingStartedSection')).toBeGreaterThan(leftOrder.indexOf('section-ForYouSection'));
        });
    });
});
