import {act, render} from '@testing-library/react-native';

import type {ParamListBase, TabNavigationState} from '@react-navigation/native';

import {NativeBottomTabView} from '@react-navigation/bottom-tabs/unstable';
import {DefaultTheme, ThemeProvider} from '@react-navigation/native';
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

// Each mounted native tab, and each mounted tab content as `<route key>@<native tab it is drawn inside>`, in mount order
const mockNativeTabMounts: string[] = [];
const contentMounts: string[] = [];
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

function TabContent({routeKey}: {routeKey: string}) {
    const nativeTab = useContext(jest.requireMock<{mockNativeTabContext: React.Context<string | undefined>}>('react-native-screens').mockNativeTabContext);
    useEffect(() => {
        contentMounts.push(`${routeKey}@${nativeTab}`);
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

function renderFlatNav(focusedRouteName: string, {navigation = buildNavigation(), options = FLAT_NAV_OPTIONS} = {}) {
    return render(renderTabView(buildFlatNavTabState(focusedRouteName), navigation, [], options));
}

function selectNatively(selectedScreenKey: string) {
    act(() => {
        mockLatestHostProps?.onTabSelected({nativeEvent: {selectedScreenKey, provenance: 1, actionOrigin: 'user'}});
    });
}

describe('NativeBottomTabView', () => {
    beforeEach(() => {
        mockNativeTabMounts.length = 0;
        contentMounts.length = 0;
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
        expect(contentMounts.filter((mount) => mount.startsWith('Inbox'))).toEqual(['Inbox-key-1@Inbox', 'Inbox-key-2@Inbox']);
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

    it.each([
        {focusedRouteName: 'Spend', hostRouteName: 'Expenses', repeatedTabSelection: {popToRoot: true, scrollToTop: true}},
        {focusedRouteName: 'Workspaces', hostRouteName: 'More', repeatedTabSelection: {popToRoot: false, scrollToTop: false}},
    ])('selects and draws $focusedRouteName inside its explicit host $hostRouteName', ({focusedRouteName, hostRouteName, repeatedTabSelection}) => {
        // Given a hidden route focused with a placeholder as its host, as the flat nav bar does. More has its own selection
        // disabled, because a tap on it opens a menu.
        renderFlatNav(focusedRouteName);

        // When the native host is asked which tab to select
        // Then it selects the host and keeps its selection drawn, so the bar highlights the slot the route stands in
        expect(mockLatestHostProps?.navStateRequest.selectedScreenKey).toBe(hostRouteName);
        expect(mockLatestHostProps?.tabBarItemSelectionHidden).toBe(false);
        // And the route is drawn inside that host rather than the first visible tab
        expect(contentMounts).toContain(`${focusedRouteName}-key@${hostRouteName}`);
        // And a repeated tap pops and scrolls the route as a tap on a selected tab does, unless the host leaves it to JS
        // because its selection is disabled
        expect(mockLatestScreenProps.get(hostRouteName)?.specialEffects?.repeatedTabSelection).toEqual(repeatedTabSelection);
    });

    it.each([
        {tappedRouteName: 'Expenses', expectedDispatches: []},
        {tappedRouteName: 'Inbox', expectedDispatches: [[expect.objectContaining({type: 'NAVIGATE', payload: expect.objectContaining({name: 'Inbox'}), target: 'tab'})]]},
    ])('leaves a hidden route only when the user taps a tab other than its host: $tappedRouteName', ({tappedRouteName, expectedDispatches}) => {
        // Given Spend focused inside the natively selected Expenses placeholder
        const navigation = buildNavigation();
        renderFlatNav('Spend', {navigation});

        // When the user taps its host again, which native reports as a repeated selection, or another visible tab
        selectNatively(tappedRouteName);

        // Then the press reaches the tapped tab, but JS navigates only away from the host: Expenses shows as selected, so
        // a tap on it repeats the selection of Spend instead of leaving it
        expect(navigation.emit).toHaveBeenCalledWith({type: 'tabPress', target: `${tappedRouteName}-key`});
        expect(navigation.dispatch.mock.calls).toEqual(expectedDispatches);
    });

    it('mounts a route with an explicit host ahead of its first visit, inside that host', () => {
        // Given the flat nav tabs with Inbox focused, so Spend and Workspaces have not been visited
        renderFlatNav('Inbox');

        // When the deferred tabs render after the first commit
        // Then Spend and Workspaces are mounted inside their hosts, like the visible tabs, so they are ready when first opened
        expect(contentMounts).toEqual(expect.arrayContaining(['Spend-key@Expenses', 'Workspaces-key@More']));
        // And Account, which has no explicit host, stays unmounted until it is first visited, as before
        expect(contentMounts.some((mount) => mount.startsWith('Account-key'))).toBe(false);
    });

    it('falls back to the first visible tab when the host is not a visible route', () => {
        // Given Spend focused with a host that is not registered, as when the placeholders are gone after the beta is turned off
        renderFlatNav('Spend', {options: {...FLAT_NAV_OPTIONS, Spend: {tabBarItemHidden: true, tabBarItemHostRouteName: 'Missing'}}});

        // When the native host is asked which tab to select
        // Then Spend is drawn like a route without a host, so it is never left without a tab to be drawn in
        expect(mockLatestHostProps?.navStateRequest.selectedScreenKey).toBe('Inbox');
        expect(mockLatestHostProps?.tabBarItemSelectionHidden).toBe(true);
    });

    it('draws a hidden route without a host exactly as before host routes', () => {
        // Given Account focused, which has no host, next to routes that have one
        renderFlatNav('Account');

        // When the native tabs are configured
        // Then it is drawn in the first visible tab, which the host selects with no item drawn as selected and no
        // repeated selection effects, the same as patch 005 draws it
        expect(contentMounts).toContain('Account-key@Inbox');
        expect(mockLatestHostProps?.navStateRequest.selectedScreenKey).toBe('Inbox');
        expect(mockLatestHostProps?.tabBarItemSelectionHidden).toBe(true);
        expect(mockLatestScreenProps.get('Inbox')?.specialEffects?.repeatedTabSelection).toEqual({popToRoot: false, scrollToTop: false});
    });
});
