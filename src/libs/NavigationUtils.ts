import cloneDeep from 'lodash/cloneDeep';
import SCREENS from '@src/SCREENS';
import {flattenObject} from './flattenObject';
import getTopmostBottomTabRoute from './Navigation/getTopmostBottomTabRoute';
import type {BottomTabScreenName, CentralPaneName, RootStackParamList, State} from './Navigation/types';

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

function isCentralPaneName(screen: string | undefined): screen is CentralPaneName {
    if (!screen) {
        return false;
    }

    return CENTRAL_PANE_SCREEN_NAMES.has(screen as CentralPaneName);
}

const removePolicyIDParamFromState = (state: State<RootStackParamList>) => {
    const stateCopy = cloneDeep(state);
    const bottomTabRoute = getTopmostBottomTabRoute(stateCopy);
    if (bottomTabRoute?.params && 'policyID' in bottomTabRoute.params) {
        delete bottomTabRoute.params.policyID;
    }
    return stateCopy;
};

const SETTINGS_SCREENS = Object.values(flattenObject(SCREENS.SETTINGS));
const SEARCH_SCREENS = Object.values(flattenObject(SCREENS.SEARCH));
const HOME_SCREENS = [SCREENS.HOME, SCREENS.REPORT];
const BOTTOM_TAB_SCREEN_NAMES = new Set([...SETTINGS_SCREENS, ...SEARCH_SCREENS, ...HOME_SCREENS]);

const SETTINGS_TAB_SCREEN_NAMES = new Set(SETTINGS_SCREENS);

const SEARCH_TAB_SCREEN_NAMES = new Set(SEARCH_SCREENS);

const HOME_SCREEN_NAMES = new Set(HOME_SCREENS);

function isBottomTabName(screen: string | undefined): screen is BottomTabScreenName {
    if (!screen) {
        return false;
    }
    return BOTTOM_TAB_SCREEN_NAMES.has(screen as any);
}

function isSettingTabName(screen: string | undefined): screen is any {
    if (!screen) {
        return false;
    }
    return SETTINGS_TAB_SCREEN_NAMES.has(screen as any);
}

function isSearchTabName(screen: string | undefined): screen is (typeof SEARCH_SCREENS)[0] {
    if (!screen) {
        return false;
    }
    return SEARCH_TAB_SCREEN_NAMES.has(screen as (typeof SEARCH_SCREENS)[0]);
}

function isHomeTabName(screen: string | undefined): screen is (typeof HOME_SCREENS)[0] {
    if (!screen) {
        return false;
    }
    return HOME_SCREEN_NAMES.has(screen as (typeof HOME_SCREENS)[0]);
}

export {isCentralPaneName, isBottomTabName, isSearchTabName, isSettingTabName, isHomeTabName, removePolicyIDParamFromState};
