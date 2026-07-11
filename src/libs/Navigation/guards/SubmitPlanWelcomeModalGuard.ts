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
import type {Beta, BetaConfiguration, IntroSelected, Policy, SecurityGroup, Session} from '@src/types/onyx';

import type {NavigationAction, NavigationState} from '@react-navigation/native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {findFocusedRoute} from '@react-navigation/native';
import {hasCompletedGuidedSetupFlowSelector} from '@selectors/Onboarding';
import {Str} from 'expensify-common';
import Onyx from 'react-native-onyx';

import type {GuardContext, GuardResult, NavigationGuard} from './types';

let session: OnyxEntry<Session>;
let isLoadingApp = true;
let betas: OnyxEntry<Beta[]>;
let betaConfiguration: OnyxEntry<BetaConfiguration>;
let introSelected: OnyxEntry<IntroSelected>;
let policies: OnyxCollection<Policy>;
let hasCompletedGuidedSetupFlow: boolean | undefined;
let hasShownSubmitMigrationModal: OnyxEntry<boolean>;
let myDomainSecurityGroups: OnyxEntry<Record<string, string>>;
let securityGroups: OnyxCollection<SecurityGroup>;
let isSubmitMigrationModalShownLoaded = false;
let hasLoadedApp = false;

let hasRedirectedToSubmitPlanModal = false;
let isEvaluationScheduled = false;

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
        // getActiveRoute returns a plain string, while getStateFromPath expects a Route. Any string returned by
        // getActiveRoute is a valid route path, and getStateFromPath safely handles paths it cannot parse.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        const focusedRouteName = findFocusedRouteWithOnyxTabGuard(getStateFromPath(activeRoute as Route) ?? {})?.name;
        if (focusedRouteName && SUBMIT_PLAN_WELCOME_ENTRY_SCREENS.has(focusedRouteName)) {
            return activeRoute;
        }
    } catch {
        // getStateFromPath can throw for paths it cannot parse; fall back to HOME below.
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

    return isSubmit2026BetaEnabled && hasEmployerIntent && !!hasCompletedGuidedSetupFlow && groupPolicies.length === 0 && !isPolicyCreationRestricted() && !hasShownSubmitMigrationModal;
}

/**
 * Whether the user's domain security group restricts workspace creation. Mirrors `usePreferredPolicy`.
 * Restricted users can't create a Submit workspace, so we must not show them the modal — otherwise
 * "Get the free plan" would dismiss it (marking it shown) without creating anything or navigating.
 */
function isPolicyCreationRestricted(): boolean {
    const userDomain = session?.email ? Str.extractEmailDomain(session.email) : undefined;
    const securityGroupID = userDomain ? myDomainSecurityGroups?.[userDomain] : undefined;
    if (!securityGroupID) {
        return false;
    }
    return securityGroups?.[`${ONYXKEYS.COLLECTION.SECURITY_GROUP}${securityGroupID}`]?.enableRestrictedPolicyCreation === true;
}

/**
 * Proactively navigate to the submit plan welcome modal when all conditions are met,
 * without waiting for a user-initiated navigation action.
 * Waits for NVP_SUBMIT_MIGRATION_MODAL_SHOWN to load before evaluating, preventing the
 * race condition where the modal would re-appear on app restart.
 */
function navigateToSubmitPlanWelcomeModalIfReady() {
    if (!session?.authToken || isLoadingApp || !hasLoadedApp || hasRedirectedToSubmitPlanModal || !isSubmitMigrationModalShownLoaded || !shouldShowSubmitPlanWelcomeModal()) {
        return;
    }

    hasRedirectedToSubmitPlanModal = true;
    Navigation.navigate(getSubmitPlanWelcomeModalRoute());
}

/**
 * Coalesce the proactive-navigation decision onto a microtask so it runs once, after the current Onyx
 * update batch has fully applied.
 *
 * OpenApp is a write command, so its server `onyxData` (which carries NVP_SUBMIT_MIGRATION_MODAL_SHOWN
 * and the beta/intro/policy data) and its finallyData (IS_LOADING_APP=false) are queued and flushed
 * together in a single combined Onyx.update. The order in which per-key subscriber callbacks fire within
 * that batch is not guaranteed, so evaluating synchronously from the IS_LOADING_APP callback could read a
 * stale (undefined) `hasShownSubmitMigrationModal` while the positive conditions are already set, and
 * incorrectly redirect a user who has already seen the modal (most visible right after "clear cache and
 * restart", when Onyx starts empty). Deferring the decision guarantees every cached value reflects the
 * just-applied OpenApp data before we decide.
 *
 * The decision additionally waits for HAS_LOADED_APP, which covers the sign-in flow: SignInUser can deliver
 * the eligibility NVPs (beta/intro/onboarding) and authenticate the session before OpenApp has fetched
 * NVP_SUBMIT_MIGRATION_MODAL_SHOWN. In that window IS_LOADING_APP is still the stale `false` preserved from
 * before sign-in and the shown-flag reads as a stale `undefined`, so without HAS_LOADED_APP we'd redirect a
 * user who has already seen the modal. HAS_LOADED_APP is cleared on sign-out and only set (in OpenApp's
 * queueFlushedData) after the response NVPs land, so it is a reliable "this session's account data, including
 * the shown-flag, has loaded" signal.
 */
function scheduleSubmitPlanWelcomeModalEvaluation() {
    if (isEvaluationScheduled) {
        return;
    }
    isEvaluationScheduled = true;
    Promise.resolve().then(() => {
        isEvaluationScheduled = false;
        navigateToSubmitPlanWelcomeModalIfReady();
    });
}

/**
 * Called by guards/index.ts when session or loading app state changes.
 * Reuses the shared Onyx subscriptions from guards/index.ts to avoid duplicate connections.
 */
function onSessionOrLoadingAppChanged(sessionValue: OnyxEntry<Session>, isLoadingAppValue: boolean) {
    session = sessionValue;
    isLoadingApp = isLoadingAppValue;
    scheduleSubmitPlanWelcomeModalEvaluation();
}

// These subscriptions only keep the guard's cached copies in sync for the synchronous `evaluate` and the
// proactive check. They intentionally do NOT drive navigation: the one-shot proactive redirect is a
// boot-time decision triggered solely by the app-load/session signal (onSessionOrLoadingAppChanged), by
// which point every value below has already landed in the same OpenApp batch. Driving navigation from these
// (especially the high-churn POLICY collection) would recompute eligibility on every unrelated mutation for
// the whole session.
Onyx.connectWithoutView({
    key: ONYXKEYS.BETAS,
    callback: (value) => {
        betas = value;
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.BETA_CONFIGURATION,
    callback: (value) => {
        betaConfiguration = value;
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_INTRO_SELECTED,
    callback: (value) => {
        introSelected = value;
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_ONBOARDING,
    callback: (value) => {
        hasCompletedGuidedSetupFlow = hasCompletedGuidedSetupFlowSelector(value);
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: (value) => {
        policies = value;
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
    },
});

// HAS_LOADED_APP is the one subscription that also drives the proactive redirect: it flips to true only after
// OpenApp's response NVPs (including the shown-flag) have been applied, so scheduling from here guarantees the
// decision runs on this session's fully-loaded account data rather than on stale sign-in/boot values.
Onyx.connectWithoutView({
    key: ONYXKEYS.HAS_LOADED_APP,
    callback: (value) => {
        hasLoadedApp = value ?? false;
        scheduleSubmitPlanWelcomeModalEvaluation();
    },
});

// Domain security-group data for the policy-creation restriction check. Pure cache-feeders (they do not
// drive navigation); the restriction is read synchronously in shouldShowSubmitPlanWelcomeModal.
Onyx.connectWithoutView({
    key: ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS,
    callback: (value) => {
        myDomainSecurityGroups = value;
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.SECURITY_GROUP,
    waitForCollectionCallback: true,
    callback: (value) => {
        securityGroups = value;
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

        // Wait until this session's account data has fully loaded before deciding. HAS_LOADED_APP flips to
        // true only after OpenApp's response NVPs (incl. the shown-flag) land, which closes the sign-in gap
        // where SignInUser authenticates and delivers the eligibility NVPs before OpenApp fetches the
        // shown-flag — a navigation firing in that window would otherwise read a stale (undefined) flag and
        // redirect a user who already saw the modal.
        if (!hasLoadedApp || !isSubmitMigrationModalShownLoaded) {
            return {type: 'ALLOW'};
        }

        if (shouldShowSubmitPlanWelcomeModal()) {
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
export {resetSessionFlag, onSessionOrLoadingAppChanged};
