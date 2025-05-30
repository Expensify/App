import type {ValueOf} from 'type-fest';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import type {FullScreenName} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

const FULLSCREEN_TO_TAB: Record<FullScreenName, ValueOf<typeof NAVIGATION_TABS>> = {
    [NAVIGATORS.REPORTS_SPLIT_NAVIGATOR]: NAVIGATION_TABS.HOME,
    [NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR]: NAVIGATION_TABS.SEARCH,
    [NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR]: NAVIGATION_TABS.SETTINGS,
    [NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR]: NAVIGATION_TABS.WORKSPACES,
    [SCREENS.WORKSPACES_LIST]: NAVIGATION_TABS.WORKSPACES,
};

export default FULLSCREEN_TO_TAB;
