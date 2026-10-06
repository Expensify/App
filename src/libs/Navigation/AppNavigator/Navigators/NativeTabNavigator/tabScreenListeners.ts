import navigateToInboxTab from '@components/Navigation/NavigationTabBar/navigateToInboxTab';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import ROUTE_TO_NAVIGATION_TAB from '@components/Navigation/NavigationTabBar/ROUTE_TO_NAVIGATION_TAB';

import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import getFocusedLeafScreenName from '@libs/Navigation/helpers/getFocusedLeafScreenName';
import {startNavigateToInboxTabSpan, startNavigateToReportsTabSpans} from '@libs/telemetry/startTabNavigationSpans';

import SCREENS from '@src/SCREENS';

import type {NavigationState, PartialState} from '@react-navigation/native';
import type {ValueOf} from 'type-fest';

type NavigationTab = ValueOf<typeof NAVIGATION_TABS>;

/** Tabs the JS tab buttons keep from anonymous users, who get the sign-in modal instead. */
const ANONYMOUS_GATED_TABS = new Set<NavigationTab>([NAVIGATION_TABS.SEARCH, NAVIGATION_TABS.INSIGHTS, NAVIGATION_TABS.WORKSPACES, NAVIGATION_TABS.SETTINGS]);

type TabRoute = {
    name: string;
    state?: NavigationState | PartialState<NavigationState>;
};

/** Whether Inbox shows its chat list, which is where its JS tab button opens it. */
function isInboxTabAtChatList(inboxRoute: TabRoute | undefined) {
    return getFocusedLeafScreenName(inboxRoute?.state) === SCREENS.INBOX;
}

/**
 * What a tap on the native bar does on top of the tab switch, mirroring the JS tab buttons the native bar replaces.
 * Workspaces is handled by TabPressListeners, which needs Onyx data.
 */
const NAVIGATION_TAB_PRESS_HANDLERS: Partial<Record<NavigationTab, (route: TabRoute) => void>> = {
    [NAVIGATION_TABS.INBOX]: (route) => (isInboxTabAtChatList(route) ? startNavigateToInboxTabSpan({isWideLayout: false}) : navigateToInboxTab()),
    [NAVIGATION_TABS.SEARCH]: () => interceptAnonymousUser(startNavigateToReportsTabSpans),
    [NAVIGATION_TABS.INSIGHTS]: () => interceptAnonymousUser(() => {}),
    [NAVIGATION_TABS.SETTINGS]: () => interceptAnonymousUser(() => {}),
};

type NativeTabSelectionParams = {
    isAnonymousUser: boolean;
    isInboxAtChatList: boolean;
    /** Whether Workspaces shows what its JS tab button restores, see useIsWorkspacesTabRestored. */
    isWorkspacesTabRestored: boolean;
};

/**
 * Whether the native bar switches to the tab itself, or leaves the switch to the tab's press handler. The native switch
 * is kept whenever the tab already shows what its JS tab button opens, because a prevented selection makes the iOS bar
 * slide back to the current tab before JS moves it to the new one.
 */
function isNativeTabSelectionEnabled(routeName: string, {isAnonymousUser, isInboxAtChatList, isWorkspacesTabRestored}: NativeTabSelectionParams) {
    const tab = ROUTE_TO_NAVIGATION_TAB[routeName];
    if (isAnonymousUser && ANONYMOUS_GATED_TABS.has(tab)) {
        return false;
    }
    if (tab === NAVIGATION_TABS.INBOX) {
        return isInboxAtChatList;
    }
    if (tab === NAVIGATION_TABS.WORKSPACES) {
        return isWorkspacesTabRestored;
    }
    return true;
}

type TabScreenListenerProps = {
    route: TabRoute;
    navigation: {isFocused: () => boolean};
};

/**
 * Native tabs emit `tabPress` when a user tap reaches JS, both for a tab the bar switched to and for one whose
 * selection is disabled. A tap on the already focused tab does nothing, the same as a JS tab button pressed on its own tab.
 */
function tabScreenListeners({route, navigation}: TabScreenListenerProps) {
    return {
        tabPress: () => {
            if (navigation.isFocused()) {
                return;
            }
            NAVIGATION_TAB_PRESS_HANDLERS[ROUTE_TO_NAVIGATION_TAB[route.name]]?.(route);
        },
    };
}

export default tabScreenListeners;
export {isInboxTabAtChatList, isNativeTabSelectionEnabled};
