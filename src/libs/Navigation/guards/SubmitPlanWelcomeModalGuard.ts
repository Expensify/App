import type {NavigationAction, NavigationState} from '@react-navigation/native';
import {findFocusedRoute} from '@react-navigation/native';
import {hasCompletedGuidedSetupFlowSelector} from '@selectors/Onboarding';
import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Log from '@libs/Log';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import findFocusedRouteWithOnyxTabGuard from '@libs/Navigation/helpers/findFocusedRouteWithOnyxTabGuard';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';
import Navigation from '@libs/Navigation/Navigation';
import Permissions from '@libs/Permissions';
import {getGroupPoliciesWhereReportCanBeCreated} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Beta, BetaConfiguration, IntroSelected, Policy, Session} from '@src/types/onyx';
import type {GuardContext, GuardResult, NavigationGuard} from './types';

let session: OnyxEntry<Session>;
let isLoadingApp = true;
let betas: OnyxEntry<Beta[]>;
let betaConfiguration: OnyxEntry<BetaConfiguration>;
let introSelected: OnyxEntry<IntroSelected>;
let policies: OnyxCollection<Policy>;
let hasCompletedGuidedSetupFlow: boolean | undefined;
let hasShownSubmitMigrationModal: OnyxEntry<boolean>;
let isSubmitMigrationModalShownLoaded = false;

let hasRedirectedToSubmitPlanModal = false;

const SUBMIT_PLAN_WELCOME_ENTRY_SCREENS = new Set<string>(DYNAMIC_ROUTES.SUBMIT_PLAN_WELCOME.entryScreens);

/**
 * The submit-plan-welcome modal is a dynamic route that can only attach to the screens listed in
 * DYNAMIC_ROUTES.SUBMIT_PLAN_WELCOME.entryScreens. When we proactively open the modal on app boot,
 * the active route can be any screen (e.g. `/settings/troubleshoot` after "Clear cache and restart"),
 * and stacking the suffix onto a non-entry screen resolves to NotFound. Fall back to HOME (a valid
 * entry screen) whenever the active route isn't an allowed base.
 */
function getValidModalBasePath(): string {
    const activeRoute = Navigation.getActiveRoute();
    if (!activeRoute) {
        return ROUTES.HOME;
    }
    try {
        const focusedRouteName = findFocusedRouteWithOnyxTabGuard(getStateFromPath(activeRoute as Route) ?? {})?.name;
        if (focusedRouteName && SUBMIT_PLAN_WELCOME_ENTRY_SCREENS.has(focusedRouteName)) {
            return activeRoute;
        }
    } catch {
        // getStateFromPath can throw for unparseable paths; fall back to HOME below.
    }
    return ROUTES.HOME;
}

function getSubmitPlanWelcomeModalRoute(basePath?: string): Route {
    return createDynamicRoute(DYNAMIC_ROUTES.SUBMIT_PLAN_WELCOME.path, basePath ?? getValidModalBasePath());
}

function resetSessionFlag() {
    hasRedirectedToSubmitPlanModal = false;
}

/**
 * Returns true when the current user matches the "existing Get paid back intent" audience:
 * the SUBMIT_2026 beta is enabled, they picked the EMPLOYER onboarding intent, completed onboarding,
 * haven't seen the modal yet, and don't already belong to any workspace where they can submit reports.
 *
 * The last check uses `getGroupPoliciesWhereReportCanBeCreated` (paid Team/Corporate AND free Submit
 * workspaces) rather than only paid policies. This intentionally excludes users who just created a
 * Submit workspace through the EMPLOYER onboarding flow, so the modal never collides with (or duplicates)
 * that flow.
 */
function shouldShowSubmitPlanWelcomeModal(): boolean {
    const isSubmit2026BetaEnabled = Permissions.isBetaEnabled(CONST.BETAS.SUBMIT_2026, betas, betaConfiguration);
    const hasEmployerIntent = introSelected?.choice === CONST.ONBOARDING_CHOICES.EMPLOYER;
    const groupPolicies = getGroupPoliciesWhereReportCanBeCreated(policies, isSubmit2026BetaEnabled, session?.email);

    return isSubmit2026BetaEnabled && hasEmployerIntent && !!hasCompletedGuidedSetupFlow && groupPolicies.length === 0 && !hasShownSubmitMigrationModal;
}

/**
 * Proactively navigate to the submit plan welcome modal when all conditions are met,
 * without waiting for a user-initiated navigation action.
 * Waits for NVP_SUBMIT_MIGRATION_MODAL_SHOWN to load before evaluating, preventing the
 * race condition where the modal would re-appear on app restart.
 */
function navigateToSubmitPlanWelcomeModalIfReady() {
    if (!session?.authToken || isLoadingApp || hasRedirectedToSubmitPlanModal || !isSubmitMigrationModalShownLoaded || !shouldShowSubmitPlanWelcomeModal()) {
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
    key: ONYXKEYS.NVP_SUBMIT_MIGRATION_MODAL_SHOWN,
    callback: (value) => {
        hasShownSubmitMigrationModal = value;
        isSubmitMigrationModalShownLoaded = true;
        // Once the modal has been recorded as shown, release the block so the user can navigate away freely.
        if (value) {
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
    return hasRedirectedToSubmitPlanModal && !hasShownSubmitMigrationModal && state.routes.at(-1)?.name === NAVIGATORS.SUBMIT_PLAN_MODAL_NAVIGATOR && !isAllowedAction;
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
 * are not on any paid workspace, and haven't seen it yet (behind the SUBMIT_2026 beta).
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
        // NVP_SUBMIT_MIGRATION_MODAL_SHOWN has been fetched. Without this check, a navigation
        // firing between those Onyx callbacks would see an undefined flag and incorrectly redirect
        // users who already saw the modal.
        if (!isSubmitMigrationModalShownLoaded) {
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
