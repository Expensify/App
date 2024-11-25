import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import type {FullScreenName, OnboardingFlowName, SplitNavigatorLHNScreen, SplitNavigatorName} from './Navigation/types';

const SPLIT_NAVIGATORS = [NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR, NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR];
const FULL_SCREENS = [...SPLIT_NAVIGATORS, SCREENS.SEARCH.CENTRAL_PANE];
const SIDEBARS = [SCREENS.HOME, SCREENS.SETTINGS.ROOT, SCREENS.WORKSPACE.INITIAL];
const ONBOARDING_SCREENS = [
    SCREENS.ONBOARDING.PERSONAL_DETAILS,
    SCREENS.ONBOARDING.PURPOSE,
    SCREENS.ONBOARDING_MODAL.ONBOARDING,
    SCREENS.ONBOARDING.EMPLOYEES,
    SCREENS.ONBOARDING.ACCOUNTING,
];

const SPLIT_NAVIGATORS_SET = new Set(SPLIT_NAVIGATORS);
const FULL_SCREENS_SET = new Set(FULL_SCREENS);
const SIDEBARS_SET = new Set(SIDEBARS);
const ONBOARDING_SCREENS_SET = new Set(ONBOARDING_SCREENS);

function checkIfScreenHasMatchingNameToSetValues<T extends string>(screen: string | undefined, set: Set<T>): screen is T {
    if (!screen) {
        return false;
    }

    return set.has(screen as T);
}

function isOnboardingFlowName(screen: string | undefined) {
    return checkIfScreenHasMatchingNameToSetValues<OnboardingFlowName>(screen, ONBOARDING_SCREENS_SET);
}

function isSplitNavigatorName(screen: string | undefined) {
    return checkIfScreenHasMatchingNameToSetValues<SplitNavigatorName>(screen, SPLIT_NAVIGATORS_SET);
}

function isFullScreenName(screen: string | undefined) {
    return checkIfScreenHasMatchingNameToSetValues<FullScreenName>(screen, FULL_SCREENS_SET);
}

function isSidebarScreenName(screen: string | undefined) {
    return checkIfScreenHasMatchingNameToSetValues<SplitNavigatorLHNScreen>(screen, SIDEBARS_SET);
}

export {isFullScreenName, isOnboardingFlowName, isSidebarScreenName, isSplitNavigatorName};
