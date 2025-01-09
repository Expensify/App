import {SIDEBAR_TO_SPLIT, SPLIT_TO_SIDEBAR} from '@libs/Navigation/linkingConfig/RELATIONS';
import type {FullScreenName, OnboardingFlowName, SplitNavigatorSidebarScreen} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';

const ONBOARDING_SCREENS = [
    SCREENS.ONBOARDING.PERSONAL_DETAILS,
    SCREENS.ONBOARDING.PURPOSE,
    SCREENS.ONBOARDING_MODAL.ONBOARDING,
    SCREENS.ONBOARDING.EMPLOYEES,
    SCREENS.ONBOARDING.ACCOUNTING,
    SCREENS.ONBOARDING.PRIVATE_DOMAIN,
    SCREENS.ONBOARDING.WORKSPACES,
];

const FULL_SCREENS_SET = new Set([...Object.values(SIDEBAR_TO_SPLIT), SCREENS.SEARCH.ROOT]);
const SIDEBARS_SET = new Set(Object.values(SPLIT_TO_SIDEBAR));
const ONBOARDING_SCREENS_SET = new Set(ONBOARDING_SCREENS);

/**
 * Functions defined below are used to check whether a screen belongs to a specific group.
 * It is mainly used to filter routes in the navigation state.
 */
function checkIfScreenHasMatchingNameToSetValues<T extends string>(screen: string | undefined, set: Set<T>): screen is T {
    if (!screen) {
        return false;
    }

    return set.has(screen as T);
}

function isOnboardingFlowName(screen: string | undefined) {
    return checkIfScreenHasMatchingNameToSetValues<OnboardingFlowName>(screen, ONBOARDING_SCREENS_SET);
}

function isFullScreenName(screen: string | undefined) {
    return checkIfScreenHasMatchingNameToSetValues<FullScreenName>(screen, FULL_SCREENS_SET);
}

function isSidebarScreenName(screen: string | undefined) {
    return checkIfScreenHasMatchingNameToSetValues<SplitNavigatorSidebarScreen>(screen, SIDEBARS_SET);
}

export {isFullScreenName, isOnboardingFlowName, isSidebarScreenName};
