import {SIDEBAR_TO_SPLIT, SPLIT_TO_SIDEBAR} from '@libs/Navigation/linkingConfig/RELATIONS';
import type {FullScreenName, OnboardingFlowName, SplitNavigatorName, SplitNavigatorSidebarScreen, WorkspacesTabScreenName} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

const ONBOARDING_SCREENS = [
    SCREENS.ONBOARDING.PERSONAL_DETAILS,
    SCREENS.ONBOARDING.PURPOSE,
    SCREENS.ONBOARDING_MODAL.ONBOARDING,
    SCREENS.ONBOARDING.EMPLOYEES,
    SCREENS.ONBOARDING.ACCOUNTING,
    SCREENS.ONBOARDING.PRIVATE_DOMAIN,
    SCREENS.ONBOARDING.WORKSPACES,
    SCREENS.ONBOARDING.WORK_EMAIL,
    SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION,
];

const FULL_SCREENS_SET = new Set([...Object.values(SIDEBAR_TO_SPLIT), NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR]);
const SIDEBARS_SET = new Set(Object.values(SPLIT_TO_SIDEBAR));
const ONBOARDING_SCREENS_SET = new Set(ONBOARDING_SCREENS);
const SPLIT_NAVIGATORS_SET = new Set(Object.values(SIDEBAR_TO_SPLIT));
const WORKSPACES_TAB_SET = new Set(Object.values([NAVIGATORS.WORKSPACE_HUB_SPLIT_NAVIGATOR, NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR]));

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

function isSplitNavigatorName(screen: string | undefined) {
    return checkIfScreenHasMatchingNameToSetValues<SplitNavigatorName>(screen, SPLIT_NAVIGATORS_SET);
}

function isFullScreenName(screen: string | undefined) {
    return checkIfScreenHasMatchingNameToSetValues<FullScreenName>(screen, FULL_SCREENS_SET);
}

function isSidebarScreenName(screen: string | undefined) {
    return checkIfScreenHasMatchingNameToSetValues<SplitNavigatorSidebarScreen>(screen, SIDEBARS_SET);
}

function isWorkspacesTabScreenName(screen: string | undefined) {
    return checkIfScreenHasMatchingNameToSetValues<WorkspacesTabScreenName>(screen, WORKSPACES_TAB_SET);
}

export {isFullScreenName, isOnboardingFlowName, isSidebarScreenName, isSplitNavigatorName, isWorkspacesTabScreenName};
