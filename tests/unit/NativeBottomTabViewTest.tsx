import {act, render} from '@testing-library/react-native';

import type {ParamListBase, TabNavigationState} from '@react-navigation/native';
import type {StyleProp, ViewStyle} from 'react-native';

import {NativeBottomTabView} from '@react-navigation/bottom-tabs/unstable';
import {DefaultTheme, ThemeProvider} from '@react-navigation/native';
import React, {useContext, useEffect} from 'react';
import {Platform, StyleSheet} from 'react-native';

type NativeBottomTabViewProps = Parameters<typeof NativeBottomTabView>[0];

type MockTabsHostProps = {
    navStateRequest: {selectedScreenKey: string};
    tabBarItemSelectionHidden?: boolean;
    tabBarItemOrder?: string[];
    onTabSelected: (event: {nativeEvent: {selectedScreenKey: string; provenance: number; actionOrigin: string}}) => void;
    onTabSelectionPrevented: (event: {nativeEvent: {selectedScreenKey: string; provenance: number; preventedScreenKey: string}}) => void;
    children: React.ReactNode;
};

type MockTabsScreenProps = {
    screenKey: string;
    hostedContentSourceScreenKey?: string;
    title?: string;
    preventNativeSelection?: boolean;
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

// Flat nav: Spend hidden and drawn in the Expenses placeholder, Workspaces hidden and drawn in More, Account hidden with
// no host. Reports is a placeholder Spend can name as its host instead.
function buildFlatNavTabState(focusedRouteName: string): TabNavigationState<ParamListBase> {
    const routeNames = ['Inbox', 'Expenses', 'Reports', 'More', 'Spend', 'Workspaces', 'Account'];
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
    Expenses: {tabBarItemHiddenRouteName: 'Spend'},
    Reports: {tabBarItemHiddenRouteName: 'Spend'},
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
    navigation.getState.mockReturnValue(state);
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

function getFlatNavOptionsWithSpendHost(hostRouteName: string) {
    return {...FLAT_NAV_OPTIONS, Spend: {tabBarItemHidden: true, tabBarItemHostRouteName: hostRouteName}};
}

function renderFlatNav(focusedRouteName: string, {navigation = buildNavigation(), options = FLAT_NAV_OPTIONS} = {}) {
    return render(renderTabView(buildFlatNavTabState(focusedRouteName), navigation, [], options));
}

function selectNatively(selectedScreenKey: string) {
    act(() => {
        mockLatestHostProps?.onTabSelected({nativeEvent: {selectedScreenKey, provenance: 1, actionOrigin: 'user'}});
    });
}

// A tap on a tab native does not select, which it reports instead of selecting it
function pressPreventedTab(preventedScreenKey: string) {
    act(() => {
        mockLatestHostProps?.onTabSelectionPrevented({nativeEvent: {selectedScreenKey: mockLatestHostProps.navStateRequest.selectedScreenKey, provenance: 1, preventedScreenKey}});
    });
}

// The press of a prevented placeholder is sent in a task after the bar is committed
function runPendingTabPress() {
    act(() => {
        jest.advanceTimersByTime(0);
    });
}

// Outside iOS two tabs trade their places in the bar when a hidden route names another host. iOS moves the native view.
function useTabsThatTradePlaces() {
    jest.replaceProperty(Platform, 'OS', 'android');
}

function isViewStyleProp(style: unknown): style is StyleProp<ViewStyle> {
    return typeof style === 'object';
}

// The `display` of the view a hidden route is drawn in, found from its content
function getHiddenRouteDisplay(screen: ReturnType<typeof render>, routeKey: string) {
    const content = screen.UNSAFE_getByProps({routeKey});
    let instance: typeof content | null = content;
    while (instance && instance.props.pointerEvents === undefined) {
        instance = instance.parent;
    }
    const style: unknown = instance?.props.style;
    return isViewStyleProp(style) ? StyleSheet.flatten(style)?.display : undefined;
}

describe('NativeBottomTabView', () => {
    beforeEach(() => {
        mockNativeTabMounts.length = 0;
        contentMounts.length = 0;
        mockLatestHostProps = undefined;
        mockLatestScreenProps.clear();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
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

    it('navigates back to the rendered tab when the user taps it after another tap navigated away before JS rendered', () => {
        // Given the Inbox tab rendered, and a native tap on Spend that navigated before JS rendered again
        const navigation = buildNavigation();
        const inboxState = buildTabState('Inbox-key-1');
        render(renderTabView(inboxState, navigation));
        selectNatively('Spend');
        navigation.getState.mockReturnValue({...inboxState, index: 1, history: [{type: 'route', key: 'Spend-key'}]});
        navigation.dispatch.mockClear();

        // When the user taps Inbox, which native already shows as selected again
        selectNatively('Inbox');

        // Then JS navigates back to Inbox, since the navigator is on Spend, so the bar and the screen do not end on different tabs
        expect(navigation.dispatch).toHaveBeenCalledWith(expect.objectContaining({type: 'NAVIGATE', payload: expect.objectContaining({name: 'Inbox'}), target: 'tab'}));
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
    it('keeps the route a host showed laid out while another tab is focused', () => {
        // Given Spend focused in its Expenses host and then Inbox focused
        const navigation = buildNavigation();
        const screen = render(renderTabView(buildFlatNavTabState('Spend'), navigation, [], FLAT_NAV_OPTIONS));
        screen.rerender(renderTabView(buildFlatNavTabState('Inbox'), navigation, [], FLAT_NAV_OPTIONS));

        // When the views the hidden routes are drawn in are laid out
        // Then Spend stays laid out in Expenses, so a native tap on Expenses shows it before JS focuses it again, and
        // Workspaces, the only route More hosts, is laid out there the same way
        expect(getHiddenRouteDisplay(screen, 'Spend-key')).toBeUndefined();
        expect(getHiddenRouteDisplay(screen, 'Workspaces-key')).toBeUndefined();
    });

    it('keeps a hidden route mounted when it names another host, and trades the places of the two tabs', () => {
        useTabsThatTradePlaces();
        // Given Spend focused and drawn inside the Expenses placeholder
        const navigation = buildNavigation();
        const screen = render(renderTabView(buildFlatNavTabState('Spend'), navigation, [], FLAT_NAV_OPTIONS));

        // When Spend names Reports as its host, as it does when its search moves to the Reports section
        screen.rerender(renderTabView(buildFlatNavTabState('Spend'), navigation, [], getFlatNavOptionsWithSpendHost('Reports')));

        // Then Spend is not mounted again, since moving it into the Reports tab would rebuild the whole screen
        expect(contentMounts.filter((mount) => mount.startsWith('Spend-key'))).toEqual(['Spend-key@Expenses']);
        // And its tab stays selected, takes the place of Reports in the bar and draws the Reports item, so the bar
        // highlights Reports over the same content
        expect(mockLatestHostProps?.navStateRequest.selectedScreenKey).toBe('Expenses');
        expect(mockLatestHostProps?.tabBarItemOrder).toEqual(['Inbox', 'Reports', 'Expenses', 'More']);
        expect(mockLatestScreenProps.get('Expenses')?.title).toBe('Reports');
        expect(mockLatestScreenProps.get('Reports')?.title).toBe('Expenses');
    });

    it.each([
        {tappedScreenKey: 'Reports', pressedRouteName: 'Expenses', expectedDispatches: [[expect.objectContaining({type: 'NAVIGATE', payload: expect.objectContaining({name: 'Expenses'})})]]},
        {tappedScreenKey: 'Expenses', pressedRouteName: 'Reports', expectedDispatches: []},
    ])('sends a press on the traded tab $tappedScreenKey to $pressedRouteName, whose item it draws', ({tappedScreenKey, pressedRouteName, expectedDispatches}) => {
        useTabsThatTradePlaces();
        // Given Spend focused in the Expenses tab, which traded places with Reports because Spend names Reports
        const navigation = buildNavigation();
        const screen = render(renderTabView(buildFlatNavTabState('Spend'), navigation, [], FLAT_NAV_OPTIONS));
        screen.rerender(renderTabView(buildFlatNavTabState('Spend'), navigation, [], getFlatNavOptionsWithSpendHost('Reports')));

        // When the user taps one of the two tabs, which native reports by the key of the tab and not of the item it draws
        selectNatively(tappedScreenKey);

        // Then the press goes to the route of the item the user tapped, and JS navigates only when that is not the
        // selected tab, so the listeners of Expenses and Reports keep answering to their own items
        expect(navigation.emit).toHaveBeenCalledWith({type: 'tabPress', target: `${pressedRouteName}-key`});
        expect(navigation.dispatch.mock.calls).toEqual(expectedDispatches);
    });

    it('keeps a hidden route mounted on iOS when it names another host, and has that host show its view', () => {
        // Given Spend focused and drawn inside the Expenses placeholder on iOS, where the bar animates its selection
        // between tabs and every item has to stay a tab of its own
        const navigation = buildNavigation();
        const screen = render(renderTabView(buildFlatNavTabState('Spend'), navigation, [], FLAT_NAV_OPTIONS));

        // When Spend names Reports as its host
        screen.rerender(renderTabView(buildFlatNavTabState('Spend'), navigation, [], getFlatNavOptionsWithSpendHost('Reports')));

        // Then Spend is not mounted again and no tab changes its place or item
        expect(contentMounts.filter((mount) => mount.startsWith('Spend-key'))).toEqual(['Spend-key@Expenses']);
        expect(mockLatestHostProps?.tabBarItemOrder).toBeUndefined();
        expect(mockLatestScreenProps.get('Reports')?.title).toBe('Reports');
        // And native selects Reports, which shows the hosted view of Expenses while it is selected
        expect(mockLatestHostProps?.navStateRequest.selectedScreenKey).toBe('Reports');
        expect(mockLatestScreenProps.get('Reports')?.hostedContentSourceScreenKey).toBe('Expenses');
        expect(mockLatestScreenProps.get('Expenses')?.hostedContentSourceScreenKey).toBeUndefined();
    });

    it('lets native select a placeholder on iOS that shows a hidden route drawn in another tab', () => {
        // Given Inbox focused and Spend drawn in Expenses on iOS, with Reports a placeholder whose press opens Spend too
        const screen = renderFlatNav('Inbox');

        // When the native tabs are configured
        // Then native may select Reports, which shows the hosted view of Expenses, so the tap shows Spend at once and
        // the bar animates its selection as for any other tab
        expect(mockLatestScreenProps.get('Reports')?.preventNativeSelection).toBe(false);
        expect(mockLatestScreenProps.get('Reports')?.hostedContentSourceScreenKey).toBe('Expenses');
        // And Spend stays laid out for it, and More, which opens no hidden route, shows no other tab's view
        expect(getHiddenRouteDisplay(screen, 'Spend-key')).toBeUndefined();
        expect(mockLatestScreenProps.get('More')?.hostedContentSourceScreenKey).toBeUndefined();
    });

    it('keeps native from selecting a placeholder whose hidden route is drawn in another tab', () => {
        useTabsThatTradePlaces();
        // Given Spend drawn in the Expenses placeholder, and Reports a placeholder whose press opens Spend too
        renderFlatNav('Inbox');

        // When the native tabs are configured
        // Then native may select Expenses, which shows Spend, but not Reports, which would show an empty tab until JS
        // moved Spend under it
        expect(mockLatestScreenProps.get('Expenses')?.preventNativeSelection).toBe(false);
        expect(mockLatestScreenProps.get('Reports')?.preventNativeSelection).toBe(true);
    });

    it('shows a pressed placeholder selected over its hidden route before the press starts the navigation', () => {
        useTabsThatTradePlaces();
        // Given Inbox focused, Spend drawn in Expenses, and a Reports press that navigates, as the app listener does
        const navigation = buildNavigation();
        const pressedState = {...buildFlatNavTabState('Spend')};
        navigation.emit.mockImplementation(() => navigation.getState.mockReturnValue(pressedState));
        renderFlatNav('Inbox', {navigation});

        // When the user taps Reports, which native reports as a prevented selection
        pressPreventedTab('Reports');

        // Then the tab with Spend is selected in the place of Reports with the Reports item before the press is sent,
        // since native mounts the bar only when the task ends and the render of the navigation would hold it back
        expect(mockLatestHostProps?.navStateRequest.selectedScreenKey).toBe('Expenses');
        expect(mockLatestHostProps?.tabBarItemOrder).toEqual(['Inbox', 'Reports', 'Expenses', 'More']);
        expect(mockLatestScreenProps.get('Expenses')?.title).toBe('Reports');
        expect(navigation.emit).not.toHaveBeenCalled();
        // And the press then reaches Reports, whose listener starts the navigation, with the bar left as it is
        runPendingTabPress();
        expect(navigation.emit).toHaveBeenCalledWith({type: 'tabPress', target: 'Reports-key'});
        expect(mockLatestHostProps?.navStateRequest.selectedScreenKey).toBe('Expenses');
    });

    it('puts the bar back when the press of a placeholder starts no navigation', () => {
        useTabsThatTradePlaces();
        // Given Inbox focused, Spend drawn in Expenses, and a Reports press no listener answers, as for an anonymous user
        const navigation = buildNavigation();
        renderFlatNav('Inbox', {navigation});

        // When the user taps Reports and the press is sent
        pressPreventedTab('Reports');
        runPendingTabPress();

        // Then the press is sent, and with the navigation state unchanged the bar selects Inbox in the first order
        // again, so it does not stay on an item whose route was never opened
        expect(navigation.emit).toHaveBeenCalledWith({type: 'tabPress', target: 'Reports-key'});
        expect(mockLatestHostProps?.navStateRequest.selectedScreenKey).toBe('Inbox');
        expect(mockLatestHostProps?.tabBarItemOrder).toEqual(['Inbox', 'Expenses', 'Reports', 'More']);
    });

    it('lets a pressed placeholder expire when the navigation never names it as the host', () => {
        useTabsThatTradePlaces();
        // Given Inbox focused, Spend drawn in Expenses, and a Reports press whose listener changes the state without
        // moving Spend under Reports
        const navigation = buildNavigation();
        navigation.emit.mockImplementation(() => navigation.getState.mockReturnValue({...buildFlatNavTabState('Inbox')}));
        renderFlatNav('Inbox', {navigation});

        // When the user taps Reports and the press stays unanswered
        pressPreventedTab('Reports');
        runPendingTabPress();
        act(() => {
            jest.advanceTimersByTime(2000);
        });

        // Then the bar selects Inbox in the first order again, so it does not stay on Reports over a route that never
        // moved there
        expect(mockLatestHostProps?.navStateRequest.selectedScreenKey).toBe('Inbox');
        expect(mockLatestHostProps?.tabBarItemOrder).toEqual(['Inbox', 'Expenses', 'Reports', 'More']);
    });

    it('leaves a tab in its place when the focused route needs it, and hides the route that named it', () => {
        useTabsThatTradePlaces();
        // Given Workspaces focused in More while Spend, drawn in Expenses, names More too, as a saved search does
        const screen = renderFlatNav('Workspaces', {options: getFlatNavOptionsWithSpendHost('More')});

        // When the bar is laid out
        // Then no tab trades places, since More has to show Workspaces under its own item
        expect(mockLatestHostProps?.navStateRequest.selectedScreenKey).toBe('More');
        expect(mockLatestHostProps?.tabBarItemOrder).toEqual(['Inbox', 'Expenses', 'Reports', 'More']);
        // And Spend is not laid out in Expenses, so a tap on Expenses does not show a search that belongs under More
        expect(getHiddenRouteDisplay(screen, 'Spend-key')).toBe('none');
    });

    it('sends no tab order when no route has an explicit host', () => {
        // Given the tabs without the flat nav placeholders
        render(renderTabView(buildTabState('Inbox-key-1'), buildNavigation()));

        // When the native host is configured
        // Then it gets no order, so the native bar keeps the order of its tabs as before
        expect(mockLatestHostProps?.tabBarItemOrder).toBeUndefined();
    });

    it('hides a hidden route without a host while it is not focused', () => {
        // Given Account, which has no host, visited and then left for Inbox
        const navigation = buildNavigation();
        const screen = render(renderTabView(buildFlatNavTabState('Account'), navigation, [], FLAT_NAV_OPTIONS));
        screen.rerender(renderTabView(buildFlatNavTabState('Inbox'), navigation, [], FLAT_NAV_OPTIONS));

        // When the view Account is drawn in is laid out
        // Then it is hidden, since it is drawn over the content of Inbox, the tab it shares
        expect(getHiddenRouteDisplay(screen, 'Account-key')).toBe('none');
    });
});
