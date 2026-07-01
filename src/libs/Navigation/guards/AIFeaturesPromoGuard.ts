import type {NavigationAction, NavigationState, PartialState} from '@react-navigation/native';
import {findFocusedRoute} from '@react-navigation/native';
import {isActingAsDelegateSelector} from '@selectors/Account';
import {hasCompletedGuidedSetupFlowSelector, tryNewDotOnyxSelector} from '@selectors/Onboarding';
import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import Log from '@libs/Log';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import isProductTrainingElementDismissed from '@libs/TooltipUtils';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {DismissedProductTraining, Onboarding, Session} from '@src/types/onyx';
import type {GuardResult, NavigationGuard} from './types';

let session: OnyxEntry<Session>;
let isLoadingApp = true;

let dismissedProductTraining: OnyxEntry<DismissedProductTraining>;
let isDismissedProductTrainingLoaded = false;

let hasBeenAddedToNudgeMigration = false;
let isTryNewDotLoaded = false;

let onboarding: OnyxEntry<Onboarding>;
let isOnboardingLoaded = false;

let isActingAsDelegate = false;

let hasRedirectedToAIFeaturesPromoModal = false;
let isWaitingForProtectedRoutes = false;

/**
 * This modal must not appear in the same session as the migration welcome modal, the onboarding flow,
 * or the HybridApp explanation modal. These flags trip when we observe any of those navigators mounting
 * during this process lifetime, and suppress the AI promo for the rest of the session.
 */
let observedActiveMigrationModalThisSession = false;
let observedActiveOnboardingThisSession = false;

function containsNavigator(state: NavigationState | PartialState<NavigationState> | undefined, navigatorName: string): boolean {
    if (!state?.routes) {
        return false;
    }
    return state.routes.some((route) => route.name === navigatorName || containsNavigator(route.state, navigatorName));
}

function snapshotActiveModalsFromNavigationState() {
    if (!navigationRef.isReady?.()) {
        return;
    }
    const rootState = navigationRef.getRootState?.();
    if (!rootState) {
        return;
    }
    if (containsNavigator(rootState, NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR)) {
        observedActiveOnboardingThisSession = true;
    }
    if (containsNavigator(rootState, NAVIGATORS.MIGRATED_USER_MODAL_NAVIGATOR)) {
        observedActiveMigrationModalThisSession = true;
    }
}

// Attach lazily — the listener can only be added once react-navigation's ref is ready,
// which generally happens after this module is loaded.
let isStateListenerAttached = false;
function attachNavigationStateListener() {
    if (isStateListenerAttached || !navigationRef.isReady?.()) {
        return;
    }
    isStateListenerAttached = true;
    snapshotActiveModalsFromNavigationState();
    navigationRef.addListener('state', snapshotActiveModalsFromNavigationState);
}

function isEligibleToShowAIFeaturesPromoModal(): boolean {
    return (
        !!session?.authToken &&
        !isLoadingApp &&
        !isActingAsDelegate &&
        !hasRedirectedToAIFeaturesPromoModal &&
        isDismissedProductTrainingLoaded &&
        isTryNewDotLoaded &&
        isOnboardingLoaded &&
        !isProductTrainingElementDismissed(CONST.AI_FEATURES_PROMO_MODAL, dismissedProductTraining) &&
        !observedActiveMigrationModalThisSession &&
        !observedActiveOnboardingThisSession
    );
}

function getAIFeaturesPromoModalRoute(): Route {
    return createDynamicRoute(DYNAMIC_ROUTES.AI_FEATURES_PROMO.path, ROUTES.HOME);
}

/**
 * Proactively navigate to the AI features promo modal when all conditions are met.
 */
function navigateToAIFeaturesPromoModalIfReady() {
    // Sync the modal-active flags from the current navigation state (and attach a listener
    // for future state changes) before checking, so a freshly-mounted onboarding navigator
    // is reflected immediately.
    attachNavigationStateListener();

    if (isWaitingForProtectedRoutes || !isEligibleToShowAIFeaturesPromoModal()) {
        return;
    }

    isWaitingForProtectedRoutes = true;
    // Defer until any in-flight navigation transition (splash → home, etc.)
    // has fully settled, then wait for the protected stack to be in the nav tree.
    TransitionTracker.runAfterTransitions({
        callback: () => {
            Navigation.waitForProtectedRoutes().then(() => {
                isWaitingForProtectedRoutes = false;
                snapshotActiveModalsFromNavigationState();
                if (!isEligibleToShowAIFeaturesPromoModal()) {
                    return;
                }
                Log.info('[AIFeaturesPromoGuard] Proactively navigating to AI features promo modal');
                hasRedirectedToAIFeaturesPromoModal = true;
                Navigation.navigate(getAIFeaturesPromoModalRoute());
            });
        },
        waitForUpcomingTransition: true,
    });
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
    key: ONYXKEYS.NVP_ONBOARDING,
    callback: (value) => {
        onboarding = value;
        isOnboardingLoaded = true;
        if (hasCompletedGuidedSetupFlowSelector(onboarding) === false) {
            observedActiveOnboardingThisSession = true;
        }
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_TRY_NEW_DOT,
    callback: (value) => {
        const result = value ? tryNewDotOnyxSelector(value) : undefined;
        hasBeenAddedToNudgeMigration = result?.hasBeenAddedToNudgeMigration ?? false;
        isTryNewDotLoaded = true;
        if (hasBeenAddedToNudgeMigration && !isProductTrainingElementDismissed(CONST.MIGRATED_USER_WELCOME_MODAL, dismissedProductTraining)) {
            observedActiveMigrationModalThisSession = true;
        }
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.ACCOUNT,
    callback: (value) => {
        isActingAsDelegate = isActingAsDelegateSelector(value);
    },
});

/**
 * Block navigation while the AI features promo modal is active (on top of the stack).
 */
function shouldBlockWhileModalActive(state: NavigationState, action: NavigationAction): boolean {
    if (
        !hasRedirectedToAIFeaturesPromoModal ||
        isProductTrainingElementDismissed(CONST.AI_FEATURES_PROMO_MODAL, dismissedProductTraining) ||
        state.routes.at(-1)?.name !== NAVIGATORS.AI_FEATURES_PROMO_MODAL_NAVIGATOR
    ) {
        return false;
    }

    // Internal modal-close actions always allowed.
    if (action.type === CONST.NAVIGATION.ACTION_TYPE.DISMISS_MODAL || action.type === CONST.NAVIGATION.ACTION_TYPE.GO_BACK) {
        return false;
    }

    // RESET actions are how deep links / share intents enter the app — never block them.
    if (action.type === CONST.NAVIGATION.ACTION_TYPE.RESET) {
        return false;
    }

    // For NAVIGATE/PUSH/REPLACE actions, only block if the target lives inside the AI promo navigator.
    const targetName = (action.payload as {name?: string} | undefined)?.name;
    if (targetName && targetName !== NAVIGATORS.AI_FEATURES_PROMO_MODAL_NAVIGATOR) {
        return false;
    }

    return true;
}

/** Prevents redirect loops by detecting when we're already on or resetting to the modal. */
function isNavigatingToAIFeaturesPromoModal(state: NavigationState, action: NavigationAction): boolean {
    const isOnModal = findFocusedRoute(state)?.name === SCREENS.AI_FEATURES_PROMO_MODAL.DYNAMIC_ROOT;
    const isResettingToModal =
        action.type === CONST.NAVIGATION.ACTION_TYPE.RESET && !!action.payload && findFocusedRoute(action.payload as NavigationState)?.name === SCREENS.AI_FEATURES_PROMO_MODAL.DYNAMIC_ROOT;

    return isOnModal || isResettingToModal;
}

/**
 * AIFeaturesPromoGuard surfaces the one-time AI features promo modal.
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

        if (isEligibleToShowAIFeaturesPromoModal()) {
            hasRedirectedToAIFeaturesPromoModal = true;
            return {type: 'REDIRECT', route: getAIFeaturesPromoModalRoute()};
        }

        return {type: 'ALLOW'};
    },
};

export default AIFeaturesPromoGuard;
export {onSessionOrLoadingAppChanged};
