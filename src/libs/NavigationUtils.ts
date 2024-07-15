import cloneDeep from 'lodash/cloneDeep';
import type {TupleToUnion} from 'type-fest';
import {flattenObject} from '@src/languages/translations';
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

function isBottomTabName(screen: TupleToUnion<typeof SETTINGS_SCREENS> | undefined) {
    if (!screen) {
        return false;
    }
    return BOTTOM_TAB_SCREEN_NAMES.has(screen);
}

function isSettingTabName(screen: TupleToUnion<typeof SETTINGS_SCREENS> | undefined) {
    if (!screen) {
        return false;
    }
    return SETTINGS_TAB_SCREEN_NAMES.has(screen);
}

function isSearchTabName(screen: TupleToUnion<typeof SEARCH_SCREENS> | undefined) {
    if (!screen) {
        return false;
    }
    return SEARCH_TAB_SCREEN_NAMES.has(screen);
}

function isHomeTabName(screen: TupleToUnion<typeof HOME_SCREENS> | undefined) {
    if (!screen) {
        return false;
    }
    return HOME_SCREEN_NAMES.has(screen);
}

export {isCentralPaneName, isBottomTabName, isSearchTabName, isSettingTabName, isHomeTabName, removePolicyIDParamFromState};
