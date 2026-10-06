import navigateToInboxTab from '@components/Navigation/NavigationTabBar/navigateToInboxTab';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import ROUTE_TO_NAVIGATION_TAB from '@components/Navigation/NavigationTabBar/ROUTE_TO_NAVIGATION_TAB';

import interceptAnonymousUser from '@libs/interceptAnonymousUser';

import NAVIGATORS from '@src/NAVIGATORS';

import type {ValueOf} from 'type-fest';

type NavigationTab = ValueOf<typeof NAVIGATION_TABS>;

/** Tabs the JS tab buttons keep from anonymous users, who get the sign-in modal instead. */
const ANONYMOUS_GATED_TABS = new Set<NavigationTab>([NAVIGATION_TABS.SEARCH, NAVIGATION_TABS.INSIGHTS, NAVIGATION_TABS.SETTINGS]);

/**
 * Tabs switched by their own JS navigation rather than by the native selection, as their JS tab buttons do: Inbox opens
 * at its chat list, and Workspaces restores the last workspace or falls back to the list.
 */
const JS_SWITCHED_TABS = new Set<NavigationTab>([NAVIGATION_TABS.INBOX, NAVIGATION_TABS.WORKSPACES]);

/**
 * What a tap on the native bar does on top of the tab switch, mirroring the JS tab buttons the native bar replaces.
 * Spend and Workspaces are handled by TabPressListeners, which need Onyx data.
 */
const NAVIGATION_TAB_PRESS_HANDLERS: Partial<Record<NavigationTab, () => void>> = {
    [NAVIGATION_TABS.INBOX]: navigateToInboxTab,
    [NAVIGATION_TABS.INSIGHTS]: () => interceptAnonymousUser(() => {}),
    [NAVIGATION_TABS.SETTINGS]: () => interceptAnonymousUser(() => {}),
};

type NativeTabSelectionParams = {
    isAnonymousUser: boolean;
    /** Spend's first visit opens the latest search kept in Onyx, which the tab mounted at startup does not show yet. */
    hasSpendBeenSelected: boolean;
};

/** Whether the native bar switches to the tab itself, or leaves the switch to the tab's press handler. */
function isNativeTabSelectionEnabled(routeName: string, {isAnonymousUser, hasSpendBeenSelected}: NativeTabSelectionParams) {
    if (routeName === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR && !hasSpendBeenSelected) {
        return false;
    }
    const tab = ROUTE_TO_NAVIGATION_TAB[routeName];
    return !JS_SWITCHED_TABS.has(tab) && !(isAnonymousUser && ANONYMOUS_GATED_TABS.has(tab));
}

type TabScreenListenerProps = {
    route: {name: string};
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
            NAVIGATION_TAB_PRESS_HANDLERS[ROUTE_TO_NAVIGATION_TAB[route.name]]?.();
        },
    };
}

export default tabScreenListeners;
export {isNativeTabSelectionEnabled};
