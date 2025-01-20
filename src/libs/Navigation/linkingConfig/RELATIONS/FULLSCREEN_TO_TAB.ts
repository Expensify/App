import type {BottomTabName} from '@components/Navigation/BottomTabBar';
import BOTTOM_TABS from '@components/Navigation/BottomTabBar/BOTTOM_TABS';
import type {FullScreenName} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

const FULLSCREEN_TO_TAB: Record<FullScreenName, BottomTabName> = {
    [NAVIGATORS.REPORTS_SPLIT_NAVIGATOR]: BOTTOM_TABS.HOME,
    [SCREENS.SEARCH.ROOT]: BOTTOM_TABS.SEARCH,
    [NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR]: BOTTOM_TABS.SETTINGS,
    [NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR]: BOTTOM_TABS.SETTINGS,
};

export default FULLSCREEN_TO_TAB;
