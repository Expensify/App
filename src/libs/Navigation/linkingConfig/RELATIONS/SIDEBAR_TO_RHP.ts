import type {SplitNavigatorLHNScreen} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';

// This file is used to define the relationship between the sidebar (LHN) and the right hand pane (RHP) screen.
// These screens don't care about the split navigator's central screen and are in relation directly to the sidebar.
const SIDEBAR_TO_RHP: Partial<Record<SplitNavigatorLHNScreen, string[]>> = {
    [SCREENS.SETTINGS.ROOT]: [
        SCREENS.SETTINGS.SHARE_CODE,
        SCREENS.SETTINGS.PROFILE.STATUS,
        SCREENS.SETTINGS.PREFERENCES.PRIORITY_MODE,
        SCREENS.SETTINGS.EXIT_SURVEY.REASON,
        SCREENS.SETTINGS.EXIT_SURVEY.RESPONSE,
        SCREENS.SETTINGS.EXIT_SURVEY.CONFIRM,
    ],
};

export default SIDEBAR_TO_RHP;
