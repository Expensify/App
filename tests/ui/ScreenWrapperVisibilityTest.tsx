import {act, render} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import type {RHPWidth} from '@components/WideRHPContextProvider';

import useIsScreenVisible from '@hooks/useIsScreenVisible';

import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';

import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import type {NavigatorScreenParams} from '@react-navigation/native';

import {createNavigationContainerRef, NavigationContainer} from '@react-navigation/native';
import React, {useEffect} from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

let mockIsSmallScreenWidth = false;

jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: () => ({isSmallScreenWidth: mockIsSmallScreenWidth, shouldUseNarrowLayout: mockIsSmallScreenWidth}),
}));

// Every screen reports these RHP widths.
let mockRHPWidth: Exclude<RHPWidth, 'narrow'> | undefined;
let mockDisplayedRHPWidth: Exclude<RHPWidth, 'narrow'> | undefined;

jest.mock('@components/WideRHPContextProvider', () => ({
    ...jest.requireActual<Record<string, unknown>>('@components/WideRHPContextProvider'),
    getRHPRouteWidth: () => mockRHPWidth,
    getDisplayedRHPRouteWidth: () => mockDisplayedRHPWidth,
}));

type SplitParamList = {
    [SCREENS.WORKSPACE.INITIAL]: undefined;
    Page: undefined;
    NextPage: undefined;
};

type RootParamList = {
    Split: NavigatorScreenParams<SplitParamList>;
    Other: undefined;
};

const RootStack = createPlatformStackNavigator<RootParamList>();
const SplitStack = createPlatformStackNavigator<SplitParamList>();
const navigationRef = createNavigationContainerRef<RootParamList>();

const contentVisibility: Record<string, boolean> = {};

function Content({screenName}: {screenName: string}) {
    const isVisible = useIsScreenVisible();
    useEffect(() => {
        contentVisibility[screenName] = isVisible;
    });
    return null;
}

function Sidebar() {
    return (
        <ScreenWrapper testID="Sidebar">
            <Content screenName="Sidebar" />
        </ScreenWrapper>
    );
}

function Page() {
    return (
        <ScreenWrapper testID="Page">
            <Content screenName="Page" />
        </ScreenWrapper>
    );
}

function EmptyScreen() {
    return null;
}

function SplitNavigator() {
    return (
        <SplitStack.Navigator initialRouteName={SCREENS.WORKSPACE.INITIAL}>
            <SplitStack.Screen
                name={SCREENS.WORKSPACE.INITIAL}
                component={Sidebar}
            />
            <SplitStack.Screen
                name="Page"
                component={Page}
            />
            <SplitStack.Screen
                name="NextPage"
                component={EmptyScreen}
            />
        </SplitStack.Navigator>
    );
}

async function renderSidebarWithPageOpen() {
    render(
        <ComposeProviders components={[OnyxListItemProvider]}>
            <NavigationContainer ref={navigationRef}>
                <RootStack.Navigator>
                    <RootStack.Screen
                        name="Split"
                        component={SplitNavigator}
                    />
                    <RootStack.Screen
                        name="Other"
                        component={EmptyScreen}
                    />
                </RootStack.Navigator>
            </NavigationContainer>
        </ComposeProviders>,
    );
    act(() => {
        navigationRef.navigate('Split', {screen: 'Page'});
    });
    await waitForBatchedUpdatesWithAct();
}

describe('ScreenWrapper visibility', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        mockIsSmallScreenWidth = false;
        mockRHPWidth = undefined;
        mockDisplayedRHPWidth = undefined;
        for (const screenName of Object.keys(contentVisibility)) {
            delete contentVisibility[screenName];
        }
    });

    it('tells the content of a split navigator sidebar that it can be seen beside its focused page on a wide layout', async () => {
        // Given the workspace sidebar beside a focused workspace page on a wide layout
        // When the sidebar content asks whether its screen can be seen
        await renderSidebarWithPageOpen();

        // Then it can
        expect(contentVisibility.Sidebar).toBe(true);
    });

    it('tells the sidebar content it cannot be seen while another screen covers the workspace, and that it can once that screen closes', async () => {
        // Given the workspace sidebar beside one of its pages on a wide layout
        await renderSidebarWithPageOpen();

        // When a screen outside the workspace opens over it
        act(() => {
            navigationRef.navigate('Other');
        });
        await waitForBatchedUpdatesWithAct();

        // Then the sidebar content cannot be seen, so its highlights wait
        expect(contentVisibility.Sidebar).toBe(false);

        // When that screen closes
        act(() => {
            navigationRef.goBack();
        });
        await waitForBatchedUpdatesWithAct();

        // Then it can be seen again
        expect(contentVisibility.Sidebar).toBe(true);
    });

    it('tells the sidebar content it cannot be seen under its own page on a small screen', async () => {
        // Given a small screen, where the page covers the sidebar
        mockIsSmallScreenWidth = true;

        // When the sidebar content asks whether its screen can be seen
        await renderSidebarWithPageOpen();

        // Then it cannot
        expect(contentVisibility.Sidebar).toBe(false);
    });

    it('does not tell a workspace page it can be seen once a later page covers it, since only the sidebar is shown beside the focused page', async () => {
        // Given a workspace page on a wide layout, with the sidebar beside it
        await renderSidebarWithPageOpen();
        expect(contentVisibility.Page).toBe(true);

        // When another page of the same workspace opens over it
        act(() => {
            navigationRef.navigate('Split', {screen: 'NextPage'});
        });
        await waitForBatchedUpdatesWithAct();

        // Then the covered page cannot be seen, though its navigator is focused, while the sidebar can
        expect(contentVisibility.Page).toBe(false);
        expect(contentVisibility.Sidebar).toBe(true);
    });

    it('tells a covered screen it can be seen while it is displayed wide beneath a narrower panel', async () => {
        // Given a page displayed wide under the next one, as a report table is under an opened expense on desktop
        await renderSidebarWithPageOpen();
        mockRHPWidth = 'super-wide';
        mockDisplayedRHPWidth = 'super-wide';

        // When the next page opens over it
        act(() => {
            navigationRef.navigate('Split', {screen: 'NextPage'});
        });
        await waitForBatchedUpdatesWithAct();

        // Then the covered page can be seen, dimmed to the left of the panel on top
        expect(contentVisibility.Page).toBe(true);
    });

    it('does not tell a screen animating out of a wide RHP that it can be seen, although it keeps its width until it is gone', async () => {
        // Given a page sliding out: its width is held, but it is no longer displayed
        await renderSidebarWithPageOpen();
        mockRHPWidth = 'super-wide';
        mockDisplayedRHPWidth = undefined;

        // When another page takes focus
        act(() => {
            navigationRef.navigate('Split', {screen: 'NextPage'});
        });
        await waitForBatchedUpdatesWithAct();

        // Then the leaving page cannot be seen
        expect(contentVisibility.Page).toBe(false);
    });
});
