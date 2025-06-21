import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

// This file is used to define the relationship between the sidebar (LHN) and the parent split navigator.
const SIDEBAR_TO_SPLIT = {
    [SCREENS.SETTINGS.ROOT]: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR,
    [SCREENS.HOME]: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
    [SCREENS.WORKSPACE.INITIAL]: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR,
};

export default SIDEBAR_TO_SPLIT;
