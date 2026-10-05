import navigateToInboxTab from '@components/Navigation/NavigationTabBar/navigateToInboxTab';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import ROUTE_TO_NAVIGATION_TAB from '@components/Navigation/NavigationTabBar/ROUTE_TO_NAVIGATION_TAB';

import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import {startNavigateToReportsTabSpans} from '@libs/telemetry/startTabNavigationSpans';

import type {ValueOf} from 'type-fest';

type NavigationTab = ValueOf<typeof NAVIGATION_TABS>;

/** Tabs the JS tab buttons keep from anonymous users, who get the sign-in modal instead. */
const ANONYMOUS_GATED_TABS = new Set<NavigationTab>([NAVIGATION_TABS.SEARCH, NAVIGATION_TABS.INSIGHTS, NAVIGATION_TABS.SETTINGS]);

/**
 * What a tap on the native bar does on top of the tab switch, mirroring the JS tab buttons the native bar replaces.
 * Inbox opens at its chat list, so it is switched by JS navigation rather than by the native selection.
 */
const NAVIGATION_TAB_PRESS_HANDLERS: Partial<Record<NavigationTab, () => void>> = {
    [NAVIGATION_TABS.INBOX]: navigateToInboxTab,
    [NAVIGATION_TABS.SEARCH]: () => interceptAnonymousUser(startNavigateToReportsTabSpans),
    [NAVIGATION_TABS.INSIGHTS]: () => interceptAnonymousUser(() => {}),
    [NAVIGATION_TABS.SETTINGS]: () => interceptAnonymousUser(() => {}),
};

/** Whether the native bar switches to the tab itself, or leaves the switch to the tab's press handler. */
function isNativeTabSelectionEnabled(routeName: string, isAnonymousUser: boolean) {
    const tab = ROUTE_TO_NAVIGATION_TAB[routeName];
    return tab !== NAVIGATION_TABS.INBOX && !(isAnonymousUser && ANONYMOUS_GATED_TABS.has(tab));
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
