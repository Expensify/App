import {getTabNavigatorState} from '@libs/Navigation/helpers/tabNavigatorUtils';

import type NAVIGATORS from '@src/NAVIGATORS';

import type {NavigationState} from '@react-navigation/native';
import type {ValueOf} from 'type-fest';

import {useState} from 'react';

import useRootNavigationState from './useRootNavigationState';

type TabNavigatorName = ValueOf<typeof NAVIGATORS>;

/** Whether the tab is shown or under a screen drawn over it, rather than a background tab of the tab navigator. */
function isTabShown(rootState: NavigationState | undefined, tabName: TabNavigatorName) {
    if (rootState?.routes.some((route) => route.name === tabName)) {
        return true;
    }
    const tabState = getTabNavigatorState(rootState);
    return !tabState || tabState.routes.at(tabState.index ?? 0)?.name === tabName;
}

/**
 * Whether the tab has been shown since the screen mounted. Native tab bars mount every tab at startup, so a tab root
 * screen uses it to hold back the requests and writes it makes on mount until the user first opens the tab, as it does
 * when it mounts with the tab.
 */
function useHasTabBeenShown(tabName: TabNavigatorName) {
    const isShown = useRootNavigationState((rootState) => isTabShown(rootState, tabName));
    const [hasBeenShown, setHasBeenShown] = useState(isShown);
    if (isShown && !hasBeenShown) {
        setHasBeenShown(true);
    }
    return hasBeenShown;
}

export default useHasTabBeenShown;
