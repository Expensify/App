import type {SplitNavigatorSidebarScreen} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';

/**
 * This file is used to define the relationship between the sidebar and the right hand pane (RHP) screen.
 * This means that going back from RHP will take the user directly to the sidebar. On wide layout the default central screen will be used to fill the space.
 */
const SIDEBAR_TO_RHP: Partial<Record<SplitNavigatorSidebarScreen, string[]>> = {
    [SCREENS.SETTINGS.ROOT]: [SCREENS.SETTINGS.SHARE_CODE, SCREENS.SETTINGS.PROFILE.STATUS, SCREENS.SETTINGS.PREFERENCES.PRIORITY_MODE],
};

export default SIDEBAR_TO_RHP;
