import {act, cleanup, render, screen} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import TabNavigatorBar from '@libs/Navigation/AppNavigator/Navigators/TabNavigatorBar';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import type {ComponentType} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {StyleSheet} from 'react-native';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

type ReactActual = {
    createElement: typeof React.createElement;
};

type ReactNativeActual = {
    View: ComponentType<{testID: string}>;
};

type UseShouldUseFlatNavigationBarModule = {
    default: () => boolean;
};

let mockShouldUseNativeVariant = false;

jest.mock('@components/Navigation/FlatNavigationBar', () => {
    const {createElement} = jest.requireActual<ReactActual>('react');
    const {View} = jest.requireActual<ReactNativeActual>('react-native');
    return () => createElement(View, {testID: 'FlatNavigationBar'});
});

jest.mock('@components/Navigation/NavigationTabBar', () => {
    const {createElement} = jest.requireActual<ReactActual>('react');
    const {View} = jest.requireActual<ReactNativeActual>('react-native');
    return () => createElement(View, {testID: 'NavigationTabBar'});
});

// Jest resolves the native variant by default, so the web one is loaded by its path and each test picks the platform.
jest.mock('@components/Navigation/FlatNavigationBar/useShouldUseFlatNavigationBar', () => {
    const web = jest.requireActual<UseShouldUseFlatNavigationBarModule>('@components/Navigation/FlatNavigationBar/useShouldUseFlatNavigationBar/index.ts');
    const native = jest.requireActual<UseShouldUseFlatNavigationBarModule>('@components/Navigation/FlatNavigationBar/useShouldUseFlatNavigationBar/index.native.ts');
    return {
        __esModule: true,
        default: () => (mockShouldUseNativeVariant ? native.default() : web.default()),
    };
});

jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: jest.fn(),
}));

const tabBarState = createMock<BottomTabBarProps['state']>({
    index: 0,
    routes: [{key: 'home', name: SCREENS.HOME, params: undefined}],
});

function isStyleProp(value: unknown): value is StyleProp<ViewStyle> {
    return value === undefined || value === null || typeof value === 'object';
}

function mockLayout(shouldUseNarrowLayout: boolean) {
    jest.mocked(useResponsiveLayout).mockReturnValue(createMock<ReturnType<typeof useResponsiveLayout>>({shouldUseNarrowLayout}));
}

async function renderBar() {
    render(
        <OnyxListItemProvider>
            <TabNavigatorBar state={tabBarState} />
        </OnyxListItemProvider>,
    );
    await waitForBatchedUpdatesWithAct();
}

function expectFlatBar() {
    expect(screen.getByTestId('FlatNavigationBar')).toBeOnTheScreen();
    expect(screen.queryByTestId('NavigationTabBar')).not.toBeOnTheScreen();
}

function expectIconBar() {
    expect(screen.getByTestId('NavigationTabBar')).toBeOnTheScreen();
    expect(screen.queryByTestId('FlatNavigationBar')).not.toBeOnTheScreen();
}

describe('TabNavigatorBar with the flatNav beta', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        mockShouldUseNativeVariant = false;
        mockLayout(false);
    });

    afterEach(async () => {
        cleanup();
        await Onyx.clear();
    });

    it('renders the flat navigation bar on wide when the beta is on', async () => {
        // Given a wide web layout and a user on the flatNav beta
        await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.FLAT_NAV]);

        // When the tab navigator draws its bar
        await renderBar();

        // Then the flat bar replaces the icon bar, because the beta is what opts the user into the new navigation
        expectFlatBar();
    });

    it('keeps the icon bar on wide when the beta is off', async () => {
        // Given a wide web layout and a user without the flatNav beta

        // When the tab navigator draws its bar
        await renderBar();

        // Then nothing changes for users outside the beta
        expectIconBar();
    });

    it('keeps the bottom bar on narrow even when the beta is on', async () => {
        // Given a narrow layout and a user on the flatNav beta
        mockLayout(true);
        await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.FLAT_NAV]);

        // When the tab navigator draws its bar
        await renderBar();

        // Then the bottom bar stays, because the flat bar is only the wide layout's navigation for now
        expectIconBar();
    });

    it('keeps the icon bar on a wide native layout even when the beta is on', async () => {
        // Given a tablet, which renders the same tab bar on wide, and a user on the flatNav beta
        mockShouldUseNativeVariant = true;
        await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.FLAT_NAV]);

        // When the tab navigator draws its bar
        await renderBar();

        // Then the icon bar stays, because the flat bar is web only until its anchors handle native safe areas
        expectIconBar();
    });

    it('swaps the icon bar for the flat bar and back as the override is switched, without reopening the app', async () => {
        // Given a wide web user who is not on the flatNav beta
        await renderBar();
        expectIconBar();

        // When the beta is switched on from the beta overrides page
        await act(async () => {
            await Onyx.merge(ONYXKEYS.BETA_OVERRIDES, {[CONST.BETAS.FLAT_NAV]: true});
        });

        // Then the flat bar replaces the icon bar in place, because testers flip the flag on a running app
        expectFlatBar();

        // When the override is switched off again
        await act(async () => {
            await Onyx.merge(ONYXKEYS.BETA_OVERRIDES, {[CONST.BETAS.FLAT_NAV]: false});
        });

        // Then the icon bar comes back, so turning the beta off leaves nothing of the new navigation behind
        expectIconBar();
    });

    it('lets an override that turns the beta off win over a user who has it on their account', async () => {
        // Given a wide web user whose account has the flatNav beta
        await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.FLAT_NAV]);
        await renderBar();
        expectFlatBar();

        // When the beta is overridden to off
        await act(async () => {
            await Onyx.merge(ONYXKEYS.BETA_OVERRIDES, {[CONST.BETAS.FLAT_NAV]: false});
        });

        // Then the icon bar shows, because an override is the way to compare both navigations on the same account
        expectIconBar();
    });

    describe('container width', () => {
        // The bar mocks render nothing of their own, so the container's style is found on the nearest ancestor that sets a width.
        function getContainerWidth(testID: string) {
            for (let node = screen.getByTestId(testID).parent; node; node = node.parent) {
                const style: unknown = node.props.style;
                const width = isStyleProp(style) ? StyleSheet.flatten(style)?.width : undefined;
                if (width !== undefined) {
                    return width;
                }
            }
            return undefined;
        }

        it('follows the collapsed rail so the central pane moves with the bar', async () => {
            // Given a user on the flatNav beta with the bar collapsed
            await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.FLAT_NAV]);
            await Onyx.set(ONYXKEYS.NVP_SEARCH_SIDEBAR, {isCollapsed: true});

            // When the tab navigator draws its bar
            await renderBar();

            // Then the container reserves only the rail plus the sidebar next to it, which is what offsets the content
            expect(getContainerWidth('FlatNavigationBar')).toBe(variables.flatNavigationBarCollapsedWidth + variables.sideBarWithLHBWidth);
        });

        it('keeps the icon bar width when the saved state is collapsed but the beta is off', async () => {
            // Given the Spend sidebar collapsed on a user outside the beta
            await Onyx.set(ONYXKEYS.NVP_SEARCH_SIDEBAR, {isCollapsed: true});

            // When the tab navigator draws its bar
            await renderBar();

            // Then the icon bar keeps its own width, so the flag changes nothing outside the beta
            expect(getContainerWidth('NavigationTabBar')).toBe(variables.navigationTabBarSize + variables.sideBarWithLHBWidth);
        });
    });
});
