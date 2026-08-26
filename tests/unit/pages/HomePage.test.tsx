/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return -- Jest factory mocks use CommonJS require() which returns untyped modules; typing each mock precisely is not practical here */
import {act, render, renderHook, screen, within} from '@testing-library/react-native';

import {useIsOnlineAppLoadPending} from '@hooks/useInFlightRequests';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import {WRITE_COMMANDS} from '@libs/API/types';
import type * as NetworkStateModule from '@libs/NetworkState';

import HomePage from '@pages/home/HomePage';

import OnyxListItemProvider from '@src/components/OnyxListItemProvider';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyRequest} from '@src/types/onyx';

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

// HomePage's offline guard reads useNetwork, which is useSyncExternalStore over @libs/NetworkState and not
// Onyx, so the hook itself is mocked rather than driven through Onyx.
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));

// Keep the sequential queue inert while the tests write fake requests into the persisted queue keys.
jest.mock('@libs/NetworkState', () => ({
    ...jest.requireActual<typeof NetworkStateModule>('@libs/NetworkState'),
    getIsOffline: () => true,
}));

// Deliberately not `mockSection('HomePageSkeleton')`: that helper emits a `section-` testID, which
// `renderedSectionOrder` matches, so the skeleton would count as a rendered section.
jest.mock('@pages/home/HomePageSkeleton', () => {
    const ReactModule = require('react');
    const {View: RNView} = require('react-native');
    function MockHomePageSkeleton() {
        return ReactModule.createElement(RNView, {testID: 'homePageSkeleton'});
    }
    return MockHomePageSkeleton;
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

// The app-load gate keeps a module-scoped latch that covers the window where an OpenApp has left the queue
// but its deferred Onyx updates have not flushed. That latch survives `Onyx.clear()`, so a case that leaves
// it set would make the next case read as mid-load.
async function resetAppLoadLatch() {
    await Onyx.set(ONYXKEYS.IS_LOADING_APP, false);
    await waitForBatchedUpdates();
    const {unmount} = renderHook(() => useIsOnlineAppLoadPending());
    await act(async () => {
        await waitForBatchedUpdates();
    });
    unmount();
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

const mockUseNetwork = jest.mocked(useNetwork);

const buildRequest = (command: AnyRequest['command'], initiatedOffline = false): AnyRequest => ({
    command,
    data: {},
    initiatedOffline,
});

// `requests` is the queue of requests not yet sent. `ongoingRequest` is the one being sent, which the
// sequential queue moves out of the queue and into its own key. Both are set explicitly so a case cannot
// accidentally assert against a state the real queue never produces.
async function setAppLoadState({
    hasLoadedApp,
    isLoadingApp,
    requests = [],
    ongoingRequest = null,
}: {
    hasLoadedApp: boolean;
    isLoadingApp: boolean;
    requests?: AnyRequest[];
    ongoingRequest?: AnyRequest | null;
}) {
    await act(async () => {
        await Onyx.multiSet({
            [ONYXKEYS.HAS_LOADED_APP]: hasLoadedApp,
            [ONYXKEYS.IS_LOADING_APP]: isLoadingApp,
            [ONYXKEYS.PERSISTED_REQUESTS]: requests,
            [ONYXKEYS.PERSISTED_ONGOING_REQUESTS]: ongoingRequest,
        });
    });
    await waitForBatchedUpdates();
}

describe('HomePage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        setNarrowLayout();
        mockUseNetwork.mockReturnValue({isOffline: false} as ReturnType<typeof useNetwork>);
        await Onyx.clear();
        // The app-load gate reads a cleared HAS_LOADED_APP as a first load in progress. Once HomePage branches on it,
        // every case below would render the page-level skeleton instead of the Sections it asserts on. See Expensify/App#98968.
        await Onyx.set(ONYXKEYS.HAS_LOADED_APP, true);
        await waitForBatchedUpdates();
        await resetAppLoadLatch();
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
    // These cases prove that HomePage branches on the gate and composes the offline guard.
    describe('app load skeleton', () => {
        it('renders the skeleton instead of the sections while the first OpenApp is in flight', async () => {
            await setAppLoadState({hasLoadedApp: false, isLoadingApp: false, requests: [buildRequest(WRITE_COMMANDS.OPEN_APP)]});

            renderHomePage();

            expect(screen.getByTestId('homePageSkeleton')).toBeOnTheScreen();
            expect(screen.queryAllByTestId(/^section-/)).toHaveLength(0);
        });

        it('renders the skeleton for an interrupted cold start, where only isLoadingApp survived', async () => {
            await setAppLoadState({hasLoadedApp: false, isLoadingApp: true});

            renderHomePage();

            expect(screen.getByTestId('homePageSkeleton')).toBeOnTheScreen();
        });

        it('renders the sections, not the skeleton, while a ReconnectApp is in flight', async () => {
            await setAppLoadState({hasLoadedApp: false, isLoadingApp: false, requests: [buildRequest(WRITE_COMMANDS.RECONNECT_APP)]});

            renderHomePage();

            expect(screen.queryByTestId('homePageSkeleton')).not.toBeOnTheScreen();
            expect(screen.queryAllByTestId(/^section-/)).not.toHaveLength(0);
        });

        it('renders the sections, not the skeleton, once the app has loaded', async () => {
            await setAppLoadState({hasLoadedApp: true, isLoadingApp: false});

            renderHomePage();

            expect(screen.queryByTestId('homePageSkeleton')).not.toBeOnTheScreen();
            expect(screen.queryAllByTestId(/^section-/)).not.toHaveLength(0);
        });

        // An OpenApp queued while offline sits in the queue until the user reconnects, so it is not a load
        // in progress and must not hold the skeleton there indefinitely.
        it('renders the sections, not the skeleton, on a cold start while offline', async () => {
            mockUseNetwork.mockReturnValue({isOffline: true} as ReturnType<typeof useNetwork>);
            await setAppLoadState({hasLoadedApp: false, isLoadingApp: false, requests: [buildRequest(WRITE_COMMANDS.OPEN_APP, true)]});

            renderHomePage();

            expect(screen.queryByTestId('homePageSkeleton')).not.toBeOnTheScreen();
            expect(screen.queryAllByTestId(/^section-/)).not.toHaveLength(0);
        });

        // Losing signal mid-load must not swap the skeleton for Sections that have no data yet: the request
        // was queued while online, so the load is still in progress and resumes on reconnect.
        it('keeps the skeleton when the connection drops while the first OpenApp is still queued', async () => {
            mockUseNetwork.mockReturnValue({isOffline: true} as ReturnType<typeof useNetwork>);
            await setAppLoadState({hasLoadedApp: false, isLoadingApp: false, requests: [buildRequest(WRITE_COMMANDS.OPEN_APP)]});

            renderHomePage();

            expect(screen.getByTestId('homePageSkeleton')).toBeOnTheScreen();
            expect(screen.queryAllByTestId(/^section-/)).toHaveLength(0);
        });

        // The same case one step later in the queue's lifecycle: the request has left PERSISTED_REQUESTS
        // for PERSISTED_ONGOING_REQUESTS because it is being sent. Reading only the former would show empty Sections for this entire window.
        it('keeps the skeleton when the connection drops while the first OpenApp is in flight', async () => {
            mockUseNetwork.mockReturnValue({isOffline: true} as ReturnType<typeof useNetwork>);
            await setAppLoadState({hasLoadedApp: false, isLoadingApp: false, ongoingRequest: buildRequest(WRITE_COMMANDS.OPEN_APP)});

            renderHomePage();

            expect(screen.getByTestId('homePageSkeleton')).toBeOnTheScreen();
            expect(screen.queryAllByTestId(/^section-/)).toHaveLength(0);
        });

        // Reaching the ongoing key at all means the request was being sent, so the offline stamp is stale by
        // then and the skeleton stays.
        it('keeps the skeleton for an in-flight OpenApp that was first queued offline', async () => {
            mockUseNetwork.mockReturnValue({isOffline: true} as ReturnType<typeof useNetwork>);
            await setAppLoadState({hasLoadedApp: false, isLoadingApp: false, ongoingRequest: buildRequest(WRITE_COMMANDS.OPEN_APP, true)});

            renderHomePage();

            expect(screen.getByTestId('homePageSkeleton')).toBeOnTheScreen();
        });

        // A restart rehydrates PERSISTED_ONGOING_REQUESTS, so the request is not being sent at that instant.
        // `SequentialQueue.process` proceeds on an ongoing request alone, so it resumes on reconnect. Pinned
        // because the alternative reading, that this is a skeleton which can never resolve, is the plausible
        // wrong one.
        it('keeps the skeleton offline for an OpenApp left in the ongoing key by a killed process', async () => {
            mockUseNetwork.mockReturnValue({isOffline: true} as ReturnType<typeof useNetwork>);
            await setAppLoadState({hasLoadedApp: false, isLoadingApp: true, ongoingRequest: buildRequest(WRITE_COMMANDS.OPEN_APP)});

            renderHomePage();

            expect(screen.getByTestId('homePageSkeleton')).toBeOnTheScreen();
            expect(screen.queryAllByTestId(/^section-/)).toHaveLength(0);
        });

        // The recovery fallback reads a stranded IS_LOADING_APP rather than the queue, so offline it cannot
        // tell a load in progress from one that will never resume.
        it('renders the sections, not the skeleton, for an interrupted cold start while offline', async () => {
            mockUseNetwork.mockReturnValue({isOffline: true} as ReturnType<typeof useNetwork>);
            await setAppLoadState({hasLoadedApp: false, isLoadingApp: true});

            renderHomePage();

            expect(screen.queryByTestId('homePageSkeleton')).not.toBeOnTheScreen();
            expect(screen.queryAllByTestId(/^section-/)).not.toHaveLength(0);
        });

        it('renders the skeleton in place of both columns on wide layout', async () => {
            setWideLayout();
            await setAppLoadState({hasLoadedApp: false, isLoadingApp: false, requests: [buildRequest(WRITE_COMMANDS.OPEN_APP)]});

            renderHomePage();

            expect(screen.getByTestId('homePageSkeleton')).toBeOnTheScreen();
            expect(screen.queryByTestId('homePageLeftColumn')).not.toBeOnTheScreen();
            expect(screen.queryByTestId('homePageRightColumn')).not.toBeOnTheScreen();
        });
    });
});
