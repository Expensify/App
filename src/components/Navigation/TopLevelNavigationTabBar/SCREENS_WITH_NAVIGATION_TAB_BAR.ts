import {SIDEBAR_TO_SPLIT} from '@libs/Navigation/linkingConfig/RELATIONS';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

// HOME and WORKSPACES_LIST are root screens of RootTabNavigator tabs, so the tab bar should be visible there.
const SCREENS_WITH_NAVIGATION_TAB_BAR = [...Object.keys(SIDEBAR_TO_SPLIT), NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, SCREENS.SEARCH.ROOT, SCREENS.HOME, SCREENS.WORKSPACES_LIST];

export default SCREENS_WITH_NAVIGATION_TAB_BAR;
