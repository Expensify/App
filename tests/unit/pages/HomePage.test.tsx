/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return -- Jest factory mocks use CommonJS require() which returns untyped modules; typing each mock precisely is not practical here */
import {render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import HomePage from '@pages/home/HomePage';
import OnyxListItemProvider from '@src/components/OnyxListItemProvider';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({shouldUseNarrowLayout: true})));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);
jest.mock('@hooks/useDocumentTitle', () => jest.fn());
jest.mock('@hooks/useConfirmReadyToOpenApp', () => jest.fn());
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

jest.mock('@pages/home/ForYouSection', () => {
    const ReactModule = require('react');
    const {View: RNView} = require('react-native');
    function MockForYouSection() {
        return ReactModule.createElement(RNView, {testID: 'section-ForYouSection'});
    }
    return MockForYouSection;
});
jest.mock('@pages/home/GettingStartedSection', () => {
    const ReactModule = require('react');
    const {View: RNView} = require('react-native');
    function MockGettingStartedSection() {
        return ReactModule.createElement(RNView, {testID: 'section-GettingStartedSection'});
    }
    return MockGettingStartedSection;
});
jest.mock('@pages/home/AnnouncementSection', () => {
    function MockAnnouncementSection() {
        return null;
    }
    return MockAnnouncementSection;
});
jest.mock('@pages/home/AssignedCardsSection', () => {
    function MockAssignedCardsSection() {
        return null;
    }
    return MockAssignedCardsSection;
});
jest.mock('@pages/home/DiscoverSection', () => {
    function MockDiscoverSection() {
        return null;
    }
    return MockDiscoverSection;
});
jest.mock('@pages/home/FreeTrialSection', () => {
    function MockFreeTrialSection() {
        return null;
    }
    return MockFreeTrialSection;
});
jest.mock('@pages/home/SpendOverTimeSection', () => {
    function MockSpendOverTimeSection() {
        return null;
    }
    return MockSpendOverTimeSection;
});
jest.mock('@pages/home/TimeSensitiveSection', () => {
    function MockTimeSensitiveSection() {
        return null;
    }
    return MockTimeSensitiveSection;
});
jest.mock('@pages/home/UpcomingTravelSection', () => {
    function MockUpcomingTravelSection() {
        return null;
    }
    return MockUpcomingTravelSection;
});

const renderHomePage = () =>
    render(
        <OnyxListItemProvider>
            <HomePage />
        </OnyxListItemProvider>,
    );

function getSectionOrder() {
    const forYou = screen.getByTestId('section-ForYouSection');
    const gettingStarted = screen.getByTestId('section-GettingStartedSection');
    const all = screen.getAllByTestId(/^section-/);
    return {
        forYouIndex: all.indexOf(forYou),
        gettingStartedIndex: all.indexOf(gettingStarted),
    };
}

// Locks in the canonical mobile ordering from https://github.com/Expensify/App/issues/85075:
// Getting started must always sit above For you on narrow layouts, regardless of the onboarding intent.
describe('HomePage mobile ordering', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it.each([
        ['no onboarding intent set', undefined],
        ['MANAGE_TEAM intent', CONST.ONBOARDING_CHOICES.MANAGE_TEAM],
        ['TRACK_WORKSPACE intent', CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE],
    ])('renders GettingStartedSection before ForYouSection on narrow layout with %s', async (_label, choice) => {
        if (choice) {
            await Onyx.set(ONYXKEYS.NVP_INTRO_SELECTED, {choice});
        }
        await waitForBatchedUpdates();

        renderHomePage();

        const {forYouIndex, gettingStartedIndex} = getSectionOrder();
        expect(forYouIndex).toBeGreaterThanOrEqual(0);
        expect(gettingStartedIndex).toBeGreaterThanOrEqual(0);
        expect(gettingStartedIndex).toBeLessThan(forYouIndex);
    });
});
