import {SIDEBAR_TO_SPLIT, SPLIT_TO_SIDEBAR} from '@libs/Navigation/linkingConfig/RELATIONS';
import type {FullScreenName, OnboardingFlowName, SplitNavigatorName, SplitNavigatorSidebarScreen, WorkspaceNavigatorRouteName} from '@libs/Navigation/types';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

const FULL_SCREENS_SET = new Set([...Object.values(SIDEBAR_TO_SPLIT), NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, NAVIGATORS.TAB_NAVIGATOR, SCREENS.HOME, NAVIGATORS.WORKSPACE_NAVIGATOR]);
// Root-level navigators that render as an overlay/modal on top of the current screen. These do NOT go through the
// shared `Modal` component, so they never set `ONYXKEYS.MODAL` — the only way to know one is open is the navigation state.
const MODAL_NAVIGATORS_SET = new Set<string>([
    NAVIGATORS.RIGHT_MODAL_NAVIGATOR,
    NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR,
    NAVIGATORS.FEATURE_TRAINING_MODAL_NAVIGATOR,
    NAVIGATORS.MIGRATED_USER_MODAL_NAVIGATOR,
    NAVIGATORS.SUBMIT_PLAN_MODAL_NAVIGATOR,
    NAVIGATORS.AI_FEATURES_PROMO_MODAL_NAVIGATOR,
    NAVIGATORS.TEST_DRIVE_DEMO_NAVIGATOR,
    NAVIGATORS.SHARE_MODAL_NAVIGATOR,
    NAVIGATORS.TEST_TOOLS_MODAL_NAVIGATOR,
]);
const SIDEBARS_SET = new Set(Object.values(SPLIT_TO_SIDEBAR));
const ONBOARDING_SCREENS_SET = new Set(Object.values(SCREENS.ONBOARDING));
const SPLIT_NAVIGATORS_SET = new Set(Object.values(SIDEBAR_TO_SPLIT));
const WORKSPACES_TAB_SET = new Set(Object.values([NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR, SCREENS.WORKSPACES_LIST, NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR]));

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

function isModalNavigatorName(screen: string | undefined) {
    return checkIfScreenHasMatchingNameToSetValues(screen, MODAL_NAVIGATORS_SET);
}

function isSidebarScreenName(screen: string | undefined) {
    return checkIfScreenHasMatchingNameToSetValues<SplitNavigatorSidebarScreen>(screen, SIDEBARS_SET);
}

function isWorkspaceNavigatorRouteName(screen: string | undefined) {
    return checkIfScreenHasMatchingNameToSetValues<WorkspaceNavigatorRouteName>(screen, WORKSPACES_TAB_SET);
}

export {isFullScreenName, isModalNavigatorName, isOnboardingFlowName, isSidebarScreenName, isSplitNavigatorName, isWorkspaceNavigatorRouteName};
