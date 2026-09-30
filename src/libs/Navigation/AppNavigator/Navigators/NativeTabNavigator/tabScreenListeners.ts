import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import ROUTE_TO_NAVIGATION_TAB from '@components/Navigation/NavigationTabBar/ROUTE_TO_NAVIGATION_TAB';

import {startNavigateToInboxTabSpan, startNavigateToReportsTabSpans} from '@libs/telemetry/startTabNavigationSpans';

import type {ValueOf} from 'type-fest';

/**
 * Starts the tab-navigation spans of the tabs that have them. The native bar never renders InboxTabButton or
 * SearchTabButton, which start these spans on the JS tab bar, so its taps start them here instead.
 */
const NAVIGATION_TAB_TO_SPAN_START: Partial<Record<ValueOf<typeof NAVIGATION_TABS>, () => void>> = {
    [NAVIGATION_TABS.INBOX]: () => startNavigateToInboxTabSpan({isWideLayout: false}),
    [NAVIGATION_TABS.SEARCH]: startNavigateToReportsTabSpans,
};

type TabScreenListenerProps = {
    route: {name: string};
    navigation: {isFocused: () => boolean};
};

/**
 * Native tabs emit `tabPress` when a user tap reaches JS, before the navigator switches to that tab. A tap on the
 * already focused tab also emits it, and starts no span, the same as a JS tab button pressed on its own tab.
 */
function tabScreenListeners({route, navigation}: TabScreenListenerProps) {
    return {
        tabPress: () => {
            if (navigation.isFocused()) {
                return;
            }
            NAVIGATION_TAB_TO_SPAN_START[ROUTE_TO_NAVIGATION_TAB[route.name]]?.();
        },
    };
}

export default tabScreenListeners;
