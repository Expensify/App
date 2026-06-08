import type {NavigationAction, NavigationState} from '@react-navigation/native';
import {findFocusedRoute} from '@react-navigation/native';
import {hasCompletedGuidedSetupFlowSelector, tryNewDotOnyxSelector} from '@selectors/Onboarding';
import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import isProductTrainingElementDismissed from '@libs/TooltipUtils';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {DismissedProductTraining, Onboarding, Session} from '@src/types/onyx';
import type {GuardResult, NavigationGuard} from './types';

let session: OnyxEntry<Session>;
let isLoadingApp = true;

let dismissedProductTraining: OnyxEntry<DismissedProductTraining>;
let isDismissedProductTrainingLoaded = false;

let hasBeenAddedToNudgeMigration = false;
let isHybridAppOnboardingCompleted: boolean | undefined;
let isTryNewDotLoaded = false;

let onboarding: OnyxEntry<Onboarding>;
let isOnboardingLoaded = false;

let hasRedirectedToAIFeaturesPromoModal = false;

/**
 * Same-session protection.
 *
 * Per the issue requirements, the AI features promo modal must not appear in the same
 * session as the migration welcome modal, the onboarding flow, or the HybridApp
 * explanation modal. These flags trip when we observe any of those modals being
 * "active" (pending dismissal / not yet completed) at any point during this process
 * lifetime, and suppress the AI promo for the rest of the session.
 */
let observedActiveMigrationModalThisSession = false;
let observedActiveOnboardingThisSession = false;
let observedActiveExplanationModalThisSession = false;

function resetSessionFlag() {
    hasRedirectedToAIFeaturesPromoModal = false;
    observedActiveMigrationModalThisSession = false;
    observedActiveOnboardingThisSession = false;
    observedActiveExplanationModalThisSession = false;
}

/**
 * Proactively navigate to the AI features promo modal when all conditions are met.
 * Waits for the gating NVPs to load to avoid racing with the migration / onboarding guards.
 */
function navigateToAIFeaturesPromoModalIfReady() {
    if (
        !session?.authToken ||
        isLoadingApp ||
        hasRedirectedToAIFeaturesPromoModal ||
        !isDismissedProductTrainingLoaded ||
        !isTryNewDotLoaded ||
        !isOnboardingLoaded ||
        isProductTrainingElementDismissed(CONST.AI_FEATURES_PROMO_MODAL, dismissedProductTraining) ||
        observedActiveMigrationModalThisSession ||
        observedActiveOnboardingThisSession ||
        observedActiveExplanationModalThisSession
    ) {
        return;
    }

    Log.info('[AIFeaturesPromoGuard] Proactively navigating to AI features promo modal');
    hasRedirectedToAIFeaturesPromoModal = true;
    Navigation.navigate(ROUTES.AI_FEATURES_PROMO_MODAL);
}

/**
 * Called by guards/index.ts when session or loading app state changes.
 * Reuses the shared Onyx subscriptions from guards/index.ts to avoid duplicate connections.
 */
function onSessionOrLoadingAppChanged(sessionValue: OnyxEntry<Session>, isLoadingAppValue: boolean) {
    session = sessionValue;
    isLoadingApp = isLoadingAppValue;
    navigateToAIFeaturesPromoModalIfReady();
}

Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING,
    callback: (value) => {
        dismissedProductTraining = value;
        isDismissedProductTrainingLoaded = true;
        if (isProductTrainingElementDismissed(CONST.AI_FEATURES_PROMO_MODAL, value)) {
            hasRedirectedToAIFeaturesPromoModal = false;
        }
        // If the migration welcome modal is currently still pending, suppress AI promo this session.
        if (hasBeenAddedToNudgeMigration && !isProductTrainingElementDismissed(CONST.MIGRATED_USER_WELCOME_MODAL, value)) {
            observedActiveMigrationModalThisSession = true;
        }
        navigateToAIFeaturesPromoModalIfReady();
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_TRY_NEW_DOT,
    callback: (value) => {
        const result = value ? tryNewDotOnyxSelector(value) : undefined;
        hasBeenAddedToNudgeMigration = result?.hasBeenAddedToNudgeMigration ?? false;
        isHybridAppOnboardingCompleted = result?.isHybridAppOnboardingCompleted;
        isTryNewDotLoaded = true;
        if (hasBeenAddedToNudgeMigration && !isProductTrainingElementDismissed(CONST.MIGRATED_USER_WELCOME_MODAL, dismissedProductTraining)) {
            observedActiveMigrationModalThisSession = true;
        }
        // The HybridApp explanation modal shows when the user is transitioning from OldDot to NewDot.
        if (CONFIG.IS_HYBRID_APP && isHybridAppOnboardingCompleted === false) {
            observedActiveExplanationModalThisSession = true;
        }
        navigateToAIFeaturesPromoModalIfReady();
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_ONBOARDING,
    callback: (value) => {
        onboarding = value;
        isOnboardingLoaded = true;
        if (!hasCompletedGuidedSetupFlowSelector(onboarding)) {
            observedActiveOnboardingThisSession = true;
        }
        navigateToAIFeaturesPromoModalIfReady();
    },
});

/**
 * Block navigation while the AI features promo modal is active (on top of the stack).
 * Mirrors the pattern from MigratedUserWelcomeModalGuard.
 */
function shouldBlockWhileModalActive(state: NavigationState, action: NavigationAction): boolean {
    const isAllowedAction = action.type === CONST.NAVIGATION.ACTION_TYPE.DISMISS_MODAL || action.type === CONST.NAVIGATION.ACTION_TYPE.GO_BACK;
    return (
        hasRedirectedToAIFeaturesPromoModal &&
        !isProductTrainingElementDismissed(CONST.AI_FEATURES_PROMO_MODAL, dismissedProductTraining) &&
        state.routes.at(-1)?.name === NAVIGATORS.AI_FEATURES_PROMO_MODAL_NAVIGATOR &&
        !isAllowedAction
    );
}

/** Prevents redirect loops by detecting when we're already on or resetting to the modal. */
function isNavigatingToAIFeaturesPromoModal(state: NavigationState, action: NavigationAction): boolean {
    const isOnModal = findFocusedRoute(state)?.name === SCREENS.AI_FEATURES_PROMO_MODAL.ROOT;
    const isResettingToModal = action.type === 'RESET' && !!action.payload && findFocusedRoute(action.payload as NavigationState)?.name === SCREENS.AI_FEATURES_PROMO_MODAL.ROOT;

    return isOnModal || isResettingToModal;
}

/**
 * AIFeaturesPromoGuard surfaces the one-time AI features promo modal.
 *
 * This guard relies on the proactive Onyx-driven path (navigateToAIFeaturesPromoModalIfReady)
 * rather than redirecting from evaluate(), because it needs to wait for higher-priority guards
 * (Onboarding, MigratedUserWelcomeModal) to settle before deciding whether to fire.
 */
const AIFeaturesPromoGuard: NavigationGuard = {
    name: 'AIFeaturesPromoGuard',

    evaluate: (state: NavigationState, action: NavigationAction, context): GuardResult => {
        if (context.isLoading) {
            return {type: 'ALLOW'};
        }

        if (shouldBlockWhileModalActive(state, action)) {
            return {type: 'BLOCK', reason: '[AIFeaturesPromoGuard] Blocking navigation while AI features promo modal is active'};
        }

        if (isNavigatingToAIFeaturesPromoModal(state, action) || hasRedirectedToAIFeaturesPromoModal) {
            return {type: 'ALLOW'};
        }

        return {type: 'ALLOW'};
    },
};

export default AIFeaturesPromoGuard;
export {resetSessionFlag, onSessionOrLoadingAppChanged};
