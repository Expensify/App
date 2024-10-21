import cloneDeep from 'lodash/cloneDeep';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import getTopmostBottomTabRoute from './Navigation/getTopmostBottomTabRoute';
import type {CentralPaneName, FullScreenName, OnboardingFlowName, RootStackParamList, SplitNavigatorName, State} from './Navigation/types';

const SPLIT_NAVIGATORS = [NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR, NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR];

const SPLIT_NAVIGATORS_SET = new Set(SPLIT_NAVIGATORS);

const FULL_SCREEN_ROUTES_SET = new Set([...SPLIT_NAVIGATORS, SCREENS.SEARCH.CENTRAL_PANE]);

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

const ONBOARDING_SCREEN_NAMES = new Set([
    SCREENS.ONBOARDING.PERSONAL_DETAILS,
    SCREENS.ONBOARDING.PURPOSE,
    SCREENS.ONBOARDING_MODAL.ONBOARDING,
    SCREENS.ONBOARDING.EMPLOYEES,
    SCREENS.ONBOARDING.ACCOUNTING,
]);

const removePolicyIDParamFromState = (state: State<RootStackParamList>) => {
    const stateCopy = cloneDeep(state);
    const bottomTabRoute = getTopmostBottomTabRoute(stateCopy);
    if (bottomTabRoute?.params && 'policyID' in bottomTabRoute.params) {
        delete bottomTabRoute.params.policyID;
    }
    return stateCopy;
};

function isCentralPaneName(screen: string | undefined): screen is CentralPaneName {
    if (!screen) {
        return false;
    }
    return CENTRAL_PANE_SCREEN_NAMES.has(screen as CentralPaneName);
}

function isOnboardingFlowName(screen: string | undefined): screen is OnboardingFlowName {
    if (!screen) {
        return false;
    }

    return ONBOARDING_SCREEN_NAMES.has(screen as OnboardingFlowName);
}

function isSplitNavigatorName(screen: string | undefined): screen is SplitNavigatorName {
    if (!screen) {
        return false;
    }

    return SPLIT_NAVIGATORS_SET.has(screen as SplitNavigatorName);
}

function isFullScreenName(screen: string | undefined): screen is FullScreenName {
    if (!screen) {
        return false;
    }

    return FULL_SCREEN_ROUTES_SET.has(screen as FullScreenName);
}

export {isCentralPaneName, isFullScreenName, isOnboardingFlowName, isSplitNavigatorName, removePolicyIDParamFromState};
