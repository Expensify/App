import AccountUtils from '@libs/AccountUtils';
import Log from '@libs/Log';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation, {getDeepestFocusedScreen, isTwoFactorSetupScreen} from '@libs/Navigation/Navigation';
import isProductTrainingElementDismissed from '@libs/TooltipUtils';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Account, DismissedProductTraining, Onboarding, Session} from '@src/types/onyx';

import type {NavigationAction, NavigationState} from '@react-navigation/native';
import type {OnyxEntry} from 'react-native-onyx';

import {findFocusedRoute} from '@react-navigation/native';
import {hasCompletedGuidedSetupFlowSelector, tryNewDotOnyxSelector} from '@selectors/Onboarding';
import {isDelegateSessionSelector, isSupportalSessionSelector} from '@selectors/Session';
import Onyx from 'react-native-onyx';

import type {GuardResult, NavigationGuard} from './types';

let hasBeenAddedToNudgeMigration = false;
let dismissedProductTraining: OnyxEntry<DismissedProductTraining>;
let isDismissedProductTrainingLoaded = false;
let session: OnyxEntry<Session>;
let isLoadingApp = true;
let account: OnyxEntry<Account>;
let onboarding: OnyxEntry<Onboarding>;

let hasRedirectedToMigratedUserModal = false;

function getMigratedUserWelcomeModalRoute(basePath?: string): Route {
    return createDynamicRoute(DYNAMIC_ROUTES.MIGRATED_USER_WELCOME.path, basePath ?? (Navigation.getActiveRoute() || ROUTES.HOME));
}

function resetSessionFlag() {
    hasRedirectedToMigratedUserModal = false;
}

/**
 * Proactively navigate to the migrated user welcome modal when all conditions are met,
 * without waiting for a user-initiated navigation action.
 * Waits for NVP_DISMISSED_PRODUCT_TRAINING to load before evaluating, preventing the
 * race condition where the modal would re-appear on app restart.
 */
function navigateToMigratedUserWelcomeModalIfReady() {
    if (
        isSupportalSessionSelector(session) ||
        isDelegateSessionSelector(session) ||
        !session?.authToken ||
        isLoadingApp ||
        hasRedirectedToMigratedUserModal ||
        !hasBeenAddedToNudgeMigration ||
        !isDismissedProductTrainingLoaded ||
        isProductTrainingElementDismissed('migratedUserWelcomeModal', dismissedProductTraining)
    ) {
        return;
    }

    Log.info('[MigratedUserWelcomeModalGuard] Proactively navigating to migrated user welcome modal');
    hasRedirectedToMigratedUserModal = true;
    Navigation.navigate(getMigratedUserWelcomeModalRoute());
}

/**
 * Called by guards/index.ts when session or loading app state changes.
 * Reuses the shared Onyx subscriptions from guards/index.ts to avoid duplicate connections.
 */
function onSessionOrLoadingAppChanged(sessionValue: OnyxEntry<Session>, isLoadingAppValue: boolean) {
    session = sessionValue;
    isLoadingApp = isLoadingAppValue;
    navigateToMigratedUserWelcomeModalIfReady();
}

Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_TRY_NEW_DOT,
    callback: (value) => {
        const result = value ? tryNewDotOnyxSelector(value) : undefined;
        hasBeenAddedToNudgeMigration = result?.hasBeenAddedToNudgeMigration ?? false;
        navigateToMigratedUserWelcomeModalIfReady();
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING,
    callback: (value) => {
        dismissedProductTraining = value;
        isDismissedProductTrainingLoaded = true;
        if (isProductTrainingElementDismissed('migratedUserWelcomeModal', value)) {
            hasRedirectedToMigratedUserModal = false;
        }
        navigateToMigratedUserWelcomeModalIfReady();
    },
});

// The guard reads the account while evaluating navigation, outside any React render.
// useOnyx() only works during render, so connectWithoutView() is the right subscription here.
Onyx.connectWithoutView({
    key: ONYXKEYS.ACCOUNT,
    callback: (value) => {
        account = value;
    },
});

// The guard reads onboarding while evaluating navigation, outside any React render.
// useOnyx() only works during render, so connectWithoutView() is the right subscription here.
Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_ONBOARDING,
    callback: (value) => {
        onboarding = value;
    },
});

function isRequiredTwoFactorSetupExceptionActive(): boolean {
    const hasCompletedGuidedSetupFlow = hasCompletedGuidedSetupFlowSelector(onboarding) ?? false;
    // Allow 2FA setup while the blocking overlay is up, and also through the post-verify
    // handoff window when the overlay is intentionally hidden but setup is still in progress.
    return AccountUtils.shouldShowRequire2FAPage(account, hasCompletedGuidedSetupFlow) || AccountUtils.isForced2FAOnboardingSetup(account, hasCompletedGuidedSetupFlow);
}

type DeepestFocusedScreenInput = NonNullable<Parameters<typeof getDeepestFocusedScreen>[0]>;

function isObjectPayload(value: unknown): value is DeepestFocusedScreenInput {
    return typeof value === 'object' && value !== null;
}

function getActionPayloadScreenName(action: NavigationAction): string | undefined {
    // NAVIGATE/PUSH payloads aren't full NavigationStates. getDeepestFocusedScreen accepts that shape.
    // Use a type guard (not `as`) so we stay within this file's no-unsafe-type-assertion seatbelt.
    if (!isObjectPayload(action.payload)) {
        return undefined;
    }

    return getDeepestFocusedScreen(action.payload)?.name;
}

/**
 * Block navigation while the migrated user modal is active (on top of the stack).
 * Prevents tab switches from pushing screens before the modal overlay becomes visible,
 * which would cause DISMISS_MODAL to fail.
 * Required 2FA setup is allowed through, matching OnboardingGuard, so Enable can open
 * the setup flow while this modal is still underneath.
 */
function shouldBlockWhileModalActive(state: NavigationState, action: NavigationAction): boolean {
    const isAllowedAction = action.type === CONST.NAVIGATION.ACTION_TYPE.DISMISS_MODAL || action.type === CONST.NAVIGATION.ACTION_TYPE.GO_BACK;
    const isRequiredTwoFactorSetupNavigation = isRequiredTwoFactorSetupExceptionActive() && isTwoFactorSetupScreen(getActionPayloadScreenName(action));
    return (
        hasRedirectedToMigratedUserModal &&
        !isProductTrainingElementDismissed('migratedUserWelcomeModal', dismissedProductTraining) &&
        state.routes.at(-1)?.name === NAVIGATORS.MIGRATED_USER_MODAL_NAVIGATOR &&
        !isAllowedAction &&
        !isRequiredTwoFactorSetupNavigation
    );
}

/** Prevents redirect loops by detecting when we're already on or resetting to the modal. */
function isNavigatingToMigratedUserModal(state: NavigationState, action: NavigationAction): boolean {
    const isOnModal = findFocusedRoute(state)?.name === SCREENS.MIGRATED_USER_WELCOME_MODAL.DYNAMIC_ROOT;
    const isResettingToModal = action.type === 'RESET' && !!action.payload && findFocusedRoute(action.payload as NavigationState)?.name === SCREENS.MIGRATED_USER_WELCOME_MODAL.DYNAMIC_ROOT;

    return isOnModal || isResettingToModal;
}

/**
 * MigratedUserWelcomeModalGuard handles the migrated user welcome modal flow.
 * This modal appears for users who have been added to nudge migration and haven't dismissed it yet.
 */
const MigratedUserWelcomeModalGuard: NavigationGuard = {
    name: 'MigratedUserWelcomeModalGuard',

    evaluate: (state: NavigationState, action: NavigationAction, context): GuardResult => {
        if (context.isLoading) {
            return {type: 'ALLOW'};
        }

        if (shouldBlockWhileModalActive(state, action)) {
            return {type: 'BLOCK', reason: '[MigratedUserWelcomeModalGuard] Blocking navigation while migrated user modal is active'};
        }

        if (isNavigatingToMigratedUserModal(state, action) || hasRedirectedToMigratedUserModal) {
            return {type: 'ALLOW'};
        }

        // Guard against the race condition where NVP_TRY_NEW_DOT arrives before
        // NVP_DISMISSED_PRODUCT_TRAINING has been fetched. Without this check, a
        // navigation firing between those two Onyx callbacks would see an undefined
        // dismissedProductTraining and incorrectly redirect users who already dismissed
        // the modal (most noticeable in copilot sessions or on large accounts with
        // slow OpenApp responses).
        if (!isDismissedProductTrainingLoaded) {
            return {type: 'ALLOW'};
        }

        if (hasBeenAddedToNudgeMigration && !isProductTrainingElementDismissed('migratedUserWelcomeModal', dismissedProductTraining)) {
            if (context.isSupportalSession || context.isDelegateSession) {
                return {type: 'ALLOW'};
            }

            Log.info('[MigratedUserWelcomeModalGuard] Redirecting to migrated user welcome modal');
            hasRedirectedToMigratedUserModal = true;

            return {
                type: 'REDIRECT',
                route: getMigratedUserWelcomeModalRoute(),
            };
        }

        return {type: 'ALLOW'};
    },
};

export default MigratedUserWelcomeModalGuard;
export {resetSessionFlag, onSessionOrLoadingAppChanged};

/**
 * Resets the dismissal-NVP loaded flag and cached value.
 * Only intended for use in unit tests to simulate the race condition where
 * NVP_DISMISSED_PRODUCT_TRAINING has not yet been delivered by Onyx.
 */
function resetDismissedProductTrainingState() {
    isDismissedProductTrainingLoaded = false;
    dismissedProductTraining = undefined;
}

export {resetDismissedProductTrainingState};
