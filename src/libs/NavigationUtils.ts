import cloneDeep from 'lodash/cloneDeep';
import SCREENS from '@src/SCREENS';
import getTopmostBottomTabRoute from './Navigation/getTopmostBottomTabRoute';
import type {CentralPaneName, RootStackParamList, State} from './Navigation/types';

const CENTRAL_PANE_SCREEN_NAMES = new Set([
    SCREENS.SETTINGS.WORKSPACES,
    SCREENS.SETTINGS.PREFERENCES.ROOT,
    SCREENS.SETTINGS.SECURITY,
    SCREENS.SETTINGS.PROFILE.ROOT,
    SCREENS.SETTINGS.WALLET.ROOT,
    SCREENS.SETTINGS.ABOUT,
    SCREENS.SETTINGS.TROUBLESHOOT,
    SCREENS.SETTINGS.SAVE_THE_WORLD,
    SCREENS.SETTINGS.SUBSCRIPTION.ROOT,
    SCREENS.SEARCH.CENTRAL_PANE,
    SCREENS.REPORT,
]);

const removePolicyIDParamFromState = (state: State<RootStackParamList>) => {
    const stateCopy = cloneDeep(state);
    const bottomTabRoute = getTopmostBottomTabRoute(stateCopy);
    if (bottomTabRoute?.params && 'policyID' in bottomTabRoute.params) {
        delete bottomTabRoute.params.policyID;
    }
    return stateCopy;
};

const TAB_SETTINGS_SCREENS = [SCREENS.SETTINGS.ROOT];
const TAB_SEARCH_SCREENS = [SCREENS.SEARCH.BOTTOM_TAB, SCREENS.SEARCH.CENTRAL_PANE];
const TAB_CHAT_SCREENS = [SCREENS.HOME];

const TAB_SCREEN_NAMES = new Set([...TAB_SETTINGS_SCREENS, ...TAB_SEARCH_SCREENS, ...TAB_CHAT_SCREENS]);
const TAB_SETTINGS_SCREEN_NAMES = new Set(TAB_SETTINGS_SCREENS);
const TAB_SEARCH_SCREEN_NAMES = new Set(TAB_SEARCH_SCREENS);
const TAB_CHAT_SCREEN_NAMES = new Set(TAB_CHAT_SCREENS);

function createScreenNameChecker<ScreenName extends string>(screenNames: Set<string>) {
    return function (screen: string | undefined): screen is ScreenName {
        if (!screen) {
            return false;
        }
        return screenNames.has(screen);
    };
}

const isTabScreenName = createScreenNameChecker(TAB_SCREEN_NAMES);
const isSettingsTab = createScreenNameChecker(TAB_SETTINGS_SCREEN_NAMES);
const isSearchTab = createScreenNameChecker(TAB_SEARCH_SCREEN_NAMES);
const isHomeTab = createScreenNameChecker(TAB_CHAT_SCREEN_NAMES);
const isCentralPaneName = createScreenNameChecker<CentralPaneName>(CENTRAL_PANE_SCREEN_NAMES);

export {isTabScreenName, isCentralPaneName, isSearchTab, isHomeTab, isSettingsTab, removePolicyIDParamFromState};
