import type {NavigationState} from '@react-navigation/native';
import type {ValueOf} from 'type-fest';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import {isFullScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import {FULLSCREEN_TO_TAB} from '@libs/Navigation/linkingConfig/RELATIONS';
import type {FullScreenName, RootTabNavigatorParamList} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

const ROOT_TAB_ROUTE_TO_NAVIGATION_TAB: Partial<Record<keyof RootTabNavigatorParamList, ValueOf<typeof NAVIGATION_TABS>>> = {
    [SCREENS.HOME]: NAVIGATION_TABS.HOME,
    [NAVIGATORS.REPORTS_SPLIT_NAVIGATOR]: NAVIGATION_TABS.INBOX,
    [NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR]: NAVIGATION_TABS.SEARCH,
    [NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR]: NAVIGATION_TABS.SETTINGS,
    [SCREENS.WORKSPACES_LIST]: NAVIGATION_TABS.WORKSPACES,
};

function getSelectedTab(state: NavigationState) {
    const topmostFullScreenRoute = state?.routes.findLast((route) => isFullScreenName(route.name));

    if (topmostFullScreenRoute?.name === NAVIGATORS.ROOT_TAB_NAVIGATOR) {
        const tabState = topmostFullScreenRoute.state as {routes: {name: keyof RootTabNavigatorParamList}[]; index: number} | undefined;
        const selectedRouteName = tabState?.routes?.[tabState?.index ?? 0]?.name;
        return ROOT_TAB_ROUTE_TO_NAVIGATION_TAB[selectedRouteName ?? NAVIGATORS.REPORTS_SPLIT_NAVIGATOR] ?? NAVIGATION_TABS.INBOX;
    }

    return FULLSCREEN_TO_TAB[(topmostFullScreenRoute?.name as FullScreenName) ?? NAVIGATORS.REPORTS_SPLIT_NAVIGATOR];
}

export default getSelectedTab;
