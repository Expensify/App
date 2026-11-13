import {act, render} from '@testing-library/react-native';

import {isNavigationToNativeTabItem} from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/nativeTabItemUtils';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type {ParamListBase, TabNavigationState} from '@react-navigation/native';

import {createNativeBottomTabNavigator, NativeBottomTabView} from '@react-navigation/bottom-tabs/unstable';
import {createNavigationContainerRef, DefaultTheme, NavigationContainer, ThemeProvider} from '@react-navigation/native';
import React, {useContext, useEffect} from 'react';

type NativeBottomTabViewProps = Parameters<typeof NativeBottomTabView>[0];

type MockTabsHostProps = {
    navStateRequest: {selectedScreenKey: string};
    tabBarItemSelectionHidden?: boolean;
    onTabSelected: (event: {nativeEvent: {selectedScreenKey: string; provenance: number; actionOrigin: string}}) => void;
    children: React.ReactNode;
};

type MockTabsScreenProps = {
    screenKey: string;
    specialEffects?: {repeatedTabSelection?: {popToRoot?: boolean; scrollToTop?: boolean}};
    children: React.ReactNode;
};

// The published types describe the web stub, which renders nothing. Jest resolves the native view.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const NativeTabView = NativeBottomTabView as unknown as React.ComponentType<NativeBottomTabViewProps>;

// Each mounted native tab and each mounted tab content, in mount order
const mockNativeTabMounts: string[] = [];
const contentMounts: string[] = [];
// Each mounted tab content with the native tab it is drawn inside, as `<route key>@<native tab>`
const contentMountsInHost: string[] = [];
let mockLatestHostProps: MockTabsHostProps | undefined;
const mockLatestScreenProps = new Map<string, MockTabsScreenProps>();

jest.mock('react-native-screens', () => {
    const {useEffect: mockUseEffect, createContext, createElement} = jest.requireActual<typeof React>('react');
    const mockNativeTabContext = createContext<string | undefined>(undefined);

    function Host(props: MockTabsHostProps) {
        mockLatestHostProps = props;
        return props.children;
    }

    function Screen(props: MockTabsScreenProps) {
        const {screenKey, children} = props;
        mockLatestScreenProps.set(screenKey, props);
        mockUseEffect(() => {
            mockNativeTabMounts.push(screenKey);
        }, []);
        return createElement(mockNativeTabContext.Provider, {value: screenKey}, children);
    }

    return {Tabs: {Host, Screen}, mockNativeTabContext};
});

function EmptyScreen() {
    return null;
}

function TabContent({routeKey}: {routeKey: string}) {
    const nativeTab = useContext(jest.requireMock<{mockNativeTabContext: React.Context<string | undefined>}>('react-native-screens').mockNativeTabContext);
    useEffect(() => {
        contentMounts.push(routeKey);
        contentMountsInHost.push(`${routeKey}@${nativeTab}`);
    }, [routeKey, nativeTab]);
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

// Flat nav: Spend hidden and drawn in the Expenses placeholder, Workspaces hidden and drawn in More, Account hidden with no host
function buildFlatNavTabState(focusedRouteName: string): TabNavigationState<ParamListBase> {
    const routeNames = ['Inbox', 'Expenses', 'More', 'Spend', 'Workspaces', 'Account'];
    return {
        type: 'tab',
        key: 'tab',
        index: routeNames.indexOf(focusedRouteName),
        stale: false,
        routeNames,
        routes: routeNames.map((name) => ({name, key: `${name}-key`})),
        history: [{type: 'route', key: `${focusedRouteName}-key`}],
        preloadedRouteKeys: [],
    };
}

const FLAT_NAV_OPTIONS: Record<string, Record<string, unknown>> = {
    More: {tabBarSelectionEnabled: false},
    Spend: {tabBarItemHidden: true, tabBarItemHostRouteName: 'Expenses'},
    Workspaces: {tabBarItemHidden: true, tabBarItemHostRouteName: 'More'},
    Account: {tabBarItemHidden: true},
};

function buildNavigation() {
    return {dispatch: jest.fn(), emit: jest.fn(), getState: jest.fn()};
}

function buildDescriptors(
    state: TabNavigationState<ParamListBase>,
    hiddenRouteNames: string[],
    optionsByRouteName: Record<string, Record<string, unknown>> = {},
): NativeBottomTabViewProps['descriptors'] {
    const descriptors = Object.fromEntries(
        state.routes.map((route) => [
            route.key,
            {
                route,
                options: {tabBarItemHidden: hiddenRouteNames.includes(route.name), ...optionsByRouteName[route.name]},
                navigation: {},
                render: () => <TabContent routeKey={route.key} />,
            },
        ]),
    );
    // The view reads only the fields built above.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return descriptors as unknown as NativeBottomTabViewProps['descriptors'];
}

function renderTabView(
    state: TabNavigationState<ParamListBase>,
    navigation: ReturnType<typeof buildNavigation>,
    hiddenRouteNames: string[] = [],
    optionsByRouteName: Record<string, Record<string, unknown>> = {},
) {
    return (
        <ThemeProvider value={DefaultTheme}>
            <NativeTabView
                state={state}
                // The view calls only the navigation methods the mock provides.
                // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
                navigation={navigation as unknown as NativeBottomTabViewProps['navigation']}
                descriptors={buildDescriptors(state, hiddenRouteNames, optionsByRouteName)}
            />
        </ThemeProvider>
    );
}

describe('NativeBottomTabView', () => {
    beforeEach(() => {
        mockNativeTabMounts.length = 0;
        contentMounts.length = 0;
        contentMountsInHost.length = 0;
        mockLatestHostProps = undefined;
        mockLatestScreenProps.clear();
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

    it('selects the explicit host of a focused hidden route and shows it as selected', () => {
        // Given Spend focused and hidden, with the Expenses placeholder as its host, as the flat nav bar does
        render(renderTabView(buildFlatNavTabState('Spend'), buildNavigation(), [], FLAT_NAV_OPTIONS));

        // When the native host is asked which tab to select
        // Then it selects Expenses and keeps its selection drawn, so the bar highlights the slot Spend stands in
        expect(mockLatestHostProps?.navStateRequest.selectedScreenKey).toBe('Expenses');
        expect(mockLatestHostProps?.tabBarItemSelectionHidden).toBe(false);
        // And a repeated tap on Expenses still pops and scrolls Spend, as a tap on a selected tab does
        expect(mockLatestScreenProps.get('Expenses')?.specialEffects?.repeatedTabSelection).toEqual({popToRoot: true, scrollToTop: true});
    });

    it('stays on a hidden route when the user taps its explicit host', () => {
        // Given Spend focused inside the natively selected Expenses placeholder
        const navigation = buildNavigation();
        render(renderTabView(buildFlatNavTabState('Spend'), navigation, [], FLAT_NAV_OPTIONS));

        // When the user taps Expenses again, which native reports as a repeated selection
        act(() => {
            mockLatestHostProps?.onTabSelected({nativeEvent: {selectedScreenKey: 'Expenses', provenance: 1, actionOrigin: 'user'}});
        });

        // Then the press reaches the placeholder, but JS does not navigate, because Expenses shows as selected and the tap
        // repeats the selection of Spend instead of leaving it
        expect(navigation.emit).toHaveBeenCalledWith({type: 'tabPress', target: 'Expenses-key'});
        expect(navigation.dispatch).not.toHaveBeenCalled();
    });

    it('mounts a route with an explicit host ahead of its first visit, inside that host', () => {
        // Given the flat nav tabs with Inbox focused, so Spend and Workspaces have not been visited
        render(renderTabView(buildFlatNavTabState('Inbox'), buildNavigation(), [], FLAT_NAV_OPTIONS));

        // When the deferred tabs render after the first commit
        // Then Spend and Workspaces are mounted, like the visible tabs, so they are ready when first opened
        expect(contentMounts).toEqual(expect.arrayContaining(['Spend-key', 'Workspaces-key']));
        // And Account, which has no explicit host, stays unmounted until it is first visited, as before
        expect(contentMounts).not.toContain('Account-key');
    });

    it('leaves the repeated selection of a host with disabled selection to JS', () => {
        // Given Workspaces focused inside More, whose own selection is disabled because a tap on it opens a menu
        render(renderTabView(buildFlatNavTabState('Workspaces'), buildNavigation(), [], FLAT_NAV_OPTIONS));

        // When the native tabs are configured
        // Then More is selected and shown as selected, but a repeated tap neither pops nor scrolls Workspaces, so the
        // tap only opens the menu
        expect(mockLatestHostProps?.navStateRequest.selectedScreenKey).toBe('More');
        expect(mockLatestHostProps?.tabBarItemSelectionHidden).toBe(false);
        expect(mockLatestScreenProps.get('More')?.specialEffects?.repeatedTabSelection).toEqual({popToRoot: false, scrollToTop: false});
    });

    it('keeps a hidden route without a host in the first visible tab with no item drawn as selected', () => {
        // Given Account focused, which has no explicit host, next to routes that have one
        render(renderTabView(buildFlatNavTabState('Account'), buildNavigation(), [], FLAT_NAV_OPTIONS));

        // When the native host is asked which tab to select
        // Then the behaviour from before host routes is unchanged: the first visible tab is selected with its selection hidden
        expect(mockLatestHostProps?.navStateRequest.selectedScreenKey).toBe('Inbox');
        expect(mockLatestHostProps?.tabBarItemSelectionHidden).toBe(true);
    });

    it('falls back to the first visible tab when the host is not a visible route', () => {
        // Given Spend focused with a host that is not registered, as when the placeholders are gone after the beta is turned off
        const options = {...FLAT_NAV_OPTIONS, Spend: {tabBarItemHidden: true, tabBarItemHostRouteName: 'Missing'}};
        render(renderTabView(buildFlatNavTabState('Spend'), buildNavigation(), [], options));

        // When the native host is asked which tab to select
        // Then Spend is drawn like a route without a host, so it is never left without a tab to be drawn in
        expect(mockLatestHostProps?.navStateRequest.selectedScreenKey).toBe('Inbox');
        expect(mockLatestHostProps?.tabBarItemSelectionHidden).toBe(true);
    });

    it('draws a hidden route without a host exactly as before host routes', () => {
        // Given the flat nav tabs with Inbox focused, where Account has no host
        const navigation = buildNavigation();
        const {rerender} = render(renderTabView(buildFlatNavTabState('Inbox'), navigation, [], FLAT_NAV_OPTIONS));

        // Then Account is not mounted before its first visit
        expect(contentMounts).not.toContain('Account-key');

        // When Account is focused
        rerender(renderTabView(buildFlatNavTabState('Account'), navigation, [], FLAT_NAV_OPTIONS));

        // Then it is drawn in the first visible tab, which the host selects with no item drawn as selected and no
        // repeated selection effects, the same as patch 005 draws it
        expect(contentMountsInHost).toContain('Account-key@Inbox');
        expect(mockLatestHostProps?.navStateRequest.selectedScreenKey).toBe('Inbox');
        expect(mockLatestHostProps?.tabBarItemSelectionHidden).toBe(true);
        expect(mockLatestScreenProps.get('Inbox')?.specialEffects?.repeatedTabSelection).toEqual({popToRoot: false, scrollToTop: false});
    });

    it('draws a route with an explicit host inside that host', () => {
        // Given Spend focused, with the Expenses placeholder as its host
        render(renderTabView(buildFlatNavTabState('Spend'), buildNavigation(), [], FLAT_NAV_OPTIONS));

        // When the tabs mount
        // Then Spend is drawn inside the Expenses native tab rather than the first visible tab
        expect(contentMountsInHost).toContain('Spend-key@Expenses');
    });

    it('leaves a hidden route when the user taps another visible tab', () => {
        // Given Spend focused inside the natively selected Expenses placeholder
        const navigation = buildNavigation();
        render(renderTabView(buildFlatNavTabState('Spend'), navigation, [], FLAT_NAV_OPTIONS));

        // When the user taps Inbox
        act(() => {
            mockLatestHostProps?.onTabSelected({nativeEvent: {selectedScreenKey: 'Inbox', provenance: 1, actionOrigin: 'user'}});
        });

        // Then JS navigates to Inbox, so the tap is not mistaken for the native bar confirming the host
        expect(navigation.dispatch).toHaveBeenCalledWith(expect.objectContaining({type: 'NAVIGATE', payload: expect.objectContaining({name: 'Inbox'}), target: 'tab'}));
    });

    it('remounts the content of a hidden route that moves to another host', () => {
        // Given Spend focused inside Expenses
        const navigation = buildNavigation();
        const {rerender} = render(renderTabView(buildFlatNavTabState('Spend'), navigation, [], FLAT_NAV_OPTIONS));

        // When its search moves it to More, as an Accounting search does
        rerender(renderTabView(buildFlatNavTabState('Spend'), navigation, [], {...FLAT_NAV_OPTIONS, Spend: {tabBarItemHidden: true, tabBarItemHostRouteName: 'More'}}));

        // Then its content mounts again inside More: moving between native tabs remounts the components, which is the
        // known cost of drawing a route inside the item it stands in
        expect(contentMountsInHost.filter((mount) => mount.startsWith('Spend-key'))).toEqual(['Spend-key@Expenses', 'Spend-key@More']);
    });
});

describe('NativeBottomTabView in a tab navigator with flat nav placeholders', () => {
    beforeEach(() => {
        mockLatestHostProps = undefined;
    });

    it('presses a placeholder and stays on Search when the user selects it', () => {
        // Given a tab navigator focused on Search, drawn inside the Reports placeholder, with a router that swallows
        // navigations to placeholders as tabRouterOverride does
        const Tab = createNativeBottomTabNavigator();
        const navigationRef = createNavigationContainerRef();
        const onExpensesPress = jest.fn();
        render(
            <NavigationContainer ref={navigationRef}>
                <Tab.Navigator
                    initialRouteName={NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR}
                    UNSTABLE_router={(originalRouter) => ({
                        getStateForAction: (state, action, options) => (isNavigationToNativeTabItem(action) ? state : originalRouter.getStateForAction(state, action, options)),
                    })}
                >
                    <Tab.Screen
                        name={SCREENS.HOME}
                        component={EmptyScreen}
                    />
                    <Tab.Screen
                        name={SCREENS.NATIVE_TAB_ITEM.EXPENSES}
                        component={EmptyScreen}
                        listeners={{tabPress: onExpensesPress}}
                    />
                    <Tab.Screen
                        name={SCREENS.NATIVE_TAB_ITEM.REPORTS}
                        component={EmptyScreen}
                    />
                    <Tab.Screen
                        name={NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR}
                        component={EmptyScreen}
                        options={{tabBarItemHidden: true, tabBarItemHostRouteName: SCREENS.NATIVE_TAB_ITEM.REPORTS}}
                    />
                </Tab.Navigator>
            </NavigationContainer>,
        );

        // When the user selects Expenses in the native bar
        act(() => {
            mockLatestHostProps?.onTabSelected({nativeEvent: {selectedScreenKey: SCREENS.NATIVE_TAB_ITEM.EXPENSES, provenance: 1, actionOrigin: 'user'}});
        });

        // Then the Expenses press reaches its listener, which opens the search, while the navigation to the placeholder
        // is swallowed and Search stays focused
        expect(onExpensesPress).toHaveBeenCalledTimes(1);
        expect(navigationRef.getCurrentRoute()?.name).toBe(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
    });
});
