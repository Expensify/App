import type {NavigationAction, NavigationState} from '@react-navigation/native';
import {findFocusedRoute} from '@react-navigation/native';
import {hasCompletedGuidedSetupFlowSelector} from '@selectors/Onboarding';
import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Log from '@libs/Log';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import Permissions from '@libs/Permissions';
import {getGroupPoliciesWhereReportCanBeCreated} from '@libs/PolicyUtils';
import isProductTrainingElementDismissed from '@libs/TooltipUtils';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Beta, BetaConfiguration, DismissedProductTraining, IntroSelected, Policy, Session} from '@src/types/onyx';
import type {GuardContext, GuardResult, NavigationGuard} from './types';

let session: OnyxEntry<Session>;
let isLoadingApp = true;
let betas: OnyxEntry<Beta[]>;
let betaConfiguration: OnyxEntry<BetaConfiguration>;
let introSelected: OnyxEntry<IntroSelected>;
let policies: OnyxCollection<Policy>;
let hasCompletedGuidedSetupFlow: boolean | undefined;
let dismissedProductTraining: OnyxEntry<DismissedProductTraining>;
let isDismissedProductTrainingLoaded = false;

let hasRedirectedToSubmitPlanModal = false;

function getSubmitPlanWelcomeModalRoute(basePath?: string): Route {
    return createDynamicRoute(DYNAMIC_ROUTES.SUBMIT_PLAN_WELCOME.path, basePath ?? (Navigation.getActiveRoute() || ROUTES.HOME));
}

function resetSessionFlag() {
    hasRedirectedToSubmitPlanModal = false;
}

/**
 * Returns true when the current user matches the "existing Get paid back intent" audience:
 * the SUBMIT_2026 beta is enabled, they picked the EMPLOYER onboarding intent, completed onboarding,
 * haven't dismissed the modal, and don't already belong to any workspace where they can submit reports.
 *
 * The last check uses `getGroupPoliciesWhereReportCanBeCreated` (paid Team/Corporate AND free Submit
 * workspaces) rather than only paid policies. This intentionally excludes users who just created a
 * Submit workspace through the EMPLOYER onboarding flow, so the modal never collides with (or duplicates)
 * that flow.
 */
function shouldShowSubmitPlanWelcomeModal(): boolean {
    const isSubmit2026BetaEnabled = Permissions.isBetaEnabled(CONST.BETAS.SUBMIT_2026, betas, betaConfiguration);

    return (
        isSubmit2026BetaEnabled &&
        introSelected?.choice === CONST.ONBOARDING_CHOICES.EMPLOYER &&
        !!hasCompletedGuidedSetupFlow &&
        getGroupPoliciesWhereReportCanBeCreated(policies, isSubmit2026BetaEnabled, session?.email).length === 0 &&
        !isProductTrainingElementDismissed(CONST.SUBMIT_PLAN_WELCOME_MODAL, dismissedProductTraining)
    );
}

/**
 * Proactively navigate to the submit plan welcome modal when all conditions are met,
 * without waiting for a user-initiated navigation action.
 * Waits for NVP_DISMISSED_PRODUCT_TRAINING to load before evaluating, preventing the
 * race condition where the modal would re-appear on app restart.
 */
function navigateToSubmitPlanWelcomeModalIfReady() {
    if (!session?.authToken || isLoadingApp || hasRedirectedToSubmitPlanModal || !isDismissedProductTrainingLoaded || !shouldShowSubmitPlanWelcomeModal()) {
        return;
    }

    Log.info('[SubmitPlanWelcomeModalGuard] Proactively navigating to submit plan welcome modal');
    hasRedirectedToSubmitPlanModal = true;
    Navigation.navigate(getSubmitPlanWelcomeModalRoute());
}

/**
 * Called by guards/index.ts when session or loading app state changes.
 * Reuses the shared Onyx subscriptions from guards/index.ts to avoid duplicate connections.
 */
function onSessionOrLoadingAppChanged(sessionValue: OnyxEntry<Session>, isLoadingAppValue: boolean) {
    session = sessionValue;
    isLoadingApp = isLoadingAppValue;
    navigateToSubmitPlanWelcomeModalIfReady();
}

Onyx.connectWithoutView({
    key: ONYXKEYS.BETAS,
    callback: (value) => {
        betas = value;
        navigateToSubmitPlanWelcomeModalIfReady();
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.BETA_CONFIGURATION,
    callback: (value) => {
        betaConfiguration = value;
        navigateToSubmitPlanWelcomeModalIfReady();
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_INTRO_SELECTED,
    callback: (value) => {
        introSelected = value;
        navigateToSubmitPlanWelcomeModalIfReady();
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_ONBOARDING,
    callback: (value) => {
        hasCompletedGuidedSetupFlow = hasCompletedGuidedSetupFlowSelector(value);
        navigateToSubmitPlanWelcomeModalIfReady();
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: (value) => {
        policies = value;
        navigateToSubmitPlanWelcomeModalIfReady();
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING,
    callback: (value) => {
        dismissedProductTraining = value;
        isDismissedProductTrainingLoaded = true;
        if (isProductTrainingElementDismissed(CONST.SUBMIT_PLAN_WELCOME_MODAL, value)) {
            hasRedirectedToSubmitPlanModal = false;
        }
        navigateToSubmitPlanWelcomeModalIfReady();
    },
});

/**
 * Block navigation while the submit plan modal is active (on top of the stack).
 * Prevents tab switches from pushing screens before the modal overlay becomes visible,
 * which would cause DISMISS_MODAL to fail.
 */
function shouldBlockWhileModalActive(state: NavigationState, action: NavigationAction): boolean {
    const isAllowedAction = action.type === CONST.NAVIGATION.ACTION_TYPE.DISMISS_MODAL || action.type === CONST.NAVIGATION.ACTION_TYPE.GO_BACK;
    return (
        hasRedirectedToSubmitPlanModal &&
        !isProductTrainingElementDismissed(CONST.SUBMIT_PLAN_WELCOME_MODAL, dismissedProductTraining) &&
        state.routes.at(-1)?.name === NAVIGATORS.SUBMIT_PLAN_MODAL_NAVIGATOR &&
        !isAllowedAction
    );
}

/** Prevents redirect loops by detecting when we're already on or resetting to the modal. */
function isNavigatingToSubmitPlanModal(state: NavigationState, action: NavigationAction): boolean {
    const isOnModal = findFocusedRoute(state)?.name === SCREENS.SUBMIT_PLAN_WELCOME_MODAL.DYNAMIC_ROOT;
    const isResettingToModal =
        action.type === 'RESET' &&
        !!action.payload &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the RESET action payload is a navigation state (mirrors MigratedUserWelcomeModalGuard)
        findFocusedRoute(action.payload as NavigationState)?.name === SCREENS.SUBMIT_PLAN_WELCOME_MODAL.DYNAMIC_ROOT;

    return isOnModal || isResettingToModal;
}

/**
 * SubmitPlanWelcomeModalGuard handles the in-product Submit plan welcome modal flow.
 * This modal appears for users who previously selected the "Get paid back" (EMPLOYER) intent,
 * are not on any paid workspace, and haven't dismissed it yet (behind the SUBMIT_2026 beta).
 */
const SubmitPlanWelcomeModalGuard: NavigationGuard = {
    name: 'SubmitPlanWelcomeModalGuard',

    evaluate: (state: NavigationState, action: NavigationAction, context: GuardContext): GuardResult => {
        if (context.isLoading) {
            return {type: 'ALLOW'};
        }

        if (shouldBlockWhileModalActive(state, action)) {
            return {type: 'BLOCK', reason: '[SubmitPlanWelcomeModalGuard] Blocking navigation while submit plan modal is active'};
        }

        if (isNavigatingToSubmitPlanModal(state, action) || hasRedirectedToSubmitPlanModal) {
            return {type: 'ALLOW'};
        }

        // Guard against the race condition where the beta/intro/policy NVPs arrive before
        // NVP_DISMISSED_PRODUCT_TRAINING has been fetched. Without this check, a navigation
        // firing between those Onyx callbacks would see an undefined dismissedProductTraining
        // and incorrectly redirect users who already dismissed the modal.
        if (!isDismissedProductTrainingLoaded) {
            return {type: 'ALLOW'};
        }

        if (shouldShowSubmitPlanWelcomeModal()) {
            Log.info('[SubmitPlanWelcomeModalGuard] Redirecting to submit plan welcome modal');
            hasRedirectedToSubmitPlanModal = true;

            return {
                type: 'REDIRECT',
                route: getSubmitPlanWelcomeModalRoute(),
            };
        }

        return {type: 'ALLOW'};
    },
};

export default SubmitPlanWelcomeModalGuard;
export {resetSessionFlag, onSessionOrLoadingAppChanged, shouldShowSubmitPlanWelcomeModal};
