import {act, render} from '@testing-library/react-native';

import type {ParamListBase, TabNavigationState} from '@react-navigation/native';

import {NativeBottomTabView} from '@react-navigation/bottom-tabs/unstable';
import {DefaultTheme, ThemeProvider} from '@react-navigation/native';
import React, {useEffect} from 'react';

type NativeBottomTabViewProps = Parameters<typeof NativeBottomTabView>[0];

type MockTabsHostProps = {
    navStateRequest: {selectedScreenKey: string};
    onTabSelected: (event: {nativeEvent: {selectedScreenKey: string; provenance: number; actionOrigin: string}}) => void;
    children: React.ReactNode;
};

type MockTabsScreenProps = {
    screenKey: string;
    children: React.ReactNode;
};

// The published types describe the web stub, which renders nothing. Jest resolves the native view.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const NativeTabView = NativeBottomTabView as unknown as React.ComponentType<NativeBottomTabViewProps>;

// Each mounted native tab and each mounted tab content, in mount order
const mockNativeTabMounts: string[] = [];
const contentMounts: string[] = [];
let mockLatestHostProps: MockTabsHostProps | undefined;

jest.mock('react-native-screens', () => {
    const {useEffect: mockUseEffect} = jest.requireActual<typeof React>('react');

    function Host(props: MockTabsHostProps) {
        mockLatestHostProps = props;
        return props.children;
    }

    function Screen({screenKey, children}: MockTabsScreenProps) {
        mockUseEffect(() => {
            mockNativeTabMounts.push(screenKey);
        }, []);
        return children;
    }

    return {Tabs: {Host, Screen}};
});

function TabContent({routeKey}: {routeKey: string}) {
    useEffect(() => {
        contentMounts.push(routeKey);
    }, [routeKey]);
    return null;
}

function buildTabState(inboxKey: string): TabNavigationState<ParamListBase> {
    return {
        type: 'tab',
        key: 'tab',
        index: 0,
        stale: false,
        routeNames: ['Inbox', 'Spend'],
        routes: [
            {name: 'Inbox', key: inboxKey},
            {name: 'Spend', key: 'Spend-key'},
        ],
        history: [{type: 'route', key: inboxKey}],
        preloadedRouteKeys: [],
    };
}

// Account focused with no item in the native bar, as with the Insights beta
function buildHiddenAccountTabState(): TabNavigationState<ParamListBase> {
    return {
        type: 'tab',
        key: 'tab',
        index: 1,
        stale: false,
        routeNames: ['Inbox', 'Account'],
        routes: [
            {name: 'Inbox', key: 'Inbox-key'},
            {name: 'Account', key: 'Account-key'},
        ],
        history: [{type: 'route', key: 'Account-key'}],
        preloadedRouteKeys: [],
    };
}

function buildNavigation() {
    return {dispatch: jest.fn(), emit: jest.fn(), getState: jest.fn()};
}

function buildDescriptors(state: TabNavigationState<ParamListBase>, hiddenRouteNames: string[]): NativeBottomTabViewProps['descriptors'] {
    const descriptors = Object.fromEntries(
        state.routes.map((route) => [
            route.key,
            {
                route,
                options: {tabBarItemHidden: hiddenRouteNames.includes(route.name)},
                navigation: {},
                render: () => <TabContent routeKey={route.key} />,
            },
        ]),
    );
    // The view reads only the fields built above.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return descriptors as unknown as NativeBottomTabViewProps['descriptors'];
}

function renderTabView(state: TabNavigationState<ParamListBase>, navigation: ReturnType<typeof buildNavigation>, hiddenRouteNames: string[] = []) {
    return (
        <ThemeProvider value={DefaultTheme}>
            <NativeTabView
                state={state}
                // The view calls only the navigation methods the mock provides.
                // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
                navigation={navigation as unknown as NativeBottomTabViewProps['navigation']}
                descriptors={buildDescriptors(state, hiddenRouteNames)}
            />
        </ThemeProvider>
    );
}

describe('NativeBottomTabView', () => {
    beforeEach(() => {
        mockNativeTabMounts.length = 0;
        contentMounts.length = 0;
        mockLatestHostProps = undefined;
    });

    it('keeps the native tab when the focused route gets a new key, and remounts only its content', () => {
        // Given the Inbox tab focused under a native tab bar
        const navigation = buildNavigation();
        const {rerender} = render(renderTabView(buildTabState('Inbox-key-1'), navigation));

        // When the Inbox route gets a new key, as the pre-insert under the RHP does to remount it without a push flash (#90985)
        rerender(renderTabView(buildTabState('Inbox-key-2'), navigation));

        // Then no native tab is mounted again, since Android never removes the replaced one and would show Inbox twice
        expect(mockNativeTabMounts).toEqual(['Inbox', 'Spend']);
        // And the Inbox content still remounts under its new key, so the remount the new key asks for still happens
        expect(contentMounts.filter((routeKey) => routeKey.startsWith('Inbox'))).toEqual(['Inbox-key-1', 'Inbox-key-2']);
        // And native is asked to select the tab by its route name, which did not change
        expect(mockLatestHostProps?.navStateRequest.selectedScreenKey).toBe('Inbox');
    });

    it('switches to the route whose name native reports as selected', () => {
        // Given the Inbox tab focused under a native tab bar
        const navigation = buildNavigation();
        render(renderTabView(buildTabState('Inbox-key-1'), navigation));

        // When the user selects the Spend tab natively, which reports the tab by its route name
        act(() => {
            mockLatestHostProps?.onTabSelected({nativeEvent: {selectedScreenKey: 'Spend', provenance: 1, actionOrigin: 'user'}});
        });

        // Then JS presses and navigates to that route, so JS follows native instead of dropping the selection
        expect(navigation.emit).toHaveBeenCalledWith({type: 'tabPress', target: 'Spend-key'});
        expect(navigation.dispatch).toHaveBeenCalledWith(expect.objectContaining({type: 'NAVIGATE', payload: expect.objectContaining({name: 'Spend'}), target: 'tab'}));
    });

    it('leaves a focused hidden route when the user taps the tab it is drawn in', () => {
        // Given Account focused, drawn in the natively selected Inbox tab
        const navigation = buildNavigation();
        render(renderTabView(buildHiddenAccountTabState(), navigation, ['Account']));

        // When the user taps Inbox, which native reports as a repeated selection of the selected tab
        act(() => {
            mockLatestHostProps?.onTabSelected({nativeEvent: {selectedScreenKey: 'Inbox', provenance: 1, actionOrigin: 'user'}});
        });

        // Then JS navigates to Inbox, since no item is drawn as selected and the tap is the user leaving Account
        expect(navigation.dispatch).toHaveBeenCalledWith(expect.objectContaining({type: 'NAVIGATE', payload: expect.objectContaining({name: 'Inbox'}), target: 'tab'}));
    });
});
