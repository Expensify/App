
let _a;
exports.__esModule = true;
const NAVIGATION_TABS_1 = require('@components/Navigation/NavigationTabBar/NAVIGATION_TABS');
const NAVIGATORS_1 = require('@src/NAVIGATORS');

const FULLSCREEN_TO_TAB =
    ((_a = {}),
    (_a[NAVIGATORS_1['default'].REPORTS_SPLIT_NAVIGATOR] = NAVIGATION_TABS_1['default'].HOME),
    (_a[NAVIGATORS_1['default'].SEARCH_FULLSCREEN_NAVIGATOR] = NAVIGATION_TABS_1['default'].SEARCH),
    (_a[NAVIGATORS_1['default'].SETTINGS_SPLIT_NAVIGATOR] = NAVIGATION_TABS_1['default'].SETTINGS),
    (_a[NAVIGATORS_1['default'].WORKSPACE_SPLIT_NAVIGATOR] = NAVIGATION_TABS_1['default'].SETTINGS),
    _a);
exports['default'] = FULLSCREEN_TO_TAB;
