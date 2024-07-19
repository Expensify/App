import cloneDeep from 'lodash/cloneDeep';
import SCREENS from '@src/SCREENS';
import getTopmostBottomTabRoute from './Navigation/getTopmostBottomTabRoute';
import type {CentralPaneName, OnboardingFlowName, RootStackParamList, State} from './Navigation/types';

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

const ONBOARDING_SCREEN_NAMES = new Set([SCREENS.ONBOARDING.PERSONAL_DETAILS, SCREENS.ONBOARDING.PURPOSE, SCREENS.ONBOARDING.WORK, SCREENS.ONBOARDING_MODAL.ONBOARDING]);

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

export {isCentralPaneName, removePolicyIDParamFromState, isOnboardingFlowName};
